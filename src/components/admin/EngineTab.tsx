"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Cpu, 
  Layers, 
  Sliders, 
  Download, 
  FolderOpen, 
  Check, 
  X, 
  Loader2, 
  AlertTriangle, 
  Star, 
  Sparkles, 
  Eye, 
  Smile, 
  Copy, 
  Clipboard, 
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CullingResult {
  filename: string;
  sharpness: number;
  faces_count: number;
  eyes_open: boolean;
  smiling: boolean;
  group_id: number | null;
  is_hero: boolean;
  stars: number;
  color_label: string;
  time: string;
}

interface ProjectSettings {
  adjustments: Record<string, any>;
  culling_results: CullingResult[];
}

export default function EngineTab() {
  const [isOnline, setIsOnline] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [engineStats, setEngineStats] = useState<any>(null);
  
  // Projects state
  const [selectedProject, setSelectedProject] = useState("");
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({ adjustments: {}, culling_results: [] });
  const [loadingProject, setLoadingProject] = useState(false);
  
  // Forms & parameters
  const [ingestForm, setIngestForm] = useState({ projectName: "", sourceDir: "" });
  const [exportForm, setExportForm] = useState({ watermarkText: "Moldra Films", scaleMaxDim: 0 });
  
  // Selection / Editing states
  const [selectedPhoto, setSelectedPhoto] = useState<CullingResult | null>(null);
  const [adjustments, setAdjustments] = useState({
    exposure: 0.0,
    contrast: 0.0,
    temp: 0.0,
    saturation: 0.0,
    sharpness: 0.0,
    noiseReduction: 0.0
  });
  const [copiedAdjustments, setCopiedAdjustments] = useState<any>(null);

  // Background action states
  const [pollingActive, setPollingActive] = useState(false);

  // Ping FastAPI Server on mount & set up polling
  useEffect(() => {
    checkEngineStatus();
    const interval = setInterval(checkEngineStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Poll project details when selected project changes
  useEffect(() => {
    if (selectedProject) {
      loadProjectSettings(selectedProject);
    } else {
      setProjectSettings({ adjustments: {}, culling_results: [] });
      setSelectedPhoto(null);
    }
  }, [selectedProject]);

  const checkEngineStatus = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/status");
      if (res.ok) {
        const data = await res.json();
        setEngineStats(data);
        setIsOnline(true);
        
        // If there's an active processing job, keep polling status frequently
        const jobs = data.active_jobs;
        if (
          jobs.ingestion.status === "Processing" || 
          jobs.culling.status === "Processing" || 
          jobs.export.status === "Processing"
        ) {
          setPollingActive(true);
        } else {
          setPollingActive(false);
        }
      } else {
        setIsOnline(false);
      }
    } catch (e) {
      setIsOnline(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadProjectSettings = async (projectName: string) => {
    setLoadingProject(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/project/${projectName}/settings`);
      if (res.ok) {
        const data = await res.json();
        setProjectSettings(data);
        if (data.culling_results && data.culling_results.length > 0) {
          setSelectedPhoto(data.culling_results[0]);
          // Load adjustments for this photo if any
          const photoName = data.culling_results[0].filename;
          const photoAdj = data.adjustments?.[photoName] || {
            exposure: 0.0,
            contrast: 0.0,
            temp: 0.0,
            saturation: 0.0,
            sharpness: 0.0,
            noiseReduction: 0.0
          };
          setAdjustments(photoAdj);
        }
      }
    } catch (e) {
      console.error("Error loading project settings:", e);
    } finally {
      setLoadingProject(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestForm.projectName || !ingestForm.sourceDir) return;
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_dir: ingestForm.sourceDir,
          project_name: ingestForm.projectName
        })
      });
      if (res.ok) {
        alert("Ingestão iniciada no servidor local! Acompanhe o progresso na barra lateral de status.");
        setIngestForm({ projectName: "", sourceDir: "" });
        checkEngineStatus();
      } else {
        const err = await res.json();
        alert(`Erro na ingestão: ${err.detail || "Erro desconhecido"}`);
      }
    } catch (err) {
      alert("Erro ao conectar com o Moldra Engine local. Verifique se o servidor está ativo.");
    }
  };

  const handleRunCulling = async () => {
    if (!selectedProject) return;
    setLoadingProject(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/cull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_name: selectedProject })
      });
      if (res.ok) {
        alert("Culling inteligente IA finalizado com sucesso!");
        loadProjectSettings(selectedProject);
      } else {
        const err = await res.json();
        alert(`Erro no culling: ${err.detail}`);
      }
    } catch (err) {
      alert("Erro de conexão ao rodar o Culling.");
    } finally {
      setLoadingProject(false);
    }
  };

  const handleAdjustChange = (key: string, val: number) => {
    if (!selectedPhoto) return;
    const updated = { ...adjustments, [key]: val };
    setAdjustments(updated);
    
    // Save locally to projectSettings state immediately
    setProjectSettings((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [selectedPhoto.filename]: updated
      }
    }));

    // Send async save to FastAPI server
    fetch("http://127.0.0.1:8000/api/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: selectedProject,
        filename: selectedPhoto.filename,
        adjustments: updated
      })
    }).catch(e => console.error("Error saving adjustment:", e));
  };

  const handleCopyAdjustments = () => {
    setCopiedAdjustments(adjustments);
    alert("Ajustes copiados!");
  };

  const handlePasteAdjustments = () => {
    if (!copiedAdjustments || !selectedPhoto) return;
    setAdjustments(copiedAdjustments);
    handleAdjustChange("exposure", copiedAdjustments.exposure);
    // Trigger bulk saves for all parameters
    Object.keys(copiedAdjustments).forEach((key) => {
      handleAdjustChange(key, copiedAdjustments[key]);
    });
  };

  const handleApplyToAll = async () => {
    if (!selectedProject || projectSettings.culling_results.length === 0) return;
    if (!confirm("Tem certeza que deseja aplicar os ajustes da foto atual em TODAS as fotos deste projeto?")) return;
    
    setLoadingProject(true);
    try {
      // Loop photos and trigger save for each
      const promises = projectSettings.culling_results.map((photo) => {
        return fetch("http://127.0.0.1:8000/api/adjust", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_name: selectedProject,
            filename: photo.filename,
            adjustments: adjustments
          })
        });
      });
      await Promise.all(promises);
      alert("Ajustes aplicados em lote com sucesso!");
      loadProjectSettings(selectedProject);
    } catch (e) {
      alert("Erro ao aplicar ajustes em massa.");
    } finally {
      setLoadingProject(false);
    }
  };

  const handleUpdatePhotoMetadata = (photo: CullingResult, stars: number, colorLabel: string) => {
    // Local state update
    setProjectSettings((prev) => {
      const updatedResults = prev.culling_results.map((item) => {
        if (item.filename === photo.filename) {
          return { ...item, stars, color_label: colorLabel };
        }
        return item;
      });
      return { ...prev, culling_results: updatedResults };
    });

    if (selectedPhoto?.filename === photo.filename) {
      setSelectedPhoto((prev) => prev ? { ...prev, stars, color_label: colorLabel } : null);
    }

    // Save adjustment record to database containing stars/color
    const photoAdj = projectSettings.adjustments?.[photo.filename] || {};
    const updatedAdj = { ...photoAdj, stars, colorLabel };
    
    fetch("http://127.0.0.1:8000/api/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: selectedProject,
        filename: photo.filename,
        adjustments: updatedAdj
      })
    }).catch(e => console.error("Error saving metadata settings:", e));
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: selectedProject,
          watermark_text: exportForm.watermarkText,
          scale_max_dim: Number(exportForm.scaleMaxDim)
        })
      });
      if (res.ok) {
        alert("Fila de renderização paralela iniciada! Acompanhe o progresso na barra de status.");
        checkEngineStatus();
      } else {
        const err = await res.json();
        alert(`Erro na exportação: ${err.detail}`);
      }
    } catch (err) {
      alert("Erro de conexão ao disparar a exportação.");
    }
  };

  // Group culling results by duplicate group_id for visual grouping
  const groupPhotos = () => {
    const groups: Record<number, CullingResult[]> = {};
    const nonGrouped: CullingResult[] = [];
    
    projectSettings.culling_results.forEach((photo) => {
      if (photo.group_id !== null) {
        if (!groups[photo.group_id]) groups[photo.group_id] = [];
        groups[photo.group_id].push(photo);
      } else {
        nonGrouped.push(photo);
      }
    });

    return { groups, nonGrouped };
  };

  const { groups, nonGrouped } = groupPhotos();

  return (
    <div className="p-8 space-y-8">
      {/* Subtab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold uppercase tracking-wider text-white">Moldra Engine</h2>
          </div>
          <p className="text-xs text-gray-500 font-sans mt-1">Ingestão de RAWs, seleção inteligente por IA (culling), edição em lote e exportador de alta performance.</p>
        </div>

        {/* Local server online indicator */}
        <div className="flex items-center gap-2.5">
          {loadingStatus ? (
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando...
            </span>
          ) : isOnline ? (
            <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] uppercase font-extrabold tracking-wider rounded-xl flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Servidor Local Online (8000)
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase font-extrabold tracking-wider rounded-xl flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Servidor Local Offline
            </span>
          )}
        </div>
      </div>

      {/* OFFLINE VIEW INSTRUCTIONS */}
      {!isOnline && !loadingStatus && (
        <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-dark-card border border-white/5 space-y-6 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Moldra Engine não está ativo no seu computador</h3>
            <p className="text-xs text-gray-400 font-sans max-w-lg mx-auto leading-relaxed">
              O Moldra Engine é uma suíte local pesada desenvolvida em Python para acessar o hardware da sua máquina, decodificar arquivos RAW e rodar o MediaPipe.
            </p>
          </div>

          <div className="p-5 bg-black/40 border border-white/5 rounded-xl text-left font-mono text-[11px] max-w-md mx-auto space-y-3">
            <p className="text-primary font-bold">👉 Como inicializar o serviço local (1-Clique):</p>
            <div className="bg-black/80 p-3 rounded-lg border border-white/10 select-all cursor-pointer">
              cd moldra-engine && ./setup.sh
            </div>
            <p className="text-gray-500">Isso irá criar o ambiente virtual, instalar os pacotes (rawpy, cv2, mediapipe, uvicorn) e iniciar o backend na porta 8000.</p>
          </div>
          
          <button 
            onClick={checkEngineStatus}
            className="px-5 py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Tentar Reconectar
          </button>
        </div>
      )}

      {/* ONLINE INTERFACE DASHBOARD */}
      {isOnline && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR: Status & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Server Resource Metrics */}
            {engineStats && (
              <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                  <Cpu className="w-4 h-4 text-primary" />
                  <h3 className="text-[10px] uppercase font-bold text-white tracking-wider">Recursos de Hardware</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="block text-gray-500 text-[9px] uppercase font-bold">Processador</span>
                    <span className="text-white font-semibold">{engineStats.cpu_usage}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[9px] uppercase font-bold">Memória RAM</span>
                    <span className="text-white font-semibold">{engineStats.ram_usage}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-500 text-[9px] uppercase font-bold">Núcleos de CPU Ativos</span>
                    <span className="text-white font-semibold">{engineStats.cores_available} Cores (Multiprocessamento)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ingestion Form Card */}
            <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <FolderOpen className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] uppercase font-bold text-white tracking-wider">Ingestão de Fotos (RAW)</h3>
              </div>

              <form onSubmit={handleIngest} className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Nome do Projeto</label>
                  <input
                    type="text"
                    required
                    value={ingestForm.projectName}
                    onChange={(e) => setIngestForm({ ...ingestForm, projectName: e.target.value })}
                    placeholder="Ex: Casamento_Ana_Luiz"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Diretório do Cartão (SD/HD)</label>
                  <input
                    type="text"
                    required
                    value={ingestForm.sourceDir}
                    onChange={(e) => setIngestForm({ ...ingestForm, sourceDir: e.target.value })}
                    placeholder="Ex: /Volumes/SD_CARD/DCIM/100CANON"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={engineStats?.active_jobs?.ingestion?.status === "Processing"}
                  className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Iniciar Importação
                </button>
              </form>

              {/* Ingestion Progress bar */}
              {engineStats?.active_jobs?.ingestion?.progress > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5 font-sans">
                  <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                    <span>Processando Importação</span>
                    <span>{engineStats.active_jobs.ingestion.progress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${engineStats.active_jobs.ingestion.progress}%` }}
                    />
                  </div>
                  <span className="block text-[9px] text-gray-500 font-mono">
                    Copias: {engineStats.active_jobs.ingestion.current} / {engineStats.active_jobs.ingestion.total}
                  </span>
                </div>
              )}
            </div>

            {/* Export Rendering Form Card */}
            <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <Download className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] uppercase font-bold text-white tracking-wider">Fila de Exportação</h3>
              </div>

              <form onSubmit={handleExport} className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Marca d'água</label>
                  <input
                    type="text"
                    value={exportForm.watermarkText}
                    onChange={(e) => setExportForm({ ...exportForm, watermarkText: e.target.value })}
                    placeholder="Ex: Moldra Films"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Redimensionamento (Max Dimen.)</label>
                  <select
                    value={exportForm.scaleMaxDim}
                    onChange={(e) => setExportForm({ ...exportForm, scaleMaxDim: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary text-xs cursor-pointer"
                  >
                    <option value={0}>Resolução Original (Máxima)</option>
                    <option value={2048}>Entrega Web (2048px)</option>
                    <option value={1080}>Light Preview (1080px)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!selectedProject || engineStats?.active_jobs?.export?.status === "Processing"}
                  className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Iniciar Exportação Lote
                </button>
              </form>

              {/* Export Progress bar */}
              {engineStats?.active_jobs?.export?.progress > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5 font-sans">
                  <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                    <span>Exportando Arquivos</span>
                    <span>{engineStats.active_jobs.export.progress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${engineStats.active_jobs.export.progress}%` }}
                    />
                  </div>
                  <span className="block text-[9px] text-gray-500 font-mono">
                    Renders: {engineStats.active_jobs.export.current} / {engineStats.active_jobs.export.total}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* MAIN GRID WORKSPACE: Culling Catalog and Edit Panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar: Active Project selector & IA Culling trigger */}
            <div className="p-4 rounded-xl bg-dark-card border border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Projeto Ativo:</span>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer min-w-[200px]"
                >
                  <option value="">Selecione um projeto...</option>
                  {engineStats?.projects_list?.map((p: string) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <button
                  onClick={handleRunCulling}
                  disabled={loadingProject}
                  className="px-4 py-2 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  {loadingProject ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Executar Culling por IA
                </button>
              )}
            </div>

            {/* If loading project settings */}
            {loadingProject && (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs text-gray-500 font-mono">Processando metadados e renderizando miniaturas...</p>
              </div>
            )}

            {/* Catalog Grid Area */}
            {!loadingProject && selectedProject && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* PHOTO GRID CATALOG */}
                <div className="xl:col-span-2 space-y-6 max-h-[80vh] overflow-y-auto pr-2 scrollbar-hide">
                  
                  {/* duplicate burst groups */}
                  {Object.keys(groups).map((gIdStr) => {
                    const gId = Number(gIdStr);
                    const members = groups[gId];
                    const hero = members.find(m => m.is_hero) || members[0];
                    return (
                      <div key={gId} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" /> Grupo de Rajada #{gId} ({members.length} fotos)
                          </span>
                          <span className="text-[9px] text-gray-600 font-mono">{members[0].time}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {members.map((photo) => {
                            const isCurrentlySelected = selectedPhoto?.filename === photo.filename;
                            return (
                              <div
                                key={photo.filename}
                                onClick={() => {
                                  setSelectedPhoto(photo);
                                  const photoAdj = projectSettings.adjustments?.[photo.filename] || {
                                    exposure: 0.0,
                                    contrast: 0.0,
                                    temp: 0.0,
                                    saturation: 0.0,
                                    sharpness: 0.0,
                                    noiseReduction: 0.0
                                  };
                                  setAdjustments(photoAdj);
                                }}
                                className={`rounded-xl overflow-hidden border bg-black/80 relative cursor-pointer aspect-video flex flex-col justify-between transition-all ${
                                  isCurrentlySelected 
                                    ? "border-primary ring-2 ring-primary/20 scale-[0.98]" 
                                    : "border-white/5 hover:border-white/15"
                                }`}
                              >
                                {/* Proxy image background */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={`http://127.0.0.1:8000/api/proxy/${selectedProject}/${photo.filename}`}
                                  alt={photo.filename}
                                  className="absolute inset-0 w-full h-full object-cover z-0"
                                />

                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-black/20 z-10" />

                                {/* Image metadata status indicators */}
                                <div className="p-2 z-20 flex justify-between items-start">
                                  {/* Hero badge indicator */}
                                  {photo.is_hero ? (
                                    <span className="px-1.5 py-0.5 bg-primary text-black text-[7px] uppercase font-black rounded tracking-wide shadow flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" /> HERO
                                    </span>
                                  ) : (
                                    <div />
                                  )}

                                  {/* Color rating label */}
                                  <span className={`w-2.5 h-2.5 rounded-full ${
                                    photo.color_label === "Green" ? "bg-green-500" :
                                    photo.color_label === "Red" ? "bg-red-500" :
                                    photo.color_label === "Blue" ? "bg-blue-500" : "bg-transparent"
                                  }`} />
                                </div>

                                {/* Bottom Info panel overlay */}
                                <div className="p-2 bg-gradient-to-t from-black/80 to-transparent z-20 text-[9px] font-sans flex justify-between items-end">
                                  <span className="text-gray-400 truncate max-w-[80px] font-mono">{photo.filename}</span>
                                  <div className="flex items-center gap-1.5">
                                    {/* Focus warning */}
                                    {photo.color_label === "Red" && (
                                      <span title={`Fora de foco (Score: ${photo.sharpness})`}>
                                        <AlertTriangle className="w-3 h-3 text-red-400" />
                                      </span>
                                    )}
                                    <span className="text-white font-mono">{photo.sharpness}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Non-grouped individual photos */}
                  {nonGrouped.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-500 pb-1 border-b border-white/5">
                        Fotos Individuais / Avulsas ({nonGrouped.length} fotos)
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {nonGrouped.map((photo) => {
                          const isCurrentlySelected = selectedPhoto?.filename === photo.filename;
                          return (
                            <div
                              key={photo.filename}
                              onClick={() => {
                                setSelectedPhoto(photo);
                                const photoAdj = projectSettings.adjustments?.[photo.filename] || {
                                  exposure: 0.0,
                                  contrast: 0.0,
                                  temp: 0.0,
                                  saturation: 0.0,
                                  sharpness: 0.0,
                                  noiseReduction: 0.0
                                };
                                setAdjustments(photoAdj);
                              }}
                              className={`rounded-xl overflow-hidden border bg-black/80 relative cursor-pointer aspect-video flex flex-col justify-between transition-all ${
                                isCurrentlySelected 
                                  ? "border-primary ring-2 ring-primary/20 scale-[0.98]" 
                                  : "border-white/5 hover:border-white/15"
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`http://127.0.0.1:8000/api/proxy/${selectedProject}/${photo.filename}`}
                                alt={photo.filename}
                                className="absolute inset-0 w-full h-full object-cover z-0"
                              />

                              <div className="absolute inset-0 bg-black/20 z-10" />

                              <div className="p-2 z-20 flex justify-between items-start">
                                <div />
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  photo.color_label === "Green" ? "bg-green-500" :
                                  photo.color_label === "Red" ? "bg-red-500" :
                                  photo.color_label === "Blue" ? "bg-blue-500" : "bg-transparent"
                                }`} />
                              </div>

                              <div className="p-2 bg-gradient-to-t from-black/80 to-transparent z-20 text-[9px] font-sans flex justify-between items-end">
                                <span className="text-gray-400 truncate max-w-[80px] font-mono">{photo.filename}</span>
                                <span className="text-white font-mono">{photo.sharpness}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                {/* AD-JUSTMENT & PRE-VIEW PANEL */}
                <div className="xl:col-span-1 space-y-6">
                  {selectedPhoto ? (
                    <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-5 flex flex-col sticky top-4">
                      
                      {/* Photo preview block */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`http://127.0.0.1:8000/api/proxy/${selectedProject}/${selectedPhoto.filename}`}
                          alt={selectedPhoto.filename}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Photo Metadata Info */}
                      <div className="space-y-3 font-sans text-xs">
                        <div className="flex justify-between items-start border-b border-white/5 pb-3">
                          <div>
                            <span className="font-bold text-white block text-sm truncate max-w-[150px] font-mono">{selectedPhoto.filename}</span>
                            <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">{selectedPhoto.time}</span>
                          </div>
                          
                          {/* Face mesh analytics badges */}
                          <div className="flex flex-col items-end gap-1.5">
                            {selectedPhoto.faces_count > 0 ? (
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                                  {selectedPhoto.faces_count} {selectedPhoto.faces_count === 1 ? "Rosto" : "Rostos"}
                                </span>
                                
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 ${
                                  selectedPhoto.eyes_open 
                                    ? "bg-green-500/10 border-green-500/20 text-green-400" 
                                    : "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                                }`}>
                                  <Eye className="w-3.5 h-3.5" />
                                  {selectedPhoto.eyes_open ? "Olhos Abert." : "Piscando"}
                                </span>
                              </div>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-gray-500/10 border border-gray-500/20 text-gray-400 rounded text-[9px] font-bold uppercase tracking-wider">
                                Sem Rostos
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Star Rating and Color Label selectors */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Classificar</span>
                          
                          {/* Stars */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = star <= selectedPhoto.stars;
                              return (
                                <button
                                  key={star}
                                  onClick={() => handleUpdatePhotoMetadata(selectedPhoto, star, selectedPhoto.color_label)}
                                  className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <Star className={`w-3.5 h-3.5 ${active ? "text-primary fill-primary" : "text-gray-600"}`} />
                                </button>
                              );
                            })}
                          </div>

                          {/* Color label indicator toggle button */}
                          <div className="flex items-center gap-1.5">
                            {["Red", "Yellow", "Green", "Blue", "None"].map((col) => {
                              const active = selectedPhoto.color_label === col;
                              return (
                                <button
                                  key={col}
                                  onClick={() => handleUpdatePhotoMetadata(selectedPhoto, selectedPhoto.stars, col)}
                                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                                    col === "Red" ? "bg-red-500" :
                                    col === "Yellow" ? "bg-yellow-500" :
                                    col === "Green" ? "bg-green-500" :
                                    col === "Blue" ? "bg-blue-500" : "border-gray-600 bg-transparent"
                                  } ${active ? "ring-2 ring-white scale-110" : "opacity-40 hover:opacity-100"}`}
                                  title={col}
                                />
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* ADJUSTMENT SLIDERS */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-primary" /> Ajustes de Imagem
                          </span>
                          
                          {/* Clipboard button controls */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handleCopyAdjustments}
                              className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
                              title="Copiar Ajustes"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handlePasteAdjustments}
                              disabled={!copiedAdjustments}
                              className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                              title="Colar Ajustes"
                            >
                              <Clipboard className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Exposure */}
                        <div className="space-y-1 font-sans text-xs">
                          <div className="flex justify-between font-mono text-[10px] text-gray-400">
                            <span>Exposição</span>
                            <span>{adjustments.exposure > 0 ? `+${adjustments.exposure.toFixed(2)}` : adjustments.exposure.toFixed(2)} EV</span>
                          </div>
                          <input
                            type="range"
                            min="-3.0"
                            max="3.0"
                            step="0.1"
                            value={adjustments.exposure}
                            onChange={(e) => handleAdjustChange("exposure", Number(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Contrast */}
                        <div className="space-y-1 font-sans text-xs">
                          <div className="flex justify-between font-mono text-[10px] text-gray-400">
                            <span>Contraste</span>
                            <span>{adjustments.contrast > 0 ? `+${Math.round(adjustments.contrast * 100)}` : Math.round(adjustments.contrast * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="-1.0"
                            max="1.0"
                            step="0.05"
                            value={adjustments.contrast}
                            onChange={(e) => handleAdjustChange("contrast", Number(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Temperature */}
                        <div className="space-y-1 font-sans text-xs">
                          <div className="flex justify-between font-mono text-[10px] text-gray-400">
                            <span>Balanço de Branco (Temp)</span>
                            <span>{adjustments.temp > 0 ? `+${Math.round(adjustments.temp * 100)}` : Math.round(adjustments.temp * 100)}</span>
                          </div>
                          <input
                            type="range"
                            min="-1.0"
                            max="1.0"
                            step="0.05"
                            value={adjustments.temp}
                            onChange={(e) => handleAdjustChange("temp", Number(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-1 font-sans text-xs">
                          <div className="flex justify-between font-mono text-[10px] text-gray-400">
                            <span>Saturação</span>
                            <span>{adjustments.saturation > 0 ? `+${Math.round(adjustments.saturation * 100)}` : Math.round(adjustments.saturation * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="-1.0"
                            max="1.0"
                            step="0.05"
                            value={adjustments.saturation}
                            onChange={(e) => handleAdjustChange("saturation", Number(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Sharpness */}
                        <div className="space-y-1 font-sans text-xs">
                          <div className="flex justify-between font-mono text-[10px] text-gray-400">
                            <span>Nitidez</span>
                            <span>{Math.round(adjustments.sharpness * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.05"
                            value={adjustments.sharpness}
                            onChange={(e) => handleAdjustChange("sharpness", Number(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Noise Reduction */}
                        <div className="space-y-1 font-sans text-xs">
                          <div className="flex justify-between font-mono text-[10px] text-gray-400">
                            <span>Redução de Ruído</span>
                            <span>{Math.round(adjustments.noiseReduction * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.05"
                            value={adjustments.noiseReduction}
                            onChange={(e) => handleAdjustChange("noiseReduction", Number(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Apply Preset buttons */}
                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={handleApplyToAll}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl text-[9px] uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Aplicar a Todas
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-dark-card border border-white/5 text-center text-xs text-gray-500 font-sans">
                      Selecione uma foto do catálogo para ajustar.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* If no project selected yet */}
            {!selectedProject && (
              <div className="p-12 text-center bg-dark-card border border-white/5 rounded-2xl space-y-4">
                <Layers className="w-8 h-8 text-gray-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">Nenhum Projeto Ativo</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
                    Selecione um projeto existente na barra superior ou inicie uma nova importação no painel lateral esquerdo para começar o trabalho.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
