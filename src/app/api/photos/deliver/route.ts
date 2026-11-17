import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { getOrder, syncPayment, UUID_RE } from "@/lib/photoOrders";

export const dynamic = "force-dynamic";

/**
 * Delivers the ORIGINAL (unwatermarked) photos of an order - only after the
 * payment has been confirmed with Mercado Pago. The order id is an unguessable
 * UUID kept by the buyer's browser.
 *
 * Body: { orderId: string, paymentId?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = String(body?.orderId || "");
    const paymentId = body?.paymentId ? String(body.paymentId) : "";

    if (!UUID_RE.test(orderId)) {
      return NextResponse.json({ error: "Invalid order." }, { status: 400 });
    }

    let order = await getOrder(orderId);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    // The buyer may come back before the webhook arrives: confirm with Mercado Pago now.
    if (order.status !== "paid" && paymentId) {
      await syncPayment(paymentId, orderId);
      order = (await getOrder(orderId)) || order;
    }

    if (order.status !== "paid") {
      return NextResponse.json({ paid: false, status: order.status });
    }

    const { data: event } = await supabase
      .from("event_medias")
      .select("id, name, photos")
      .eq("id", order.event_id)
      .maybeSingle();
    const photos: { id: string; name: string; url: string }[] = Array.isArray(event?.photos) ? event!.photos : [];

    const chosen =
      order.mode === "package"
        ? photos
        : photos.filter((p) => Array.isArray(order!.photo_ids) && order!.photo_ids.includes(p.id));

    return NextResponse.json({
      paid: true,
      eventName: event?.name || "",
      files: chosen.map((p) => ({
        id: p.id,
        name: p.name,
        url: p.url,
        thumbUrl: `/api/photos/preview?e=${order!.event_id}&p=${encodeURIComponent(p.id)}&w=160`,
      })),
    });
  } catch (err: any) {
    console.error("Deliver error:", err?.message || err);
    return NextResponse.json({ error: "Could not verify the order." }, { status: 500 });
  }
}
