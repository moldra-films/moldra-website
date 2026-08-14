import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = data.map((trans: any) => ({
      id: trans.id,
      type: trans.type,
      category: trans.category,
      value: trans.value,
      date: trans.date,
      description: trans.description,
      status: trans.status,
      customer: trans.customer,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Error reading transactions from Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (Array.isArray(payload)) {
      // Overwrite database (Admin sync)
      // 1. Delete all current rows
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .neq("id", -1);
      
      if (deleteError) throw deleteError;

      // 2. Insert new transactions
      if (payload.length > 0) {
        const insertRows = payload.map((trans: any) => ({
          id: trans.id,
          type: trans.type,
          category: trans.category,
          value: trans.value,
          date: trans.date,
          description: trans.description,
          status: trans.status,
          customer: trans.customer,
        }));

        const { error: insertError } = await supabase
          .from("transactions")
          .insert(insertRows);

        if (insertError) throw insertError;
      }
      return NextResponse.json({ success: true });
    } else {
      // Append single transaction (Client purchase or manual ledger quick entry)
      const { data: maxIdData, error: maxIdError } = await supabase
        .from("transactions")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (maxIdError) throw maxIdError;

      const nextId = maxIdData && maxIdData.length > 0 ? Number(maxIdData[0].id) + 1 : 1;

      const insertRow = {
        id: nextId,
        type: payload.type,
        category: payload.category,
        value: payload.value,
        date: payload.date,
        description: payload.description,
        status: payload.status,
        customer: payload.customer,
      };

      const { error: insertError } = await supabase
        .from("transactions")
        .insert(insertRow);

      if (insertError) throw insertError;

      return NextResponse.json(insertRow);
    }
  } catch (error: any) {
    console.error("Error writing transactions to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
