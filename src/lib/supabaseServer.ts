import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for SERVER-SIDE code only (API routes).
 *
 * When SUPABASE_SERVICE_ROLE_KEY is set (Vercel env var, never NEXT_PUBLIC_),
 * the server uses it and the database can be locked down so the public anon
 * key (which ships in the browser bundle) cannot read or write any table.
 * Until that variable exists we fall back to the anon key, so nothing breaks.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serverKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-key";

export const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, serverKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
