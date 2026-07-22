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
  updateLead: (id: number, lead: Partial<Lead>) => void;
  deleteLead: (id: number) => void;
  convertLeadToClient: (id: number) => void;
  
  // Client actions
  addClient: (client: Omit<Client, "id" | "projectsCount" | "totalValue">) => void;
  updateClient: (id: number, client: Partial<Client>) => void;
  deleteClient: (id: number) => void;
  
  // Project actions
  addProject: (project: Omit<Project, "id" | "comments" | "version">) => void;
  updateProjectStatus: (id: number, status: Project["status"]) => void;
  addProjectComment: (id: number, comment: Omit<Comment, "id">) => void;
  updateProjectShotList: (id: number, list: string[]) => void;
  updateProjectChecklist: (id: number, list: string[]) => void;
  
  // Task actions
  addTask: (task: Omit<Task, "id">) => void;
  updateTaskStatus: (id: number, status: Task["status"]) => void;
  updateTask: (id: number, task: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  toggleTaskItem: (taskId: number, itemIndex: number) => void;
  
  // Finance actions
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  markTransactionPaid: (id: number) => void;
  
  // Equipment actions
  updateEquipmentStatus: (id: number, status: Equipment["status"], responsible?: string) => void;
  addEquipment: (equipment: Omit<Equipment, "id">) => void;
  addLocation: (location: Omit<Location, "id">) => void;
  
  // Notification actions
  markAllNotificationsRead: () => void;
  addNotification: (title: string, description: string, type: Notification["type"]) => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  const updateLead = (id: number, updatedFields: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...updatedFields } : lead))
    );
  };

  const deleteLead = (id: number) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
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

  const addClient = (client: Omit<Client, "id" | "projectsCount" | "totalValue">) => {
    setClients((prev) => [...prev, { ...client, id: prev.length + 1, projectsCount: 0, totalValue: 0 }]);
  };

  const updateClient = (id: number, updatedFields: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteClient = (id: number) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
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

  const updateTask = (id: number, updatedFields: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updatedFields } : task))
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
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

  const addEquipment = (equipment: Omit<Equipment, "id">) => {
    setEquipments((prev) => [...prev, { ...equipment, id: prev.length + 1 }]);
    addNotification("Equipamento cadastrado", `O item '${equipment.name}' foi registrado no inventário técnico.`, "maintenance");
  };

  const addLocation = (location: Omit<Location, "id">) => {
    setLocations((prev) => [...prev, { ...location, id: prev.length + 1 }]);
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
        updateLead,
        deleteLead,
        convertLeadToClient,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProjectStatus,
        addProjectComment,
        updateProjectShotList,
        updateProjectChecklist,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        toggleTaskItem,
        addTransaction,
        markTransactionPaid,
        updateEquipmentStatus,
        addEquipment,
        addLocation,
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
