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

    const mapped = (data || []).map((event: any) => {
      const rawPhotos = Array.isArray(event.photos) ? event.photos : [];
      const coverObj = rawPhotos.find((p: any) => p && (p.isCover || p.id === "__cover__"));
      
      // Real album photos: filter out internal __cover__ entry
      const albumPhotos = rawPhotos.filter((p: any) => p && p.id !== "__cover__");

      let coverUrl = event.cover_url || event.coverUrl || coverObj?.url || null;
      const coverPosition = typeof event.cover_position === "number"
        ? event.cover_position
        : typeof event.coverPosition === "number"
        ? event.coverPosition
        : typeof coverObj?.coverPosition === "number"
        ? coverObj.coverPosition
        : 50;

      // For public users, if cover points to an album photo, provide watermarked preview URL
      if (!isAdmin && coverUrl) {
        const matchingPhoto = albumPhotos.find((p: any) => p && (p.url === coverUrl || p.id === coverUrl));
        if (matchingPhoto) {
          coverUrl = `/api/photos/preview?e=${event.id}&p=${encodeURIComponent(matchingPhoto.id)}&w=1280`;
        }
      }

      return {
        id: event.id,
        name: event.name,
        date: event.date,
        pricePerPhoto: event.price_per_photo,
        packagePrice: event.package_price,
        coverUrl,
        coverPosition,
        photos: isAdmin
          ? albumPhotos
          : albumPhotos.map((p: any) => {
              const base = `/api/photos/preview?e=${event.id}&p=${encodeURIComponent(p.id)}`;
              return {
                id: p.id,
                name: p.name,
                url: `${base}&w=1280`,
                thumbUrl: `${base}&w=480`,
                isCover: !!p.isCover,
                coverPosition: p.coverPosition,
              };
            }),
      };
    });

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
      const insertRows = body.map((event: any) => {
        const coverUrl = event.coverUrl && typeof event.coverUrl === "string" && event.coverUrl.trim().length > 0
          ? event.coverUrl.trim()
          : null;
        const coverPosition = typeof event.coverPosition === "number" ? event.coverPosition : 50;

        // Base photos: filter out any previous __cover__ entry
        const basePhotos = (event.photos || []).filter((p: any) => p && p.id !== "__cover__");

        let matchedExisting = false;
        const photosWithCover = basePhotos.map((p: any) => {
          if (coverUrl && (p.url === coverUrl || p.thumbUrl === coverUrl || p.id === coverUrl)) {
            matchedExisting = true;
            return { ...p, isCover: true, coverPosition };
          }
          const { isCover, coverPosition: _, ...rest } = p;
          return rest;
        });

        // If coverUrl is provided and does not match any album photo, add a dedicated __cover__ item
        if (coverUrl && !matchedExisting) {
          photosWithCover.push({
            id: "__cover__",
            name: "Capa do Evento",
            url: coverUrl,
            thumbUrl: coverUrl,
            isCover: true,
            coverPosition,
          });
        }

        return {
          id: event.id,
          name: event.name,
          date: event.date,
          price_per_photo: event.pricePerPhoto,
          package_price: event.packagePrice,
          cover_url: coverUrl,
          cover_position: coverPosition,
          photos: photosWithCover,
        };
      });

      const { error: insertError } = await supabase
        .from("event_medias")
        .insert(insertRows);

      if (insertError) {
        // Fallback without cover_url and cover_position columns if table does not have them
        console.warn("Retrying insert without cover columns:", insertError.message);
        const fallbackRows = insertRows.map(({ cover_url, cover_position, ...rest }: any) => rest);
        const { error: fallbackError } = await supabase
          .from("event_medias")
          .insert(fallbackRows);

        if (fallbackError) throw fallbackError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing event-media to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
