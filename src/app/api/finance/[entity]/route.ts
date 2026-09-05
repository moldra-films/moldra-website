import { NextResponse } from "next/server";
import { FinanceDb, FinanceDatabase } from "@/lib/db/financeDb";
import { AuditLog, Transaction } from "@/types/finance";

function mapEntityToKey(entity: string): keyof FinanceDatabase | null {
  switch (entity) {
    case "bank-accounts": return "bankAccounts";
    case "categories": return "categories";
    case "transactions": return "transactions";
    case "billings": return "billings";
    case "payables": return "payables";
    case "goals": return "goals";
    case "assets": return "assets";
    case "imported-transactions": return "importedTransactions";
    case "audit-logs": return "auditLogs";
    default: return null;
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const db = await FinanceDb.load(true);
    const key = mapEntityToKey(entity);

    if (!key) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
    }

    return NextResponse.json(db[key], {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error(`Error in GET /api/finance/${error.message}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const key = mapEntityToKey(entity);

    if (!key) {
      return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 });
    }

    const payload = await request.json();
    if (!Array.isArray(payload) && key !== "categories") {
      return NextResponse.json({ error: "Payload must be an array" }, { status: 400 });
    }

    const db = await FinanceDb.load(true);
    const user = request.headers.get("x-user-name") || "Natália Camurça";

    // Dynamic Audit Engine for Transactions
    if (key === "transactions") {
      const oldTransactions = db.transactions;
      const newTransactions = payload as Transaction[];
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0];

      const newLogs: AuditLog[] = [];

      // 1. Detect Deleted Transactions
      oldTransactions.forEach((oldTx) => {
        const stillExists = newTransactions.some((newTx) => newTx.id === oldTx.id);
        if (!stillExists) {
          newLogs.push({
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            user,
            date: dateStr,
            time: timeStr,
            action: `${user} excluiu a transação de ${oldTx.type.toLowerCase()} "${oldTx.description}" de R$ ${oldTx.value.toLocaleString()}`,
            oldValue: JSON.stringify(oldTx),
            newValue: null,
            targetId: oldTx.id,
          });
        }
      });

      // 2. Detect Added / Modified Transactions
      newTransactions.forEach((newTx) => {
        const oldTx = oldTransactions.find((tx) => tx.id === newTx.id);

        if (!oldTx) {
          // It's a new transaction!
          newLogs.push({
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            user,
            date: dateStr,
            time: timeStr,
            action: `${user} criou a transação de ${newTx.type.toLowerCase()} "${newTx.description}" no valor de R$ ${newTx.value.toLocaleString()}`,
            oldValue: null,
            newValue: JSON.stringify(newTx),
            targetId: newTx.id,
          });
        } else {
          // It's an edit! Check for critical differences
          const changes: string[] = [];
          if (oldTx.value !== newTx.value) {
            changes.push(`valor de R$ ${oldTx.value.toLocaleString()} para R$ ${newTx.value.toLocaleString()}`);
          }
          if (oldTx.status !== newTx.status) {
            changes.push(`status de "${oldTx.status}" para "${newTx.status}"`);
          }
          if (oldTx.description !== newTx.description) {
            changes.push(`descrição de "${oldTx.description}" para "${newTx.description}"`);
          }
          if (oldTx.date !== newTx.date) {
            changes.push(`data de "${oldTx.date}" para "${newTx.date}"`);
          }
          if (oldTx.category !== newTx.category) {
            changes.push(`categoria de "${oldTx.category}" para "${newTx.category}"`);
          }

          if (changes.length > 0) {
            newLogs.push({
              id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              user,
              date: dateStr,
              time: timeStr,
              action: `${user} alterou a transação "${newTx.description}": ${changes.join(", ")}`,
              oldValue: JSON.stringify(oldTx),
              newValue: JSON.stringify(newTx),
              targetId: newTx.id,
            });
          }
        }
      });

      // Append new logs to the database audit trail
      if (newLogs.length > 0) {
        db.auditLogs = [...newLogs, ...db.auditLogs];
      }
    }

    // Save payload to target key in db
    // @ts-ignore
    db[key] = payload;

    // Persist changes
    await FinanceDb.save(db);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error in POST /api/finance/${error.message}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
