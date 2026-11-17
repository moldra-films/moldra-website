import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabase } from "@/lib/supabaseServer";
import { isAllowedImageUrl } from "@/lib/imageHosts";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_ORIGINAL_BYTES = 60 * 1024 * 1024;

let logoCache: Buffer | null = null;

async function loadLogo(origin: string): Promise<Buffer | null> {
  if (logoCache) return logoCache;
  try {
    const res = await fetch(`${origin}/logo.png`);
    if (!res.ok) return null;
    logoCache = Buffer.from(await res.arrayBuffer());
    return logoCache;
  } catch {
    return null;
  }
}

/** White silhouette of the logo, thickened and with controlled opacity. */
async function logoMark(logo: Buffer, size: number, strength: number, angle: number): Promise<Buffer> {
  const alpha = await sharp(logo)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .extractChannel(3)
    .blur(Math.max(1.2, size / 120)) // thicken the thin lines so they are hard to erase
    .linear(strength, 0)
    .png()
    .toBuffer();

  const mark = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer();

  return sharp(mark)
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function buildOverlays(width: number, height: number, logo: Buffer | null) {
  const overlays: sharp.OverlayOptions[] = [];
  const base = Math.min(width, height);

  // Fine diagonal mesh across the whole image (no fonts needed, so it renders anywhere).
  const gap = Math.max(14, Math.round(base / 22));
  const mesh = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <pattern id="p" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <line x1="0" y1="0" x2="0" y2="${gap}" stroke="white" stroke-opacity="0.22" stroke-width="${Math.max(1.2, base / 400)}"/>
        <line x1="${gap / 2}" y1="0" x2="${gap / 2}" y2="${gap}" stroke="black" stroke-opacity="0.13" stroke-width="${Math.max(1.2, base / 400)}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#p)"/>
  </svg>`;
  overlays.push({ input: Buffer.from(mesh), top: 0, left: 0 });

  if (logo) {
    // Big central mark.
    const big = Math.round(base * 0.62);
    const bigMark = await logoMark(logo, big, 3.2, -18);
    const bigMeta = await sharp(bigMark).metadata();
    overlays.push({
      input: bigMark,
      left: Math.max(0, Math.round((width - (bigMeta.width || big)) / 2)),
      top: Math.max(0, Math.round((height - (bigMeta.height || big)) / 2)),
    });

    // Staggered grid of smaller marks.
    const small = Math.round(base * 0.2);
    const smallMark = await logoMark(logo, small, 2.2, -18);
    const meta = await sharp(smallMark).metadata();
    const sw = meta.width || small;
    const sh = meta.height || small;
    const stepX = Math.round(sw * 1.7);
    const stepY = Math.round(sh * 1.5);
    let row = 0;
    for (let y = -Math.round(sh / 3); y < height; y += stepY, row++) {
      for (let x = (row % 2) * Math.round(stepX / 2) - Math.round(sw / 3); x < width; x += stepX) {
        const left = Math.max(0, x);
        const top = Math.max(0, y);
        if (left + sw > width || top + sh > height) continue; // sharp requires the overlay to fit
        overlays.push({ input: smallMark, left, top });
      }
    }
  }
  return overlays;
}

/**
 * Public watermarked preview. The original file is fetched on the server and is
 * never exposed to visitors: they only ever receive this reduced, watermarked JPEG.
 * GET /api/photos/preview?e=<eventId>&p=<photoId>&w=<width>
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const eventId = Number(searchParams.get("e"));
  const photoId = searchParams.get("p") || "";
  const requested = Number(searchParams.get("w")) || 1280;
  const width = Math.min(1600, Math.max(160, Math.round(requested)));

  if (!Number.isFinite(eventId) || !photoId) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    const { data: event, error } = await supabase
      .from("event_medias")
      .select("photos")
      .eq("id", eventId)
      .maybeSingle();
    if (error) throw error;

    const photo = (Array.isArray(event?.photos) ? event!.photos : []).find((p: any) => p?.id === photoId);
    if (!photo?.url || !isAllowedImageUrl(photo.url)) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const originalRes = await fetch(photo.url, { redirect: "error" });
    if (!originalRes.ok) {
      return NextResponse.json({ error: "Original unavailable" }, { status: 502 });
    }
    const declared = Number(originalRes.headers.get("content-length") || 0);
    if (declared > MAX_ORIGINAL_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }
    const original = Buffer.from(await originalRes.arrayBuffer());

    const resized = await sharp(original, { failOn: "none" })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });

    const logo = await loadLogo(origin);
    const overlays = await buildOverlays(resized.info.width, resized.info.height, logo);

    const output = await sharp(resized.data)
      .composite(overlays)
      .jpeg({ quality: 70, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(output), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "Content-Disposition": "inline",
      },
    });
  } catch (err: any) {
    console.error("Preview generation error:", err?.message || err);
    return NextResponse.json({ error: "Could not generate preview" }, { status: 500 });
  }
}
