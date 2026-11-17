import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { mercadoPagoToken, recordSale } from "@/lib/photoOrders";
import { findCoupon, calculateDiscount, incrementCouponUsage } from "@/lib/coupons";

export const dynamic = "force-dynamic";

const MAX_INDIVIDUAL_PHOTOS = 300;

// Only redirect buyers back to our own site (the Origin header is client-controlled).
function safeOrigin(request: Request): string {
  const origin = request.headers.get("origin") || "";
  if (/^https:\/\/(www\.)?moldrafilms\.com\.br$/i.test(origin)) return origin;
  if (/^http:\/\/localhost:\d+$/i.test(origin)) return origin;
  return "https://moldrafilms.com.br";
}

/**
 * Creates a photo order and a Mercado Pago payment preference.
 * The price is ALWAYS computed here from the database - the browser only says
 * which event and which photos, never how much to charge.
 *
 * Body: { eventId: number, mode: "package" | "individual", photoIds?: string[], couponCode?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = Number(body?.eventId);
    const wantsPackage = body?.mode === "package";
    const requestedIds: string[] = Array.isArray(body?.photoIds)
      ? Array.from(new Set(body.photoIds.filter((id: unknown) => typeof id === "string")))
      : [];
    const couponCode = String(body?.couponCode || "").trim().toUpperCase();
    const customerName = String(body?.customerName || "").trim();
    const customerPhone = String(body?.customerPhone || "").trim();

    if (!Number.isFinite(eventId)) {
      return NextResponse.json({ error: "eventId is required." }, { status: 400 });
    }
    if (!wantsPackage && requestedIds.length === 0) {
      return NextResponse.json({ error: "Select at least one photo." }, { status: 400 });
    }
    if (requestedIds.length > MAX_INDIVIDUAL_PHOTOS) {
      return NextResponse.json({ error: "Too many photos selected." }, { status: 400 });
    }

    const { data: event, error: eventError } = await supabase
      .from("event_medias")
      .select("id, name, price_per_photo, package_price, photos")
      .eq("id", eventId)
      .maybeSingle();
    if (eventError) throw eventError;
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const photos: { id: string; name?: string }[] = Array.isArray(event.photos) ? event.photos : [];
    const pricePerPhoto = Number(event.price_per_photo) || 0;
    const packagePrice = Number(event.package_price) || 0;
    const validIds = new Set(photos.map((p) => p.id));

    let mode: "package" | "individual" = wantsPackage ? "package" : "individual";
    let photoIds: string[] = [];
    let amount = packagePrice;
    let count = photos.length;

    if (mode === "individual") {
      photoIds = requestedIds.filter((id) => validIds.has(id));
      if (photoIds.length === 0) {
        return NextResponse.json({ error: "Selected photos were not found." }, { status: 400 });
      }
      amount = photoIds.length * pricePerPhoto;
      count = photoIds.length;
    }

    amount = Math.round(amount * 100) / 100;
    if (!(amount > 0)) {
      return NextResponse.json({ error: "This event has no valid price configured." }, { status: 400 });
    }

    // Check discount coupon if provided
    let appliedCoupon = null;
    let finalAmount = amount;
    let isFree = false;

    if (couponCode) {
      appliedCoupon = await findCoupon(couponCode);
      if (appliedCoupon) {
        const discountCalc = calculateDiscount(appliedCoupon, amount);
        finalAmount = discountCalc.finalAmount;
        isFree = discountCalc.isFree;
      }
    }

    // CASE 1: 100% Free order (via coupon)! Instant liberation, bypass Mercado Pago.
    if (isFree || finalAmount === 0) {
      const { data: order, error: orderError } = await supabase
        .from("photo_orders")
        .insert({
          event_id: eventId,
          mode,
          photo_ids: photoIds,
          amount: amount > 0 ? amount : 1.0,
          status: "paid",
          payment_id: `CUPOM_${appliedCoupon?.code || "100"}`,
          paid_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (orderError || !order) throw orderError || new Error("Could not create free order");

      if (appliedCoupon) {
        await incrementCouponUsage(appliedCoupon.code);
      }

      await recordSale(order, `CUPOM_${appliedCoupon?.code || "100"}`, {
        customerName: customerName
          ? `${customerName}${customerPhone ? ` • Whats: ${customerPhone}` : ""}`
          : `Beneficiário Cupom ${appliedCoupon?.code || "100"}`,
        couponCode: appliedCoupon?.code || "100",
        isFree: true,
      });

      return NextResponse.json({
        free: true,
        orderId: order.id,
        message: "Fotos liberadas com sucesso via cupom de 100%!",
      });
    }

    // CASE 2: Paid order via Mercado Pago (with or without partial coupon discount)
    const accessToken = mercadoPagoToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago Access Token is not configured on the server." },
        { status: 501 }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("photo_orders")
      .insert({ event_id: eventId, mode, photo_ids: photoIds, amount: finalAmount, status: "pending" })
      .select("id")
      .single();
    if (orderError || !order) throw orderError || new Error("Could not create order");

    if (appliedCoupon) {
      await incrementCouponUsage(appliedCoupon.code);
    }

    const origin = safeOrigin(request);
    const returnUrl = (status: string) =>
      `${origin}/eventos/${eventId}?payment=${status}&order=${order.id}`;

    const mpPayload: any = {
      items: [
        {
          id: order.id,
          title:
            mode === "package"
              ? `Pacote Completo de Fotos - ${event.name}${appliedCoupon ? ` (Cupom ${appliedCoupon.code})` : ""}`
              : `${count} foto(s) - ${event.name}${appliedCoupon ? ` (Cupom ${appliedCoupon.code})` : ""}`,
          quantity: 1,
          unit_price: finalAmount,
          currency_id: "BRL",
        },
      ],
      external_reference: order.id,
      metadata: {
        customer_name: customerName,
        customer_phone: customerPhone,
        event_id: eventId,
      },
      back_urls: {
        success: returnUrl("success"),
        failure: returnUrl("failure"),
        pending: returnUrl("pending"),
      },
      auto_return: "approved",
      notification_url: `${origin}/api/checkout/webhook`,
      statement_descriptor: "MOLDRA FILMS",
    };

    if (customerName) {
      mpPayload.payer = {
        name: customerName,
      };
      if (customerPhone) {
        mpPayload.payer.phone = {
          number: customerPhone.replace(/\D/g, ""),
        };
      }
    }

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(mpPayload),
    });

    if (!mpResponse.ok) {
      let details = "Mercado Pago API error";
      try {
        const err = await mpResponse.json();
        details = err.message || JSON.stringify(err);
      } catch {}
      console.error("Mercado Pago preference error:", mpResponse.status, details);
      await supabase.from("photo_orders").update({ status: "failed" }).eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to process checkout transaction.", details },
        { status: 502 }
      );
    }

    const preference = await mpResponse.json();
    await supabase.from("photo_orders").update({ preference_id: preference.id }).eq("id", order.id);

    return NextResponse.json({ initPoint: preference.init_point, orderId: order.id });
  } catch (error: any) {
    console.error("Checkout API error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to process checkout transaction.", details: error?.message },
      { status: 500 }
    );
  }
}
