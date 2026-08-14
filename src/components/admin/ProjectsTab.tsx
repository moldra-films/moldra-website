"use client";

import { useState } from "react";
import { useAdmin, Project } from "@/context/AdminContext";
import { Film, Calendar, MapPin, AlignLeft, CheckSquare, Users, Edit3, X, Play, Sliders, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const getStatusColor = (status: Project["status"]) => {
  switch (status) {
    case "Briefing":
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        solid: "bg-blue-500",
        hoverBg: "hover:bg-blue-500/20",
        gradient: "from-blue-600 to-blue-400 text-white shadow-blue-500/15",
      };
    case "Planejamento":
      return {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-400",
        solid: "bg-purple-500",
        hoverBg: "hover:bg-purple-500/20",
        gradient: "from-purple-600 to-purple-400 text-white shadow-purple-500/15",
      };
    case "Em Produção":
      return {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-400",
        solid: "bg-yellow-500",
        hoverBg: "hover:bg-yellow-500/20",
        gradient: "from-yellow-600 to-yellow-400 text-black shadow-yellow-500/15",
      };
    case "Aprovação":
      return {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        text: "text-orange-400",
        solid: "bg-orange-500",
        hoverBg: "hover:bg-orange-500/20",
        gradient: "from-orange-600 to-orange-400 text-white shadow-orange-500/15",
      };
    case "Concluído":
      return {
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        text: "text-green-400",
        solid: "bg-green-500",
        hoverBg: "hover:bg-green-500/20",
        gradient: "from-green-600 to-green-400 text-black shadow-green-500/15",
      };
    default:
      return {
        bg: "bg-white/5",
        border: "border-white/10",
        text: "text-gray-300",
        solid: "bg-white",
        hoverBg: "hover:bg-white/10",
        gradient: "from-white/20 to-white/10 text-white shadow-white/5",
      };
  }
};

export default function ProjectsTab() {
  const { projects, clients, serviceTypes, addProject, updateProject, deleteProject, updateProjectStatus, updateProjectShotList, updateProjectChecklist } = useAdmin();
  const [viewMode, setViewMode] = useState<"lista" | "kanban" | "calendario" | "timeline">("lista");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Drawer Editing states
  const [newShotItem, setNewShotItem] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");

  const [showAddProject, setShowAddProject] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [selectedProjectVideoUploading, setSelectedProjectVideoUploading] = useState(false);
  const [selectedProjectVideoProgress, setSelectedProjectVideoProgress] = useState(0);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setVideoUploading(true);
    setVideoProgress(10);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, fileUrl } = await res.json();
      setVideoProgress(50);

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed direct upload");
      setVideoProgress(100);

      setNewProj((prev) => ({ ...prev, videoUrl: fileUrl }));
      alert("Vídeo enviado com sucesso para a avaliação!");
    } catch (err) {
      console.error("Video upload error:", err);
      alert("Erro ao realizar upload do vídeo.");
    } finally {
      setVideoUploading(false);
      setVideoProgress(0);
    }
  };

  const handleDetailsVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, projId: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setSelectedProjectVideoUploading(true);
    setSelectedProjectVideoProgress(10);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, fileUrl } = await res.json();
      setSelectedProjectVideoProgress(50);

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed direct upload");
      setSelectedProjectVideoProgress(100);

      updateProject(projId, { videoUrl: fileUrl });
      setSelectedProject((prev) => prev ? { ...prev, videoUrl: fileUrl } : null);
      alert("Vídeo enviado com sucesso para a avaliação!");
    } catch (err) {
      console.error("Details Video upload error:", err);
      alert("Erro ao realizar upload do vídeo.");
    } finally {
      setSelectedProjectVideoUploading(false);
      setSelectedProjectVideoProgress(0);
    }
  };

  const handleDeleteProject = (id: number) => {
    if (confirm("Tem certeza que deseja excluir permanentemente este projeto?")) {
      deleteProject(id);
      setSelectedProject(null);
    }
  };
  const [newProj, setNewProj] = useState({
    name: "",
    clientName: "",
    serviceType: "Vídeo Institucional",
    dateShoot: "",
    dateDelivery: "",
    budget: 0,
    location: "",
    references: "",
    videoUrl: "",
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      name: newProj.name,
      clientName: newProj.clientName || (clients[0]?.company || "Geral"),
      serviceType: newProj.serviceType,
      dateShoot: newProj.dateShoot || new Date().toISOString().split("T")[0],
      dateDelivery: newProj.dateDelivery || new Date().toISOString().split("T")[0],
      budget: Number(newProj.budget),
      status: "Briefing",
      shotList: [],
      checklist: [],
      crew: ["Natália Camurça (Diretora Criativa)"],
      location: newProj.location || "Locação pendente",
      references: newProj.references,
      videoUrl: newProj.videoUrl || "https://player.vimeo.com/external/340322137.sd.mp4?s=d0cc8a79b19e917d21ca520f9119420077c98889&profile_id=139&oauth2_token_id=57447761",
    });
    setNewProj({
      name: "",
      clientName: "",
      serviceType: "Vídeo Institucional",
      dateShoot: "",
      dateDelivery: "",
      budget: 0,
      location: "",
      references: "",
      videoUrl: "",
    });
    setShowAddProject(false);
  };

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddProject(true)}
            className="px-4 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            Novo Projeto
          </button>

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
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(proj.status).bg} ${getStatusColor(proj.status).border} ${getStatusColor(proj.status).text}`}>
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
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(status).solid}`} />
                    {status}
                  </span>
                  <span className={`text-xs font-bold font-display px-2 py-0.5 rounded-full bg-white/5 ${getStatusColor(status).text}`}>{statusProjects.length}</span>
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
                    className={`absolute h-6 bg-gradient-to-r rounded-lg shadow-md flex items-center px-3 text-[9px] font-bold uppercase ${getStatusColor(proj.status).gradient}`}
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
                  {projectStatuses.map((st) => {
                    const isSelected = selectedProject.status === st;
                    const colors = getStatusColor(st);
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusTransition(selectedProject.id, st)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                          isSelected
                            ? `${colors.bg} ${colors.text} ${colors.border} shadow-lg shadow-black/10`
                            : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
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

              {/* Client Review Video Section */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Vídeo de Avaliação do Cliente</label>
                
                {selectedProject.videoUrl ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-black">
                      <video 
                        src={selectedProject.videoUrl} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono truncate">{selectedProject.videoUrl}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-gray-500 font-light">
                    Nenhum vídeo enviado para avaliação ainda.
                  </div>
                )}

                {/* Upload Button */}
                <div className="space-y-2">
                  <label className="block p-3 rounded-xl border border-white/10 hover:border-primary/40 bg-white/5 text-xs text-center font-semibold text-gray-300 hover:text-white cursor-pointer transition-all">
                    {selectedProjectVideoUploading ? "Enviando..." : "Subir Novo Vídeo para Avaliação"}
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      disabled={selectedProjectVideoUploading}
                      onChange={(e) => handleDetailsVideoUpload(e, selectedProject.id)}
                    />
                  </label>
                  
                  {selectedProjectVideoUploading && (
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${selectedProjectVideoProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-6 border-t border-white/5 flex gap-3 mt-8">
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                className="py-3 px-5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/20 rounded-xl text-xs uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Projeto
              </button>
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
      {/* Add Project Overlay Drawer */}
      {showAddProject && (
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
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Cadastrar Novo Projeto</h3>
              <button
                onClick={() => setShowAddProject(false)}
                className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer font-bold"
              >
                X
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome do Projeto</label>
                <input
                  type="text"
                  required
                  value={newProj.name}
                  onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                  placeholder="Ex: Campanha de Outono 2026"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Cliente (Empresa)</label>
                <select
                  value={newProj.clientName}
                  onChange={(e) => setNewProj({ ...newProj, clientName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.company}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                  {clients.length === 0 && <option value="Geral">Sem Clientes Cadastrados (Usar Geral)</option>}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Tipo de Serviço</label>
                  <select
                    value={newProj.serviceType}
                    onChange={(e) => setNewProj({ ...newProj, serviceType: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    {serviceTypes.length === 0 && <option value="Vídeo Institucional">Vídeo Institucional</option>}
                  </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Data de Gravação</label>
                  <input
                    type="date"
                    required
                    value={newProj.dateShoot}
                    onChange={(e) => setNewProj({ ...newProj, dateShoot: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Data de Entrega</label>
                  <input
                    type="date"
                    required
                    value={newProj.dateDelivery}
                    onChange={(e) => setNewProj({ ...newProj, dateDelivery: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Orçamento (R$)</label>
                  <input
                    type="number"
                    required
                    value={newProj.budget}
                    onChange={(e) => setNewProj({ ...newProj, budget: Number(e.target.value) })}
                    placeholder="Ex: 15000"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Locação</label>
                  <input
                    type="text"
                    value={newProj.location}
                    onChange={(e) => setNewProj({ ...newProj, location: e.target.value })}
                    placeholder="Ex: Estúdio Retro, SP"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Vídeo de Avaliação (Cloudflare R2 / Vimeo)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase text-gray-500 mb-1 font-sans">Inserir Link Manual</label>
                    <input
                      type="text"
                      value={newProj.videoUrl}
                      onChange={(e) => setNewProj({ ...newProj, videoUrl: e.target.value })}
                      placeholder="Ex: https://vimeo.com/..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase text-gray-500 mb-1 font-sans font-bold text-gray-400">Ou Enviar Arquivo de Vídeo</label>
                    <label className="block w-full p-2 rounded-xl border border-white/10 hover:border-primary/40 bg-white/5 text-[10px] text-center font-bold text-gray-400 hover:text-white cursor-pointer transition-all">
                      {videoUploading ? "Enviando..." : "Subir Arquivo de Vídeo"}
                      <input 
                        type="file" 
                        accept="video/*" 
                        className="hidden" 
                        disabled={videoUploading}
                        onChange={handleVideoUpload}
                      />
                    </label>
                  </div>
                </div>

                {videoUploading && (
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                )}
                
                {newProj.videoUrl && (
                  <p className="text-[9px] text-primary font-mono truncate">Vídeo selecionado: {newProj.videoUrl}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Referências / Detalhes</label>
                <textarea
                  value={newProj.references}
                  onChange={(e) => setNewProj({ ...newProj, references: e.target.value })}
                  placeholder="Estilo comercial dinâmico, cortes rápidos..."
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Criar Projeto
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
