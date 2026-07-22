"use client";

import { useState } from "react";
import { useAdmin, Lead } from "@/context/AdminContext";
import { Plus, ArrowRight, CheckCircle2, User, Search, MessageSquare, PhoneCall } from "lucide-react";

export default function CRMTab() {
  const { leads, clients, addLead, updateLeadStage, convertLeadToClient } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);

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

  const handleStageChange = (leadId: number, currentStage: Lead["stage"], direction: "next" | "prev") => {
    const stages: Lead["stage"][] = [
      "Novo Lead",
      "Primeiro Contato",
      "Reunião Agendada",
      "Proposta Enviada",
      "Negociação"
    ];
    const currentIndex = stages.indexOf(currentStage);
    if (direction === "next" && currentIndex < stages.length - 1) {
      updateLeadStage(leadId, stages[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      updateLeadStage(leadId, stages[currentIndex - 1]);
    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Criar Novo Lead</h3>
              <button onClick={() => setShowAddLead(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
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
                    <option value="Vídeo Institucional">Vídeo Institucional</option>
                    <option value="Campanha Comercial">Campanha Comercial</option>
                    <option value="Cobertura de Evento">Cobertura de Evento</option>
                    <option value="Redes Sociais">Redes Sociais</option>
                    <option value="Fotografia">Fotografia</option>
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
                Cadastrar Lead
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {pipelineStages.map((stageObj) => {
          const stageLeads = leads.filter((lead) => lead.stage === stageObj.stage);
          return (
            <div key={stageObj.stage} className="flex flex-col rounded-2xl bg-dark-card border border-white/5 min-h-[400px]">
              {/* Stage Header */}
              <div className={`px-4 py-3 rounded-t-2xl border-b border-white/5 flex items-center justify-between ${stageObj.color}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider">{stageObj.label}</span>
                <span className="text-xs font-bold font-display px-2 py-0.5 rounded-full bg-white/5">{stageLeads.length}</span>
              </div>

              {/* Stage Cards */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl bg-black/50 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <span className="text-[10px] text-primary uppercase font-bold tracking-widest">{lead.projectType}</span>
                      <h4 className="text-xs font-bold text-white mt-1 font-display leading-tight">{lead.company}</h4>
                      <p className="text-[10px] text-gray-500 font-sans mt-0.5">{lead.name}</p>
                      <p className="text-[10px] text-gray-400 font-sans mt-2 line-clamp-2 leading-relaxed font-light">{lead.details}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs font-bold text-white">R$ {lead.value.toLocaleString()}</span>
                      
                      {/* Interaction Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStageChange(lead.id, lead.stage, "prev")}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                        >
                          &larr;
                        </button>
                        <button
                          onClick={() => handleStageChange(lead.id, lead.stage, "next")}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                        >
                          &rarr;
                        </button>
                        
                        {/* Convert to Client Button (Shows up on last pipeline stage) */}
                        {lead.stage === "Negociação" && (
                          <button
                            onClick={() => convertLeadToClient(lead.id)}
                            className="p-1 bg-primary hover:bg-[#B39356] text-black rounded ml-1 cursor-pointer transition-colors"
                            title="Converter em Cliente"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-[10px] text-gray-600 font-sans">Sem leads</div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
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
