import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
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
