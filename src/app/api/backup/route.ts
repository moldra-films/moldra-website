import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { FinanceDb } from "@/lib/db/financeDb";
import { r2, bucketName } from "@/lib/r2Client";
import { PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function collectFullBackupData() {
  const [
    leadsRes,
    clientsRes,
    projectsRes,
    tasksRes,
    equipmentsRes,
    locationsRes,
    contractsRes,
    notificationsRes,
    serviceTypesRes,
    eventMediaRes,
  ] = await Promise.all([
    supabase.from("leads").select("*").order("id", { ascending: true }),
    supabase.from("clients").select("*").order("id", { ascending: true }),
    supabase.from("projects").select("*").order("id", { ascending: true }),
    supabase.from("tasks").select("*").order("id", { ascending: true }),
    supabase.from("equipments").select("*").order("id", { ascending: true }),
    supabase.from("locations").select("*").order("id", { ascending: true }),
    supabase.from("contracts").select("*").order("id", { ascending: true }),
    supabase.from("notifications").select("*").order("id", { ascending: true }),
    supabase.from("service_types").select("*").order("id", { ascending: true }),
    supabase.from("event_media").select("*").order("id", { ascending: true }),
  ]);

  const financeData = await FinanceDb.load().catch(() => null);

  // Also read admin accounts if available in R2
  let adminAccounts: any[] = [];
  try {
    const accRes = await r2.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: "db/admin-accounts.json",
    }));
    const str = await accRes.Body?.transformToString();
    if (str) adminAccounts = JSON.parse(str);
  } catch {}

  const now = new Date();
  return {
    version: "1.0",
    appName: "Moldra Films",
    exportDate: now.toISOString(),
    formattedDate: now.toLocaleString("pt-BR"),
    data: {
      leads: leadsRes.data || [],
      clients: clientsRes.data || [],
      projects: projectsRes.data || [],
      tasks: tasksRes.data || [],
      equipments: equipmentsRes.data || [],
      locations: locationsRes.data || [],
      contracts: contractsRes.data || [],
      notifications: notificationsRes.data || [],
      serviceTypes: (serviceTypesRes.data || []).map((s: any) => s.name || s),
      eventMedia: eventMediaRes.data || [],
      finance: financeData,
      adminAccounts,
    },
    counts: {
      leads: leadsRes.data?.length || 0,
      clients: clientsRes.data?.length || 0,
      projects: projectsRes.data?.length || 0,
      tasks: tasksRes.data?.length || 0,
      equipments: equipmentsRes.data?.length || 0,
      locations: locationsRes.data?.length || 0,
      contracts: contractsRes.data?.length || 0,
      notifications: notificationsRes.data?.length || 0,
      eventMedia: eventMediaRes.data?.length || 0,
      transactions: financeData?.transactions?.length || 0,
      bankAccounts: financeData?.bankAccounts?.length || 0,
    }
  };
}

// GET: Download complete backup as JSON
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const download = url.searchParams.get("download") === "true";

    const backup = await collectFullBackupData();

    const jsonString = JSON.stringify(backup, null, 2);
    const dateStamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const fileName = `moldra-films-backup-${dateStamp}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...(download
          ? {
              "Content-Disposition": `attachment; filename="${fileName}"`,
            }
          : {}),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Backup export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Save snapshot to Cloudflare R2 backup vault
export async function POST(request: Request) {
  try {
    const backup = await collectFullBackupData();
    const dateStamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const key = `backups/moldra-backup-${dateStamp}.json`;

    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(backup, null, 2),
        ContentType: "application/json",
      })
    );

    return NextResponse.json({
      success: true,
      key,
      date: backup.formattedDate,
      counts: backup.counts,
    });
  } catch (err: any) {
    console.error("Backup snapshot save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
