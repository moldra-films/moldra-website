export interface BankAccount {
  id: string;
  bank: string; // Nubank, Itaú, etc.
  name: string;
  type: "Corrente" | "Poupança" | "Investimentos";
  agency: string;
  account: string;
  initialBalance: number;
  currentBalance: number;
  status: "Ativa" | "Inativa";
  lastSync: string | null;
}

export interface Transaction {
  id: string;
  description: string;
  type: "Entrada" | "Saída" | "Transferência";
  category: string;
  subcategory?: string;
  customerOrProvider: string;
  bankAccountId?: string; // used for Entrada/Saída
  fromBankAccountId?: string; // used for Transferência
  toBankAccountId?: string;   // used for Transferência
  paymentMethod: string; // Pix, Boleto, Cartão, Dinheiro
  value: number;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: "Pago" | "Recebido" | "Pendente" | "Agendado" | "Vencido" | "Cancelado";
  origin: "Manual" | "Importado" | "API";
  receiptUrl: string | null;
  notes: string | null;
  billingId?: string | null;
  payableId?: string | null;
}

export interface Billing {
  id: string;
  client: string;
  service: string;
  value: number;
  billingDate: string;
  dueDate: string;
  status: "A receber" | "Recebido" | "Vencido" | "Cancelado";
  bankAccountId: string;
  paymentMethod: string;
  notes: string | null;
}

export interface Payable {
  id: string;
  provider: string;
  description: string;
  category: string;
  value: number;
  dueDate: string;
  bankAccountId: string;
  status: "Pendente" | "Pago" | "Vencido" | "Cancelado";
  recurrence: "Única" | "Mensal" | "Anual";
  receiptUrl: string | null;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
}

export interface Asset {
  id: string;
  name: string;
  acquisitionValue: number;
  category: string;
  acquisitionDate: string;
  status: "Ativo" | "Inativo" | "Baixado";
  currentBookValue: number;
  depreciationRate: number; // annual percentage, e.g. 10
}

export interface AuditLog {
  id: string;
  user: string;
  date: string;
  time: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  targetId: string;
}

export interface ImportedTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  value: number;
  payerOrReceiver: string | null;
  status: "Pendente" | "Conciliada" | "Divergente" | "Não Identificada";
  suggestedTransactionId: string | null;
  pixKey?: string | null;
}
