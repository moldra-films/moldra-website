"use client";

import { useState, useEffect, useRef } from "react";
import { useAdmin } from "@/context/AdminContext";
import { 
  Plus, Check, DollarSign, FileText, Share2, Printer, X, 
  ArrowDownRight, ArrowUpRight, ArrowLeftRight, TrendingUp, 
  Wallet, Calendar, AlertCircle, Building, Activity, Edit2, 
  Trash2, Copy, FileSpreadsheet, Paperclip, History, Search, 
  Filter, Target, Package, ChevronRight, ChevronDown, Download, 
  RefreshCw, Sparkles, Upload 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BankAccount, Transaction, Billing, Payable, 
  FinancialGoal, Asset, AuditLog, ImportedTransaction 
} from "@/types/finance";

type DateFilterType = "Hoje" | "Esta semana" | "Este mês" | "Últimos 30 dias" | "Este ano" | "Personalizado";

const BankLogoBadge = ({ bank }: { bank: string }) => {
  switch (bank) {
    case "Nubank":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#820AD1] flex items-center justify-center text-white font-extrabold text-[11px] select-none shadow shadow-[#820AD1]/30">
          Nu
        </div>
      );
    case "Itaú":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#EC7000] border border-[#EC7000] flex items-center justify-center text-white font-black text-[9px] select-none shadow shadow-[#EC7000]/30 italic">
          Itau
        </div>
      );
    case "Bradesco":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#CC092F] flex items-center justify-center text-white select-none shadow shadow-[#CC092F]/30">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-4h2v4zm0-6h-2V8h2v2z" />
          </svg>
        </div>
      );
    case "Banco do Brasil":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#FDF600] flex items-center justify-center text-[#0038A8] select-none shadow shadow-[#FDF600]/30">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 12h5v8h10v-8h5L12 2z" />
          </svg>
        </div>
      );
    case "Santander":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#EC0000] flex items-center justify-center text-white select-none shadow shadow-[#EC0000]/30">
          <span className="font-sans font-bold text-[8px] uppercase tracking-tighter">Sant</span>
        </div>
      );
    case "Inter":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#FF7A00] flex items-center justify-center text-white font-bold text-[10px] select-none shadow shadow-[#FF7A00]/30">
          Inter
        </div>
      );
    case "C6 Bank":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#111111] border border-white/10 flex items-center justify-center text-white font-black text-[9px] select-none shadow">
          C6
        </div>
      );
    case "BTG Pactual":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#001E62] flex items-center justify-center text-white font-bold text-[8px] select-none shadow">
          BTG
        </div>
      );
    case "Safra":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#A88434] flex items-center justify-center text-white font-serif font-bold text-[9px] select-none shadow">
          Safra
        </div>
      );
    case "Caixa Econômica":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#005CA9] flex items-center justify-center text-[#FDF600] font-black text-[12px] select-none shadow italic">
          X
        </div>
      );
    case "Sicoob":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#003641] flex items-center justify-center text-[#00AE96] font-bold text-[8px] select-none shadow">
          Sicoob
        </div>
      );
    case "Sicredi":
      return (
        <div className="w-8 h-8 rounded-lg bg-[#32963C] flex items-center justify-center text-white font-bold text-[9px] select-none shadow">
          Sicredi
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-primary font-bold text-xs uppercase select-none">
          {bank.substring(0, 2)}
        </div>
      );
  }
};

export default function FinanceTab() {
  const { clients, activeFinanceSubTab: activeSubTab, setActiveFinanceSubTab: setActiveSubTab } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter States
  const [dateFilter, setDateFilter] = useState<DateFilterType>("Este mês");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [accountFilter, setAccountFilter] = useState<string>("todos");

  // Database States
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [importedTransactions, setImportedTransactions] = useState<ImportedTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Loading & Action States
  const [isLoading, setIsLoading] = useState(true);
  const [activeUser, setActiveUser] = useState("Natália Camurça");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [openFinanceConnected, setOpenFinanceConnected] = useState(false);
  const [showOpenFinanceModal, setShowOpenFinanceModal] = useState(false);
  const [uploadingTxId, setUploadingTxId] = useState<string | null>(null);
  const [statementImported, setStatementImported] = useState(false);

  // Statement sub-tabs (Cash Flow, DRE, Balance Sheet, Category Chart)
  const [statementSubView, setStatementSubView] = useState<"flow" | "dre" | "balance" | "categories">("flow");
  const [cashFlowPeriod, setCashFlowPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  // Form States
  const [txForm, setTxForm] = useState({
    id: "",
    description: "",
    type: "Entrada" as Transaction["type"],
    category: "Serviços",
    subcategory: "",
    customerOrProvider: "",
    bankAccountId: "",
    fromBankAccountId: "",
    toBankAccountId: "",
    paymentMethod: "Pix",
    value: 0,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    status: "Pendente" as Transaction["status"],
    notes: "",
  });

  const [transferForm, setTransferForm] = useState({
    value: 0,
    fromAccountId: "",
    toAccountId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [accountForm, setAccountForm] = useState({
    bank: "Nubank",
    name: "",
    type: "Corrente" as BankAccount["type"],
    agency: "",
    account: "",
    initialBalance: 0,
  });

  const [goalForm, setGoalForm] = useState({
    name: "",
    targetValue: 0,
    currentValue: 0,
    deadline: "",
  });

  const [assetForm, setAssetForm] = useState({
    name: "",
    acquisitionValue: 0,
    category: "Equipamentos",
    acquisitionDate: new Date().toISOString().split("T")[0],
    depreciationRate: 10,
  });

  const [billingForm, setBillingForm] = useState({
    client: "",
    service: "",
    value: 0,
    billingDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    bankAccountId: "",
    paymentMethod: "Boleto",
    notes: "",
  });

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const endpoints = [
        "bank-accounts", "categories", "transactions", 
        "billings", "payables", "goals", "assets", 
        "imported-transactions", "audit-logs"
      ];
      
      const responses = await Promise.all(
        endpoints.map(ep => fetch(`/api/finance/${ep}`, { 
          cache: "no-store", 
          headers: { "Cache-Control": "no-cache" } 
        }).then(r => r.ok ? r.json() : []).catch(() => []))
      );

      setBankAccounts(responses[0] || []);
      setCategories(responses[1] || []);
      setTransactions(responses[2] || []);
      setBillings(responses[3] || []);
      setPayables(responses[4] || []);
      setGoals(responses[5] || []);
      setAssets(responses[6] || []);
      setImportedTransactions(responses[7] || []);
      setAuditLogs(responses[8] || []);
      
      // Auto determine active user name from UI contexts or defaults
      if (clients && clients.length > 0) {
        // Just mock user email mapping check
        const storedRole = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('moldra-role='))?.split('=')[1] : null;
        if (storedRole === 'admin') setActiveUser("Mikelly Maduro");
      }
    } catch (err) {
      console.error("Failed to load financial records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save changes to backend
  const saveEntity = async (entity: string, data: any) => {
    try {
      const res = await fetch(`/api/finance/${entity}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-name": activeUser
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Error saving ${entity}`);
      
      // If saving transactions, sync to Supabase fallback api/transactions to ensure cross-app integration
      if (entity === "transactions") {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).catch(e => console.error("Failed to sync to Supabase transactions table:", e));
      }
      
      loadData();
    } catch (err) {
      console.error(`Failed to save ${entity}:`, err);
    }
  };

  // Helper date filter ranges
  const filterByDate = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const last30 = new Date(today);
    last30.setDate(today.getDate() - 30);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    switch (dateFilter) {
      case "Hoje":
        return d.getTime() >= today.getTime();
      case "Esta semana":
        return d.getTime() >= startOfWeek.getTime();
      case "Este mês":
        return d.getTime() >= startOfMonth.getTime();
      case "Últimos 30 dias":
        return d.getTime() >= last30.getTime();
      case "Este ano":
        return d.getTime() >= startOfYear.getTime();
      case "Personalizado":
        if (customStartDate && customEndDate) {
          const sd = new Date(customStartDate);
          const ed = new Date(customEndDate);
          ed.setHours(23,59,59,999);
          return d.getTime() >= sd.getTime() && d.getTime() <= ed.getTime();
        }
        return true;
      default:
        return true;
    }
  };

  // Calculations & Analytics
  const filteredTxs = transactions.filter(tx => {
    const matchSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        tx.customerOrProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "todos" ? true : tx.type === typeFilter;
    const matchStatus = statusFilter === "todos" ? true : tx.status === statusFilter;
    const matchAccount = accountFilter === "todos" ? true : tx.bankAccountId === accountFilter || tx.fromBankAccountId === accountFilter || tx.toBankAccountId === accountFilter;
    const matchDate = filterByDate(tx.date);

    return matchSearch && matchType && matchStatus && matchAccount && matchDate;
  });

  const totals = (() => {
    let entradas = 0;
    let saidas = 0;
    
    filteredTxs.forEach(t => {
      if (t.type === "Entrada" && (t.status === "Recebido" || t.status === "Pago")) {
        entradas += t.value;
      } else if (t.type === "Saída" && t.status === "Pago") {
        saidas += t.value;
      }
    });

    const totalDisponivel = bankAccounts.reduce((acc, b) => b.status === "Ativa" ? acc + b.currentBalance : acc, 0);
    
    // Unpaid/Receivables
    const aReceber = billings.filter(b => b.status === "A receber").reduce((acc, b) => acc + b.value, 0);
    const aPagar = payables.filter(p => p.status === "Pendente").reduce((acc, p) => acc + p.value, 0);
    
    const vencidosReceber = billings.filter(b => b.status === "A receber" && new Date(b.dueDate) < new Date()).reduce((acc, b) => acc + b.value, 0);
    const vencidosPagar = payables.filter(p => p.status === "Pendente" && new Date(p.dueDate) < new Date()).reduce((acc, p) => acc + p.value, 0);

    return {
      entradas,
      saidas,
      saldoLiquido: entradas - saidas,
      totalDisponivel,
      aReceber,
      aPagar,
      vencidosTotal: vencidosReceber + vencidosPagar,
      vencidosPagar
    };
  })();

  // Transaction CRUD Actions
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    const newTxId = txForm.id || `tx-${Date.now()}`;
    const valueNum = Number(txForm.value);

    // If edit mode
    if (txForm.id) {
      updated = transactions.map(t => {
        if (t.id === txForm.id) {
          // If transaction status changed to paid, verify if we need to adjust account balance
          adjustBankBalancesOnStatusChange(t, { ...t, value: valueNum, status: txForm.status, bankAccountId: txForm.bankAccountId });
          return {
            ...t,
            description: txForm.description,
            value: valueNum,
            category: txForm.category,
            subcategory: txForm.subcategory,
            customerOrProvider: txForm.customerOrProvider,
            bankAccountId: txForm.bankAccountId,
            paymentMethod: txForm.paymentMethod,
            date: txForm.date,
            dueDate: txForm.dueDate,
            status: txForm.status,
            notes: txForm.notes
          };
        }
        return t;
      });
    } else {
      // Create new transaction
      const newTx: Transaction = {
        id: newTxId,
        description: txForm.description,
        type: txForm.type,
        category: txForm.category,
        subcategory: txForm.subcategory,
        customerOrProvider: txForm.customerOrProvider,
        bankAccountId: txForm.bankAccountId,
        paymentMethod: txForm.paymentMethod,
        value: valueNum,
        date: txForm.date,
        dueDate: txForm.dueDate,
        status: txForm.status,
        origin: "Manual",
        receiptUrl: null,
        notes: txForm.notes
      };
      
      updated = [...transactions, newTx];
      
      // Update bank account balance if paid/received immediately
      if ((newTx.status === "Recebido" || newTx.status === "Pago") && newTx.bankAccountId) {
        updateAccountBalance(newTx.bankAccountId, newTx.value, newTx.type === "Entrada" ? "add" : "sub");
      }
    }

    saveEntity("transactions", updated);
    setShowTransactionModal(false);
    resetTxForm();
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      description: `${tx.description} (Cópia)`,
      date: new Date().toISOString().split("T")[0],
      status: tx.type === "Entrada" ? "Pendente" : "Pendente"
    };
    saveEntity("transactions", [...transactions, duplicated]);
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    if (confirm(`Tem certeza de que deseja excluir a transação "${tx.description}"? A operação será registrada no log de auditoria.`)) {
      // Revert bank balances if it was previously paid
      if (tx.status === "Pago" || tx.status === "Recebido") {
        updateAccountBalance(tx.bankAccountId!, tx.value, tx.type === "Entrada" ? "sub" : "add");
      }
      const filtered = transactions.filter(t => t.id !== tx.id);
      saveEntity("transactions", filtered);
    }
  };

  const handleUploadClick = (txId: string) => {
    setUploadingTxId(txId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTxId) return;

    try {
      // Get presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const { uploadUrl, fileUrl } = await res.json();

      // Put to R2
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      // Save to transaction
      const updated = transactions.map(t => t.id === uploadingTxId ? { ...t, receiptUrl: fileUrl } : t);
      await saveEntity("transactions", updated);
      alert("Comprovante anexado com sucesso!");
    } catch (err) {
      console.error("Failed to upload file to R2:", err);
      alert("Falha ao fazer upload do comprovante.");
    } finally {
      setUploadingTxId(null);
    }
  };

  // Transfer Actions
  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = Number(transferForm.value);
    if (!transferForm.fromAccountId || !transferForm.toAccountId) {
      alert("Selecione as contas de origem e destino.");
      return;
    }
    if (transferForm.fromAccountId === transferForm.toAccountId) {
      alert("A conta de destino deve ser diferente da conta de origem.");
      return;
    }

    const fromAcc = bankAccounts.find(b => b.id === transferForm.fromAccountId);
    if (fromAcc && fromAcc.currentBalance < valueNum) {
      if (!confirm("O saldo da conta de origem é menor que o valor da transferência. Continuar?")) return;
    }

    const transferTx: Transaction = {
      id: `tx-tf-${Date.now()}`,
      description: `Transferência de ${bankAccounts.find(b => b.id === transferForm.fromAccountId)?.bank} para ${bankAccounts.find(b => b.id === transferForm.toAccountId)?.bank}`,
      type: "Transferência",
      category: "Transferência",
      customerOrProvider: "Moldra Films",
      fromBankAccountId: transferForm.fromAccountId,
      toBankAccountId: transferForm.toAccountId,
      paymentMethod: "Transferência",
      value: valueNum,
      date: transferForm.date,
      dueDate: transferForm.date,
      status: "Pago",
      origin: "Manual",
      receiptUrl: null,
      notes: transferForm.notes
    };

    // Update balances
    updateAccountBalance(transferForm.fromAccountId, valueNum, "sub");
    updateAccountBalance(transferForm.toAccountId, valueNum, "add");

    saveEntity("transactions", [...transactions, transferTx]);
    setShowTransferModal(false);
    setTransferForm({
      value: 0,
      fromAccountId: "",
      toAccountId: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  // Helper function to update bank account balance
  const updateAccountBalance = (accountId: string, amount: number, operation: "add" | "sub") => {
    const updated = bankAccounts.map(b => {
      if (b.id === accountId) {
        const diff = operation === "add" ? amount : -amount;
        return {
          ...b,
          currentBalance: b.currentBalance + diff
        };
      }
      return b;
    });
    saveEntity("bank-accounts", updated);
  };

  const adjustBankBalancesOnStatusChange = (oldTx: Transaction, newTx: Transaction) => {
    const wasPaid = oldTx.status === "Pago" || oldTx.status === "Recebido";
    const isPaid = newTx.status === "Pago" || newTx.status === "Recebido";

    if (wasPaid && !isPaid) {
      // Revert previous balance impact
      updateAccountBalance(oldTx.bankAccountId!, oldTx.value, oldTx.type === "Entrada" ? "sub" : "add");
    } else if (!wasPaid && isPaid) {
      // Add balance impact
      updateAccountBalance(newTx.bankAccountId!, newTx.value, newTx.type === "Entrada" ? "add" : "sub");
    } else if (wasPaid && isPaid && (oldTx.value !== newTx.value || oldTx.bankAccountId !== newTx.bankAccountId)) {
      // Balance impact changed or account changed
      // 1. Revert old
      updateAccountBalance(oldTx.bankAccountId!, oldTx.value, oldTx.type === "Entrada" ? "sub" : "add");
      // 2. Add new
      updateAccountBalance(newTx.bankAccountId!, newTx.value, newTx.type === "Entrada" ? "add" : "sub");
    }
  };

  // Billings (Receivables)
  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = Number(billingForm.value);
    const newBill: Billing = {
      id: `bill-${Date.now()}`,
      client: billingForm.client,
      service: billingForm.service,
      value: valueNum,
      billingDate: billingForm.billingDate,
      dueDate: billingForm.dueDate,
      status: "A receber",
      bankAccountId: billingForm.bankAccountId,
      paymentMethod: billingForm.paymentMethod,
      notes: billingForm.notes
    };

    // Create a matching pending transaction
    const matchingTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      description: `${billingForm.service} - ${billingForm.client}`,
      type: "Entrada",
      category: "Serviços",
      customerOrProvider: billingForm.client,
      bankAccountId: billingForm.bankAccountId,
      paymentMethod: billingForm.paymentMethod,
      value: valueNum,
      date: billingForm.billingDate,
      dueDate: billingForm.dueDate,
      status: "Pendente",
      origin: "Manual",
      receiptUrl: null,
      notes: billingForm.notes,
      billingId: newBill.id
    };

    saveEntity("billings", [...billings, newBill]);
    saveEntity("transactions", [...transactions, matchingTx]);
    setShowBillingModal(false);
    setBillingForm({
      client: "",
      service: "",
      value: 0,
      billingDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      bankAccountId: "",
      paymentMethod: "Boleto",
      notes: "",
    });
  };

  const handleClearanceBilling = (bill: Billing) => {
    // Mark paid
    const updatedBillings = billings.map(b => b.id === bill.id ? { ...b, status: "Recebido" as const } : b);
    
    // Update matching transaction
    const updatedTxs = transactions.map(t => {
      if (t.billingId === bill.id) {
        updateAccountBalance(t.bankAccountId!, t.value, "add");
        return { ...t, status: "Recebido" as const, date: new Date().toISOString().split("T")[0] };
      }
      return t;
    });

    saveEntity("billings", updatedBillings);
    saveEntity("transactions", updatedTxs);
  };

  const handleClearancePayable = (pay: Payable) => {
    const updatedPayables = payables.map(p => p.id === pay.id ? { ...p, status: "Pago" as const } : p);
    
    // Update matching transaction or create new paid output transaction if none exists
    let updatedTxs = [...transactions];
    const matchingTxIndex = transactions.findIndex(t => t.payableId === pay.id);

    if (matchingTxIndex !== -1) {
      updateAccountBalance(transactions[matchingTxIndex].bankAccountId!, pay.value, "sub");
      updatedTxs[matchingTxIndex] = {
        ...transactions[matchingTxIndex],
        status: "Pago" as const,
        date: new Date().toISOString().split("T")[0]
      };
    } else {
      // Create new transaction
      const newTx: Transaction = {
        id: `tx-pay-${Date.now()}`,
        description: pay.description,
        type: "Saída",
        category: pay.category,
        customerOrProvider: pay.provider,
        bankAccountId: pay.bankAccountId,
        paymentMethod: "Transferência",
        value: pay.value,
        date: new Date().toISOString().split("T")[0],
        dueDate: pay.dueDate,
        status: "Pago",
        origin: "Manual",
        receiptUrl: pay.receiptUrl,
        notes: "Baixa de conta a pagar.",
        payableId: pay.id
      };
      updateAccountBalance(pay.bankAccountId, pay.value, "sub");
      updatedTxs.push(newTx);
    }

    saveEntity("payables", updatedPayables);
    saveEntity("transactions", updatedTxs);
  };

  // Open Finance & Bank Reconciliation real & simulation methods
  const handleOpenFinanceConnect = () => {
    setShowOpenFinanceModal(true);
  };

  const openPluggyConnect = async () => {
    try {
      setShowOpenFinanceModal(false);
      
      // 1. Fetch token from backend API
      const res = await fetch("/api/pluggy/connect-token");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao obter token do Open Finance");
      }
      const { accessToken } = await res.json();
      
      // 2. Dynamically load Pluggy Connect script if not already loaded
      if (!(window as any).PluggyConnect) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.pluggy.ai/pluggy-connect/v2.7.0/pluggy-connect.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Erro ao carregar SDK do Open Finance. Verifique sua conexão."));
          document.body.appendChild(script);
        });
      }

      // 3. Open Widget
      const pluggyConnect = new (window as any).PluggyConnect({
        connectToken: accessToken,
        includeSandbox: true, // Allow Sandbox test banks
        onSuccess: async (data: any) => {
          const itemId = data.item.id;
          alert("Conexão realizada com sucesso! Sincronizando contas e transações...");
          
          const syncRes = await fetch("/api/pluggy/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId }),
          });
          
          if (syncRes.ok) {
            alert("Suas contas e transações foram sincronizadas com o Open Finance real!");
            setOpenFinanceConnected(true);
            loadData();
          } else {
            const err = await syncRes.json();
            alert(`Erro ao sincronizar dados: ${err.error || "Erro desconhecido"}`);
          }
        },
        onError: (err: any) => {
          console.error("Erro no widget Pluggy Connect:", err);
          alert("Conexão cancelada ou erro ao autenticar no banco.");
        }
      });
      
      pluggyConnect.init();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao iniciar o Open Finance");
    }
  };

  const handleConfirmBankConnection = (bankName: string) => {
    setOpenFinanceConnected(true);
    setShowOpenFinanceModal(false);
    
    // Update sync dates on bankAccounts
    const updated = bankAccounts.map(b => b.bank === bankName ? { ...b, lastSync: new Date().toISOString() } : b);
    saveEntity("bank-accounts", updated);

    // Add audit log
    const now = new Date();
    const log: AuditLog = {
      id: `log-of-${Date.now()}`,
      user: activeUser,
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0],
      action: `${activeUser} conectou a conta ${bankName} via Open Finance.`,
      oldValue: "Desconectada",
      newValue: "Conectada Open Finance",
      targetId: "open-finance"
    };
    saveEntity("audit-logs", [log, ...auditLogs]);
  };

  const simulateImportStatement = () => {
    setStatementImported(true);
    alert("Simulando importação: 4 lançamentos importados do extrato Nubank. Analisando correspondências...");
  };

  const executeAutoReconciliation = () => {
    let reconciledCount = 0;
    
    // Match logic: value matching and date closeness or payerOrReceiver keywords
    const updatedImported = importedTransactions.map(imp => {
      if (imp.status !== "Pendente") return imp;

      // Find possible pending transaction in database
      const match = transactions.find(t => 
        t.status === "Pendente" && 
        Math.abs(t.value) === Math.abs(imp.value) &&
        (t.customerOrProvider.toLowerCase().includes(imp.payerOrReceiver?.toLowerCase() || "") || 
         imp.payerOrReceiver?.toLowerCase().includes(t.customerOrProvider.toLowerCase() || ""))
      );

      if (match) {
        reconciledCount++;
        // Perform clearing
        if (match.type === "Entrada") {
          match.status = "Recebido";
          updateAccountBalance(match.bankAccountId!, match.value, "add");
          if (match.billingId) {
            const bIndex = billings.findIndex(b => b.id === match.billingId);
            if (bIndex !== -1) billings[bIndex].status = "Recebido";
          }
        } else {
          match.status = "Pago";
          updateAccountBalance(match.bankAccountId!, match.value, "sub");
          if (match.payableId) {
            const pIndex = payables.findIndex(p => p.id === match.payableId);
            if (pIndex !== -1) payables[pIndex].status = "Pago";
          }
        }

        return {
          ...imp,
          status: "Conciliada" as const,
          suggestedTransactionId: match.id
        };
      }

      // Exact value match with a billing
      const billMatch = billings.find(b => b.status === "A receber" && b.value === imp.value);
      if (billMatch) {
        reconciledCount++;
        billMatch.status = "Recebido";
        
        // Find matching pending transaction and clear it
        const tMatch = transactions.find(t => t.billingId === billMatch.id);
        if (tMatch) {
          tMatch.status = "Recebido";
          updateAccountBalance(tMatch.bankAccountId!, tMatch.value, "add");
        }
        return {
          ...imp,
          status: "Conciliada" as const,
          suggestedTransactionId: tMatch ? tMatch.id : null
        };
      }

      // If no suggestion, mark divergence or unidentified
      return {
        ...imp,
        status: imp.value > 0 ? "Não Identificada" as const : "Divergente" as const
      };
    });

    if (reconciledCount > 0) {
      saveEntity("transactions", transactions);
      saveEntity("billings", billings);
      saveEntity("payables", payables);
      saveEntity("imported-transactions", updatedImported);
      alert(`Conciliação finalizada! ${reconciledCount} lançamentos correspondentes conciliados automaticamente.`);
    } else {
      alert("Nenhum lançamento correspondente identificado automaticamente com precisão de metadados.");
    }
  };

  // Asset Depreciation
  const executeAssetDepreciation = () => {
    if (confirm("Deseja aplicar o ajuste anual de depreciação contábil nos equipamentos cadastrados (10% a.a.)?")) {
      const updated = assets.map(a => {
        if (a.status === "Ativo") {
          const depValue = a.acquisitionValue * (a.depreciationRate / 100);
          const newValue = Math.max(0, a.currentBookValue - depValue);
          
          // Log adjustment
          const now = new Date();
          const log: AuditLog = {
            id: `log-dep-${Date.now()}-${a.id}`,
            user: activeUser,
            date: now.toISOString().split("T")[0],
            time: now.toTimeString().split(" ")[0],
            action: `Depreciação aplicada no ativo "${a.name}": Valor contábil ajustado de R$ ${a.currentBookValue.toLocaleString()} para R$ ${newValue.toLocaleString()}`,
            oldValue: `R$ ${a.currentBookValue}`,
            newValue: `R$ ${newValue}`,
            targetId: a.id
          };
          dbSaveAudit(log);

          return {
            ...a,
            currentBookValue: newValue
          };
        }
        return a;
      });
      saveEntity("assets", updated);
      alert("Ajuste de depreciação patrimonial aplicado com sucesso!");
    }
  };

  const dbSaveAudit = async (log: AuditLog) => {
    const current = [log, ...auditLogs];
    await saveEntity("audit-logs", current);
  };

  // Manual Creation Forms Modal open hooks
  const openNewTransaction = (type: Transaction["type"]) => {
    setTxForm({
      id: "",
      description: "",
      type,
      category: type === "Entrada" ? "Serviços" : "Alimentação",
      subcategory: "",
      customerOrProvider: "",
      bankAccountId: bankAccounts[0]?.id || "",
      fromBankAccountId: "",
      toBankAccountId: "",
      paymentMethod: "Pix",
      value: 0,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      status: "Pendente",
      notes: "",
    });
    setShowTransactionModal(true);
  };

  const openEditTransaction = (tx: Transaction) => {
    setTxForm({
      id: tx.id,
      description: tx.description,
      type: tx.type,
      category: tx.category,
      subcategory: tx.subcategory || "",
      customerOrProvider: tx.customerOrProvider,
      bankAccountId: tx.bankAccountId || "",
      fromBankAccountId: tx.fromBankAccountId || "",
      toBankAccountId: tx.toBankAccountId || "",
      paymentMethod: tx.paymentMethod,
      value: tx.value,
      date: tx.date,
      dueDate: tx.dueDate,
      status: tx.status,
      notes: tx.notes || "",
    });
    setShowTransactionModal(true);
  };

  const resetTxForm = () => {
    setTxForm({
      id: "",
      description: "",
      type: "Entrada",
      category: "Serviços",
      subcategory: "",
      customerOrProvider: "",
      bankAccountId: "",
      fromBankAccountId: "",
      toBankAccountId: "",
      paymentMethod: "Pix",
      value: 0,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      status: "Pendente",
      notes: "",
    });
  };

  // Bank accounts add / edit / delete
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    const now = new Date();
    
    if (editingAccount) {
      const balanceDiff = Number(accountForm.initialBalance) - editingAccount.initialBalance;
      updated = bankAccounts.map(b => b.id === editingAccount.id ? {
        ...b,
        bank: accountForm.bank,
        name: accountForm.name,
        type: accountForm.type,
        agency: accountForm.agency,
        account: accountForm.account,
        initialBalance: Number(accountForm.initialBalance),
        currentBalance: b.currentBalance + balanceDiff
      } : b);

      // Log edit
      const log: AuditLog = {
        id: `log-edit-bank-${Date.now()}`,
        user: activeUser,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
        action: `${activeUser} editou os dados da conta bancária "${editingAccount.name}".`,
        oldValue: JSON.stringify(editingAccount),
        newValue: JSON.stringify(updated.find(b => b.id === editingAccount.id)),
        targetId: editingAccount.id
      };
      saveEntity("audit-logs", [log, ...auditLogs]);
    } else {
      const newAcc: BankAccount = {
        id: `bank-${Date.now()}`,
        bank: accountForm.bank,
        name: accountForm.name,
        type: accountForm.type,
        agency: accountForm.agency,
        account: accountForm.account,
        initialBalance: Number(accountForm.initialBalance),
        currentBalance: Number(accountForm.initialBalance),
        status: "Ativa",
        lastSync: null
      };
      updated = [...bankAccounts, newAcc];

      // Log add
      const log: AuditLog = {
        id: `log-add-bank-${Date.now()}`,
        user: activeUser,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
        action: `${activeUser} cadastrou a nova conta bancária "${newAcc.name}" (${newAcc.bank}).`,
        oldValue: null,
        newValue: JSON.stringify(newAcc),
        targetId: newAcc.id
      };
      saveEntity("audit-logs", [log, ...auditLogs]);
    }

    saveEntity("bank-accounts", updated);
    setShowAccountModal(false);
    setEditingAccount(null);
    setAccountForm({ bank: "Nubank", name: "", type: "Corrente", agency: "", account: "", initialBalance: 0 });
  };

  const openEditAccount = (acc: BankAccount) => {
    setEditingAccount(acc);
    setAccountForm({
      bank: acc.bank,
      name: acc.name,
      type: acc.type,
      agency: acc.agency,
      account: acc.account,
      initialBalance: acc.initialBalance,
    });
    setShowAccountModal(true);
  };

  const handleDeleteAccount = (acc: BankAccount) => {
    if (confirm(`Tem certeza de que deseja excluir a conta bancária "${acc.name}"? Todos os saldos vinculados a ela serão removidos.`)) {
      const updated = bankAccounts.filter(b => b.id !== acc.id);
      saveEntity("bank-accounts", updated);
      
      const now = new Date();
      const log: AuditLog = {
        id: `log-del-bank-${Date.now()}`,
        user: activeUser,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
        action: `${activeUser} excluiu a conta bancária "${acc.name}" (${acc.bank}).`,
        oldValue: JSON.stringify(acc),
        newValue: null,
        targetId: acc.id
      };
      saveEntity("audit-logs", [log, ...auditLogs]);
    }
  };

  // Financial goals add
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: FinancialGoal = {
      id: `goal-${Date.now()}`,
      name: goalForm.name,
      targetValue: Number(goalForm.targetValue),
      currentValue: Number(goalForm.currentValue),
      deadline: goalForm.deadline,
    };
    saveEntity("goals", [...goals, newGoal]);
    setShowGoalModal(false);
    setGoalForm({ name: "", targetValue: 0, currentValue: 0, deadline: "" });
  };

  // Equipment assets add
  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(assetForm.acquisitionValue);
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: assetForm.name,
      acquisitionValue: val,
      category: assetForm.category,
      acquisitionDate: assetForm.acquisitionDate,
      status: "Ativo",
      currentBookValue: val,
      depreciationRate: Number(assetForm.depreciationRate)
    };
    saveEntity("assets", [...assets, newAsset]);
    setShowAssetModal(false);
    setAssetForm({ name: "", acquisitionValue: 0, category: "Equipamentos", acquisitionDate: new Date().toISOString().split("T")[0], depreciationRate: 10 });
  };

  // Exports
  const handleExportCSV = (entityName: string, dataset: any[]) => {
    if (dataset.length === 0) {
      alert("Nenhum dado disponível para exportação.");
      return;
    }
    const headers = Object.keys(dataset[0]).join(";");
    const rows = dataset.map(row => 
      Object.values(row).map(val => {
        if (typeof val === "object" && val !== null) return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(";")
    );
    const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n"); // UTF-8 BOM for Excel compatibility
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-${entityName}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-gray-500 uppercase tracking-widest font-sans">Carregando Módulo Financeiro...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 text-white font-sans max-w-[1600px] mx-auto">
      {/* Hidden file input for R2 receipts */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,application/pdf"
      />

      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">
              ERP Control Center
            </span>
            {openFinanceConnected && (
              <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-widest flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Open Finance Ativo
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white mt-2 font-display">
            Gestão Financeira Integrada
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Controle de fluxo de caixa, DRE contábil, conciliações automáticas e auditorias em tempo real.
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-black/40 border border-white/5 p-1 rounded-xl w-fit">
          {(["Hoje", "Esta semana", "Este mês", "Últimos 30 dias", "Este ano", "Personalizado"] as DateFilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                dateFilter === filter ? "bg-primary text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs Panel */}
      {dateFilter === "Personalizado" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-wrap items-center gap-4 bg-dark-card border border-white/5 p-4 rounded-2xl"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Início:</span>
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)} 
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary font-sans"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Término:</span>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)} 
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary font-sans"
            />
          </div>
          <button 
            onClick={loadData}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Aplicar Intervalo
          </button>
        </motion.div>
      )}



      {/* Main Tab Render Workspace */}
      <div className="min-h-[50vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. VISÃO GERAL (DASHBOARD) SUB-TAB */}
            {activeSubTab === "dashboard" && (
              <div className="space-y-8">
                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card: Entradas */}
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-colors" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Entradas Recebidas</span>
                        <h4 className="text-2xl font-bold text-green-400 mt-2 font-mono">
                          R$ {totals.entradas.toLocaleString()}
                        </h4>
                      </div>
                      <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
                        <ArrowDownRight className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-4 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 font-semibold">+14.2%</span> em relação ao período anterior
                    </div>
                  </div>

                  {/* Card: Saídas */}
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Saídas Pagas</span>
                        <h4 className="text-2xl font-bold text-red-400 mt-2 font-mono">
                          R$ {totals.saidas.toLocaleString()}
                        </h4>
                      </div>
                      <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-4 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-red-400" />
                      <span className="text-red-400 font-semibold">+6.5%</span> em relação ao período anterior
                    </div>
                  </div>

                  {/* Card: Saldo Líquido */}
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Resultado do Período</span>
                        <h4 className={`text-2xl font-bold mt-2 font-mono ${totals.saldoLiquido >= 0 ? "text-primary" : "text-red-400"}`}>
                          R$ {totals.saldoLiquido.toLocaleString()}
                        </h4>
                      </div>
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-4 font-mono">
                      Margem líquida: <span className="font-bold text-primary">
                        {totals.entradas > 0 ? ((totals.saldoLiquido / totals.entradas) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>

                  {/* Card: Saldo Bancário Disponível */}
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Saldo em Contas PJ</span>
                        <h4 className="text-2xl font-bold text-blue-400 mt-2 font-mono">
                          R$ {totals.totalDisponivel.toLocaleString()}
                        </h4>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-4 flex items-center justify-between">
                      <span>Somatória de {bankAccounts.filter(b => b.status === "Ativa").length} contas ativas</span>
                    </div>
                  </div>
                </div>

                {/* Sub Metrics (Receivables & Payables & Overdues) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-[#121212]/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Valores a Receber (Previsto)</span>
                      <span className="block text-xl font-bold mt-1 text-white font-mono">R$ {totals.aReceber.toLocaleString()}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-lg uppercase">Cobranças Ativas</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#121212]/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Valores a Pagar (Previsto)</span>
                      <span className="block text-xl font-bold mt-1 text-white font-mono">R$ {totals.aPagar.toLocaleString()}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded-lg uppercase">Compromissos</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-red-400 uppercase font-bold">Contas Vencidas</span>
                      <span className="block text-xl font-bold mt-1 text-red-400 font-mono">R$ {totals.vencidosTotal.toLocaleString()}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg uppercase flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> Atenção
                    </span>
                  </div>
                </div>

                {/* Dashboard Main Workspace split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Quick Entry & Bank Balances */}
                  <div className="lg:col-span-5 space-y-8">
                    {/* Bank balances widgets */}
                    <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-primary" /> Distribuição de Saldos
                        </h3>
                        <button 
                          onClick={() => {
                            setEditingAccount(null);
                            setAccountForm({ bank: "Nubank", name: "", type: "Corrente", agency: "", account: "", initialBalance: 0 });
                            setShowAccountModal(true);
                          }}
                          className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
                        >
                          + Adicionar Conta
                        </button>
                      </div>

                      <div className="space-y-3">
                        {bankAccounts.map((account) => (
                          <div key={account.id} className="p-3 bg-black/25 border border-white/5 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <BankLogoBadge bank={account.bank} />
                              <div>
                                <span className="text-xs font-bold block text-white">{account.name}</span>
                                <span className="text-[9px] text-gray-500 block uppercase font-mono">{account.bank} | Ag: {account.agency} CC: {account.account}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-xs font-bold block text-white font-mono">R$ {account.currentBalance.toLocaleString()}</span>
                                <span className="text-[8px] text-gray-500 block uppercase">
                                  {account.lastSync ? `Sinc: ${new Date(account.lastSync).toLocaleDateString()}` : "Sem Sinc."}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 ml-1 border-l border-white/5 pl-2">
                                <button 
                                  onClick={() => openEditAccount(account)}
                                  className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
                                  title="Editar Conta"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAccount(account)}
                                  className="p-1 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 cursor-pointer"
                                  title="Excluir Conta"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Entry Form Panel */}
                    <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">
                        Lançamento Rápido de Movimentação
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => openNewTransaction("Entrada")}
                          className="py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> + Entrada
                        </button>
                        <button 
                          onClick={() => openNewTransaction("Saída")}
                          className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> + Saída
                        </button>
                      </div>

                      <button 
                        onClick={() => setShowTransferModal(true)}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-primary" /> Transferência Entre Contas
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Financial Alerts & Goal Feed */}
                  <div className="lg:col-span-7 space-y-8">
                    {/* Alertas System Feed */}
                    <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3 flex items-center justify-between">
                        <span>Central de Alertas & Notificações</span>
                        <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping" />
                      </h3>

                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {/* Alert: Payables Overdue */}
                        {payables.filter(p => p.status === "Pendente" && new Date(p.dueDate) < new Date()).map(p => (
                          <div key={p.id} className="p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-white block">Conta a Pagar Vencida!</span>
                              <span className="text-[10px] text-gray-400 block mt-1">
                                O compromisso de <span className="font-bold text-red-400">R$ {p.value.toLocaleString()}</span> com <span className="text-white font-medium">{p.provider}</span> venceu em {new Date(p.dueDate).toLocaleDateString()}.
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Alert: Billings Overdue */}
                        {billings.filter(b => b.status === "A receber" && new Date(b.dueDate) < new Date()).map(b => (
                          <div key={b.id} className="p-3.5 bg-yellow-500/5 border border-yellow-500/15 rounded-xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-white block">Cobrança de Cliente Atrasada</span>
                              <span className="text-[10px] text-gray-400 block mt-1">
                                O recebimento de <span className="font-bold text-yellow-400">R$ {b.value.toLocaleString()}</span> da empresa <span className="text-white font-medium">{b.client}</span> está atrasado desde {new Date(b.dueDate).toLocaleDateString()}.
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Alert: Open Finance Connection Missing */}
                        {!openFinanceConnected && (
                          <div className="p-3.5 bg-blue-500/5 border border-blue-500/15 rounded-xl flex gap-3">
                            <Building className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-white block">Integração Bancária Pendente</span>
                              <span className="text-[10px] text-gray-400 block mt-1">
                                Conecte suas contas via Open Finance para automatizar a conciliação e importar extratos em tempo real.
                              </span>
                              <button 
                                onClick={handleOpenFinanceConnect} 
                                className="text-[10px] text-primary font-bold uppercase mt-2 block hover:underline cursor-pointer"
                              >
                                Conectar Conta Bancária Now
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Alert: Low balance alerts */}
                        {bankAccounts.filter(b => b.currentBalance < 2000).map(b => (
                          <div key={b.id} className="p-3.5 bg-yellow-500/5 border border-yellow-500/15 rounded-xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-white block">Alerta de Saldo Baixo</span>
                              <span className="text-[10px] text-gray-400 block mt-1">
                                O saldo da conta <span className="text-white font-semibold">{b.name}</span> está abaixo do limite operacional de segurança comercial: R$ {b.currentBalance.toLocaleString()}.
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TRANSAÇÕES / MOVIMENTAÇÕES SUB-TAB */}
            {activeSubTab === "transactions" && (
              <div className="space-y-6">
                {/* Filter and search bar */}
                <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar por descrição, cliente, categoria..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Filter: Tipo */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Tipo:</span>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                        >
                          <option value="todos">Todos</option>
                          <option value="Entrada">Entradas</option>
                          <option value="Saída">Saídas</option>
                          <option value="Transferência">Transferências</option>
                        </select>
                      </div>

                      {/* Filter: Status */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Status:</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                        >
                          <option value="todos">Todos</option>
                          <option value="Pago">Pago / Recebido</option>
                          <option value="Pendente">Pendente</option>
                          <option value="Vencido">Vencido</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>

                      {/* Export buttons */}
                      <button
                        onClick={() => handleExportCSV("movimentacoes", filteredTxs)}
                        className="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Exportar CSV
                      </button>

                      <button
                        onClick={() => openNewTransaction("Entrada")}
                        className="px-4 py-2 bg-primary hover:bg-[#B39356] text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Nova Transação
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ledger Transactions table */}
                <div className="rounded-2xl bg-dark-card border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/20 text-gray-400 font-semibold tracking-wider uppercase text-[9px]">
                          <th className="p-4">Descrição / Cliente</th>
                          <th className="p-4">Tipo</th>
                          <th className="p-4">Categoria</th>
                          <th className="p-4">Conta Bancária</th>
                          <th className="p-4">Forma</th>
                          <th className="p-4">Valor</th>
                          <th className="p-4">Data</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Origem</th>
                          <th className="p-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredTxs.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="p-8 text-center text-gray-500 uppercase tracking-widest font-sans">
                              Nenhuma transação encontrada para os filtros selecionados.
                            </td>
                          </tr>
                        ) : (
                          filteredTxs.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-4">
                                <span className="font-semibold text-white block font-sans">{tx.description}</span>
                                <span className="text-[10px] text-gray-500 font-sans block mt-0.5">{tx.customerOrProvider}</span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                                  tx.type === "Entrada"
                                    ? "bg-green-500/10 text-green-400 border border-green-500/15"
                                    : tx.type === "Saída"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/15"
                                    : "bg-purple-500/10 text-purple-400 border border-purple-500/15"
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-gray-300 font-medium">{tx.category}</span>
                                {tx.subcategory && <span className="text-[9px] text-gray-500 block">{tx.subcategory}</span>}
                              </td>
                              <td className="p-4 text-gray-300">
                                {tx.type === "Transferência" ? (
                                  <span className="flex items-center gap-1">
                                    {bankAccounts.find(b => b.id === tx.fromBankAccountId)?.bank} 
                                    <ArrowLeftRight className="w-3 h-3 text-primary" />
                                    {bankAccounts.find(b => b.id === tx.toBankAccountId)?.bank}
                                  </span>
                                ) : (
                                  bankAccounts.find(b => b.id === tx.bankAccountId)?.name || "-"
                                )}
                              </td>
                              <td className="p-4 text-gray-400">{tx.paymentMethod}</td>
                              <td className={`p-4 font-bold font-mono ${
                                tx.type === "Entrada" ? "text-green-400" : tx.type === "Saída" ? "text-red-400" : "text-purple-400"
                              }`}>
                                {tx.type === "Saída" ? "-" : ""}R$ {tx.value.toLocaleString()}
                              </td>
                              <td className="p-4 text-gray-400 font-mono">{tx.date}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                                  tx.status === "Pago" || tx.status === "Recebido"
                                    ? "bg-green-500/5 border-green-500/20 text-green-400"
                                    : tx.status === "Pendente" || tx.status === "Agendado"
                                    ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-400"
                                    : tx.status === "Vencido"
                                    ? "bg-red-500/5 border-red-500/20 text-red-400"
                                    : "bg-gray-500/5 border-gray-500/20 text-gray-400"
                                }`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-[10px] text-gray-500 block uppercase font-mono">{tx.origin}</span>
                              </td>
                              <td className="p-4 text-center space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => openEditTransaction(tx)}
                                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-lg cursor-pointer transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateTransaction(tx)}
                                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-lg cursor-pointer transition-colors"
                                  title="Duplicar"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUploadClick(tx.id)}
                                  className={`p-1.5 border rounded-lg cursor-pointer transition-colors ${
                                    tx.receiptUrl 
                                      ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" 
                                      : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
                                  }`}
                                  title={tx.receiptUrl ? "Ver / Alterar Comprovante" : "Anexar Comprovante"}
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(tx)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg cursor-pointer transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {tx.receiptUrl && (
                                  <a 
                                    href={tx.receiptUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-lg cursor-pointer transition-colors inline-block text-[10px] font-bold"
                                  >
                                    Ver R2
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CONCILIAÇÃO & OPEN FINANCE SUB-TAB */}
            {activeSubTab === "reconciliation" && (
              <div className="space-y-8">
                {/* Open Finance connection widget */}
                <div className="p-6 rounded-2xl bg-dark-card border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Integração Open Finance & APIs Bancárias
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 font-sans">
                      Conecte sua conta PJ da Moldra Films de forma segura com Nubank, Itaú ou outros bancos autorizados pelo Banco Central.
                    </p>
                  </div>

                  {!openFinanceConnected ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-red-400 font-bold bg-red-500/5 px-3 py-1.5 rounded-lg border border-red-500/10 uppercase tracking-wider">
                        Conta não conectada
                      </span>
                      <button
                        onClick={handleOpenFinanceConnect}
                        className="px-4 py-2.5 bg-primary hover:bg-[#B39356] text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        Conectar Conta Bancária
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-green-400 font-bold bg-green-500/5 px-3 py-1.5 rounded-lg border border-green-500/10 uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Conectado Open Finance
                      </span>
                      <button
                        onClick={() => setOpenFinanceConnected(false)}
                        className="px-4 py-2.5 border border-white/10 hover:bg-white/5 text-gray-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                  )}
                </div>

                {/* Conciliation Workspace */}
                <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Painel de Conciliação Bancária</h3>
                      <p className="text-[10px] text-gray-500 font-sans mt-0.5">Identifique correspondências entre os lançamentos do seu extrato e as transações do ERP.</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={simulateImportStatement}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-primary" /> Importar Extrato (Simulador)
                      </button>

                      {statementImported && (
                        <button
                          onClick={executeAutoReconciliation}
                          className="px-4 py-2 bg-primary hover:bg-[#B39356] text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Executar Conciliação Automática
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary of statement items */}
                  {statementImported && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-black/35 border border-white/5 text-center">
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Importadas</span>
                        <span className="block text-lg font-bold text-white mt-1 font-mono">{importedTransactions.length}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                        <span className="text-[9px] text-green-400 uppercase font-bold">Conciliadas</span>
                        <span className="block text-lg font-bold text-green-400 mt-1 font-mono">
                          {importedTransactions.filter(i => i.status === "Conciliada").length}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-center">
                        <span className="text-[9px] text-yellow-400 uppercase font-bold">Pendentes</span>
                        <span className="block text-lg font-bold text-yellow-400 mt-1 font-mono">
                          {importedTransactions.filter(i => i.status === "Pendente").length}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-center">
                        <span className="text-[9px] text-red-400 uppercase font-bold">Divergentes / Não Identificadas</span>
                        <span className="block text-lg font-bold text-red-400 mt-1 font-mono">
                          {importedTransactions.filter(i => i.status === "Divergente" || i.status === "Não Identificada").length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reconciled table view */}
                  <div className="border border-white/5 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 bg-black/20 text-gray-400 font-semibold tracking-wider uppercase text-[9px]">
                            <th className="p-4">Data Extrato</th>
                            <th className="p-4">Descrição Extrato</th>
                            <th className="p-4">Pador/Favorecido</th>
                            <th className="p-4">Metadados / Pix</th>
                            <th className="p-4">Valor</th>
                            <th className="p-4">Status Conciliação</th>
                            <th className="p-4">Transação Correspondente</th>
                            <th className="p-4 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {importedTransactions.map((imp) => (
                            <tr key={imp.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 text-gray-400 font-mono">{imp.date}</td>
                              <td className="p-4 font-semibold text-white font-sans">{imp.description}</td>
                              <td className="p-4 text-gray-300">{imp.payerOrReceiver || "-"}</td>
                              <td className="p-4 text-gray-500 font-mono text-[10px]">{imp.pixKey || "N/A"}</td>
                              <td className={`p-4 font-bold font-mono ${imp.value > 0 ? "text-green-400" : "text-red-400"}`}>
                                R$ {imp.value.toLocaleString()}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                                  imp.status === "Conciliada"
                                    ? "bg-green-500/10 text-green-400 border border-green-500/15"
                                    : imp.status === "Pendente"
                                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/15"
                                    : "bg-red-500/10 text-red-400 border border-red-500/15"
                                }`}>
                                  {imp.status}
                                </span>
                              </td>
                              <td className="p-4 text-gray-400">
                                {imp.suggestedTransactionId ? (
                                  <span className="text-xs font-semibold text-primary block">
                                    Match: #{imp.suggestedTransactionId}
                                    <span className="text-[9px] text-gray-500 block font-normal font-sans">
                                      {transactions.find(t => t.id === imp.suggestedTransactionId)?.description}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-500 italic block">Nenhum match sugerido</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {imp.status === "Pendente" && imp.suggestedTransactionId && (
                                  <button
                                    onClick={() => {
                                      // manual confirm
                                      const updatedImp = importedTransactions.map(i => i.id === imp.id ? { ...i, status: "Conciliada" as const } : i);
                                      const updatedTxs = transactions.map(t => {
                                        if (t.id === imp.suggestedTransactionId) {
                                          updateAccountBalance(t.bankAccountId!, t.value, t.type === "Entrada" ? "add" : "sub");
                                          return { ...t, status: t.type === "Entrada" ? "Recebido" as const : "Pago" as const };
                                        }
                                        return t;
                                      });
                                      saveEntity("imported-transactions", updatedImp);
                                      saveEntity("transactions", updatedTxs);
                                      alert("Transação conciliada manualmente com sucesso!");
                                    }}
                                    className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-[9px] font-bold rounded uppercase cursor-pointer"
                                  >
                                    Confirmar Baixa
                                  </button>
                                )}
                                {imp.status === "Pendente" && !imp.suggestedTransactionId && (
                                  <button
                                    onClick={() => {
                                      // Open billing or payable matching selector, or let them create manual
                                      alert("Para conciliar, registre manualmente uma transação com valor igual na conta bancária correspondente.");
                                    }}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 text-[9px] font-bold rounded uppercase cursor-pointer"
                                  >
                                    Criar Lançamento
                                  </button>
                                )}
                                {imp.status === "Conciliada" && (
                                  <span className="text-[10px] text-green-400 font-bold flex items-center justify-center gap-0.5">
                                    <Check className="w-3.5 h-3.5" /> Conciliada
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CONTAS A PAGAR & RECEBER SUB-TAB */}
            {activeSubTab === "receivables-payables" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left panel: Contas a Receber (Billings) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Contas a Receber / Cobranças</h3>
                        <p className="text-[9px] text-gray-500 font-sans mt-0.5">Acompanhe as propostas faturadas aos clientes até a compensação.</p>
                      </div>

                      <button
                        onClick={() => setShowBillingModal(true)}
                        className="px-3 py-1.5 bg-primary hover:bg-[#B39356] text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Faturar Serviço
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {billings.map(bill => (
                        <div key={bill.id} className="p-4 bg-black/25 border border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{bill.service}</span>
                            <span className="text-[10px] text-gray-500 block mt-0.5">{bill.client} | Venc: {new Date(bill.dueDate).toLocaleDateString()}</span>
                            <span className="text-[9px] text-gray-400 block mt-2">Banco de compensação: {bankAccounts.find(b => b.id === bill.bankAccountId)?.name}</span>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-xs font-bold block text-green-400 font-mono">R$ {bill.value.toLocaleString()}</span>
                            
                            {bill.status === "A receber" ? (
                              <button
                                onClick={() => handleClearanceBilling(bill)}
                                className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-[8px] font-bold rounded-lg uppercase cursor-pointer"
                              >
                                Dar Baixa
                              </button>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-500/5 text-green-400 border border-green-500/15 text-[8px] font-bold rounded-lg uppercase">
                                Recebido
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right panel: Contas a Pagar (Payables) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">
                        Contas a Pagar / Compromissos de Saída
                      </h3>
                    </div>

                    {/* Vencidas */}
                    <div className="space-y-3">
                      <span className="text-[9px] text-red-400 uppercase font-bold tracking-widest block border-l-2 border-red-500 pl-2">Contas Vencidas</span>
                      {payables.filter(p => p.status === "Pendente" && new Date(p.dueDate) < new Date()).length === 0 ? (
                        <span className="text-[10px] text-gray-500 block italic pl-2">Nenhum débito vencido pendente.</span>
                      ) : (
                        payables.filter(p => p.status === "Pendente" && new Date(p.dueDate) < new Date()).map(p => (
                          <div key={p.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-white block">{p.description}</span>
                              <span className="text-[9px] text-gray-500 block mt-0.5">{p.provider} | Venc: {new Date(p.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1.5">
                              <span className="text-xs font-bold text-red-400 font-mono">R$ {p.value.toLocaleString()}</span>
                              <button
                                onClick={() => handleClearancePayable(p)}
                                className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[8px] font-bold rounded-lg uppercase cursor-pointer"
                              >
                                Pagar
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Próximos 7 dias */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9px] text-yellow-400 uppercase font-bold tracking-widest block border-l-2 border-yellow-500 pl-2">Vencendo nos próximos 7 dias</span>
                      {payables.filter(p => {
                        const diffTime = new Date(p.dueDate).getTime() - new Date().getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return p.status === "Pendente" && diffDays >= 0 && diffDays <= 7;
                      }).map(p => (
                        <div key={p.id} className="p-3 bg-black/25 border border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{p.description}</span>
                            <span className="text-[9px] text-gray-500 block mt-0.5">{p.provider} | Venc: {new Date(p.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                            <span className="text-xs font-bold text-white font-mono">R$ {p.value.toLocaleString()}</span>
                            <button
                              onClick={() => handleClearancePayable(p)}
                              className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-[8px] font-bold rounded-lg uppercase cursor-pointer"
                            >
                              Pagar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Outros Pendentes */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block border-l-2 border-gray-500 pl-2">Outros Compromissos Futuristas (30 dias)</span>
                      {payables.filter(p => {
                        const diffTime = new Date(p.dueDate).getTime() - new Date().getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return p.status === "Pendente" && diffDays > 7 && diffDays <= 30;
                      }).map(p => (
                        <div key={p.id} className="p-3 bg-black/25 border border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{p.description}</span>
                            <span className="text-[9px] text-gray-500 block mt-0.5">{p.provider} | Venc: {new Date(p.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                            <span className="text-xs font-bold text-white font-mono">R$ {p.value.toLocaleString()}</span>
                            <button
                              onClick={() => handleClearancePayable(p)}
                              className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-[8px] font-bold rounded-lg uppercase cursor-pointer"
                            >
                              Pagar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagas */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[9px] text-green-400 uppercase font-bold tracking-widest block border-l-2 border-green-500 pl-2">Pagas no Período</span>
                      {payables.filter(p => p.status === "Pago").map(p => (
                        <div key={p.id} className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{p.description}</span>
                            <span className="text-[9px] text-gray-500 block mt-0.5">{p.provider} | Paga em: {new Date(p.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-green-400 font-mono">R$ {p.value.toLocaleString()}</span>
                            <span className="text-[8px] text-green-400 uppercase font-bold block mt-1">Liquidado</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. DRE, BALANÇO & FLOWS (STATEMENT RELATÓRIOS) SUB-TAB */}
            {activeSubTab === "statements" && (
              <div className="space-y-8">
                {/* Sub View Toggle Bar */}
                <div className="flex gap-2 bg-[#121212]/60 p-1 rounded-xl border border-white/5 w-fit">
                  <button
                    onClick={() => setStatementSubView("flow")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      statementSubView === "flow" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Fluxo de Caixa
                  </button>
                  <button
                    onClick={() => setStatementSubView("dre")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      statementSubView === "dre" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    DRE do Exercício
                  </button>
                  <button
                    onClick={() => setStatementSubView("balance")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      statementSubView === "balance" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Balanço Patrimonial
                  </button>
                  <button
                    onClick={() => setStatementSubView("categories")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      statementSubView === "categories" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Despesas por Categoria
                  </button>
                </div>

                {/* Sub View 1: FLUXO DE CAIXA */}
                {statementSubView === "flow" && (
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Fluxo de Caixa Projetado & Realizado</h3>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">Visão comparativa de entradas vs saídas e saldo futuro projetado com base em faturas futuras.</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={cashFlowPeriod}
                          onChange={(e) => setCashFlowPeriod(e.target.value as any)}
                          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-sans"
                        >
                          <option value="daily">Diário</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensal</option>
                          <option value="yearly">Anual</option>
                        </select>
                        <button
                          onClick={() => handleExportCSV("fluxo-caixa", transactions)}
                          className="px-3 py-2 border border-white/10 hover:bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase cursor-pointer"
                        >
                          Exportar
                        </button>
                      </div>
                    </div>

                    {/* Chart Mock Graph rendering using CSS bars */}
                    <div className="space-y-4 pt-6">
                      <div className="flex items-end justify-around h-64 border-b border-white/10 pb-2 relative">
                        {/* Y-axis guidelines */}
                        <div className="absolute left-0 right-0 top-0 border-t border-white/[0.02]" />
                        <div className="absolute left-0 right-0 top-1/3 border-t border-white/[0.02]" />
                        <div className="absolute left-0 right-0 top-2/3 border-t border-white/[0.02]" />

                        {/* Visual Bars represent months */}
                        {[
                          { name: "Junho", in: 18000, out: 12000, projIn: 18000, projOut: 12000 },
                          { name: "Julho", in: 22000, out: 14500, projIn: 22000, projOut: 14500 },
                          { name: "Agosto (Real)", in: totals.entradas, out: totals.saidas, projIn: totals.entradas, projOut: totals.saidas },
                          { name: "Setembro (Proj.)", in: 0, out: 0, projIn: totals.aReceber, projOut: totals.aPagar }
                        ].map((month, idx) => {
                          const max = 30000;
                          const inHeight = month.in > 0 ? (month.in / max) * 100 : (month.projIn / max) * 100;
                          const outHeight = month.out > 0 ? (month.out / max) * 100 : (month.projOut / max) * 100;

                          return (
                            <div key={idx} className="flex flex-col items-center gap-3 w-1/5 shrink-0 z-10">
                              <div className="flex items-end gap-2 w-full justify-center h-48">
                                {/* Entry Bar */}
                                <div 
                                  style={{ height: `${Math.max(4, inHeight)}%` }}
                                  className={`w-6 rounded-t-md transition-all duration-500 relative group cursor-pointer ${
                                    month.in > 0 ? "bg-green-500" : "bg-green-500/30 border border-dashed border-green-500/40"
                                  }`}
                                >
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-mono">
                                    R$ {(month.in || month.projIn).toLocaleString()}
                                  </div>
                                </div>

                                {/* Output Bar */}
                                <div 
                                  style={{ height: `${Math.max(4, outHeight)}%` }}
                                  className={`w-6 rounded-t-md transition-all duration-500 relative group cursor-pointer ${
                                    month.out > 0 ? "bg-red-500" : "bg-red-500/30 border border-dashed border-red-500/40"
                                  }`}
                                >
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-mono">
                                    R$ {(month.out || month.projOut).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-500 font-bold block uppercase">{month.name}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-center gap-6 text-[10px] text-gray-400 font-bold uppercase pt-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded" /> Entradas
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-red-500 rounded" /> Saídas
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 border border-dashed border-green-500/40 rounded bg-green-500/10" /> Entradas Projetadas
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 border border-dashed border-red-500/40 rounded bg-red-500/10" /> Saídas Projetadas
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub View 2: DRE */}
                {statementSubView === "dre" && (
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">DRE - Demonstrativo do Resultado do Exercício</h3>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">Demonstração detalhada de receitas, impostos, custos, lucros e margem operacional.</p>
                      </div>

                      <button
                        onClick={() => window.print()}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Imprimir Relatório
                      </button>
                    </div>

                    {/* DRE Spreadsheet formatting structure */}
                    <div className="bg-black/35 rounded-xl border border-white/5 overflow-hidden">
                      <div className="p-4 bg-black/40 border-b border-white/5 font-bold text-xs uppercase tracking-widest text-primary flex justify-between">
                        <span>Descrição das Contas Contábeis</span>
                        <span className="font-mono">Valor Financeiro</span>
                      </div>

                      <div className="p-4 space-y-3 text-xs">
                        {/* Receita Bruta */}
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="font-semibold text-white">(+) RECEITA OPERACIONAL BRUTA (Serviços e Galeria)</span>
                          <span className="font-mono text-white font-bold">R$ {totals.entradas.toLocaleString()}</span>
                        </div>

                        {/* Custos Operacionais */}
                        <div className="flex justify-between border-b border-white/5 pb-2 text-red-400 pl-4">
                          <span>(-) Custos de Produção / Locação</span>
                          <span className="font-mono font-medium">- R$ {
                            filteredTxs.filter(t => t.type === "Saída" && t.category === "Produção").reduce((acc, t) => acc + t.value, 0).toLocaleString()
                          }</span>
                        </div>

                        {/* Deduções/Impostos */}
                        <div className="flex justify-between border-b border-white/5 pb-2 text-red-400 pl-4">
                          <span>(-) Impostos sobre Serviços (Simplificado 6%)</span>
                          <span className="font-mono font-medium">- R$ {(totals.entradas * 0.06).toLocaleString()}</span>
                        </div>

                        {/* Resultado Bruto */}
                        <div className="flex justify-between border-b border-white/5 pb-2 text-white font-bold bg-white/[0.01] p-1 rounded">
                          <span>(=) RESULTADO OPERACIONAL BRUTO</span>
                          <span className="font-mono">R$ {(totals.entradas - (totals.entradas * 0.06) - filteredTxs.filter(t => t.type === "Saída" && t.category === "Produção").reduce((acc, t) => acc + t.value, 0)).toLocaleString()}</span>
                        </div>

                        {/* Despesas Gerais */}
                        <div className="flex justify-between border-b border-white/5 pb-2 text-red-400 pl-4">
                          <span>(-) Despesas Administrativas (Softwares, Internet, Aluguel)</span>
                          <span className="font-mono font-medium">- R$ {
                            filteredTxs.filter(t => t.type === "Saída" && t.category !== "Produção" && t.category !== "Equipamentos").reduce((acc, t) => acc + t.value, 0).toLocaleString()
                          }</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2 text-red-400 pl-4">
                          <span>(-) Despesas de Marketing / Divulgação</span>
                          <span className="font-mono font-medium">- R$ {
                            filteredTxs.filter(t => t.type === "Saída" && t.category === "Marketing").reduce((acc, t) => acc + t.value, 0).toLocaleString()
                          }</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2 text-red-400 pl-4">
                          <span>(-) Depreciação contábil estimada (Ajustada)</span>
                          <span className="font-mono font-medium">- R$ {(assets.filter(a => a.status === "Ativo").reduce((acc, a) => acc + (a.acquisitionValue * (a.depreciationRate/100)), 0) / 12).toLocaleString()}</span>
                        </div>

                        {/* Lucro Líquido */}
                        {(() => {
                          const rec = totals.entradas;
                          const imp = rec * 0.06;
                          const prod = filteredTxs.filter(t => t.type === "Saída" && t.category === "Produção").reduce((acc, t) => acc + t.value, 0);
                          const adm = filteredTxs.filter(t => t.type === "Saída" && t.category !== "Produção" && t.category !== "Equipamentos").reduce((acc, t) => acc + t.value, 0);
                          const mkt = filteredTxs.filter(t => t.type === "Saída" && t.category === "Marketing").reduce((acc, t) => acc + t.value, 0);
                          const dep = assets.filter(a => a.status === "Ativo").reduce((acc, a) => acc + (a.acquisitionValue * (a.depreciationRate/100)), 0) / 12;
                          const netProfit = rec - imp - prod - adm - mkt - dep;

                          return (
                            <div className="flex justify-between border-t border-primary/20 pt-4 text-primary font-bold text-sm bg-primary/5 p-2 rounded">
                              <span>(=) RESULTADO OPERACIONAL LÍQUIDO (Lucro / Prejuízo)</span>
                              <span className="font-mono">R$ {netProfit.toLocaleString()}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub View 3: BALANÇO PATRIMONIAL */}
                {statementSubView === "balance" && (
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Balanço Patrimonial Simplificado</h3>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">Quadro geral de Ativos (bens e direitos), Passivos (obrigações) e Patrimônio Líquido.</p>
                      </div>

                      <button
                        onClick={executeAssetDepreciation}
                        className="px-3 py-2 bg-primary hover:bg-[#B39356] text-black font-bold rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Rodar Depreciação de Ativos
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                      {/* ATIVOS */}
                      <div className="p-5 bg-black/20 border border-white/5 rounded-xl space-y-4">
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block border-b border-white/5 pb-2">Ativos (Bens e Direitos)</span>
                        
                        <div className="space-y-2">
                          <span className="font-semibold text-white block uppercase text-[9px] tracking-wider text-gray-400">Ativo Circulante</span>
                          <div className="flex justify-between pl-2">
                            <span>Disponibilidades (Saldo total em bancos)</span>
                            <span className="font-mono text-white">R$ {totals.totalDisponivel.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pl-2">
                            <span>Contas a Receber (Cobranças ativas)</span>
                            <span className="font-mono text-white">R$ {totals.aReceber.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="font-semibold text-white block uppercase text-[9px] tracking-wider text-gray-400">Ativo Permanente (Imobilizado)</span>
                          {assets.map(asset => (
                            <div key={asset.id} className="flex justify-between pl-2">
                              <span>{asset.name} (Valor contábil atual)</span>
                              <span className="font-mono text-white">R$ {asset.currentBookValue.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between border-t border-white/5 pt-4 text-white font-bold bg-white/[0.01] p-1 rounded">
                          <span>TOTAL DOS ATIVOS</span>
                          <span className="font-mono">R$ {(
                            totals.totalDisponivel + 
                            totals.aReceber + 
                            assets.reduce((acc, a) => a.status === "Ativo" ? acc + a.currentBookValue : acc, 0)
                          ).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* PASSIVOS & PATRIMÔNIO LÍQUIDO */}
                      <div className="p-5 bg-black/20 border border-white/5 rounded-xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[10px] text-red-400 uppercase font-bold tracking-widest block border-b border-white/5 pb-2">Passivos (Obrigações)</span>
                          
                          <div className="space-y-2">
                            <span className="font-semibold text-white block uppercase text-[9px] tracking-wider text-gray-400">Passivo Circulante</span>
                            <div className="flex justify-between pl-2">
                              <span>Contas a Pagar (Débitos pendentes)</span>
                              <span className="font-mono text-red-400">R$ {totals.aPagar.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <span className="text-[10px] text-purple-400 uppercase font-bold tracking-widest block border-b border-white/5 pb-2">Patrimônio Líquido</span>
                          <div className="flex justify-between pl-2">
                            <span>Capital Social / Lucros Acumulados</span>
                            <span className="font-mono text-white">R$ {(
                              (totals.totalDisponivel + totals.aReceber + assets.reduce((acc, a) => a.status === "Ativo" ? acc + a.currentBookValue : acc, 0)) - 
                              totals.aPagar
                            ).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex justify-between border-t border-white/5 pt-4 text-white font-bold bg-white/[0.01] p-1 rounded">
                          <span>TOTAL DOS PASSIVOS + PL</span>
                          <span className="font-mono">R$ {(
                            totals.totalDisponivel + 
                            totals.aReceber + 
                            assets.reduce((acc, a) => a.status === "Ativo" ? acc + a.currentBookValue : acc, 0)
                          ).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub View 4: CATEGORIAS */}
                {statementSubView === "categories" && (
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Gastos Por Categoria Financeira</h3>
                      <p className="text-[10px] text-gray-500 font-sans mt-0.5">Detalhamento dos maiores centros de custos e despesas operacionais da empresa.</p>
                    </div>

                    <div className="space-y-4">
                      {categories.map((cat: string) => {
                        const totalCat = filteredTxs.filter(t => t.type === "Saída" && t.category === cat).reduce((acc, t) => acc + t.value, 0);
                        const totalSaidas = filteredTxs.filter(t => t.type === "Saída").reduce((acc, t) => acc + t.value, 0);
                        const sharePercent = totalSaidas > 0 ? (totalCat / totalSaidas) * 100 : 0;

                        if (totalCat === 0) return null;

                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-white">{cat}</span>
                              <span className="font-mono text-gray-300">R$ {totalCat.toLocaleString()} ({sharePercent.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${sharePercent}%` }} 
                                className="bg-primary h-full rounded-full transition-all duration-500" 
                              />
                            </div>
                          </div>
                        );
                      })}
                      {filteredTxs.filter(t => t.type === "Saída").length === 0 && (
                        <div className="text-center p-8 text-gray-500 uppercase tracking-widest font-sans text-xs">
                          Nenhum gasto registrado para exibir divisão por categoria.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. METAS & ATIVOS & CONFIGS SUB-TAB */}
            {activeSubTab === "assets-goals" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side: Goals (Metas Financeiras) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Metas Financeiras & Reservas</h3>
                        <p className="text-[9px] text-gray-500 font-sans mt-0.5">Defina limites e prazos de acumulação para novos investimentos.</p>
                      </div>

                      <button
                        onClick={() => setShowGoalModal(true)}
                        className="px-3 py-1.5 bg-primary hover:bg-[#B39356] text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Criar Meta
                      </button>
                    </div>

                    <div className="space-y-4">
                      {goals.map(goal => {
                        const progress = (goal.currentValue / goal.targetValue) * 100;
                        return (
                          <div key={goal.id} className="p-4 bg-black/25 border border-white/5 rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-white block">{goal.name}</span>
                                <span className="text-[9px] text-gray-500 block uppercase font-mono mt-0.5">Prazo: {new Date(goal.deadline).toLocaleDateString()}</span>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm("Deseja excluir esta meta?")) {
                                    saveEntity("goals", goals.filter(g => g.id !== goal.id));
                                  }
                                }}
                                className="p-1 hover:bg-white/5 text-gray-500 hover:text-red-400 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span>Acumulado: R$ {goal.currentValue.toLocaleString()}</span>
                                <span className="text-primary font-bold">Meta: R$ {goal.targetValue.toLocaleString()} ({progress.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${Math.min(100, progress)}%` }} 
                                  className="bg-primary h-full rounded-full" 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right side: Ativos Patrimoniais (Equipment depreciation assets) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Inventário de Ativos Físicos PJ</h3>
                        <p className="text-[9px] text-gray-500 font-sans mt-0.5">Controle patrimonial contábil de bens corpóreos da produtora.</p>
                      </div>

                      <button
                        onClick={() => setShowAssetModal(true)}
                        className="px-3 py-1.5 bg-primary hover:bg-[#B39356] text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Registrar Ativo
                      </button>
                    </div>

                    <div className="space-y-3">
                      {assets.map(asset => (
                        <div key={asset.id} className="p-3.5 bg-black/25 border border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{asset.name}</span>
                            <span className="text-[9px] text-gray-500 block uppercase font-mono mt-0.5">Adquirido em: {new Date(asset.acquisitionDate).toLocaleDateString()} | Custo: R$ {asset.acquisitionValue.toLocaleString()}</span>
                            <span className="text-[9px] text-yellow-400 block font-semibold mt-1">Taxa Deprec.: {asset.depreciationRate}% a.a.</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold block text-white font-mono">Contábil: R$ {asset.currentBookValue.toLocaleString()}</span>
                            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-bold rounded uppercase block mt-1.5 w-fit ml-auto">
                              {asset.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. AUDITORIA & HISTÓRICO SUB-TAB */}
            {activeSubTab === "audit" && (
              <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Log de Auditoria e Histórico Operacional</h3>
                    <p className="text-[9px] text-gray-500 font-sans mt-0.5">Rastreabilidade completa de todas as inserções, exclusões e ajustes de valores no sistema.</p>
                  </div>

                  <button
                    onClick={() => handleExportCSV("logs-auditoria", auditLogs)}
                    className="px-3 py-2 border border-white/10 hover:bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Exportar Logs
                  </button>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-4 bg-black/25 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase tracking-wider text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            {log.user}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">{log.date} - {log.time}</span>
                        </div>
                        <span className="block text-gray-300 font-sans mt-2">{log.action}</span>
                      </div>
                      
                      {log.oldValue && log.newValue && (
                        <div className="text-right whitespace-nowrap bg-black/20 p-2 rounded-lg border border-white/5 max-w-[200px] overflow-x-auto">
                          <span className="text-[9px] text-gray-500 block uppercase font-mono">Transação ID: {log.targetId}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- ALL MODALS OVERLAYS --- */}

      {/* Modal: Transaction (Entrada/Saída) Add / Edit */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-full max-w-lg bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" /> {txForm.id ? "Editar Lançamento" : `Registrar Nova ${txForm.type}`}
              </h3>
              <button onClick={() => setShowTransactionModal(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Descrição</label>
                <input
                  type="text"
                  required
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="Ex: Nota Fiscal nº 2948, Cachê câmera assistente..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">
                    {txForm.type === "Entrada" ? "Cliente" : "Fornecedor"}
                  </label>
                  <input
                    type="text"
                    required
                    value={txForm.customerOrProvider}
                    onChange={(e) => setTxForm({ ...txForm, customerOrProvider: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                    placeholder="Ex: Innova Corp / João Freelancer"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txForm.value || ""}
                    onChange={(e) => setTxForm({ ...txForm, value: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-mono"
                    placeholder="2500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Categoria</label>
                  <select
                    value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                  >
                    {categories.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Subcategoria (Opcional)</label>
                  <input
                    type="text"
                    value={txForm.subcategory}
                    onChange={(e) => setTxForm({ ...txForm, subcategory: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                    placeholder="Ex: Campanha, Software"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Data Lançamento</label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={txForm.dueDate}
                    onChange={(e) => setTxForm({ ...txForm, dueDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Conta Origem / Destino</label>
                  <select
                    value={txForm.bankAccountId}
                    onChange={(e) => setTxForm({ ...txForm, bankAccountId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (Saldo: R$ {b.currentBalance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Forma de Pagamento</label>
                  <select
                    value={txForm.paymentMethod}
                    onChange={(e) => setTxForm({ ...txForm, paymentMethod: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Transferência">Transferência Bancária</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Status Lançamento</label>
                <select
                  value={txForm.status}
                  onChange={(e) => setTxForm({ ...txForm, status: e.target.value as any })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                >
                  <option value="Pendente">Pendente / Agendado</option>
                  <option value={txForm.type === "Entrada" ? "Recebido" : "Pago"}>
                    {txForm.type === "Entrada" ? "Recebido" : "Pago"}
                  </option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Observações / Notas</label>
                <textarea
                  value={txForm.notes}
                  onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans h-16"
                  placeholder="Escreva detalhes adicionais..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Salvar Movimentação
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Transfer Between Accounts */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-primary" /> Transferência Entre Contas
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransfer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Origem (Retirar)</label>
                  <select
                    required
                    value={transferForm.fromAccountId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                  >
                    <option value="">Selecione...</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (R$ {b.currentBalance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Destino (Adicionar)</label>
                  <select
                    required
                    value={transferForm.toAccountId}
                    onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                  >
                    <option value="">Selecione...</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (R$ {b.currentBalance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    value={transferForm.value || ""}
                    onChange={(e) => setTransferForm({ ...transferForm, value: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-mono"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Data Transferência</label>
                  <input
                    type="date"
                    required
                    value={transferForm.date}
                    onChange={(e) => setTransferForm({ ...transferForm, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Notas Observação</label>
                <input
                  type="text"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="Ex: Ajuste de caixa, transferência reserva..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Transferir Saldo
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Add Bank Account */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Building className="w-4 h-4 text-primary" /> {editingAccount ? "Editar Conta Bancária PJ" : "Adicionar Conta Bancária PJ"}
              </h3>
              <button onClick={() => setShowAccountModal(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Banco</label>
                <select
                  value={accountForm.bank}
                  onChange={(e) => setAccountForm({ ...accountForm, bank: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                >
                  <option value="Nubank">Nubank</option>
                  <option value="Itaú">Itaú</option>
                  <option value="Bradesco">Bradesco</option>
                  <option value="Banco do Brasil">Banco do Brasil</option>
                  <option value="Santander">Santander</option>
                  <option value="Inter">Banco Inter</option>
                  <option value="C6 Bank">C6 Bank</option>
                  <option value="BTG Pactual">BTG Pactual</option>
                  <option value="Safra">Banco Safra</option>
                  <option value="Caixa Econômica">Caixa Econômica</option>
                  <option value="Sicoob">Sicoob</option>
                  <option value="Sicredi">Sicredi</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Nome da Conta</label>
                <input
                  type="text"
                  required
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="Ex: Nubank PJ Principal, Itaú Produção"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Agência</label>
                  <input
                    type="text"
                    required
                    value={accountForm.agency}
                    onChange={(e) => setAccountForm({ ...accountForm, agency: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                    placeholder="0001"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Conta</label>
                  <input
                    type="text"
                    required
                    value={accountForm.account}
                    onChange={(e) => setAccountForm({ ...accountForm, account: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                    placeholder="12345-6"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Tipo de Conta</label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                  >
                    <option value="Corrente">Corrente</option>
                    <option value="Poupança">Poupança</option>
                    <option value="Investimentos">Investimentos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Saldo Inicial (R$)</label>
                  <input
                    type="number"
                    required
                    value={accountForm.initialBalance || ""}
                    onChange={(e) => setAccountForm({ ...accountForm, initialBalance: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-mono"
                    placeholder="10000"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingAccount ? "Salvar Alterações" : "Cadastrar Conta"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Create Goal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary" /> Definir Nova Meta Financeira
              </h3>
              <button onClick={() => setShowGoalModal(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Nome / Objetivo da Meta</label>
                <input
                  type="text"
                  required
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="Ex: Reserva estúdio, Drone DJI Mavic 3..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    required
                    value={goalForm.targetValue || ""}
                    onChange={(e) => setGoalForm({ ...goalForm, targetValue: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-mono"
                    placeholder="12000"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Valor Atual (R$)</label>
                  <input
                    type="number"
                    value={goalForm.currentValue || ""}
                    onChange={(e) => setGoalForm({ ...goalForm, currentValue: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Prazo Estimado</label>
                <input
                  type="date"
                  required
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Salvar Meta
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Register Asset */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary" /> Registrar Ativo / Equipamento
              </h3>
              <button onClick={() => setShowAssetModal(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Nome do Equipamento / Bem</label>
                <input
                  type="text"
                  required
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="Ex: Câmera Sony FX6, Lente Zeiss 35mm..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Valor de Aquisição (R$)</label>
                  <input
                    type="number"
                    required
                    value={assetForm.acquisitionValue || ""}
                    onChange={(e) => setAssetForm({ ...assetForm, acquisitionValue: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-mono"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Taxa de Depreciação Anual (%)</label>
                  <input
                    type="number"
                    required
                    value={assetForm.depreciationRate || ""}
                    onChange={(e) => setAssetForm({ ...assetForm, depreciationRate: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-mono"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Data de Aquisição</label>
                <input
                  type="date"
                  required
                  value={assetForm.acquisitionDate}
                  onChange={(e) => setAssetForm({ ...assetForm, acquisitionDate: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Registrar Ativo
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Billing (Faturar Cliente) */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-full max-w-lg bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" /> Gerar Nova Cobrança de Cliente
              </h3>
              <button onClick={() => setShowBillingModal(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBilling} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Cliente Destinatário</label>
                  <input
                    type="text"
                    required
                    value={billingForm.client}
                    onChange={(e) => setBillingForm({ ...billingForm, client: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                    placeholder="Ex: Innova Corp, Bradesco"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Serviço / Produto</label>
                  <input
                    type="text"
                    required
                    value={billingForm.service}
                    onChange={(e) => setBillingForm({ ...billingForm, service: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                    placeholder="Ex: Captação de Vídeo Promocional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Valor do Faturamento (R$)</label>
                  <input
                    type="number"
                    required
                    value={billingForm.value || ""}
                    onChange={(e) => setBillingForm({ ...billingForm, value: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-mono"
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Forma de Recebimento</label>
                  <select
                    value={billingForm.paymentMethod}
                    onChange={(e) => setBillingForm({ ...billingForm, paymentMethod: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                  >
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Pix">Pix imediato</option>
                    <option value="Transferência">TED / DOC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Data Cobrança</label>
                  <input
                    type="date"
                    required
                    value={billingForm.billingDate}
                    onChange={(e) => setBillingForm({ ...billingForm, billingDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Prazo Vencimento</label>
                  <input
                    type="date"
                    required
                    value={billingForm.dueDate}
                    onChange={(e) => setBillingForm({ ...billingForm, dueDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Conta para Recebimento</label>
                <select
                  value={billingForm.bankAccountId}
                  onChange={(e) => setBillingForm({ ...billingForm, bankAccountId: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-sans"
                >
                  <option value="">Selecione uma conta...</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.bank})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5">Observações Internas</label>
                <input
                  type="text"
                  value={billingForm.notes}
                  onChange={(e) => setBillingForm({ ...billingForm, notes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="Escreva detalhes da emissão fiscal..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Gerar Proposta Cobrança
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Open Finance Bank Connection Simulator Selector */}
      {showOpenFinanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-full max-w-sm bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl text-center"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center text-left">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Building className="w-4 h-4 text-primary" /> Escolha o Banco (Open Finance)
              </h3>
              <button onClick={() => setShowOpenFinanceModal(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Option A: Real Connection */}
              <div className="space-y-2.5">
                <span className="text-primary font-bold block uppercase tracking-wider text-[9px] text-left">Sincronização Oficial</span>
                <button
                  onClick={openPluggyConnect}
                  className="w-full py-4 bg-primary hover:bg-[#B39356] text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest shadow shadow-primary/20"
                >
                  <Sparkles className="w-4 h-4 shrink-0" /> Conectar Banco Real (Pluggy)
                </button>
                <span className="text-[9px] text-gray-500 block leading-relaxed text-left">
                  Conexão segura utilizando chaves oficiais Pluggy. Permite contas em Sandbox ou reais.
                </span>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-gray-500 uppercase tracking-widest text-[8px] font-bold">ou</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Option B: Simulation */}
              <div className="space-y-2.5">
                <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px] text-left">Simulador Rápido</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {["Nubank", "Itaú", "Bradesco"].map((bankName) => (
                    <button
                      key={bankName}
                      onClick={() => handleConfirmBankConnection(bankName)}
                      className="w-full py-3 bg-black/35 hover:bg-white/5 border border-white/5 hover:border-primary/20 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between px-4 uppercase tracking-wider"
                    >
                      <span>Simular {bankName} PJ</span>
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
