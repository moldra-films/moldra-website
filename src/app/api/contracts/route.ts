import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((contract: any) => ({
      id: contract.id,
      title: contract.title,
      client: contract.client,
      date: contract.date,
      status: contract.status,
    }));

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error reading contracts from Supabase:", error);
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
      .from("contracts")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 2. Insert new contracts
    if (body.length > 0) {
      const insertRows = body.map((contract: any) => ({
        id: contract.id,
        title: contract.title,
        client: contract.client,
        date: contract.date,
        status: contract.status,
      }));

      const { error: insertError } = await supabase
        .from("contracts")
        .insert(insertRows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing contracts to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
