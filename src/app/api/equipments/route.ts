import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { FinanceDb } from "@/lib/db/financeDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("equipments")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((eq: any) => ({
      id: eq.id,
      name: eq.name,
      category: eq.category,
      serialNumber: eq.serial_number,
      status: eq.status,
      lastMaintenance: eq.last_maintenance,
      responsible: eq.responsible,
    }));

    // Read photos safely from R2-synced finance database
    let photosMap: Record<number, string[]> = {};
    try {
      const financeDb = await FinanceDb.load(true);
      photosMap = financeDb.equipmentPhotos || {};
    } catch (photoErr) {
      console.warn("Could not load equipment photos mapping:", photoErr);
    }

    const mappedWithPhotos = mapped.map((eq: any) => ({
      ...eq,
      photos: photosMap[eq.id] || []
    }));

    return NextResponse.json(mappedWithPhotos, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error reading equipments from Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload, must be an array" }, { status: 400 });
    }

    // Safety guard: never wipe table on empty array
    if (body.length === 0) {
      return NextResponse.json({ success: true, message: "Ignored empty payload for safety" });
    }

    // 1. Save photos map safely to R2-synced finance database
    try {
      const financeDb = await FinanceDb.load();
      if (!financeDb.equipmentPhotos) {
        financeDb.equipmentPhotos = {};
      }

      const photosMap = financeDb.equipmentPhotos;
      body.forEach((eq: any) => {
        if (eq.photos) {
          photosMap[eq.id] = eq.photos;
        }
      });

      await FinanceDb.save(financeDb);
    } catch (photoErr) {
      console.warn("Could not sync equipment photos to R2/FinanceDb:", photoErr);
    }

    // 2. Delete all current rows in Supabase
    const { error: deleteError } = await supabase
      .from("equipments")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 3. Insert new equipments in Supabase (excluding photos field)
    if (body.length > 0) {
      const insertRows = body.map((eq: any) => ({
        id: eq.id,
        name: eq.name,
        category: eq.category,
        serial_number: eq.serialNumber,
        status: eq.status,
        last_maintenance: eq.lastMaintenance,
        responsible: eq.responsible,
      }));

      const { error: insertError } = await supabase
        .from("equipments")
        .insert(insertRows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing equipments to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
