import { NextResponse } from "next/server";
import { FinanceDb } from "@/lib/db/financeDb";
import { BankAccount, Transaction, AuditLog } from "@/types/finance";

export async function POST(request: Request) {
  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Pluggy credentials not configured in environmental variables" }, { status: 400 });
    }

    // 1. Authenticate with Pluggy to get API Key
    const authRes = await fetch("https://api.pluggy.ai/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      return NextResponse.json({ error: `Auth failed: ${errText}` }, { status: 500 });
    }

    const { apiKey } = await authRes.json();

    // 2. Fetch Accounts
    const accountsRes = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
      headers: { "X-API-KEY": apiKey }
    });

    if (!accountsRes.ok) {
      const errText = await accountsRes.text();
      return NextResponse.json({ error: `Failed to fetch accounts: ${errText}` }, { status: 500 });
    }

    const accountsData = await accountsRes.json();
    const pluggyAccounts = accountsData.results || [];

    // 3. Load DB
    const db = await FinanceDb.load();
    const existingAccounts = db.bankAccounts || [];
    const existingTxs = db.transactions || [];
    const auditLogs = db.auditLogs || [];

    const now = new Date();
    const updatedAccounts = [...existingAccounts];
    const newTransactionsList = [...existingTxs];

    // 4. Fetch Transactions for each account & merge
    for (const pAcc of pluggyAccounts) {
      // Map brand/bank name (e.g. "Nubank", "Itaú", etc.)
      let mappedBank = "Outro";
      const brand = pAcc.bankData?.name || "";
      if (brand.toLowerCase().includes("nubank")) mappedBank = "Nubank";
      else if (brand.toLowerCase().includes("itau")) mappedBank = "Itaú";
      else if (brand.toLowerCase().includes("bradesco")) mappedBank = "Bradesco";
      else if (brand.toLowerCase().includes("brasil")) mappedBank = "Banco do Brasil";
      else if (brand.toLowerCase().includes("santander")) mappedBank = "Santander";
      else if (brand.toLowerCase().includes("inter")) mappedBank = "Inter";
      else if (brand.toLowerCase().includes("c6")) mappedBank = "C6 Bank";
      else if (brand.toLowerCase().includes("btg")) mappedBank = "BTG Pactual";
      else if (brand.toLowerCase().includes("safra")) mappedBank = "Safra";
      else if (brand.toLowerCase().includes("caixa")) mappedBank = "Caixa Econômica";
      else if (brand.toLowerCase().includes("sicoob")) mappedBank = "Sicoob";
      else if (brand.toLowerCase().includes("sicredi")) mappedBank = "Sicredi";
      else mappedBank = brand || "Outro";

      const bankAccId = `pluggy-${pAcc.id}`;
      const mappedAccount: BankAccount = {
        id: bankAccId,
        bank: mappedBank,
        name: `${mappedBank} PJ (${pAcc.name || "Principal"})`,
        type: pAcc.type === "SAVINGS_ACCOUNT" ? "Poupança" : (pAcc.type === "CREDIT_CARD" ? "Investimentos" : "Corrente"),
        agency: pAcc.agency || "0001",
        account: pAcc.number || "0000000-0",
        initialBalance: pAcc.balance || 0,
        currentBalance: pAcc.balance || 0,
        status: "Ativa",
        lastSync: now.toISOString()
      };

      const existingAccIndex = updatedAccounts.findIndex(a => a.id === bankAccId);
      if (existingAccIndex >= 0) {
        updatedAccounts[existingAccIndex] = {
          ...updatedAccounts[existingAccIndex],
          currentBalance: mappedAccount.currentBalance,
          lastSync: mappedAccount.lastSync
        };
      } else {
        updatedAccounts.push(mappedAccount);
      }

      // Fetch transactions for this account
      const txRes = await fetch(`https://api.pluggy.ai/transactions?accountId=${pAcc.id}`, {
        headers: { "X-API-KEY": apiKey }
      });

      if (txRes.ok) {
        const txData = await txRes.json();
        const pluggyTxs = txData.results || [];

        for (const pTx of pluggyTxs) {
          const mappedTxId = `pluggy-${pTx.id}`;
          // Avoid duplicate transactions
          if (newTransactionsList.some(t => t.id === mappedTxId)) {
            continue;
          }

          // Map values: pluggy amount is positive for credit (inflow), negative for debit (outflow)
          const value = Math.abs(pTx.amount);
          const type = pTx.amount >= 0 ? "Entrada" : "Saída";

          const mappedTx: Transaction = {
            id: mappedTxId,
            description: pTx.description || "Transação Importada",
            category: pTx.category || "Outros",
            customerOrProvider: "",
            bankAccountId: bankAccId,
            paymentMethod: "Pix",
            value,
            type,
            date: pTx.date ? pTx.date.split("T")[0] : now.toISOString().split("T")[0],
            dueDate: pTx.date ? pTx.date.split("T")[0] : now.toISOString().split("T")[0],
            status: "Recebido", // Pluggy is real historical ledger, so marked as cleared
            receiptUrl: null,
            origin: "API",
            notes: `Sincronizado via Open Finance (Pluggy Item: ${itemId})`
          };

          newTransactionsList.push(mappedTx);
        }
      }
    }

    // Save back to DB
    db.bankAccounts = updatedAccounts;
    db.transactions = newTransactionsList;
    
    // Add audit log
    const syncLog: AuditLog = {
      id: `log-sync-pluggy-${Date.now()}`,
      user: "Sistema",
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0],
      action: `Open Finance sincronizado com sucesso. ID da conexão: ${itemId}. Contas importadas: ${pluggyAccounts.length}.`,
      oldValue: null,
      newValue: `Pluggy Item ID: ${itemId}`,
      targetId: itemId
    };
    db.auditLogs = [syncLog, ...auditLogs];

    await FinanceDb.save(db);

    return NextResponse.json({ success: true, accountsCount: pluggyAccounts.length });
  } catch (err: any) {
    console.error("Pluggy sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
