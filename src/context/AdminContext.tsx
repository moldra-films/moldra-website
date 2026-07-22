"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Interfaces
export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  projectType: string;
  value: number;
  stage: "Novo Lead" | "Primeiro Contato" | "Reunião Agendada" | "Proposta Enviada" | "Negociação" | "Fechado" | "Perdido";
  details: string;
}

export interface Client {
  id: number;
  name: string;
  company: string;
  cnpj: string;
  email: string;
  whatsapp: string;
  address: string;
  projectsCount: number;
  totalValue: number;
  responsible: string;
  notes?: string;
}

export interface Comment {
  id: number;
  timestamp: string;
  text: string;
  author: string;
}

export interface Project {
  id: number;
  name: string;
  clientName: string;
  serviceType: string;
  dateShoot: string;
  dateDelivery: string;
  budget: number;
  status: "Briefing" | "Planejamento" | "Em Produção" | "Aprovação" | "Concluído";
  shotList: string[];
  checklist: string[];
  crew: string[];
  location: string;
  references: string;
  comments: Comment[];
  videoUrl?: string;
  version: string;
}

export interface TaskChecklist {
  text: string;
  done: boolean;
}

export interface Task {
  id: number;
  title: string;
  project: string;
  assignedTo: string;
  dueDate: string;
  priority: "Baixa" | "Média" | "Alta";
  status: "A Fazer" | "Em Produção" | "Revisão" | "Concluído";
  checklist: TaskChecklist[];
  tags: string[];
}

export interface Transaction {
  id: number;
  type: "Receita" | "Despesa";
  category: string;
  value: number;
  date: string;
  description: string;
  status: "Pago" | "Pendente";
  customer: string;
}

export interface Equipment {
  id: number;
  name: string;
  category: "Câmeras" | "Lentes" | "Drones" | "Gimbals" | "Iluminação" | "Áudio" | "Outros";
  serialNumber: string;
  status: "Disponível" | "Em Uso" | "Em Manutenção";
  lastMaintenance: string;
  responsible: string;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  rate: number;
  status: "Disponível" | "Reservada";
  contact: string;
}

export interface Contract {
  id: number;
  title: string;
  client: string;
  date: string;
  status: "Assinado" | "Pendente" | "Cancelado";
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "payment" | "delivery" | "approval" | "task" | "maintenance";
}

interface AdminContextProps {
  leads: Lead[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  transactions: Transaction[];
  equipments: Equipment[];
  locations: Location[];
  contracts: Contract[];
  notifications: Notification[];
  
  // Lead actions
  addLead: (lead: Omit<Lead, "id">) => void;
  updateLeadStage: (id: number, stage: Lead["stage"]) => void;
  convertLeadToClient: (id: number) => void;
  
  // Client actions
  addClient: (client: Omit<Client, "id" | "projectsCount" | "totalValue">) => void;
  
  // Project actions
  addProject: (project: Omit<Project, "id" | "comments" | "version">) => void;
  updateProjectStatus: (id: number, status: Project["status"]) => void;
  addProjectComment: (id: number, comment: Omit<Comment, "id">) => void;
  updateProjectShotList: (id: number, list: string[]) => void;
  updateProjectChecklist: (id: number, list: string[]) => void;
  
  // Task actions
  addTask: (task: Omit<Task, "id">) => void;
  updateTaskStatus: (id: number, status: Task["status"]) => void;
  toggleTaskItem: (taskId: number, itemIndex: number) => void;
  
  // Finance actions
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  markTransactionPaid: (id: number) => void;
  
  // Equipment actions
  updateEquipmentStatus: (id: number, status: Equipment["status"], responsible?: string) => void;
  
  // Notification actions
  markAllNotificationsRead: () => void;
  addNotification: (title: string, description: string, type: Notification["type"]) => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Leads initial state
  const [leads, setLeads] = useState<Lead[]>([
    { id: 1, name: "Pedro Henrique", company: "Go Fit Academias", email: "pedro@gofit.com", whatsapp: "(11) 98765-4321", projectType: "Campanha Comercial", value: 12000, stage: "Negociação", details: "Quer uma campanha digital de 30 segundos focada no Instagram." },
    { id: 2, name: "Ana Souza", company: "Bella Estética", email: "ana@bella.com.br", whatsapp: "(11) 97777-6666", projectType: "Redes Sociais", value: 6500, stage: "Reunião Agendada", details: "Série de 5 Reels dinâmicos de alta qualidade." },
    { id: 3, name: "Marcos Lima", company: "Construtora Viver", email: "marcos@construtoraviver.com", whatsapp: "(11) 91111-2222", projectType: "Vídeo Institucional", value: 25000, stage: "Proposta Enviada", details: "Filme institucional completo da nova sede em Alphaville." },
  ]);

  // Clients initial state
  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: "Clara Guedes", company: "Innova Corp", cnpj: "12.345.678/0001-99", email: "clara@innovacorp.com", whatsapp: "(11) 95555-4444", address: "Av. Faria Lima, 1500 - São Paulo, SP", projectsCount: 2, totalValue: 48000, responsible: "Mikelly Maduro", notes: "Prefere contato por e-mail, aprovação rápida." },
    { id: 2, name: "Julio Santos", company: "Apex Wear", cnpj: "98.765.432/0001-11", email: "julio@apexwear.com", whatsapp: "(11) 92222-3333", address: "Alameda Lorena, 300 - São Paulo, SP", projectsCount: 1, totalValue: 18000, responsible: "Natália Camurça", notes: "Sempre pede finalizações em 16:9 e 9:16." },
  ]);

  // Projects initial state
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Legado Corporativo 2026",
      clientName: "Innova Corp",
      serviceType: "Vídeo Institucional",
      dateShoot: "2026-08-10",
      dateDelivery: "2026-08-25",
      budget: 28000,
      status: "Em Produção",
      shotList: ["Fachada do prédio com drone ao pôr do sol", "Entrevista com a diretoria no estúdio principal", "Colaboradores interagindo no refeitório e recepção"],
      checklist: ["Baterias carregadas", "HDs limpos e formatados", "Autorização de entrada e drone aprovadas"],
      crew: ["Natália Camurça (Diretora de Fotografia)", "Carlos Silva (Operador de Câmera)", "Guilherme Lemos (Operador de Drone)"],
      location: "Escritório Innova Corp, Faria Lima",
      references: "Tom comercial corporativo sofisticado, luz suave",
      comments: [
        { id: 1, timestamp: "00:14", text: "Este take da fachada ficou excelente. Podemos manter mais tempo na edição?", author: "Clara Guedes (Cliente)" },
        { id: 2, timestamp: "00:45", text: "O áudio da entrevista está limpo. Excelente pós-produção.", author: "Natália Camurça (CEO)" }
      ],
      videoUrl: "https://player.vimeo.com/external/435674703.sd.mp4?s=7f77e2da58c54d7ffab833504f478e1215b2e5cc&profile_id=139&oauth2_token_id=57447761",
      version: "v1"
    },
    {
      id: 2,
      name: "Coleção Verão Apex",
      clientName: "Apex Wear",
      serviceType: "Comercial",
      dateShoot: "2026-07-28",
      dateDelivery: "2026-08-15",
      budget: 18000,
      status: "Aprovação",
      shotList: ["Modelos desfilando na areia da praia", "Detalhe macro das costuras e tecidos", "Abertura de malas e close-up de óculos"],
      checklist: ["Aluguel da van de produção", "Contratar modelos (Sarah e Bruno)", "Apoio de iluminação externa (refletores de preenchimento)"],
      crew: ["Carlos Silva (Operador de Câmera)", "Natália Camurça (Diretora Criativa)"],
      location: "Praia de Maresias, SP",
      references: "Campanhas dinâmicas Nike, música enérgica, cortes rápidos",
      comments: [],
      videoUrl: "https://player.vimeo.com/external/340322137.sd.mp4?s=d0cc8a79b19e917d21ca520f9119420077c98889&profile_id=139&oauth2_token_id=57447761",
      version: "v2"
    }
  ]);

  // Tasks initial state
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Roteiro da campanha Go Fit", project: "Go Fit Academias", assignedTo: "Mikelly Maduro", dueDate: "2026-07-26", priority: "Alta", status: "A Fazer", checklist: [{ text: "Escrever roteiro principal", done: false }, { text: "Revisar com diretor criativo", done: false }], tags: ["Pré-Produção"] },
    { id: 2, title: "Color Grading - Apex Verão", project: "Coleção Verão Apex", assignedTo: "Natália Camurça", dueDate: "2026-08-02", priority: "Média", status: "Em Produção", checklist: [{ text: "Corrigir equilíbrio de branco", done: true }, { text: "Aplicar LUT de cinema", done: false }], tags: ["Pós-Produção"] },
    { id: 3, title: "Edição de Áudio e Trilhas", project: "Legado Corporativo 2026", assignedTo: "Bruna Lins", dueDate: "2026-08-12", priority: "Alta", status: "Revisão", checklist: [{ text: "Equalizar trilha sonora", done: true }, { text: "Limpeza de ruídos", done: true }, { text: "Finalizar Sound Design", done: false }], tags: ["Áudio"] },
  ]);

  // Transactions initial state
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: "Receita", category: "Projetos", value: 28000, date: "2026-07-15", description: "50% entrada Vídeo Institucional Innova Corp", status: "Pago", customer: "Innova Corp" },
    { id: 2, type: "Despesa", category: "Equipe", value: 3500, date: "2026-07-18", description: "Cachê freelancer operador de drone (Guilherme)", status: "Pago", customer: "Guilherme Lemos" },
    { id: 3, type: "Receita", category: "Fotografia", value: 8500, date: "2026-07-20", description: "Retratos corporativos Apex Wear", status: "Pago", customer: "Apex Wear" },
    { id: 4, type: "Despesa", category: "Aluguel", value: 5000, date: "2026-07-05", description: "Aluguel escritório e estúdio comercial", status: "Pago", customer: "Imobiliária Paulista" },
    { id: 5, type: "Receita", category: "Projetos", value: 12000, date: "2026-08-01", description: "Parcela final Go Fit Academias", status: "Pendente", customer: "Go Fit Academias" },
    { id: 6, type: "Despesa", category: "Freelancers", value: 2000, date: "2026-08-03", description: "Edição secundária de Reels", status: "Pendente", customer: "Lucas Editor" }
  ]);

  // Equipment initial state
  const [equipments, setEquipments] = useState<Equipment[]>([
    { id: 1, name: "Sony FX3 Cinema Camera", category: "Câmeras", serialNumber: "SO-FX3-0988", status: "Disponível", lastMaintenance: "2026-06-15", responsible: "Nenhum" },
    { id: 2, name: "DJI Inspire 3 Drone 8K", category: "Drones", serialNumber: "DJ-INS3-4411", status: "Em Manutenção", lastMaintenance: "2026-07-20", responsible: "Carlos Silva" },
    { id: 3, name: "Lente Sony 24-70mm f/2.8 GM II", category: "Lentes", serialNumber: "SO-2470-8772", status: "Disponível", lastMaintenance: "2026-05-10", responsible: "Nenhum" },
    { id: 4, name: "Aputure 600d Pro LED Light", category: "Iluminação", serialNumber: "AP-600D-0199", status: "Em Uso", lastMaintenance: "2026-04-12", responsible: "Natália Camurça" },
  ]);

  // Locations initial state
  const [locations, setLocations] = useState<Location[]>([
    { id: 1, name: "Estúdio Retro Industrial", address: "Rua do Bucolismo, 400 - Brás, SP", rate: 1200, status: "Disponível", contact: "Roberto (11) 98765-1122" },
    { id: 2, name: "Mansão Alphaville Residencial", address: "Al. das Flores, 88 - Barueri, SP", rate: 3500, status: "Disponível", contact: "Cláudia (11) 99888-7777" }
  ]);

  // Contracts initial state
  const [contracts, setContracts] = useState<Contract[]>([
    { id: 1, title: "Contrato Prestação Serviços Audiovisuais - Innova Corp", client: "Innova Corp", date: "2026-07-10", status: "Assinado" },
    { id: 2, title: "Contrato Cessão de Imagem Modelo - Apex Wear", client: "Apex Wear", date: "2026-07-26", status: "Pendente" },
  ]);

  // Notifications initial state
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "Novo orçamento aprovado", description: "Cliente Innova Corp aprovou o orçamento do projeto 'Legado Corporativo 2026'.", time: "Hoje, 10:15", unread: true, type: "approval" },
    { id: 2, title: "Gravação agendada próxima", description: "A gravação do projeto 'Coleção Verão Apex' acontece em 6 dias.", time: "Hoje, 08:30", unread: true, type: "delivery" },
    { id: 3, title: "Contrato pendente de assinatura", description: "Contrato de modelo para Apex Wear está pendente de assinatura.", time: "Ontem", unread: false, type: "task" }
  ]);

  // Lead actions
  const addLead = (lead: Omit<Lead, "id">) => {
    setLeads((prev) => [...prev, { ...lead, id: prev.length + 1 }]);
    addNotification("Novo Lead cadastrado", `Lead da empresa ${lead.company} foi cadastrado via funil.`, "task");
  };

  const updateLeadStage = (id: number, stage: Lead["stage"]) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, stage } : lead))
    );
  };

  const convertLeadToClient = (id: number) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    // Add to client list
    const newClient: Client = {
      id: clients.length + 1,
      name: lead.name,
      company: lead.company,
      cnpj: "00.000.000/0001-00", // Placeholder
      email: lead.email,
      whatsapp: lead.whatsapp,
      address: "Endereço comercial pendente",
      projectsCount: 1,
      totalValue: lead.value,
      responsible: "Mikelly Maduro"
    };
    setClients((prev) => [...prev, newClient]);

    // Create a project automatically
    const newProject: Project = {
      id: projects.length + 1,
      name: `Projeto ${lead.projectType} - ${lead.company}`,
      clientName: lead.company,
      serviceType: lead.projectType,
      dateShoot: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      dateDelivery: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 20 days from now
      budget: lead.value,
      status: "Briefing",
      shotList: ["Shot 01 - Cenas iniciais pendentes de roteiro"],
      checklist: ["Alinhamento de briefing comercial"],
      crew: ["Natália Camurça (Diretora Criativa)"],
      location: "Locação pendente",
      references: lead.details,
      comments: [],
      version: "v1"
    };
    setProjects((prev) => [...prev, newProject]);

    // Add budget value to transactions as pending
    const newTransaction: Transaction = {
      id: transactions.length + 1,
      type: "Receita",
      category: "Projetos",
      value: lead.value * 0.5, // 50% entry fee
      date: new Date().toISOString().split("T")[0],
      description: `50% entrada - Projeto ${lead.company}`,
      status: "Pendente",
      customer: lead.company
    };
    setTransactions((prev) => [...prev, newTransaction]);

    // Remove from lead list
    setLeads((prev) => prev.filter((l) => l.id !== id));

    addNotification("Lead convertido em Cliente!", `O lead de ${lead.name} (${lead.company}) foi convertido. Um novo projeto foi iniciado automaticamente.`, "approval");
  };

  // Client actions
  const addClient = (client: Omit<Client, "id" | "projectsCount" | "totalValue">) => {
    setClients((prev) => [...prev, { ...client, id: prev.length + 1, projectsCount: 0, totalValue: 0 }]);
  };

  // Project actions
  const addProject = (project: Omit<Project, "id" | "comments" | "version">) => {
    setProjects((prev) => [...prev, { ...project, id: prev.length + 1, comments: [], version: "v1" }]);
  };

  const updateProjectStatus = (id: number, status: Project["status"]) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, status } : proj))
    );
    const p = projects.find((proj) => proj.id === id);
    if (p) {
      addNotification("Status de projeto atualizado", `O projeto '${p.name}' foi alterado para '${status}'.`, "delivery");
    }
  };

  const addProjectComment = (id: number, comment: Omit<Comment, "id">) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === id) {
          const nextCommentId = proj.comments.length + 1;
          return {
            ...proj,
            comments: [...proj.comments, { ...comment, id: nextCommentId }]
          };
        }
        return proj;
      })
    );
  };

  const updateProjectShotList = (id: number, list: string[]) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, shotList: list } : proj))
    );
  };

  const updateProjectChecklist = (id: number, list: string[]) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, checklist: list } : proj))
    );
  };

  // Task actions
  const addTask = (task: Omit<Task, "id">) => {
    setTasks((prev) => [...prev, { ...task, id: prev.length + 1 }]);
  };

  const updateTaskStatus = (id: number, status: Task["status"]) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status } : task))
    );
  };

  const toggleTaskItem = (taskId: number, itemIndex: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newChecklist = [...task.checklist];
          newChecklist[itemIndex].done = !newChecklist[itemIndex].done;
          return { ...task, checklist: newChecklist };
        }
        return task;
      })
    );
  };

  // Finance actions
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    setTransactions((prev) => [...prev, { ...transaction, id: prev.length + 1 }]);
  };

  const markTransactionPaid = (id: number) => {
    setTransactions((prev) =>
      prev.map((trans) => (trans.id === id ? { ...trans, status: "Pago" as const } : trans))
    );
    const t = transactions.find((trans) => trans.id === id);
    if (t) {
      addNotification("Pagamento recebido", `Transação de R$ ${t.value.toLocaleString()} foi confirmada como Paga.`, "payment");
    }
  };

  // Equipment actions
  const updateEquipmentStatus = (id: number, status: Equipment["status"], responsible: string = "Nenhum") => {
    setEquipments((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, status, responsible } : eq))
    );
    const eq = equipments.find((e) => e.id === id);
    if (eq && status === "Em Manutenção") {
      addNotification("Equipamento em manutenção", `O item '${eq.name}' foi retirado para revisão de manutenção periódica.`, "maintenance");
    }
  };

  // Notification actions
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, unread: false })));
  };

  const addNotification = (title: string, description: string, type: Notification["type"]) => {
    setNotifications((prev) => [
      {
        id: prev.length + 1,
        title,
        description,
        time: "Agora mesmo",
        unread: true,
        type
      },
      ...prev
    ]);
  };

  return (
    <AdminContext.Provider
      value={{
        leads,
        clients,
        projects,
        tasks,
        transactions,
        equipments,
        locations,
        contracts,
        notifications,
        addLead,
        updateLeadStage,
        convertLeadToClient,
        addClient,
        addProject,
        updateProjectStatus,
        addProjectComment,
        updateProjectShotList,
        updateProjectChecklist,
        addTask,
        updateTaskStatus,
        toggleTaskItem,
        addTransaction,
        markTransactionPaid,
        updateEquipmentStatus,
        markAllNotificationsRead,
        addNotification
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
