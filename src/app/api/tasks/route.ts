import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      project: task.project,
      assignedTo: task.assigned_to,
      dueDate: task.due_date,
      priority: task.priority,
      status: task.status,
      checklist: task.checklist || [],
      tags: task.tags || [],
    }));

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error reading tasks from Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload, must be an array" }, { status: 400 });
    }

    // Safety guard: never wipe table on empty array
    if (body.length === 0) {
      return NextResponse.json({ success: true, message: "Ignored empty payload for safety" });
    }

    // 1. Delete all current rows
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .neq("id", -1);
    
    if (deleteError) throw deleteError;

    // 2. Insert new tasks
    if (body.length > 0) {
      const insertRows = body.map((task: any) => ({
        id: task.id,
        title: task.title,
        project: task.project,
        assigned_to: task.assignedTo,
        due_date: task.dueDate,
        priority: task.priority,
        status: task.status,
        checklist: task.checklist || [],
        tags: task.tags || [],
      }));

      const { error: insertError } = await supabase
        .from("tasks")
        .insert(insertRows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing tasks to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
