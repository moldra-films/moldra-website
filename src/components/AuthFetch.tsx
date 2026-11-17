"use client";

import { supabase } from "@/lib/supabaseClient";

/**
 * Attaches the current Supabase access token to every same-origin `/api/*`
 * request, so the server can authenticate the caller (see src/lib/apiAuth.ts).
 * Installed once, at module load, so it is active before any effect runs.
 */
if (typeof window !== "undefined" && !(window as any).__moldraAuthFetch) {
  (window as any).__moldraAuthFetch = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const rawUrl =
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(rawUrl, window.location.origin);

      if (url.origin === window.location.origin && url.pathname.startsWith("/api/")) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          const headers = new Headers(
            init?.headers || (typeof input === "object" && "headers" in input ? input.headers : undefined)
          );
          if (!headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${token}`);
          }
          return originalFetch(input, { ...init, headers });
        }
      }
    } catch {
      // Fall through to a plain request; the server will answer 401 if needed.
    }
    return originalFetch(input, init);
  };
}

export default function AuthFetch() {
  return null;
}
