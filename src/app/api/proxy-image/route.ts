import { NextResponse } from "next/server";

function isAllowedImageUrl(raw: string): boolean {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!isAllowedImageUrl(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }

  try {
    const res = await fetch(url, { redirect: "error" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image from cloud: ${res.statusText}` },
        { status: res.status }
      );
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000");

    return new Response(blob, {
      status: 200,
      headers
    });
  } catch (error: any) {
    console.error("Proxy image error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
