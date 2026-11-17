import { NextResponse } from "next/server";
import { syncPayment } from "@/lib/photoOrders";

export const dynamic = "force-dynamic";

/**
 * Mercado Pago notifications. The body is NOT trusted: we only read the payment
 * id from it and confirm everything by asking Mercado Pago directly.
 */
async function handle(request: Request) {
  const url = new URL(request.url);
  let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id") || "";
  const topic = url.searchParams.get("type") || url.searchParams.get("topic") || "";

  if (!paymentId) {
    try {
      const body = await request.json();
      paymentId = String(body?.data?.id || "");
      if (body?.type && body.type !== "payment") return NextResponse.json({ ignored: true });
    } catch {}
  }

  if (topic && topic !== "payment") return NextResponse.json({ ignored: true });
  if (!paymentId) return NextResponse.json({ ignored: true });

  try {
    const result = await syncPayment(paymentId);
    return NextResponse.json({ ok: true, status: result.mpStatus });
  } catch (err: any) {
    console.error("Webhook error:", err?.message || err);
    // 500 makes Mercado Pago retry later.
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
