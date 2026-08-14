import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) throw error;
    
    // Seed default admin accounts if table is empty
    if (data.length === 0) {
      const DEFAULT_SEEDS = [
        { id: "default-1", email: "admin@moldrafilms.com.br", name: "Administrador", role: "admin", created_at: new Date().toISOString() },
        { id: "default-2", email: "mikelly@moldrafilms.com.br", name: "Mikelly Maduro", role: "admin", created_at: new Date().toISOString() },
        { id: "default-3", email: "natalia@moldrafilms.com.br", name: "Natália Camurça", role: "admin", created_at: new Date().toISOString() }
      ];
      await supabase.from("profiles").insert(DEFAULT_SEEDS);
      
      const mapped = DEFAULT_SEEDS.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        createdAt: profile.created_at
      }));
      return NextResponse.json(mapped);
    }

    const mapped = data.map((profile: any) => ({
      id: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      role: profile.role || "client",
      createdAt: profile.created_at
    }));
    return NextResponse.json(mapped);
  } catch (err: any) {
    console.warn("Failed to read from Supabase 'profiles' table. Falling back to default admin.", err.message);
    // Graceful fallback to avoid admin panel lockout prior to SQL schema run
    return NextResponse.json([
      { id: "default-1", email: "admin@moldrafilms.com.br", role: "admin", createdAt: new Date().toISOString() },
      { id: "default-2", email: "mikelly@moldrafilms.com.br", role: "admin", createdAt: new Date().toISOString() },
      { id: "default-3", email: "natalia@moldrafilms.com.br", role: "admin", createdAt: new Date().toISOString() }
    ]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      // Full list replacement (from Settings tab)
      // 1. Delete all current rows
      await supabase.from("profiles").delete().neq("id", "placeholder_matching_none");
      
      // 2. Insert new profiles
      const insertRows = body.map((acc: any) => ({
        id: acc.id,
        email: acc.email,
        name: acc.name,
        role: acc.role,
        created_at: acc.createdAt || new Date().toISOString()
      }));

      const { error } = await supabase.from("profiles").insert(insertRows);
      if (error) throw error;
    } else if (body && typeof body === "object") {
      // Single row insertion (from Sign-Up or Google login)
      const insertRow = {
        id: body.id,
        email: body.email,
        name: body.name,
        role: body.role,
        created_at: body.createdAt || new Date().toISOString()
      };

      const { error } = await supabase.from("profiles").upsert(insertRow, { onConflict: "email" });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing admin-accounts to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
