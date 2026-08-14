import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { items, eventId } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items parameter is required and cannot be empty." },
        { status: 400 }
      );
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (accessToken) {
      // Create preference payload for Mercado Pago
      const preferencePayload = {
        items: items.map((item) => ({
          title: item.title,
          quantity: item.quantity || 1,
          unit_price: Number(item.unit_price),
          currency_id: "BRL",
        })),
        back_urls: {
          success: `${request.headers.get("origin") || "http://localhost:3000"}/eventos/${eventId}?payment=success`,
          failure: `${request.headers.get("origin") || "http://localhost:3000"}/eventos/${eventId}?payment=failure`,
          pending: `${request.headers.get("origin") || "http://localhost:3000"}/eventos/${eventId}?payment=pending`,
        },
        auto_return: "approved",
      };

      // Call Mercado Pago Preferences API directly
      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferencePayload),
      });

      if (!mpResponse.ok) {
        let errMsg = "Mercado Pago API error";
        try {
          const errorData = await mpResponse.json();
          errMsg = errorData.message || JSON.stringify(errorData);
        } catch (e) {
          try {
            const textData = await mpResponse.text();
            errMsg = textData || errMsg;
          } catch (_) {}
        }
        throw new Error(errMsg);
      }

      const data = await mpResponse.json();
      return NextResponse.json({ initPoint: data.init_point });
    } else {
      return NextResponse.json(
        { error: "Mercado Pago Access Token is not configured on the server." },
        { status: 501 }
      );
    }
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout transaction.", details: error.message },
      { status: 500 }
    );
  }
}
