import fs from "fs";
import path from "path";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucketName } from "../r2Client";
import { 
  BankAccount, 
  Transaction, 
  Billing, 
  Payable, 
  FinancialGoal, 
  Asset, 
  AuditLog, 
  ImportedTransaction 
} from "@/types/finance";

// Types definition directly in database helper to ensure compile-safety
export interface FinanceDatabase {
  bankAccounts: BankAccount[];
  categories: string[];
  transactions: Transaction[];
  billings: Billing[];
  payables: Payable[];
  goals: FinancialGoal[];
  assets: Asset[];
  importedTransactions: ImportedTransaction[];
  auditLogs: AuditLog[];
  equipmentPhotos?: Record<number, string[]>;
}

const LOCAL_DB_PATH = path.join(process.cwd(), "src/lib/db/finance.json");
const R2_DB_KEY = "db/finance.json";

// Default Seed Data
const DEFAULT_CATEGORIES = [
  "Equipamentos",
  "Produção",
  "Marketing",
  "Transporte",
  "Alimentação",
  "Software",
  "Serviços",
  "Impostos",
  "Funcionários",
  "Manutenção",
  "Outros"
];

const SEED_DATA: FinanceDatabase = {
  bankAccounts: [
    {
      id: "nubank-1",
      bank: "Nubank",
      name: "Nubank PJ",
      type: "Corrente",
      agency: "0001",
      account: "1892842-9",
      initialBalance: 10000.00,
      currentBalance: 15240.00,
      status: "Ativa",
      lastSync: "2026-08-25T10:00:00Z"
    },
    {
      id: "itau-1",
      bank: "Itaú",
      name: "Itaú Comercial",
      type: "Corrente",
      agency: "4082",
      account: "33942-0",
      initialBalance: 5000.00,
      currentBalance: 8320.00,
      status: "Ativa",
      lastSync: "2026-08-25T09:30:00Z"
    },
    {
      id: "bradesco-1",
      bank: "Bradesco",
      name: "Bradesco Reserva",
      type: "Investimentos",
      agency: "1284",
      account: "88231-1",
      initialBalance: 1500.00,
      currentBalance: 1500.00,
      status: "Ativa",
      lastSync: null
    }
  ],
  categories: DEFAULT_CATEGORIES,
  transactions: [
    {
      id: "tx-1",
      description: "Prod. Vídeo Comercial - Innova Corp",
      type: "Entrada",
      category: "Serviços",
      subcategory: "Produção Audiovisual",
      customerOrProvider: "Innova Corp",
      bankAccountId: "nubank-1",
      paymentMethod: "Pix",
      value: 7500.00,
      date: "2026-08-20",
      dueDate: "2026-08-20",
      status: "Recebido",
      origin: "Manual",
      receiptUrl: null,
      notes: "Cachê referente a 50% de entrada do projeto institucional.",
      billingId: "bill-1"
    },
    {
      id: "tx-2",
      description: "Vídeo Promocional - Porto Seguro",
      type: "Entrada",
      category: "Serviços",
      subcategory: "Campanha Comercial",
      customerOrProvider: "Porto Seguro S.A.",
      bankAccountId: "itau-1",
      paymentMethod: "Boleto",
      value: 12000.00,
      date: "2026-08-15",
      dueDate: "2026-08-15",
      status: "Recebido",
      origin: "Manual",
      receiptUrl: null,
      notes: "Faturamento integral do projeto promocional.",
      billingId: "bill-2"
    },
    {
      id: "tx-3",
      description: "Aluguel Estúdio - Agosto",
      type: "Saída",
      category: "Funcionários",
      subcategory: "Aluguel",
      customerOrProvider: "Imobiliária Vila Rica",
      bankAccountId: "nubank-1",
      paymentMethod: "Transferência",
      value: 2500.00,
      date: "2026-08-10",
      dueDate: "2026-08-10",
      status: "Pago",
      origin: "Manual",
      receiptUrl: null,
      notes: "Mensalidade do estúdio de gravações principal.",
      payableId: "pay-1"
    },
    {
      id: "tx-4",
      description: "Assinatura Adobe Creative Cloud",
      type: "Saída",
      category: "Software",
      subcategory: "Softwares",
      customerOrProvider: "Adobe Systems",
      bankAccountId: "nubank-1",
      paymentMethod: "Cartão de Crédito",
      value: 124.90,
      date: "2026-08-22",
      dueDate: "2026-08-22",
      status: "Pago",
      origin: "Importado",
      receiptUrl: null,
      notes: "Mensalidade do pacote de edição Premiere/After Effects.",
      payableId: "pay-2"
    },
    {
      id: "tx-5",
      description: "Manutenção Câmera Sony A7S III",
      type: "Saída",
      category: "Equipamentos",
      subcategory: "Manutenção",
      customerOrProvider: "Porto Técnico Assistência",
      bankAccountId: "itau-1",
      paymentMethod: "Pix",
      value: 800.00,
      date: "2026-08-24",
      dueDate: "2026-08-25",
      status: "Pago",
      origin: "Manual",
      receiptUrl: null,
      notes: "Troca do obturador e limpeza do sensor."
    }
  ],
  billings: [
    {
      id: "bill-1",
      client: "Innova Corp",
      service: "Prod. Vídeo Comercial",
      value: 7500.00,
      billingDate: "2026-08-20",
      dueDate: "2026-08-20",
      status: "Recebido",
      bankAccountId: "nubank-1",
      paymentMethod: "Pix",
      notes: "Primeira parcela da entrega de vídeo promocional."
    },
    {
      id: "bill-2",
      client: "Porto Seguro S.A.",
      service: "Vídeo Promocional",
      value: 12000.00,
      billingDate: "2026-08-10",
      dueDate: "2026-08-15",
      status: "Recebido",
      bankAccountId: "itau-1",
      paymentMethod: "Boleto",
      notes: "Cobrança única de captação e edição."
    },
    {
      id: "bill-3",
      client: "Grupo Pão de Açúcar",
      service: "Cobertura de Evento de Lançamento",
      value: 15000.00,
      billingDate: "2026-08-25",
      dueDate: "2026-09-05",
      status: "A receber",
      bankAccountId: "nubank-1",
      paymentMethod: "Boleto",
      notes: "Aguardando término da montagem do vídeo de pós-evento."
    }
  ],
  payables: [
    {
      id: "pay-1",
      provider: "Imobiliária Vila Rica",
      description: "Aluguel Estúdio - Agosto",
      category: "Aluguel",
      value: 2500.00,
      dueDate: "2026-08-10",
      bankAccountId: "nubank-1",
      status: "Pago",
      recurrence: "Mensal",
      receiptUrl: null
    },
    {
      id: "pay-2",
      provider: "Adobe Systems",
      description: "Assinatura Adobe Creative Cloud",
      category: "Softwares",
      value: 124.90,
      dueDate: "2026-08-22",
      bankAccountId: "nubank-1",
      status: "Pago",
      recurrence: "Mensal",
      receiptUrl: null
    },
    {
      id: "pay-3",
      provider: "Copel Energia",
      description: "Conta de Energia Elétrica - Estúdio",
      category: "Energia",
      value: 380.00,
      dueDate: "2026-08-30",
      bankAccountId: "nubank-1",
      status: "Pendente",
      recurrence: "Mensal",
      receiptUrl: null
    },
    {
      id: "pay-4",
      provider: "Roberto Souza Freelancer",
      description: "Serviço de Montagem / Edição de Vídeo",
      category: "Produção",
      value: 1800.00,
      dueDate: "2026-08-27",
      bankAccountId: "itau-1",
      status: "Pendente",
      recurrence: "Única",
      receiptUrl: null
    }
  ],
  goals: [
    {
      id: "goal-1",
      name: "Comprar Drone DJI Inspire 3",
      targetValue: 45000.00,
      currentValue: 15000.00,
      deadline: "2026-12-31"
    },
    {
      id: "goal-2",
      name: "Adquirir Lente Sony 24-70mm GM II",
      targetValue: 16000.00,
      currentValue: 11200.00,
      deadline: "2026-10-15"
    }
  ],
  assets: [
    {
      id: "asset-1",
      name: "Câmera Cinema Sony FX3",
      acquisitionValue: 24000.00,
      category: "Equipamentos",
      acquisitionDate: "2025-01-10",
      status: "Ativo",
      currentBookValue: 21600.00,
      depreciationRate: 10
    },
    {
      id: "asset-2",
      name: "DJI Ronin RS 3 Pro Gimbal",
      acquisitionValue: 6500.00,
      category: "Equipamentos",
      acquisitionDate: "2025-06-15",
      status: "Ativo",
      currentBookValue: 5850.00,
      depreciationRate: 10
    }
  ],
  importedTransactions: [
    {
      id: "imp-1",
      bankAccountId: "nubank-1",
      date: "2026-08-20",
      description: "Transferência Pix Recebida - Innova Corp",
      value: 7500.00,
      payerOrReceiver: "Innova Corp",
      status: "Conciliada",
      suggestedTransactionId: "tx-1",
      pixKey: "CNPJ 44.123.456/0001-00"
    },
    {
      id: "imp-2",
      bankAccountId: "nubank-1",
      date: "2026-08-22",
      description: "Compra Débito - ADOBE SYSTEMS BRASIL",
      value: -124.90,
      payerOrReceiver: "Adobe Systems",
      status: "Conciliada",
      suggestedTransactionId: "tx-4",
      pixKey: null
    },
    {
      id: "imp-3",
      bankAccountId: "nubank-1",
      date: "2026-08-25",
      description: "Pix Recebido - JOAO DA SILVA ME",
      value: 2500.00,
      payerOrReceiver: "João da Silva",
      status: "Pendente",
      suggestedTransactionId: null,
      pixKey: "11999998888"
    },
    {
      id: "imp-4",
      bankAccountId: "nubank-1",
      date: "2026-08-25",
      description: "Débito Automático - POSTO ALVORADA LTDA",
      value: -450.00,
      payerOrReceiver: "Posto Alvorada",
      status: "Pendente",
      suggestedTransactionId: null,
      pixKey: null
    }
  ],
  auditLogs: [
    {
      id: "log-1",
      user: "Mikelly Maduro",
      date: "2026-08-25",
      time: "13:15:00",
      action: "Inicialização do banco de dados financeiro empresarial Moldra Films.",
      oldValue: null,
      newValue: "Database Setup",
      targetId: "system"
    }
  ],
  equipmentPhotos: {}
};

export class FinanceDb {
  private static cache: FinanceDatabase | null = null;

  // Pull database from Cloudflare R2
  private static async pullFromR2(): Promise<FinanceDatabase | null> {
    if (!bucketName) {
      console.warn("R2_BUCKET_NAME not configured. Skipping R2 database pull.");
      return null;
    }
    try {
      console.log(`Downloading database from R2: ${R2_DB_KEY}...`);
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: R2_DB_KEY,
      });
      const response = await r2.send(command);
      const jsonStr = await response.Body?.transformToString();
      if (jsonStr) {
        return JSON.parse(jsonStr);
      }
    } catch (err: any) {
      if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
        console.log("Database file not found in R2. A fresh one will be uploaded.");
      } else {
        console.error("Error pulling financial database from R2:", err);
      }
    }
    return null;
  }

  // Push database to Cloudflare R2
  private static async pushToR2(data: FinanceDatabase): Promise<void> {
    if (!bucketName) return;
    try {
      console.log(`Uploading database to R2: ${R2_DB_KEY}...`);
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: R2_DB_KEY,
        Body: JSON.stringify(data, null, 2),
        ContentType: "application/json",
      });
      await r2.send(command);
      console.log("Financial database successfully synced to Cloudflare R2.");
    } catch (err) {
      console.error("Error pushing financial database to R2:", err);
    }
  }

  // Load database (Cloudflare R2 cloud storage -> fallback local file -> seed default)
  public static async load(forceRefresh: boolean = false): Promise<FinanceDatabase> {
    if (this.cache && !forceRefresh) return this.cache;

    let dbData: FinanceDatabase | null = null;

    // 1. Primary: Always pull latest live database from Cloudflare R2 cloud storage
    if (bucketName) {
      dbData = await this.pullFromR2();
    }

    // 2. Fallback: If R2 is offline or unavailable, try reading local file cache
    if (!dbData) {
      try {
        if (fs.existsSync(LOCAL_DB_PATH)) {
          console.log("Reading financial database from local file fallback...");
          const fileContent = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
          dbData = JSON.parse(fileContent);
        }
      } catch (err) {
        console.warn("Could not read local finance database file fallback:", err);
      }
    }

    // 3. Fallback: If both fail, use seed data and initialize R2
    if (!dbData) {
      console.log("No existing database found in R2 or local. Seeding default database...");
      dbData = SEED_DATA;
      await this.pushToR2(dbData);
    }

    this.cache = dbData;
    return this.cache;
  }

  // Save database (Cloudflare R2 cloud storage primary -> local file best-effort)
  public static async save(data: FinanceDatabase): Promise<void> {
    this.cache = data;

    // 1. Primary: Push directly to Cloudflare R2 online database
    try {
      await this.pushToR2(data);
    } catch (err) {
      console.error("Failed to save financial database to Cloudflare R2:", err);
      throw err;
    }

    // 2. Best-effort: Save locally if filesystem allows
    try {
      const dir = path.dirname(LOCAL_DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      // Ignored for serverless / read-only production environments
    }
  }
}
