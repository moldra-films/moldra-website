import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { getAuth, unauthorized, type AuthContext } from "@/lib/apiAuth";

// A project belongs to a client user if its clientName matches the user's e-mail,
// the company on their profile, or the company of their client record.
async function ownedProjectFilter(auth: AuthContext) {
  const names = new Set<string>([auth.email]);
  const company = auth.metadata?.company;
  if (typeof company === "string" && company.trim()) names.add(company.trim().toLowerCase());
  try {
    const { data } = await supabase.from("clients").select("email, company");
    for (const c of data || []) {
      if (String(c.email || "").toLowerCase() === auth.email && c.company) {
        names.add(String(c.company).trim().toLowerCase());
      }
    }
  } catch {}
  return (clientName: unknown) => names.has(String(clientName || "").trim().toLowerCase());
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
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

    let visible = mapped;
    if (!auth.isAdmin) {
      const owns = await ownedProjectFilter(auth);
      visible = mapped.filter((p: any) => owns(p.clientName));
    }

    return NextResponse.json(visible, {
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
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload, must be an array" }, { status: 400 });
    }

    // Client users (client portal) may only comment on / approve their own
    // projects. Never replace the table on their behalf.
    if (!auth.isAdmin) {
      const owns = await ownedProjectFilter(auth);
      let updated = 0;
      for (const proj of body) {
        if (!proj || typeof proj.id !== "number") continue;
        const { data: existing } = await supabase
          .from("projects")
          .select("id, client_name")
          .eq("id", proj.id)
          .maybeSingle();
        if (!existing || !owns(existing.client_name)) continue;
        const patch: Record<string, unknown> = {};
        if (Array.isArray(proj.comments)) patch.comments = proj.comments;
        if (typeof proj.status === "string") patch.status = proj.status;
        if (Object.keys(patch).length === 0) continue;
        const { error: updateError } = await supabase.from("projects").update(patch).eq("id", proj.id);
        if (updateError) throw updateError;
        updated++;
      }
      return NextResponse.json({ success: true, updated });
    }

    // Safety guard: never wipe table on empty array
    if (body.length === 0) {
      return NextResponse.json({ success: true, message: "Ignored empty payload for safety" });
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
