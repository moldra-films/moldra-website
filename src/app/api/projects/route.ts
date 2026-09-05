import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((proj: any) => ({
      id: proj.id,
      name: proj.name,
      clientName: proj.client_name,
      serviceType: proj.service_type,
      dateShoot: proj.date_shoot,
      dateDelivery: proj.date_delivery,
      budget: Number(proj.budget || 0),
      status: proj.status,
      shotList: proj.shot_list || [],
      checklist: proj.checklist || [],
      crew: proj.crew || [],
      location: proj.location,
      references: proj.references,
      comments: proj.comments || [],
      videoUrl: proj.video_url,
      version: proj.version || "v1",
    }));

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error reading projects from Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload, must be an array" }, { status: 400 });
    }

    // 1. Delete all current rows
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 2. Insert new projects
    if (body.length > 0) {
      const insertRows = body.map((proj: any) => ({
        id: proj.id,
        name: proj.name,
        client_name: proj.clientName,
        service_type: proj.serviceType,
        date_shoot: proj.dateShoot,
        date_delivery: proj.dateDelivery,
        budget: proj.budget || 0,
        status: proj.status,
        shot_list: proj.shotList || [],
        checklist: proj.checklist || [],
        crew: proj.crew || [],
        location: proj.location,
        references: proj.references,
        comments: proj.comments || [],
        video_url: proj.videoUrl,
        version: proj.version || "v1",
      }));

      const { error: insertError } = await supabase
        .from("projects")
        .insert(insertRows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing projects to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
