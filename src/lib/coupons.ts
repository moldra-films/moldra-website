import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucketName } from "./r2Client";
import fs from "fs";
import path from "path";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // 100 = 100%, 20 = 20% or R$ 20
  active: boolean;
  maxUses?: number;
  usedCount: number;
  createdAt: string;
}

const R2_COUPONS_KEY = "db/coupons.json";
const LOCAL_COUPONS_PATH = path.join(process.cwd(), ".coupons-cache.json");

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "coupon-vip100",
    code: "VIP100",
    description: "Cupom de Cortesia - 100% de Desconto",
    discountType: "percentage",
    discountValue: 100,
    active: true,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coupon-moldra100",
    code: "MOLDRA100",
    description: "Cupom Especial Moldra - 100% de Desconto",
    discountType: "percentage",
    discountValue: 100,
    active: true,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coupon-off50",
    code: "OFF50",
    description: "Desconto de 50%",
    discountType: "percentage",
    discountValue: 50,
    active: true,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  },
];

let inMemoryCoupons: Coupon[] | null = null;

export async function getCoupons(): Promise<Coupon[]> {
  if (inMemoryCoupons && inMemoryCoupons.length > 0) {
    return inMemoryCoupons;
  }

  // 1. Try pulling from Cloudflare R2
  if (bucketName) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: R2_COUPONS_KEY,
      });
      const response = await r2.send(command);
      const jsonStr = await response.Body?.transformToString();
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          inMemoryCoupons = parsed;
          return parsed;
        }
      }
    } catch (err: any) {
      if (err.name !== "NoSuchKey" && err.$metadata?.httpStatusCode !== 404) {
        console.warn("Could not load coupons from R2:", err?.message || err);
      }
    }
  }

  // 2. Try loading from local fallback cache
  try {
    if (fs.existsSync(LOCAL_COUPONS_PATH)) {
      const localData = JSON.parse(fs.readFileSync(LOCAL_COUPONS_PATH, "utf-8"));
      if (Array.isArray(localData)) {
        inMemoryCoupons = localData;
        return localData;
      }
    }
  } catch {}

  // 3. Fallback to default seeded coupons
  inMemoryCoupons = DEFAULT_COUPONS;
  await saveCoupons(DEFAULT_COUPONS).catch(() => {});
  return DEFAULT_COUPONS;
}

export async function saveCoupons(coupons: Coupon[]): Promise<void> {
  inMemoryCoupons = coupons;

  // 1. Save to R2
  if (bucketName) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: R2_COUPONS_KEY,
        Body: JSON.stringify(coupons, null, 2),
        ContentType: "application/json",
      });
      await r2.send(command);
    } catch (err) {
      console.error("Could not save coupons to R2:", err);
    }
  }

  // 2. Save to local fallback cache
  try {
    fs.writeFileSync(LOCAL_COUPONS_PATH, JSON.stringify(coupons, null, 2), "utf-8");
  } catch {}
}

export async function findCoupon(code: string): Promise<Coupon | null> {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  const coupons = await getCoupons();
  const match = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.active);
  if (!match) return null;

  if (match.maxUses && match.usedCount >= match.maxUses) {
    return null;
  }

  return match;
}

export function calculateDiscount(
  coupon: Coupon,
  originalAmount: number
): { discountAmount: number; finalAmount: number; isFree: boolean } {
  const original = Math.max(0, originalAmount);
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    const pct = Math.min(100, Math.max(0, coupon.discountValue));
    discountAmount = Math.round((original * (pct / 100)) * 100) / 100;
  } else {
    discountAmount = Math.min(original, Math.max(0, coupon.discountValue));
  }

  const finalAmount = Math.max(0, Math.round((original - discountAmount) * 100) / 100);
  return {
    discountAmount,
    finalAmount,
    isFree: finalAmount === 0,
  };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const coupons = await getCoupons();
  let updated = false;

  const newCoupons = coupons.map((c) => {
    if (c.code.toUpperCase() === cleanCode) {
      updated = true;
      return { ...c, usedCount: (c.usedCount || 0) + 1 };
    }
    return c;
  });

  if (updated) {
    await saveCoupons(newCoupons);
  }
}
