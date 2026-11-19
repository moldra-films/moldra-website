import { NextResponse } from "next/server";
import { supabase, usingServiceRole } from "@/lib/supabaseServer";
import { getAuth, unauthorized, forbidden } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
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
      return NextResponse.json(auth.isAdmin ? mapped : mapped.filter((a: any) => String(a.email).toLowerCase() === auth.email), {
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

    // Non-admin users may only see their own account record.
    const visible = auth.isAdmin ? mapped : mapped.filter((a: any) => String(a.email).toLowerCase() === auth.email);

    return NextResponse.json(visible, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (err: any) {
    console.warn("Failed to read from Supabase 'profiles' table. Falling back to default admin.", err.message);
    if (!auth.isAdmin) return forbidden();
    // Graceful fallback to avoid admin panel lockout prior to SQL schema run
    return NextResponse.json([
      { id: "default-1", email: "admin@moldrafilms.com.br", name: "Administrador", role: "admin", avatarUrl: "", createdAt: new Date().toISOString() },
      { id: "default-2", email: "mikelly@moldrafilms.com.br", name: "Mikelly Maduro", role: "admin", avatarUrl: "", createdAt: new Date().toISOString() },
      { id: "default-3", email: "natalia@moldrafilms.com.br", name: "Natália Camurça", role: "admin", avatarUrl: "", createdAt: new Date().toISOString() }
    ]);
  }
}

export async function POST(request: Request) {
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      // Replacing the whole account list is an admin-only operation.
      if (!auth.isAdmin) return forbidden();
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
      // Single row insertion (from Sign-Up or Google login).
      // Non-admins can only register THEMSELVES as a plain client, and can
      // never overwrite an existing account (prevents privilege escalation).
      if (!auth.isAdmin) {
        if (String(body.email || "").toLowerCase() !== auth.email) return forbidden();
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", auth.email.replace(/[\\%_]/g, (c) => `\\${c}`))
          .limit(1);
        if (existing && existing.length > 0) {
          return NextResponse.json({ success: true, message: "Account already registered" });
        }
        body.role = "client";
      }
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

const PROTECTED_EMAILS = ["admin@moldrafilms.com.br"];

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Finds a Supabase Auth (login) user by e-mail. */
async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find((u) => (u.email || "").toLowerCase() === email);
    if (found) return found.id;
    if (users.length < 200) break;
  }
  return null;
}

/**
 * Removes an account COMPLETELY: the panel profile AND the Supabase login.
 * (Deleting only the profile left the login behind, so the same e-mail could
 * never be registered again: "user already exists".)
 * Body: { email: string }
 */
export async function DELETE(request: Request) {
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
  if (!auth.isAdmin) return forbidden();

  if (!usingServiceRole) {
    return NextResponse.json(
      { error: "O servidor não está configurado para excluir logins (falta SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 501 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
    if (PROTECTED_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Este é o acesso administrativo principal e não pode ser removido." }, { status: 400 });
    }
    if (email === auth.email) {
      return NextResponse.json({ error: "Você não pode remover a sua própria conta." }, { status: 400 });
    }

    // Never remove the last administrator.
    const { data: admins } = await supabase.from("profiles").select("email").eq("role", "admin");
    const otherAdmins = (admins || []).filter((a: any) => String(a.email || "").toLowerCase() !== email);
    const targetIsAdmin = (admins || []).some((a: any) => String(a.email || "").toLowerCase() === email);
    if (targetIsAdmin && otherAdmins.length === 0) {
      return NextResponse.json({ error: "Não é possível remover o último administrador." }, { status: 400 });
    }

    const authUserId = await findAuthUserIdByEmail(email);
    if (authUserId) {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(authUserId);
      if (deleteAuthError) throw deleteAuthError;
    }

    const { error: profileError } = await supabase.from("profiles").delete().ilike("email", escapeLike(email));
    if (profileError) throw profileError;

    return NextResponse.json({ success: true, loginDeleted: !!authUserId });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: error.message || "Erro ao remover usuário." }, { status: 500 });
  }
}
