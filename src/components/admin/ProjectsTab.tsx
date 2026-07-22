"use client";

import { useState } from "react";
import { useAdmin, Project } from "@/context/AdminContext";
import { Film, Calendar, MapPin, AlignLeft, CheckSquare, Users, Edit3, X, Play, Sliders, ChevronRight } from "lucide-react";

export default function ProjectsTab() {
  const { projects, updateProjectStatus, updateProjectShotList, updateProjectChecklist } = useAdmin();
  const [viewMode, setViewMode] = useState<"lista" | "kanban" | "calendario" | "timeline">("lista");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Drawer Editing states
  const [newShotItem, setNewShotItem] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");

  const handleStatusTransition = (projId: number, status: Project["status"]) => {
    updateProjectStatus(projId, status);
    if (selectedProject?.id === projId) {
      setSelectedProject((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleAddShotItem = (e: React.FormEvent, projId: number) => {
    e.preventDefault();
    if (!newShotItem.trim()) return;
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      const updatedList = [...proj.shotList, newShotItem];
      updateProjectShotList(projId, updatedList);
      if (selectedProject?.id === projId) {
        setSelectedProject((prev) => (prev ? { ...prev, shotList: updatedList } : null));
      }
    }
    setNewShotItem("");
  };

  const handleAddCheckItem = (e: React.FormEvent, projId: number) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      const updatedList = [...proj.checklist, newCheckItem];
      updateProjectChecklist(projId, updatedList);
      if (selectedProject?.id === projId) {
        setSelectedProject((prev) => (prev ? { ...prev, checklist: updatedList } : null));
      }
    }
    setNewCheckItem("");
  };

  const toggleChecklistItem = (projId: number, checkIndex: number) => {
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      const updatedList = [...proj.checklist];
      // Toggle string text indicator or delete/modify. Since we store string checklist items, let's toggle with an indicator or just allow removing/editing.
      // Let's make checklist item toggleable by prefixing "[COMPLETADO] " or just mapping it.
      // Better yet, we can support removing the checklist item or editing. Let's make click delete/complete or simply list them.
      // Let's make it a deletion trigger:
      const filteredList = updatedList.filter((_, idx) => idx !== checkIndex);
      updateProjectChecklist(projId, filteredList);
      if (selectedProject?.id === projId) {
        setSelectedProject((prev) => (prev ? { ...prev, checklist: filteredList } : null));
      }
    }
  };

  const projectStatuses: Project["status"][] = ["Briefing", "Planejamento", "Em Produção", "Aprovação", "Concluído"];

  return (
    <div className="p-8 space-y-8 relative">
      {/* Header View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">Cronograma & Projetos</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">Gerencie diárias de gravações, pautas, shotlists e o andamento das produções.</p>
        </div>

        {/* View Switchers */}
        <div className="flex bg-dark-card border border-white/5 p-1 rounded-xl">
          {([
            { id: "lista", label: "Lista" },
            { id: "kanban", label: "Kanban" },
            { id: "calendario", label: "Calendário" },
            { id: "timeline", label: "Timeline" },
          ] as const).map((view) => (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id)}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                viewMode === view.id
                  ? "bg-primary text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === "lista" && (
        <div className="rounded-2xl bg-dark-card border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-gray-400 font-semibold tracking-wider uppercase text-[10px]">
                  <th className="p-4">Projeto</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Serviço</th>
                  <th className="p-4">Diária Gravação</th>
                  <th className="p-4">Data Entrega</th>
                  <th className="p-4">Orçamento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 font-bold text-white font-display">{proj.name}</td>
                    <td className="p-4 text-gray-300 font-sans">{proj.clientName}</td>
                    <td className="p-4 text-gray-400">{proj.serviceType}</td>
                    <td className="p-4 font-mono text-gray-300">{proj.dateShoot}</td>
                    <td className="p-4 font-mono text-gray-300">{proj.dateDelivery}</td>
                    <td className="p-4 font-bold text-primary">R$ {proj.budget.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300 uppercase">
                        {proj.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-[10px] uppercase font-semibold transition-colors cursor-pointer border border-white/5"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {projectStatuses.map((status) => {
            const statusProjects = projects.filter((p) => p.status === status);
            return (
              <div key={status} className="flex flex-col rounded-2xl bg-dark-card border border-white/5 min-h-[400px]">
                <div className="px-4 py-3 border-b border-white/5 bg-black/20 text-gray-300 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{status}</span>
                  <span className="text-xs font-bold font-display px-2 py-0.5 rounded-full bg-white/5">{statusProjects.length}</span>
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {statusProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 hover:translate-y-[-2px] transition-all cursor-pointer space-y-3"
                    >
                      <div>
                        <span className="text-[9px] uppercase font-semibold tracking-wider text-primary">{proj.serviceType}</span>
                        <h4 className="text-xs font-bold text-white font-display mt-0.5 leading-tight">{proj.name}</h4>
                        <span className="text-[9px] text-gray-500 font-sans block mt-1">{proj.clientName}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="font-mono">{proj.dateShoot}</span>
                        <span className="font-bold text-white">R$ {proj.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "calendario" && (
        <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Julho & Agosto 2026</h3>
            <span className="text-[11px] text-gray-500 font-sans">Dias com gravações marcadas</span>
          </div>

          <div className="grid grid-cols-7 gap-3 text-center text-xs">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <span key={d} className="text-[10px] uppercase font-bold text-gray-500">{d}</span>
            ))}
            {[...Array(26)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-gray-600 font-light select-none">
                {i + 1}
              </div>
            ))}
            {/* Days with shoots */}
            {[27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((d) => {
              const matches = projects.filter((p) => p.dateShoot.endsWith("-" + (d < 10 ? "0" + d : d)));
              const hasShoot = matches.length > 0;
              return (
                <div
                  key={d}
                  className={`aspect-square border rounded-xl flex flex-col items-center justify-between p-1.5 cursor-pointer relative ${
                    hasShoot
                      ? "bg-primary/10 border-primary text-primary font-bold shadow-md shadow-primary/5"
                      : "bg-black/25 border-white/5 text-gray-400 hover:border-white/10"
                  }`}
                  onClick={() => hasShoot && setSelectedProject(matches[0])}
                >
                  <span className="text-[10px] self-start">{d}</span>
                  {hasShoot && (
                    <span className="text-[8px] uppercase tracking-tighter text-white font-semibold truncate w-full">
                      {matches[0].name.split(" ")[0]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "timeline" && (
        <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Cronograma Linear (Gantt)</h3>
          </div>
          
          <div className="space-y-6">
            {projects.map((proj) => (
              <div key={proj.id} className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-3">
                  <span className="text-xs font-bold text-white font-display block">{proj.name}</span>
                  <span className="text-[10px] text-gray-500 font-sans block mt-0.5">{proj.clientName}</span>
                </div>
                <div className="col-span-9 bg-white/5 border border-white/5 h-10 rounded-xl relative overflow-hidden flex items-center px-4">
                  {/* Position bar dynamically */}
                  <div
                    className="absolute h-6 bg-gradient-to-r from-primary to-[#E5C180] rounded-lg shadow-md flex items-center px-3 text-[9px] font-bold text-black uppercase"
                    style={{
                      left: proj.id === 1 ? "30%" : "10%",
                      width: proj.id === 1 ? "45%" : "35%",
                    }}
                  >
                    {proj.status}
                  </div>
                  <span className="ml-auto text-[9px] font-mono text-gray-500 font-light">Shoot: {proj.dateShoot}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side Management Drawer */}
      {selectedProject && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs cursor-default"
            onClick={() => setSelectedProject(null)}
          />

          {/* Drawer container */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-dark-card border-l border-white/5 z-50 flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest">{selectedProject.serviceType}</span>
                <h3 className="text-lg font-bold font-display text-white mt-1 leading-tight">{selectedProject.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Drawer Tabs/Forms */}
            <div className="flex-1 space-y-8">
              {/* Status Manager */}
              <div className="space-y-3">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Progresso do Projeto</label>
                <div className="flex flex-wrap gap-2">
                  {projectStatuses.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusTransition(selectedProject.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                        selectedProject.status === st
                          ? "bg-primary text-black border-primary"
                          : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shot List manager */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <Film className="w-4 h-4 text-primary" />
                  <label className="text-[10px] uppercase font-bold text-gray-400">Direção & Roteiro (Shot List)</label>
                </div>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedProject.shotList.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-gray-300 font-sans font-light bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <span className="font-bold text-primary font-mono">{idx + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <form onSubmit={(e) => handleAddShotItem(e, selectedProject.id)} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Adicionar cena/direção..."
                    value={newShotItem}
                    onChange={(e) => setNewShotItem(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs uppercase font-bold transition-all border border-white/5 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </form>
              </div>

              {/* Checklist details */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <label className="text-[10px] uppercase font-bold text-gray-400">Checklist de Produção (Clique para concluir)</label>
                </div>
                <ul className="space-y-2">
                  {selectedProject.checklist.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => toggleChecklistItem(selectedProject.id, idx)}
                      className="text-xs text-gray-300 font-sans font-light bg-black/30 p-2.5 rounded-lg border border-white/5 flex justify-between items-center cursor-pointer hover:border-red-500/20 hover:text-red-400 group"
                    >
                      <span className="flex items-center gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-primary" />
                        {item}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Excluir</span>
                    </li>
                  ))}
                  {selectedProject.checklist.length === 0 && (
                    <div className="text-[10px] text-gray-500 font-sans">Sem itens de checklist</div>
                  )}
                </ul>
                <form onSubmit={(e) => handleAddCheckItem(e, selectedProject.id)} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Adicionar item de produção..."
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs uppercase font-bold transition-all border border-white/5 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </form>
              </div>

              {/* Crew Details & Location */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] uppercase font-bold text-gray-400">Equipe</span>
                  </div>
                  <ul className="text-xs text-gray-300 font-sans font-light space-y-1">
                    {selectedProject.crew.map((member, i) => (
                      <li key={i}>&bull; {member}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] uppercase font-bold text-gray-400">Locação</span>
                  </div>
                  <p className="text-xs text-gray-300 font-sans font-light">{selectedProject.location}</p>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-6 border-t border-white/5 flex gap-3 mt-8">
              <button
                onClick={() => setSelectedProject(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs uppercase font-bold text-white transition-colors cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
