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
      const mpResponse = await fetch("https://api.mercadopago.com/v1/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferencePayload),
      });

      if (!mpResponse.ok) {
        const errorData = await mpResponse.json();
        throw new Error(errorData.message || "Mercado Pago API error");
      }

      const data = await mpResponse.json();
      return NextResponse.json({ initPoint: data.init_point });
    } else {
      // If access token is not configured on the server, return simulated payment payload
      // PIX simulated payload (randomly generated key)
      const randomPixHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const simulatedPix = `00020101021226870014br.gov.bcb.pix2565pix.mercado-pago.com.br/qr/v2/mock-${randomPixHash}-moldra-payment-checkout`;

      return NextResponse.json({ simulatedPix });
    }
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout transaction.", details: error.message },
      { status: 500 }
    );
  }
}
