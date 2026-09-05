import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { FinanceDb } from "@/lib/db/financeDb";
import { r2, bucketName } from "@/lib/r2Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { collectFullBackupData } from "../route";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Arquivo de backup inválido." }, { status: 400 });
    }

    // Support both direct root format or wrapper format ({ data: { ... } })
    const data = payload.data || payload;

    // 1. Safety snapshot of current state before restoration
    try {
      const currentBackup = await collectFullBackupData();
      const safetyKey = `backups/safety-pre-restore-${Date.now()}.json`;
      await r2.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: safetyKey,
          Body: JSON.stringify(currentBackup, null, 2),
          ContentType: "application/json",
        })
      );
    } catch (safetyErr) {
      console.warn("Safety backup warning:", safetyErr);
    }

    const restorationSummary: Record<string, number> = {};

    // 2. Restore Leads
    if (Array.isArray(data.leads) && data.leads.length > 0) {
      await supabase.from("leads").delete().neq("id", -1);
      const rows = data.leads.map((l: any) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        email: l.email,
        whatsapp: l.whatsapp,
        project_type: l.project_type || l.projectType,
        value: l.value,
        stage: l.stage,
        details: l.details,
      }));
      await supabase.from("leads").insert(rows);
      restorationSummary.leads = rows.length;
    }

    // 3. Restore Clients
    if (Array.isArray(data.clients) && data.clients.length > 0) {
      await supabase.from("clients").delete().neq("id", -1);
      const rows = data.clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        company: c.company,
        cnpj: c.cnpj,
        email: c.email,
        whatsapp: c.whatsapp,
        address: c.address,
        projects_count: c.projects_count || c.projectsCount || 0,
        total_value: c.total_value || c.totalValue || 0,
        responsible: c.responsible,
        notes: c.notes || "",
        logo_url: c.logo_url || c.logoUrl || null,
      }));
      await supabase.from("clients").insert(rows);
      restorationSummary.clients = rows.length;
    }

    // 4. Restore Projects
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      await supabase.from("projects").delete().neq("id", -1);
      const rows = data.projects.map((p: any) => ({
        id: p.id,
        name: p.name,
        client_name: p.client_name || p.clientName,
        service_type: p.service_type || p.serviceType,
        date_shoot: p.date_shoot || p.dateShoot,
        date_delivery: p.date_delivery || p.dateDelivery,
        budget: p.budget,
        status: p.status,
        shot_list: p.shot_list || p.shotList || [],
        checklist: p.checklist || [],
        crew: p.crew || [],
        location: p.location || "",
        references: p.references || "",
        comments: p.comments || [],
        video_url: p.video_url || p.videoUrl || null,
        version: p.version || "v1",
      }));
      await supabase.from("projects").insert(rows);
      restorationSummary.projects = rows.length;
    }

    // 5. Restore Tasks
    if (Array.isArray(data.tasks) && data.tasks.length > 0) {
      await supabase.from("tasks").delete().neq("id", -1);
      const rows = data.tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        project: t.project,
        assigned_to: t.assigned_to || t.assignedTo,
        due_date: t.due_date || t.dueDate,
        priority: t.priority,
        status: t.status,
        checklist: t.checklist || [],
        tags: t.tags || [],
      }));
      await supabase.from("tasks").insert(rows);
      restorationSummary.tasks = rows.length;
    }

    // 6. Restore Equipments
    if (Array.isArray(data.equipments) && data.equipments.length > 0) {
      await supabase.from("equipments").delete().neq("id", -1);
      const rows = data.equipments.map((e: any) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        serial_number: e.serial_number || e.serialNumber,
        status: e.status,
        last_maintenance: e.last_maintenance || e.lastMaintenance,
        responsible: e.responsible,
        photos: e.photos || [],
      }));
      await supabase.from("equipments").insert(rows);
      restorationSummary.equipments = rows.length;
    }

    // 7. Restore Locations
    if (Array.isArray(data.locations) && data.locations.length > 0) {
      await supabase.from("locations").delete().neq("id", -1);
      const rows = data.locations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        rate: loc.rate,
        status: loc.status,
        contact: loc.contact,
      }));
      await supabase.from("locations").insert(rows);
      restorationSummary.locations = rows.length;
    }

    // 8. Restore Contracts
    if (Array.isArray(data.contracts) && data.contracts.length > 0) {
      await supabase.from("contracts").delete().neq("id", -1);
      const rows = data.contracts.map((c: any) => ({
        id: c.id,
        title: c.title,
        client: c.client,
        date: c.date,
        status: c.status,
      }));
      await supabase.from("contracts").insert(rows);
      restorationSummary.contracts = rows.length;
    }

    // 9. Restore Notifications
    if (Array.isArray(data.notifications) && data.notifications.length > 0) {
      await supabase.from("notifications").delete().neq("id", -1);
      const rows = data.notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        time: n.time,
        unread: n.unread ?? true,
        type: n.type,
      }));
      await supabase.from("notifications").insert(rows);
      restorationSummary.notifications = rows.length;
    }

    // 10. Restore Service Types
    if (Array.isArray(data.serviceTypes) && data.serviceTypes.length > 0) {
      await supabase.from("service_types").delete().neq("id", -1);
      const rows = data.serviceTypes.map((s: any, idx: number) => ({
        id: idx + 1,
        name: typeof s === "string" ? s : s.name,
      }));
      await supabase.from("service_types").insert(rows);
      restorationSummary.serviceTypes = rows.length;
    }

    // 11. Restore Event Media
    if (Array.isArray(data.eventMedia) && data.eventMedia.length > 0) {
      await supabase.from("event_media").delete().neq("id", -1);
      const rows = data.eventMedia.map((em: any) => ({
        id: em.id,
        name: em.name,
        date: em.date,
        price_per_photo: em.price_per_photo || em.pricePerPhoto || 15,
        package_price: em.package_price || em.packagePrice || 199,
        photos: em.photos || [],
      }));
      await supabase.from("event_media").insert(rows);
      restorationSummary.eventMedia = rows.length;
    }

    // 12. Restore Finance Data (Bank accounts, transactions, billings, payables, goals, assets)
    if (data.finance && typeof data.finance === "object") {
      await FinanceDb.save(data.finance);
      restorationSummary.finance = 1;
    }

    // 13. Restore Admin Accounts
    if (Array.isArray(data.adminAccounts) && data.adminAccounts.length > 0) {
      await r2.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: "db/admin-accounts.json",
          Body: JSON.stringify(data.adminAccounts),
          ContentType: "application/json",
        })
      );
      restorationSummary.adminAccounts = data.adminAccounts.length;
    }

    return NextResponse.json({
      success: true,
      message: "Backup restaurado com sucesso!",
      restored: restorationSummary,
    });
  } catch (err: any) {
    console.error("Backup restoration error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
