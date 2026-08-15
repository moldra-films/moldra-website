import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = data.map((client: any) => ({
      id: client.id,
      name: client.name,
      company: client.company,
      cnpj: client.cnpj,
      email: client.email,
      whatsapp: client.whatsapp,
      address: client.address,
      projectsCount: Number(client.projects_count || 0),
      totalValue: Number(client.total_value || 0),
      responsible: client.responsible,
      notes: client.notes,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Error reading clients from Supabase:", error);
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
      .from("clients")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 2. Insert new clients
    if (body.length > 0) {
      const insertRows = body.map((client: any) => ({
        id: client.id,
        name: client.name,
        company: client.company,
        cnpj: client.cnpj,
        email: client.email,
        whatsapp: client.whatsapp,
        address: client.address,
        projects_count: client.projectsCount || 0,
        total_value: client.totalValue || 0,
        responsible: client.responsible,
        notes: client.notes,
      }));

      const { error: insertError } = await supabase
        .from("clients")
        .insert(insertRows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing clients to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
