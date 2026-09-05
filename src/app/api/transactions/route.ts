import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { FinanceDb } from "@/lib/db/financeDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Primary: load transactions from FinanceDb (R2 cloud storage)
    try {
      const financeDb = await FinanceDb.load(true);
      if (financeDb.transactions && financeDb.transactions.length > 0) {
        const mapped = financeDb.transactions.map((trans: any, index: number) => ({
          id: trans.id,
          type: trans.type === "Entrada" ? "Receita" : trans.type === "Saída" ? "Despesa" : trans.type,
          rawType: trans.type,
          category: trans.category || "Outros",
          value: Number(trans.value) || 0,
          date: trans.date,
          description: trans.description,
          status: trans.status === "Recebido" || trans.status === "Pago" ? "Pago" : "Pendente",
          rawStatus: trans.status,
          customer: trans.customerOrProvider || trans.customer || "Nenhum",
        }));
        return NextResponse.json(mapped, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        });
      }
    } catch (r2Err) {
      console.warn("Could not load transactions from FinanceDb/R2, falling back to Supabase:", r2Err);
    }

    // 2. Fallback: load from Supabase
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((trans: any) => ({
      id: trans.id,
      type: trans.type,
      rawType: trans.type,
      category: trans.category,
      value: Number(trans.value) || 0,
      date: trans.date,
      description: trans.description,
      status: trans.status,
      rawStatus: trans.status,
      customer: trans.customer,
    }));

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error reading transactions from Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (Array.isArray(payload)) {
      // Safety guard: never wipe table on empty array
      if (payload.length === 0) {
        return NextResponse.json({ success: true, message: "Ignored empty payload for safety" });
      }

      // Overwrite database (Admin sync)
      // 1. Delete all current rows
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .neq("id", -1);
      
      if (deleteError) throw deleteError;

      // 2. Insert new transactions
      if (payload.length > 0) {
        const insertRows = payload.map((trans: any, index: number) => {
          let numId = typeof trans.id === "number" ? trans.id : parseInt(String(trans.id).replace(/\D/g, ""), 10);
          if (isNaN(numId) || !numId) {
            numId = index + 1;
          }
          // Cap to standard postgres 4-byte or 8-byte int limit
          if (numId > 2147483647) {
            numId = numId % 2000000000 + 1;
          }

          return {
            id: numId,
            type: trans.type === "Entrada" ? "Receita" : trans.type === "Saída" ? "Despesa" : trans.type,
            category: trans.category || "Outros",
            value: Number(trans.value) || 0,
            date: trans.date || new Date().toISOString().split("T")[0],
            description: trans.description || "Sem descrição",
            status: trans.status === "Recebido" || trans.status === "Pago" ? "Pago" : "Pendente",
            customer: trans.customerOrProvider || trans.customer || "Nenhum",
          };
        });

        const { error: insertError } = await supabase
          .from("transactions")
          .insert(insertRows);

        if (insertError) throw insertError;
      }
      return NextResponse.json({ success: true });
    } else {
      // Append single transaction
      const { data: maxIdData, error: maxIdError } = await supabase
        .from("transactions")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (maxIdError) throw maxIdError;

      const nextId = maxIdData && maxIdData.length > 0 ? Number(maxIdData[0].id) + 1 : 1;

      const insertRow = {
        id: nextId,
        type: payload.type === "Entrada" ? "Receita" : payload.type === "Saída" ? "Despesa" : payload.type,
        category: payload.category || "Outros",
        value: Number(payload.value) || 0,
        date: payload.date || new Date().toISOString().split("T")[0],
        description: payload.description || "Sem descrição",
        status: payload.status === "Recebido" || payload.status === "Pago" ? "Pago" : "Pendente",
        customer: payload.customerOrProvider || payload.customer || "Nenhum",
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
