"use client";

import { useState, useRef } from "react";
import { useAdmin, Lead, Client } from "@/context/AdminContext";
import { Plus, ArrowRight, CheckCircle2, User, Search, MessageSquare, PhoneCall, Edit, Trash2, GripVertical, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function CRMTab() {
  const { 
    leads, 
    clients, 
    addLead, 
    updateLead, 
    deleteLead, 
    updateLeadStage, 
    convertLeadToClient, 
    addClient, 
    updateClient, 
    deleteClient,
    serviceTypes
  } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Lead["stage"] | null>(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    whatsapp: "",
    projectType: "Vídeo Institucional",
    value: 0,
    details: "",
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      updateLead(editingLead.id, {
        name: newLead.name,
        company: newLead.company,
        email: newLead.email,
        whatsapp: newLead.whatsapp,
        projectType: newLead.projectType,
        value: Number(newLead.value),
        details: newLead.details,
      });
      setEditingLead(null);
    } else {
      addLead({
        name: newLead.name,
        company: newLead.company,
        email: newLead.email,
        whatsapp: newLead.whatsapp,
        projectType: newLead.projectType,
        value: Number(newLead.value),
        stage: "Novo Lead",
        details: newLead.details,
      });
    }
    setNewLead({
      name: "",
      company: "",
      email: "",
      whatsapp: "",
      projectType: "Vídeo Institucional",
      value: 0,
      details: "",
    });
    setShowAddLead(false);
  };

  const handleEditLeadClick = (lead: Lead) => {
    setEditingLead(lead);
    setNewLead({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      whatsapp: lead.whatsapp,
      projectType: lead.projectType,
      value: lead.value,
      details: lead.details,
    });
    setShowAddLead(true);
  };

  const handleCloseLeadDrawer = () => {
    setEditingLead(null);
    setNewLead({
      name: "",
      company: "",
      email: "",
      whatsapp: "",
      projectType: "Vídeo Institucional",
      value: 0,
      details: "",
    });
    setShowAddLead(false);
  };

  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    logoUrl: "",
    cnpj: "",
    email: "",
    whatsapp: "",
    address: "",
    responsible: "Mikelly Maduro",
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingLogo(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: `clients/${Date.now()}-${file.name}`,
            fileType: file.type,
            folder: "clients",
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Falha ao gerar link de upload.");
        }

        const { uploadUrl, fileUrl } = await res.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("Falha no upload direto para a nuvem R2.");
        }

        setNewClient((prev) => ({ ...prev, logoUrl: fileUrl }));
      } catch (err: any) {
        console.error("Error uploading client logo:", err);
        alert(`Erro ao fazer upload da foto da marca: ${err.message}`);
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, {
        name: newClient.name,
        company: newClient.company,
        logoUrl: newClient.logoUrl,
        cnpj: newClient.cnpj,
        email: newClient.email,
        whatsapp: newClient.whatsapp,
        address: newClient.address,
        responsible: newClient.responsible,
      });
      setEditingClient(null);
    } else {
      addClient({
        name: newClient.name,
        company: newClient.company,
        logoUrl: newClient.logoUrl,
        cnpj: newClient.cnpj || "00.000.000/0001-00",
        email: newClient.email,
        whatsapp: newClient.whatsapp,
        address: newClient.address || "Endereço comercial pendente",
        responsible: newClient.responsible,
      });
    }
    setNewClient({
      name: "",
      company: "",
      logoUrl: "",
      cnpj: "",
      email: "",
      whatsapp: "",
      address: "",
      responsible: "Mikelly Maduro",
    });
    setShowAddClient(false);
  };

  const handleEditClientClick = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      company: client.company,
      logoUrl: client.logoUrl || "",
      cnpj: client.cnpj,
      email: client.email,
      whatsapp: client.whatsapp,
      address: client.address,
      responsible: client.responsible,
    });
    setShowAddClient(true);
  };

  const handleCloseClientDrawer = () => {
    setEditingClient(null);
    setNewClient({
      name: "",
      company: "",
      logoUrl: "",
      cnpj: "",
      email: "",
      whatsapp: "",
      address: "",
      responsible: "Mikelly Maduro",
    });
    setShowAddClient(false);
  };

  // Drag and Drop Handlers for Kanban Cards
  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData("text/plain", leadId.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, stage: Lead["stage"]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent, stage: Lead["stage"]) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stage) {
      setDragOverStage(null);
    }
  };

  const handleDropOnColumn = (e: React.DragEvent, stage: Lead["stage"]) => {
    e.preventDefault();
    const rawId = e.dataTransfer.getData("text/plain");
    const leadId = rawId ? Number(rawId) : draggedLeadId;
    
    if (leadId) {
      updateLeadStage(leadId, stage);
    }
    setDragOverStage(null);
    setDraggedLeadId(null);
  };

  // Filter clients based on search
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pipelineStages: { stage: Lead["stage"]; label: string; color: string }[] = [
    { stage: "Novo Lead", label: "Novo Lead", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    { stage: "Primeiro Contato", label: "Contato", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
    { stage: "Reunião Agendada", label: "Reunião", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
    { stage: "Proposta Enviada", label: "Proposta", color: "bg-pink-500/10 border-pink-500/20 text-pink-400" },
    { stage: "Negociação", label: "Negociação", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
  ];

  return (
    <div className="p-8 space-y-12">
      {/* Upper Area: Pipeline Title & Add Lead Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">Funil Comercial (CRM)</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">Acompanhe as propostas e converta leads em clientes com um clique.</p>
        </div>

        <button
          onClick={() => setShowAddLead(true)}
          className="px-5 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Lead
        </button>
      </div>

      {/* Add Lead Modal / Form Overlay */}
      {showAddLead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-lg bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{editingLead ? "Editar Lead" : "Criar Novo Lead"}</h3>
              <button onClick={handleCloseLeadDrawer} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome do Contato</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="João Silva"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Empresa</label>
                  <input
                    type="text"
                    required
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="Nike Brasil"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="joao@nike.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={newLead.whatsapp}
                    onChange={(e) => setNewLead({ ...newLead, whatsapp: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="(11) 98888-8888"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Tipo de Projeto</label>
                  <select
                    value={newLead.projectType}
                    onChange={(e) => setNewLead({ ...newLead, projectType: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    {serviceTypes.length === 0 && <option value="Vídeo Institucional">Vídeo Institucional</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    required
                    value={newLead.value || ""}
                    onChange={(e) => setNewLead({ ...newLead, value: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="15000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Detalhes / Escopo</label>
                <textarea
                  value={newLead.details}
                  onChange={(e) => setNewLead({ ...newLead, details: e.target.value })}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Descreva brevemente a expectativa..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingLead ? "Salvar Alterações" : "Cadastrar Lead"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Kanban Board Grid with Drag & Drop */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {pipelineStages.map((stageObj) => {
          const stageLeads = leads.filter((lead) => lead.stage === stageObj.stage);
          const isOver = dragOverStage === stageObj.stage;
          return (
            <div 
              key={stageObj.stage} 
              onDragOver={(e) => handleDragOverColumn(e, stageObj.stage)}
              onDragLeave={(e) => handleDragLeaveColumn(e, stageObj.stage)}
              onDrop={(e) => handleDropOnColumn(e, stageObj.stage)}
              className={`flex flex-col rounded-2xl bg-dark-card border transition-all duration-200 min-h-[440px] ${
                isOver 
                  ? "border-primary ring-2 ring-primary/30 bg-primary/[0.04] shadow-xl shadow-primary/5" 
                  : "border-white/5"
              }`}
            >
              {/* Stage Header */}
              <div className={`px-4 py-3 rounded-t-2xl border-b border-white/5 flex items-center justify-between transition-colors ${stageObj.color} ${isOver ? "bg-primary/20" : ""}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider">{stageObj.label}</span>
                <span className="text-xs font-bold font-display px-2 py-0.5 rounded-full bg-white/5">{stageLeads.length}</span>
              </div>

              {/* Stage Cards Container */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1 flex flex-col">
                {stageLeads.map((lead) => {
                  const isBeingDragged = draggedLeadId === lead.id;
                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 rounded-xl bg-black/50 border transition-all duration-150 flex flex-col justify-between space-y-3 group cursor-grab active:cursor-grabbing select-none ${
                        isBeingDragged
                          ? "opacity-40 border-dashed border-primary scale-[0.98] shadow-none"
                          : "border-white/5 hover:border-primary/40 hover:shadow-lg hover:shadow-black/40 hover:bg-black/70"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-colors shrink-0" />
                            <span className="text-[10px] text-primary uppercase font-bold tracking-widest">{lead.projectType}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLeadClick(lead);
                              }}
                              className="p-1 hover:bg-white/15 rounded text-gray-400 hover:text-white cursor-pointer transition-colors"
                              title="Editar Lead"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLead(lead.id);
                              }}
                              className="p-1 hover:bg-red-500/15 rounded text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                              title="Excluir Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1 font-display leading-tight">{lead.company}</h4>
                        <p className="text-[10px] text-gray-500 font-sans mt-0.5">{lead.name}</p>
                        <p className="text-[10px] text-gray-400 font-sans mt-2 line-clamp-2 leading-relaxed font-light">{lead.details}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-xs font-bold text-white font-mono">
                          R$ {lead.value.toLocaleString("pt-BR")}
                        </span>
                        
                        {/* Interaction Controls */}
                        <div className="flex items-center gap-1">
                          {/* Convert to Client Button (Shows up on Negociação or when ready) */}
                          {lead.stage === "Negociação" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                convertLeadToClient(lead.id);
                              }}
                              className="px-2 py-1 bg-primary hover:bg-[#B39356] text-black rounded-lg cursor-pointer transition-colors text-[10px] font-bold flex items-center gap-1 shadow-sm"
                              title="Converter em Cliente"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Converter</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className={`flex-1 flex items-center justify-center border-2 border-dashed rounded-xl p-4 text-center text-[10px] transition-colors ${
                    isOver 
                      ? "border-primary/40 bg-primary/5 text-primary font-bold" 
                      : "border-white/5 text-gray-600 font-sans"
                  }`}>
                    {isOver ? "Solte o card aqui" : "Sem leads nesta etapa"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clients Directory */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-white">Diretório de Clientes Ativos</h2>
            <p className="text-xs text-gray-500 font-sans mt-1">Lista completa de marcas que já possuem projetos conosco.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddClient(true)}
              className="px-4 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Cliente
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar clientes por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-dark-card border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/40 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="rounded-2xl bg-dark-card border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-gray-400 font-semibold tracking-wider uppercase text-[10px]">
                  <th className="p-4">Cliente / Contato</th>
                  <th className="p-4">CNPJ</th>
                  <th className="p-4">E-mail & WhatsApp</th>
                  <th className="p-4 text-center">Projetos</th>
                  <th className="p-4">Total Faturado</th>
                  <th className="p-4">Responsável</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          {client.logoUrl ? (
                            <img
                              src={client.logoUrl}
                              alt={client.company}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white font-display block">{client.company}</span>
                          <span className="text-[10px] text-gray-500 font-sans block">{client.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono font-light">{client.cnpj}</td>
                    <td className="p-4 font-sans font-light">
                      <span className="block text-gray-300">{client.email}</span>
                      <span className="block text-gray-500 text-[10px] mt-0.5">{client.whatsapp}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-white">{client.projectsCount}</td>
                    <td className="p-4 font-bold text-primary font-display">R$ {client.totalValue.toLocaleString()}</td>
                    <td className="p-4 text-gray-300">{client.responsible}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClientClick(client)}
                          className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer transition-colors"
                          title="Editar Cliente"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="p-1 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                          title="Excluir Cliente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum cliente encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Client Overlay Drawer */}
      {showAddClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">{editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}</h3>
              <button
                onClick={handleCloseClientDrawer}
                className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-4">
              {/* Brand Logo Upload */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">
                  Foto / Logotipo da Marca
                </label>
                
                <div className="flex items-center gap-4">
                  {/* Preview avatar */}
                  <div className="relative w-14 h-14 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 group">
                    {newClient.logoUrl ? (
                      <>
                        <img 
                          src={newClient.logoUrl} 
                          alt="Logo Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewClient((prev) => ({ ...prev, logoUrl: "" }))}
                          className="absolute inset-0 bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-xs"
                          title="Remover foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <Upload className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-200 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {uploadingLogo ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-primary" />
                            <span>{newClient.logoUrl ? "Alterar Foto" : "Carregar Foto"}</span>
                          </>
                        )}
                      </button>

                      {newClient.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setNewClient((prev) => ({ ...prev, logoUrl: "" }))}
                          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-sans">
                      PNG, JPG ou WEBP (Salvo na nuvem R2).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Empresa / Marca</label>
                <input
                  type="text"
                  required
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  placeholder="Ex: Innova Corp"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome do Contato</label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Ex: Clara Guedes"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">CNPJ</label>
                  <input
                    type="text"
                    value={newClient.cnpj}
                    onChange={(e) => setNewClient({ ...newClient, cnpj: e.target.value })}
                    placeholder="Ex: 12.345.678/0001-99"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">WhatsApp / Celular</label>
                  <input
                    type="text"
                    required
                    value={newClient.whatsapp}
                    onChange={(e) => setNewClient({ ...newClient, whatsapp: e.target.value })}
                    placeholder="Ex: (11) 99999-8888"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">E-mail Comercial</label>
                <input
                  type="email"
                  required
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="Ex: contato@empresa.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Endereço</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="Ex: Rua Sapoti, 11 - Manaus, AM"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Responsável Atendimento</label>
                <select
                  value={newClient.responsible}
                  onChange={(e) => setNewClient({ ...newClient, responsible: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Mikelly Maduro">Mikelly Maduro</option>
                  <option value="Natália Camurça">Natália Camurça</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Inline Icon Components
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
