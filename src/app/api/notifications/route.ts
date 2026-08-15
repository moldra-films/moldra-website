import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      // Show newest first for notifications or keep order? In context, it might be unshifted (added to start),
      // but ordering by id ascending and then unshifting or reversing in JS is standard. Let's order by ID ascending
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = data.map((notif: any) => ({
      id: notif.id,
      title: notif.title,
      description: notif.description,
      time: notif.time,
      unread: notif.unread,
      type: notif.type,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Error reading notifications from Supabase:", error);
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
      .from("notifications")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 2. Insert new notifications
    if (body.length > 0) {
      const insertRows = body.map((notif: any) => ({
        id: notif.id,
        title: notif.title,
        description: notif.description,
        time: notif.time,
        unread: notif.unread,
        type: notif.type,
      }));

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(insertRows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing notifications to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
