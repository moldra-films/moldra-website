import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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

    return NextResponse.json(mapped);
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

    // 1. Delete all current rows
    const { error: deleteError } = await supabase
      .from("equipments")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 2. Insert new equipments
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
