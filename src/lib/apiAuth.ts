import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase as serverDb } from "@/lib/supabaseServer";

/**
 * Server-side authentication/authorization for API routes.
 *
 * The browser sends the Supabase access token as `Authorization: Bearer <jwt>`
 * (see src/components/AuthFetch.tsx). We validate it with Supabase on every
 * request, so nothing here trusts cookies or client-side state.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Stateless client used only to validate tokens and look up the caller's role.
const authClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

// Same list the login pages already treat as default administrators.
const DEFAULT_ADMIN_EMAILS = [
  "admin@moldrafilms.com.br",
  "mikelly@moldrafilms.com.br",
  "natalia@moldrafilms.com.br",
  "mikaelmaduro@gmail.com",
];

export interface AuthContext {
  id: string;
  email: string;
  isAdmin: boolean;
  metadata: Record<string, any>;
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Returns the authenticated caller, or null if the token is missing/invalid. */
export async function getAuth(request: Request): Promise<AuthContext | null> {
  const token = bearerToken(request);
  if (!token) return null;

  try {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data?.user?.email) return null;

    const user = data.user;
    const email = user.email!.toLowerCase();

    // Only verified e-mails may be treated as privileged identities.
    const verified = !!user.email_confirmed_at;
    let isAdmin = false;

    if (verified) {
      if (DEFAULT_ADMIN_EMAILS.includes(email)) {
        isAdmin = true;
      } else {
        const { data: rows, error: profileError } = await serverDb
          .from("profiles")
          .select("role")
          .ilike("email", escapeLike(email))
          .limit(5);
        if (!profileError && Array.isArray(rows)) {
          isAdmin = rows.some((r: any) => r?.role === "admin");
        }
      }
    }

    return {
      id: user.id,
      email,
      isAdmin,
      metadata: (user.user_metadata as Record<string, any>) || {},
    };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Returns a 401/403 response if the caller is not an admin, otherwise null. */
export async function guardAdmin(request: Request): Promise<NextResponse | null> {
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
  if (!auth.isAdmin) return forbidden();
  return null;
}
