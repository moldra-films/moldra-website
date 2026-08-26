import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { FinanceDb } from "@/lib/db/financeDb";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("equipments")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = data.map((eq: any) => ({
      id: eq.id,
      name: eq.name,
      category: eq.category,
      serialNumber: eq.serial_number,
      status: eq.status,
      lastMaintenance: eq.last_maintenance,
      responsible: eq.responsible,
    }));

    // Read photos from R2-synced finance database
    const financeDb = await FinanceDb.load();
    const photosMap = financeDb.equipmentPhotos || {};

    const mappedWithPhotos = mapped.map((eq: any) => ({
      ...eq,
      photos: photosMap[eq.id] || []
    }));

    return NextResponse.json(mappedWithPhotos);
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

    // Save photos map to R2-synced finance database
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

    // 1. Delete all current rows in Supabase
    const { error: deleteError } = await supabase
      .from("equipments")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 2. Insert new equipments in Supabase (excluding photos field)
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
