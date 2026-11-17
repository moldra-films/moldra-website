import { NextResponse } from "next/server";
import { findCoupon, calculateDiscount } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body?.code || "").trim();
    const originalAmount = Number(body?.amount || 0);

    if (!code) {
      return NextResponse.json({ valid: false, error: "Informe o código do cupom." }, { status: 400 });
    }

    const coupon = await findCoupon(code);
    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Cupom inválido, inativo ou esgotado." },
        { status: 404 }
      );
    }

    const { discountAmount, finalAmount, isFree } = calculateDiscount(coupon, originalAmount);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      originalAmount,
      discountAmount,
      finalAmount,
      isFree,
    });
  } catch (err: any) {
    console.error("Coupon validation error:", err);
    return NextResponse.json({ valid: false, error: "Erro ao validar cupom." }, { status: 500 });
  }
}
