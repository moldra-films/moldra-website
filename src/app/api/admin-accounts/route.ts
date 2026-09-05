import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) throw error;
    
    // Seed default admin accounts if table is empty
    if (!data || data.length === 0) {
      const DEFAULT_SEEDS = [
        { id: "default-1", email: "admin@moldrafilms.com.br", name: "Administrador", role: "admin", created_at: new Date().toISOString(), avatar_url: "" },
        { id: "default-2", email: "mikelly@moldrafilms.com.br", name: "Mikelly Maduro", role: "admin", created_at: new Date().toISOString(), avatar_url: "" },
        { id: "default-3", email: "natalia@moldrafilms.com.br", name: "Natália Camurça", role: "admin", created_at: new Date().toISOString(), avatar_url: "" }
      ];
      try {
        await supabase.from("profiles").insert(DEFAULT_SEEDS);
      } catch (seedErr) {
        console.warn("Could not insert default seeds with avatar_url:", seedErr);
      }
      
      const mapped = DEFAULT_SEEDS.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatarUrl: profile.avatar_url || "",
        createdAt: profile.created_at
      }));
      return NextResponse.json(mapped, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    }

    const mapped = (data || []).map((profile: any) => {
      let avatarUrl = profile.avatar_url || profile.avatarUrl || "";
      let displayName = profile.name || profile.email?.split("@")[0] || "Usuário";
      
      // Fallback if avatar is stored inside JSON name or metadata
      if (!avatarUrl && typeof displayName === "string" && displayName.startsWith("{") && displayName.includes("avatarUrl")) {
        try {
          const parsed = JSON.parse(displayName);
          avatarUrl = parsed.avatarUrl || "";
          displayName = parsed.name || profile.email?.split("@")[0] || "Usuário";
        } catch {}
      }

      return {
        id: profile.id,
        email: profile.email,
        name: displayName,
        role: profile.role || "client",
        avatarUrl: avatarUrl,
        createdAt: profile.created_at || profile.createdAt || new Date().toISOString()
      };
    });

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (err: any) {
    console.warn("Failed to read from Supabase 'profiles' table. Falling back to default admin.", err.message);
    // Graceful fallback to avoid admin panel lockout prior to SQL schema run
    return NextResponse.json([
      { id: "default-1", email: "admin@moldrafilms.com.br", name: "Administrador", role: "admin", avatarUrl: "", createdAt: new Date().toISOString() },
      { id: "default-2", email: "mikelly@moldrafilms.com.br", name: "Mikelly Maduro", role: "admin", avatarUrl: "", createdAt: new Date().toISOString() },
      { id: "default-3", email: "natalia@moldrafilms.com.br", name: "Natália Camurça", role: "admin", avatarUrl: "", createdAt: new Date().toISOString() }
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
      
      // 2. Try inserting new profiles with avatar_url
      const insertRowsWithAvatar = body.map((acc: any) => ({
        id: acc.id,
        email: acc.email,
        name: acc.avatarUrl ? JSON.stringify({ name: acc.name || acc.email.split("@")[0], avatarUrl: acc.avatarUrl }) : (acc.name || acc.email.split("@")[0]),
        role: acc.role,
        avatar_url: acc.avatarUrl || null,
        created_at: acc.createdAt || new Date().toISOString()
      }));

      const { error: insertError } = await supabase.from("profiles").insert(insertRowsWithAvatar);
      
      if (insertError) {
        console.warn("Retrying profiles insert without avatar_url column:", insertError.message);
        // Fallback without avatar_url column (avatarUrl is safely preserved in name JSON)
        const fallbackRows = body.map((acc: any) => ({
          id: acc.id,
          email: acc.email,
          name: acc.avatarUrl ? JSON.stringify({ name: acc.name || acc.email.split("@")[0], avatarUrl: acc.avatarUrl }) : (acc.name || acc.email.split("@")[0]),
          role: acc.role,
          created_at: acc.createdAt || new Date().toISOString()
        }));
        const { error: fallbackError } = await supabase.from("profiles").insert(fallbackRows);
        if (fallbackError) throw fallbackError;
      }
    } else if (body && typeof body === "object") {
      // Single row insertion (from Sign-Up or Google login)
      const insertRow = {
        id: body.id,
        email: body.email,
        name: body.avatarUrl ? JSON.stringify({ name: body.name || body.email.split("@")[0], avatarUrl: body.avatarUrl }) : (body.name || body.email.split("@")[0]),
        role: body.role,
        avatar_url: body.avatarUrl || null,
        created_at: body.createdAt || new Date().toISOString()
      };

      const { error: upsertError } = await supabase.from("profiles").upsert(insertRow, { onConflict: "email" });
      if (upsertError) {
        const fallbackRow = {
          id: body.id,
          email: body.email,
          name: body.avatarUrl ? JSON.stringify({ name: body.name || body.email.split("@")[0], avatarUrl: body.avatarUrl }) : (body.name || body.email.split("@")[0]),
          role: body.role,
          created_at: body.createdAt || new Date().toISOString()
        };
        const { error: fallbackError } = await supabase.from("profiles").upsert(fallbackRow, { onConflict: "email" });
        if (fallbackError) throw fallbackError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing admin-accounts to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
