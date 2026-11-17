import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/apiAuth";
import { getCoupons, saveCoupons, Coupon } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;

  try {
    const coupons = await getCoupons();
    return NextResponse.json(coupons);
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao buscar cupons." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const code = String(body?.code || "").trim().toUpperCase();
    const discountValue = Number(body?.discountValue);
    const discountType = body?.discountType === "fixed" ? "fixed" : "percentage";
    const description = String(body?.description || "");
    const maxUses = body?.maxUses ? Number(body.maxUses) : undefined;

    if (!code || isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { error: "Código do cupom e valor do desconto são obrigatórios." },
        { status: 400 }
      );
    }

    const coupons = await getCoupons();
    const existingIndex = coupons.findIndex((c) => c.code.toUpperCase() === code);

    const newCoupon: Coupon = {
      id: existingIndex >= 0 ? coupons[existingIndex].id : `coupon-${Date.now()}`,
      code,
      description,
      discountType,
      discountValue,
      active: true,
      maxUses,
      usedCount: existingIndex >= 0 ? coupons[existingIndex].usedCount : 0,
      createdAt: existingIndex >= 0 ? coupons[existingIndex].createdAt : new Date().toISOString(),
    };

    let updatedCoupons: Coupon[];
    if (existingIndex >= 0) {
      updatedCoupons = [...coupons];
      updatedCoupons[existingIndex] = newCoupon;
    } else {
      updatedCoupons = [newCoupon, ...coupons];
    }

    await saveCoupons(updatedCoupons);
    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao salvar cupom." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID do cupom obrigatório." }, { status: 400 });
    }

    const coupons = await getCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    await saveCoupons(filtered);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao excluir cupom." }, { status: 500 });
  }
}
