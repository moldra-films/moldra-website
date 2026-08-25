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

export interface EventPhoto {
  id: string;
  url: string;
  name: string;
}

export interface EventMedia {
  id: number;
  name: string;
  date: string;
  pricePerPhoto: number;
  packagePrice: number;
  photos: EventPhoto[];
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
  updateProject: (id: number, project: Partial<Project>) => void;
  deleteProject: (id: number) => void;
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
  addTransaction: (transaction: Omit<Transaction, "id"> & { paymentId?: string }) => void;
  markTransactionPaid: (id: number) => void;
  
  // Equipment actions
  updateEquipmentStatus: (id: number, status: Equipment["status"], responsible?: string) => void;
  addEquipment: (equipment: Omit<Equipment, "id">) => void;
  addLocation: (location: Omit<Location, "id">) => void;
  
  // Notification actions
  markAllNotificationsRead: () => void;
  addNotification: (title: string, description: string, type: Notification["type"]) => void;

  // Service Types / Categories
  serviceTypes: string[];
  addServiceType: (service: string) => void;
  deleteServiceType: (service: string) => void;

  // Event Media Store actions
  eventMedias: EventMedia[];
  addEventMedia: (event: Omit<EventMedia, "id" | "photos">) => void;
  deleteEventMedia: (id: number) => void;
  addPhotosToEvent: (eventId: number, photos: Omit<EventPhoto, "id">[]) => void;
  deletePhotoFromEvent: (eventId: number, photoId: string) => void;
  updateEventMedia: (id: number, event: Partial<EventMedia>) => void;
  activeFinanceSubTab: string;
  setActiveFinanceSubTab: (tab: string) => void;
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
  const [eventMedias, setEventMedias] = useState<EventMedia[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([
    "Vídeo Institucional",
    "Produção Audiovisual",
    "Campanha Comercial",
    "Cobertura de Evento",
    "Redes Sociais",
    "Fotografia",
  ]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState("dashboard");

  // Load state from Supabase database on client-side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Fetch centralized data from Supabase
      Promise.all([
        fetch("/api/event-media").then((res) => res.ok ? res.json() : Promise.reject("event-media error")),
        fetch("/api/transactions").then((res) => res.ok ? res.json() : Promise.reject("transactions error")),
        fetch("/api/leads").then((res) => res.ok ? res.json() : Promise.reject("leads error")),
        fetch("/api/clients").then((res) => res.ok ? res.json() : Promise.reject("clients error")),
        fetch("/api/projects").then((res) => res.ok ? res.json() : Promise.reject("projects error")),
        fetch("/api/tasks").then((res) => res.ok ? res.json() : Promise.reject("tasks error")),
        fetch("/api/equipments").then((res) => res.ok ? res.json() : Promise.reject("equipments error")),
        fetch("/api/locations").then((res) => res.ok ? res.json() : Promise.reject("locations error")),
        fetch("/api/contracts").then((res) => res.ok ? res.json() : Promise.reject("contracts error")),
        fetch("/api/notifications").then((res) => res.ok ? res.json() : Promise.reject("notifications error")),
        fetch("/api/service-types").then((res) => res.ok ? res.json() : Promise.reject("service-types error")),
      ])
        .then(([
          eventMediaData,
          transactionsData,
          leadsData,
          clientsData,
          projectsData,
          tasksData,
          equipmentsData,
          locationsData,
          contractsData,
          notificationsData,
          serviceTypesData
        ]) => {
          // Process eventMediaData migrations
          const oldSubdomain = "pub-3afde87ff96b7a4df43f2365f22e537e.r2.dev";
          const newSubdomain = "pub-5c8ecaf928ac40f487ff1d7bf6b4b629.r2.dev";
          let migrated = false;

          const migratedData = eventMediaData.map((event: any) => {
            const updatedPhotos = event.photos.map((photo: any) => {
              if (photo.url.includes(oldSubdomain)) {
                migrated = true;
                return {
                  ...photo,
                  url: photo.url.replace(oldSubdomain, newSubdomain),
                };
              }
              return photo;
            });
            return {
              ...event,
              photos: updatedPhotos,
            };
          });

          setEventMedias(migratedData);
          if (migrated) {
            fetch("/api/event-media", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(migratedData),
            }).catch((e) => console.error("Error saving migrated R2 database:", e));
          }

          // Sync database values to React states
          setTransactions(transactionsData);
          setLeads(leadsData);
          setClients(clientsData);
          setProjects(projectsData);
          setTasks(tasksData);
          setEquipments(equipmentsData);
          setLocations(locationsData);
          setContracts(contractsData);
          setNotifications(notificationsData);
          setServiceTypes(serviceTypesData);
        })
        .catch((err) => {
          console.error("Failed to load database data:", err);
        })
        .finally(() => {
          setIsLoaded(true);
        });
    }
  }, []);

  // Save to Database when state changes and loaded is complete
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leads),
      }).catch((err) => console.error("Error saving leads:", err));
    }
  }, [leads, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clients),
      }).catch((err) => console.error("Error saving clients:", err));
    }
  }, [clients, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projects),
      }).catch((err) => console.error("Error saving projects:", err));
    }
  }, [projects, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tasks),
      }).catch((err) => console.error("Error saving tasks:", err));
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactions),
      }).catch((err) => console.error("Error saving transactions:", err));
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/equipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipments),
      }).catch((err) => console.error("Error saving equipments:", err));
    }
  }, [equipments, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locations),
      }).catch((err) => console.error("Error saving locations:", err));
    }
  }, [locations, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contracts),
      }).catch((err) => console.error("Error saving contracts:", err));
    }
  }, [contracts, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      }).catch((err) => console.error("Error saving notifications:", err));
    }
  }, [notifications, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/service-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceTypes),
      }).catch((err) => console.error("Error saving service types:", err));
    }
  }, [serviceTypes, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      fetch("/api/event-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventMedias),
      }).catch((err) => console.error("Error saving event-medias database to Supabase:", err));
    }
  }, [eventMedias, isLoaded]);

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

  const updateProject = (id: number, updatedFields: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...updatedFields } : proj))
    );
  };

  const deleteProject = (id: number) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
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
    const p = projects.find((proj) => proj.id === id);
    if (p) {
      addNotification(
        "Novo comentário no projeto", 
        `'${comment.author}' comentou às ${comment.timestamp}: "${comment.text.substring(0, 40)}${comment.text.length > 40 ? "..." : ""}"`, 
        "task"
      );
    }
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
  const addTransaction = async (transaction: Omit<Transaction, "id"> & { paymentId?: string }) => {
    try {
      // POST single transaction to safely append it in R2
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (res.ok) {
        // Refetch complete list to stay updated
        const listRes = await fetch("/api/transactions");
        if (listRes.ok) {
          const list = await listRes.json();
          setTransactions(list);
          return;
        }
      }
    } catch (err) {
      console.error("Error adding transaction to R2:", err);
    }
    
    // Fallback locally
    setTransactions((prev) => [...prev, { ...transaction, id: prev.length + 1 }]);
  };

  const markTransactionPaid = async (id: number) => {
    const updated = transactions.map((trans) => (trans.id === id ? { ...trans, status: "Pago" as const } : trans));
    setTransactions(updated);

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Error updating transaction in R2:", err);
    }

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

  const addServiceType = (service: string) => {
    const trimmed = service.trim();
    if (trimmed && !serviceTypes.includes(trimmed)) {
      setServiceTypes((prev) => [...prev, trimmed]);
    }
  };

  const deleteServiceType = (service: string) => {
    setServiceTypes((prev) => prev.filter((item) => item !== service));
  };

  // Event Media Store actions
  const addEventMedia = (event: Omit<EventMedia, "id" | "photos">) => {
    setEventMedias((prev) => [
      ...prev,
      { ...event, id: prev.length + 1, photos: [] }
    ]);
    addNotification("Nova Galeria de Evento", `Mídia de evento '${event.name}' cadastrada.`, "delivery");
  };

  const deleteEventMedia = async (id: number) => {
    const event = eventMedias.find((e) => e.id === id);
    if (event && event.photos.length > 0) {
      await Promise.all(
        event.photos.map(async (photo) => {
          try {
            await fetch("/api/upload", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileUrl: photo.url }),
            });
          } catch (err) {
            console.error("Error deleting photo from R2 during event deletion:", err);
          }
        })
      );
    }
    setEventMedias((prev) => prev.filter((e) => e.id !== id));
  };

  const addPhotosToEvent = (eventId: number, newPhotos: Omit<EventPhoto, "id">[]) => {
    setEventMedias((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const formattedPhotos: EventPhoto[] = newPhotos.map((p, idx) => ({
            ...p,
            id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`
          }));
          return {
            ...e,
            photos: [...e.photos, ...formattedPhotos]
          };
        }
        return e;
      })
    );
  };

  const deletePhotoFromEvent = async (eventId: number, photoId: string) => {
    const event = eventMedias.find((e) => e.id === eventId);
    const photo = event?.photos.find((p) => p.id === photoId);
    
    if (photo?.url) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: photo.url }),
        });
      } catch (err) {
        console.error("Error deleting from R2:", err);
      }
    }

    setEventMedias((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            photos: e.photos.filter((p) => p.id !== photoId)
          };
        }
        return e;
      })
    );
  };

  const updateEventMedia = (id: number, updatedFields: Partial<EventMedia>) => {
    setEventMedias((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    );
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
        updateProject,
        deleteProject,
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
        addNotification,
        eventMedias,
        addEventMedia,
        deleteEventMedia,
        addPhotosToEvent,
        deletePhotoFromEvent,
        updateEventMedia,
        serviceTypes,
        addServiceType,
        deleteServiceType,
        activeFinanceSubTab,
        setActiveFinanceSubTab
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
