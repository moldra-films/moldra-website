import { NextResponse } from "next/server";
import { getAuth, guardAdmin } from "@/lib/apiAuth";
import { supabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Admins get the real records; the public gallery only ever gets watermarked previews.
    const auth = await getAuth(request);
    const isAdmin = !!auth?.isAdmin;

    const { data, error } = await supabase
      .from("event_medias")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((event: any) => ({
      id: event.id,
      name: event.name,
      date: event.date,
      pricePerPhoto: event.price_per_photo,
      packagePrice: event.package_price,
      photos: isAdmin
        ? event.photos || []
        : (Array.isArray(event.photos) ? event.photos : []).map((p: any) => {
            const base = `/api/photos/preview?e=${event.id}&p=${encodeURIComponent(p.id)}`;
            return { id: p.id, name: p.name, url: `${base}&w=1280`, thumbUrl: `${base}&w=480` };
          }),
    }));

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error reading event-media from Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload, must be an array" }, { status: 400 });
    }

    // Safety guard: never wipe table on empty array
    if (body.length === 0) {
      return NextResponse.json({ success: true, message: "Ignored empty payload for safety" });
    }

    // Safety guard: never persist watermarked preview URLs over the real originals.
    const hasPreviewUrls = body.some(
      (event: any) =>
        Array.isArray(event?.photos) &&
        event.photos.some((p: any) => typeof p?.url === "string" && p.url.includes("/api/photos/preview"))
    );
    if (hasPreviewUrls) {
      return NextResponse.json({ error: "Refusing to save preview URLs as originals" }, { status: 400 });
    }

    // 1. Delete all current rows
    const { error: deleteError } = await supabase
      .from("event_medias")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 2. Insert new events
    if (body.length > 0) {
      const insertRows = body.map((event: any) => ({
        id: event.id,
        name: event.name,
        date: event.date,
        price_per_photo: event.pricePerPhoto,
        package_price: event.packagePrice,
        photos: event.photos || [],
      }));

      const { error: insertError } = await supabase
        .from("event_medias")
        .insert(insertRows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing event-media to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
