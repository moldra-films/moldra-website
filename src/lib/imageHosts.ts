/** Only fetch images from our own storage (prevents open-proxy / SSRF abuse). */
export function isAllowedImageUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host.endsWith(".r2.dev") || host.endsWith(".r2.cloudflarestorage.com")) return true;
    const configured = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (configured) {
      try {
        return host === new URL(configured).hostname.toLowerCase();
      } catch {}
    }
    return false;
  } catch {
    return false;
  }
}
