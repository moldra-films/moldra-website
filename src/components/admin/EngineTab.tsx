"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Cpu, 
  Layers, 
  Sliders, 
  Download, 
  UploadCloud, 
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
  CheckSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CullingResult {
  filename: string;
  url: string;
  proxyUrl: string;
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

interface UploadingFile {
  name: string;
  progress: number;
  status: "Pendente" | "Carregando" | "Concluído" | "Falhou";
  url?: string;
}

const ENGINE_URL = process.env.NEXT_PUBLIC_MOLDRA_ENGINE_URL || "http://127.0.0.1:8000";

const PRESETS = [
  {
    name: "Original",
    values: { exposure: 0.0, contrast: 0.0, temp: 0.0, saturation: 0.0, sharpness: 0.0, noiseReduction: 0.0 }
  },
  {
    name: "Cinemático",
    values: { exposure: -0.15, contrast: 0.25, temp: 0.15, saturation: -0.15, sharpness: 0.25, noiseReduction: 0.1 }
  },
  {
    name: "P&B Clássico",
    values: { exposure: 0.1, contrast: 0.35, temp: 0.0, saturation: -1.0, sharpness: 0.2, noiseReduction: 0.05 }
  },
  {
    name: "Vintage Faded",
    values: { exposure: 0.2, contrast: -0.25, temp: 0.25, saturation: -0.2, sharpness: 0.1, noiseReduction: 0.2 }
  },
  {
    name: "Vibrante Pop",
    values: { exposure: 0.1, contrast: 0.2, temp: 0.05, saturation: 0.4, sharpness: 0.3, noiseReduction: 0.1 }
  },
  {
    name: "Golden Hour",
    values: { exposure: 0.15, contrast: 0.1, temp: 0.5, saturation: 0.1, sharpness: 0.2, noiseReduction: 0.0 }
  },
  {
    name: "Muted Matte",
    values: { exposure: 0.2, contrast: -0.15, temp: 0.1, saturation: -0.3, sharpness: 0.15, noiseReduction: 0.15 }
  },
  {
    name: "Frio Cyber",
    values: { exposure: -0.1, contrast: 0.2, temp: -0.4, saturation: 0.25, sharpness: 0.25, noiseReduction: 0.1 }
  },
  {
    name: "Contraste Drama",
    values: { exposure: -0.25, contrast: 0.4, temp: -0.05, saturation: -0.25, sharpness: 0.4, noiseReduction: 0.05 }
  },
  {
    name: "Sunset Gold",
    values: { exposure: 0.1, contrast: 0.15, temp: 0.6, saturation: 0.2, sharpness: 0.2, noiseReduction: 0.1 }
  },
  {
    name: "Analog Film",
    values: { exposure: 0.05, contrast: -0.05, temp: -0.1, saturation: -0.1, sharpness: 0.1, noiseReduction: 0.15 }
  },
  {
    name: "Alto Contraste",
    values: { exposure: 0.0, contrast: 0.5, temp: 0.0, saturation: 0.1, sharpness: 0.35, noiseReduction: 0.05 }
  },
  {
    name: "Pastel Dream",
    values: { exposure: 0.3, contrast: -0.2, temp: 0.0, saturation: -0.4, sharpness: 0.0, noiseReduction: 0.2 }
  },
  {
    name: "Neon Night",
    values: { exposure: -0.2, contrast: 0.3, temp: -0.3, saturation: 0.3, sharpness: 0.2, noiseReduction: 0.1 }
  },
  {
    name: "Fine-Art Wedding",
    values: { exposure: 0.25, contrast: 0.1, temp: 0.2, saturation: -0.15, sharpness: 0.15, noiseReduction: 0.1 }
  }
];

export default function EngineTab() {
  const [isOnline, setIsOnline] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [engineStats, setEngineStats] = useState<any>(null);
  
  // Projects state
  const [selectedProject, setSelectedProject] = useState("");
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({ adjustments: {}, culling_results: [] });
  const [loadingProject, setLoadingProject] = useState(false);
  
  // Upload & Ingestion states
  const [projectNameInput, setProjectNameInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  
  // Export states
  const [useWatermark, setUseWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState("Moldra Films");
  const [scaleMaxDim, setScaleMaxDim] = useState(0);
  
  // Full screen editor mode state
  const [selectedPhoto, setSelectedPhoto] = useState<CullingResult | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [adjustments, setAdjustments] = useState({
    exposure: 0.0,
    contrast: 0.0,
    temp: 0.0,
    saturation: 0.0,
    sharpness: 0.0,
    noiseReduction: 0.0
  });
  const [copiedAdjustments, setCopiedAdjustments] = useState<any>(null);

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

  // Keyboard navigation for full-screen editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditorOpen || !selectedPhoto || projectSettings.culling_results.length === 0) return;
      
      const currentIndex = projectSettings.culling_results.findIndex(
        (p) => p.filename === selectedPhoto.filename
      );
      
      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigatePhoto("next", currentIndex);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigatePhoto("prev", currentIndex);
      } else if (e.key === "Escape") {
        setIsEditorOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditorOpen, selectedPhoto, projectSettings]);

  const navigatePhoto = (direction: "next" | "prev", currentIndex: number) => {
    const len = projectSettings.culling_results.length;
    if (len === 0) return;
    
    let nextIndex = currentIndex;
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % len;
    } else {
      nextIndex = (currentIndex - 1 + len) % len;
    }

    const nextPhoto = projectSettings.culling_results[nextIndex];
    setSelectedPhoto(nextPhoto);
    const photoAdj = projectSettings.adjustments?.[nextPhoto.filename] || {
      exposure: 0.0,
      contrast: 0.0,
      temp: 0.0,
      saturation: 0.0,
      sharpness: 0.0,
      noiseReduction: 0.0
    };
    setAdjustments(photoAdj);
  };

  const checkEngineStatus = async () => {
    try {
      const res = await fetch(`${ENGINE_URL}/api/status`);
      if (res.ok) {
        const data = await res.json();
        setEngineStats(data);
        setIsOnline(true);
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
      const res = await fetch(`${ENGINE_URL}/api/project/${projectName}/settings`);
      if (res.ok) {
        const data = await res.json();
        setProjectSettings(data);
        if (data.culling_results && data.culling_results.length > 0) {
          setSelectedPhoto(data.culling_results[0]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setUploadQueue(filesArray.map(f => ({ name: f.name, progress: 0, status: "Pendente" })));
    }
  };

  const handleUploadAndCull = async () => {
    if (!projectNameInput) {
      alert("Por favor, digite o nome do projeto.");
      return;
    }
    if (selectedFiles.length === 0) {
      alert("Por favor, selecione ao menos uma foto.");
      return;
    }

    setIsUploading(true);
    const urls: string[] = [];
    const queue = [...uploadQueue];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        queue[i].status = "Carregando";
        setUploadQueue([...queue]);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            folder: `projects/${projectNameInput}/Original`
          }),
        });

        if (!res.ok) {
          queue[i].status = "Falhou";
          setUploadQueue([...queue]);
          continue;
        }

        const { uploadUrl, fileUrl } = await res.json();
        queue[i].progress = 40;
        setUploadQueue([...queue]);

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) {
          queue[i].status = "Falhou";
          setUploadQueue([...queue]);
          continue;
        }

        queue[i].progress = 100;
        queue[i].status = "Concluído";
        queue[i].url = fileUrl;
        setUploadQueue([...queue]);
        urls.push(fileUrl);
      }

      setUploadedUrls(urls);
      setIsUploading(false);

      alert("Upload concluído! Iniciando processamento IA de nitidez e detecção facial...");
      
      const cullRes = await fetch(`${ENGINE_URL}/api/cull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectNameInput,
          file_urls: urls
        })
      });

      if (cullRes.ok) {
        alert("Culling Inteligente concluído com sucesso!");
        setSelectedProject(projectNameInput);
        setProjectNameInput("");
        setSelectedFiles([]);
        setUploadQueue([]);
      } else {
        const err = await cullRes.json();
        alert(`Erro ao executar culling: ${err.detail}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao realizar upload ou culling na nuvem.");
      setIsUploading(false);
    }
  };

  const handleAdjustChange = (key: string, val: number) => {
    if (!selectedPhoto) return;
    const updated = { ...adjustments, [key]: val };
    setAdjustments(updated);
    
    setProjectSettings((prev) => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [selectedPhoto.filename]: updated
      }
    }));

    fetch(`${ENGINE_URL}/api/adjust`, {
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
    Object.keys(copiedAdjustments).forEach((key) => {
      handleAdjustChange(key, copiedAdjustments[key]);
    });
  };

  const handleApplyPreset = (values: typeof adjustments) => {
    setAdjustments(values);
    if (selectedPhoto) {
      setProjectSettings((prev) => ({
        ...prev,
        adjustments: {
          ...prev.adjustments,
          [selectedPhoto.filename]: values
        }
      }));

      fetch(`${ENGINE_URL}/api/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: selectedProject,
          filename: selectedPhoto.filename,
          adjustments: values
        })
      }).catch(e => console.error("Error saving preset:", e));
    }
  };

  const handleApplyToAll = async () => {
    if (!selectedProject || projectSettings.culling_results.length === 0) return;
    if (!confirm("Deseja aplicar os ajustes da foto selecionada em TODAS as fotos deste projeto?")) return;
    
    setLoadingProject(true);
    try {
      const promises = projectSettings.culling_results.map((photo) => {
        return fetch(`${ENGINE_URL}/api/adjust`, {
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
      alert("Ajustes aplicados em massa!");
      loadProjectSettings(selectedProject);
    } catch (e) {
      alert("Erro ao aplicar ajustes em massa.");
    } finally {
      setLoadingProject(false);
    }
  };

  const handleUpdatePhotoMetadata = (photo: CullingResult, stars: number, colorLabel: string) => {
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

    const photoAdj = projectSettings.adjustments?.[photo.filename] || {};
    const updatedAdj = { ...photoAdj, stars, colorLabel };
    
    fetch(`${ENGINE_URL}/api/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: selectedProject,
        filename: photo.filename,
        adjustments: updatedAdj
      })
    }).catch(e => console.error("Error saving metadata:", e));
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    const confirmDelete = confirm(
      `ATENÇÃO: Tem certeza absoluta que deseja excluir o projeto "${selectedProject}"? \n\nIsso apagará permanentemente todos os arquivos originais, miniaturas e configurações salvas na nuvem R2. Esta ação NÃO pode ser desfeita!`
    );
    if (!confirmDelete) return;

    setLoadingProject(true);
    try {
      const res = await fetch(`${ENGINE_URL}/api/project/${selectedProject}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Projeto excluído com sucesso!");
        setSelectedProject("");
        checkEngineStatus();
      } else {
        const err = await res.json();
        alert(`Erro ao excluir projeto: ${err.detail || "Erro desconhecido"}`);
      }
    } catch (e) {
      alert("Erro de conexão ao tentar excluir o projeto.");
    } finally {
      setLoadingProject(false);
    }
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    try {
      const res = await fetch(`${ENGINE_URL}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: selectedProject,
          watermark_text: useWatermark ? watermarkText : "",
          scale_max_dim: Number(scaleMaxDim)
        })
      });
      if (res.ok) {
        alert("Renderização e Exportação paralelas iniciadas no servidor de nuvem!");
        checkEngineStatus();
      } else {
        const err = await res.json();
        alert(`Erro na exportação: ${err.detail}`);
      }
    } catch (err) {
      alert("Erro de conexão ao disparar a exportação.");
    }
  };

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

  // CSS Filter Generator based on input adjustments
  const getFilterStyle = () => {
    const brightness = 100 + (adjustments.exposure * 25);
    const contrast = 100 + (adjustments.contrast * 100);
    const saturate = 100 + (adjustments.saturation * 100);
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
    };
  };

  // Temperature Simulation overlay style
  const getTempOverlayStyle = () => {
    if (adjustments.temp === 0) return { display: "none" };
    const isWarm = adjustments.temp > 0;
    const color = isWarm ? "rgba(255, 140, 0, " : "rgba(0, 191, 255, ";
    const opacity = Math.abs(adjustments.temp) * 0.15;
    return {
      backgroundColor: `${color}${opacity})`,
      mixBlendMode: "multiply" as const,
    };
  };

  // Static Preset Filter style generator for thumbnails
  const getPresetFilterStyle = (vals: typeof adjustments) => {
    const brightness = 100 + (vals.exposure * 25);
    const contrast = 100 + (vals.contrast * 100);
    const saturate = 100 + (vals.saturation * 100);
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
    };
  };

  // Static Temperature Simulation overlay style for thumbnails
  const getPresetTempOverlayStyle = (temp: number) => {
    if (temp === 0) return { display: "none" };
    const isWarm = temp > 0;
    const color = isWarm ? "rgba(255, 140, 0, " : "rgba(0, 191, 255, ";
    const opacity = Math.abs(temp) * 0.15;
    return {
      backgroundColor: `${color}${opacity})`,
      mixBlendMode: "multiply" as const,
    };
  };

  return (
    <div className="p-8 space-y-8">
      {/* Subtab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold uppercase tracking-wider text-white">Moldra Engine (Cloud Flow)</h2>
          </div>
          <p className="text-xs text-gray-500 font-sans mt-1">Envie fotos RAW/JPEG, faça culling inteligente via IA e edite com visualização gigante em tempo real.</p>
        </div>

        {/* Server online/offline badge */}
        <div className="flex items-center gap-2.5">
          {loadingStatus ? (
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Conectando...
            </span>
          ) : isOnline ? (
            <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] uppercase font-extrabold tracking-wider rounded-xl flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Servidor Cloud Online
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase font-extrabold tracking-wider rounded-xl flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Servidor Cloud Offline
            </span>
          )}
        </div>
      </div>

      {/* OFFLINE WARNING AND SETUP DIRECTIONS */}
      {!isOnline && !loadingStatus && (
        <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-dark-card border border-white/5 space-y-6 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">O serviço de nuvem do Moldra Engine não está ativo</h3>
            <p className="text-xs text-gray-400 font-sans max-w-lg mx-auto leading-relaxed">
              O backend em nuvem do Moldra Engine processa as requisições utilizando os contêineres Docker. Caso ainda não tenha realizado a implantação, você pode implantar ou rodar localmente.
            </p>
          </div>

          <div className="p-5 bg-black/40 border border-white/5 rounded-xl text-left font-mono text-[11px] max-w-md mx-auto space-y-2">
            <p className="text-primary font-bold">☁️ Configurar URL do Servidor em Nuvem:</p>
            <p className="text-gray-400">Certifique-se de que a variável abaixo está configurada no seu `.env.local` de produção:</p>
            <div className="bg-black/80 p-2.5 rounded border border-white/10 select-all">
              NEXT_PUBLIC_MOLDRA_ENGINE_URL=https://sua-url-na-render.com
            </div>
          </div>
          
          <button 
            onClick={checkEngineStatus}
            className="px-5 py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Verificar Conexão
          </button>
        </div>
      )}

      {/* ACTIVE ONLINE WORKSPACE */}
      {isOnline && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR: Upload and Export */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Upload Area */}
            <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <UploadCloud className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] uppercase font-bold text-white tracking-wider">Carregar Lote de Fotos</h3>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Nome do Projeto</label>
                  <input
                    type="text"
                    required
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    placeholder="Ex: Casamento_Ana_Luiz"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                {/* Dropzone Selector */}
                <div className="flex flex-col items-center justify-center p-5 border border-dashed border-white/10 rounded-xl hover:border-primary/20 transition-all cursor-pointer relative bg-black/20 group">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.cr2,.cr3,.nef,.arw,.dng"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors mb-2" />
                  <span className="text-[10px] font-bold text-gray-300 font-sans block truncate max-w-[150px]">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} arquivos` : "Escolher fotos..."}
                  </span>
                  <span className="text-[8px] text-gray-500 mt-0.5">RAW (CR2/CR3/NEF) ou JPEGs</span>
                </div>

                {/* Upload Action Button */}
                {selectedFiles.length > 0 && !isUploading && (
                  <button
                    onClick={handleUploadAndCull}
                    className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Iniciar Upload & Processar IA
                  </button>
                )}

                {/* Upload Queue Progress */}
                {uploadQueue.length > 0 && (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-widest">Fila de Upload</span>
                    {uploadQueue.map((item, idx) => (
                      <div key={idx} className="p-2 rounded bg-black/40 border border-white/5 space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-gray-400 truncate max-w-[120px]">{item.name}</span>
                          <span className={`${
                            item.status === "Concluído" ? "text-green-400" :
                            item.status === "Falhou" ? "text-red-400" : "text-primary"
                          }`}>{item.status === "Carregando" ? `${item.progress}%` : item.status}</span>
                        </div>
                        {item.status === "Carregando" && (
                          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Export Parameters Card */}
            <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <Download className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] uppercase font-bold text-white tracking-wider">Exportação na Nuvem</h3>
              </div>

              <form onSubmit={handleExport} className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Usar Marca d'água</span>
                  <input
                    type="checkbox"
                    checked={useWatermark}
                    onChange={(e) => setUseWatermark(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 accent-primary cursor-pointer"
                  />
                </div>

                {useWatermark && (
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-bold text-gray-400">Texto da Marca d'água</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Ex: Moldra Films"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Redimensionamento</label>
                  <select
                    value={scaleMaxDim}
                    onChange={(e) => setScaleMaxDim(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary text-xs cursor-pointer"
                  >
                    <option value={0}>Resolução Máxima</option>
                    <option value={2048}>Para Redes Sociais (2048px)</option>
                    <option value={1080}>Light Preview (1080px)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!selectedProject || engineStats?.active_jobs?.export?.status === "Processing"}
                  className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Salvar Imagens no R2
                </button>
              </form>

              {/* Export Queue Progress */}
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
                    Salvas: {engineStats.active_jobs.export.current} / {engineStats.active_jobs.export.total}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* MAIN GRAPHICS AREA (Grid Browser) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Toolbar Area */}
            <div className="p-4 rounded-xl bg-dark-card border border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Projeto Selecionado:</span>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer min-w-[200px]"
                >
                  <option value="">Selecione...</option>
                  {engineStats?.projects_list?.map((p: string) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {selectedProject && (
                  <button
                    onClick={handleDeleteProject}
                    className="px-3 py-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all cursor-pointer text-[10px] uppercase font-bold tracking-wider"
                    title="Excluir este projeto permanentemente"
                  >
                    Excluir Projeto
                  </button>
                )}
              </div>

              {selectedProject && (
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-gray-500">Total: {projectSettings.culling_results.length} fotos</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-[9px] uppercase tracking-wider text-primary font-bold animate-pulse">💡 Dica: Clique em qualquer foto para abrir a edição em tela cheia!</span>
                </div>
              )}
            </div>

            {/* Load State Indicator */}
            {loadingProject && (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs text-gray-500 font-mono">Carregando dados das fotos do Cloudflare R2...</p>
              </div>
            )}

            {/* Workspace Grid */}
            {!loadingProject && selectedProject && (
              <div className="max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide space-y-6">
                
                {/* Bursts */}
                {Object.keys(groups).map((gIdStr) => {
                  const gId = Number(gIdStr);
                  const members = groups[gId];
                  return (
                    <div key={gId} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" /> Grupo de Burst #{gId} ({members.length} duplicadas)
                        </span>
                        <span className="text-[9px] text-gray-600 font-mono">{members[0].time}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {members.map((photo) => {
                          const isCurrentlySelected = selectedPhoto?.filename === photo.filename;
                          return (
                            <div
                              key={photo.filename}
                              onClick={() => {
                                setSelectedPhoto(photo);
                                setIsEditorOpen(true);
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
                              className={`rounded-xl overflow-hidden border bg-black/80 relative cursor-pointer aspect-video flex flex-col justify-between transition-all group ${
                                isCurrentlySelected 
                                  ? "border-primary ring-2 ring-primary/20 scale-[0.98]" 
                                  : "border-white/5 hover:border-primary/45 hover:scale-[1.01]"
                              }`}
                            >
                              {/* Direct CDN URL mapping */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.proxyUrl}
                                alt={photo.filename}
                                className="absolute inset-0 w-full h-full object-cover z-0"
                              />

                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all z-10" />

                              <div className="p-2.5 z-20 flex justify-between items-start">
                                {photo.is_hero ? (
                                  <span className="px-1.5 py-0.5 bg-primary text-black text-[7px] uppercase font-black rounded tracking-wide shadow flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" /> HERO
                                  </span>
                                ) : (
                                  <div />
                                )}

                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  photo.color_label === "Green" ? "bg-green-500" :
                                  photo.color_label === "Red" ? "bg-red-500" :
                                  photo.color_label === "Blue" ? "bg-blue-500" : "bg-transparent"
                                }`} />
                              </div>

                              <div className="p-2.5 bg-gradient-to-t from-black/85 to-transparent z-20 text-[9px] font-sans flex justify-between items-end">
                                <span className="text-gray-400 truncate max-w-[90px] font-mono">{photo.filename}</span>
                                <div className="flex items-center gap-1.5">
                                  {photo.color_label === "Red" && (
                                    <span title={`Fora de foco (Score: ${photo.sharpness})`}>
                                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                    </span>
                                  )}
                                  <span className="text-white font-mono">{photo.sharpness}</span>
                                </div>
                              </div>
                              
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center">
                                <Maximize2 className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Individual Photos */}
                {nonGrouped.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-500 pb-1 border-b border-white/5">
                      Fotos Individuais ({nonGrouped.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {nonGrouped.map((photo) => {
                        const isCurrentlySelected = selectedPhoto?.filename === photo.filename;
                        return (
                          <div
                            key={photo.filename}
                            onClick={() => {
                              setSelectedPhoto(photo);
                              setIsEditorOpen(true);
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
                            className={`rounded-xl overflow-hidden border bg-black/80 relative cursor-pointer aspect-video flex flex-col justify-between transition-all group ${
                              isCurrentlySelected 
                                ? "border-primary ring-2 ring-primary/20 scale-[0.98]" 
                                : "border-white/5 hover:border-primary/45 hover:scale-[1.01]"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.proxyUrl}
                              alt={photo.filename}
                              className="absolute inset-0 w-full h-full object-cover z-0"
                            />

                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all z-10" />

                            <div className="p-2.5 z-20 flex justify-between items-start">
                              <div />
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                photo.color_label === "Green" ? "bg-green-500" :
                                photo.color_label === "Red" ? "bg-red-500" :
                                photo.color_label === "Blue" ? "bg-blue-500" : "bg-transparent"
                              }`} />
                            </div>

                            <div className="p-2.5 bg-gradient-to-t from-black/85 to-transparent z-20 text-[9px] font-sans flex justify-between items-end">
                              <span className="text-gray-400 truncate max-w-[90px] font-mono">{photo.filename}</span>
                              <span className="text-white font-mono">{photo.sharpness}</span>
                            </div>
                            
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center">
                              <Maximize2 className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Empty State */}
            {!selectedProject && (
              <div className="p-12 text-center bg-dark-card border border-white/5 rounded-2xl space-y-4">
                <Layers className="w-8 h-8 text-gray-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">Nenhum Projeto Ativo Selecionado</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
                    Selecione um projeto em nuvem na barra superior para editar, ou digite o nome de um novo projeto e selecione arquivos para fazer o upload direto de fotos.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* FULL-SCREEN CINEMA MODE EDITING LIGHTBOX */}
      <AnimatePresence>
        {isEditorOpen && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col md:flex-row"
          >
            {/* LEFT AREA: Large Image Preview */}
            <div className="flex-1 flex flex-col justify-between p-6 relative h-full">
              
              {/* Top Toolbar */}
              <div className="flex justify-between items-center z-10 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-white">{selectedPhoto.filename}</span>
                  <a 
                    href={selectedPhoto.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    title="Ver original completo em alta resolução" 
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-primary transition-colors flex items-center gap-1 text-[10px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Original High-Res
                  </a>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Image Canvas */}
              <div className="flex-1 flex items-center justify-center p-6 relative">
                {/* Left Navigation Arrow */}
                <button 
                  onClick={() => navigatePhoto("prev", projectSettings.culling_results.findIndex(p => p.filename === selectedPhoto.filename))}
                  className="absolute left-4 p-3 bg-black/60 hover:bg-primary hover:text-black border border-white/10 rounded-full text-white cursor-pointer transition-all z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Main Large Image Wrapper with live CSS filter style */}
                <div className="relative max-w-full max-h-[75vh] rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                  <motion.img
                    key={selectedPhoto.filename}
                    initial={{ scale: 0.98, opacity: 0.9 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={selectedPhoto.proxyUrl}
                    alt={selectedPhoto.filename}
                    style={getFilterStyle()}
                    className="max-w-full max-h-[75vh] object-contain transition-all duration-75"
                  />
                  
                  {/* Color Temperature Simulation overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-200"
                    style={getTempOverlayStyle()}
                  />
                </div>

                {/* Right Navigation Arrow */}
                <button 
                  onClick={() => navigatePhoto("next", projectSettings.culling_results.findIndex(p => p.filename === selectedPhoto.filename))}
                  className="absolute right-4 p-3 bg-black/60 hover:bg-primary hover:text-black border border-white/10 rounded-full text-white cursor-pointer transition-all z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Keyboard helper at bottom */}
              <div className="flex justify-center items-center gap-5 text-[10px] text-gray-500 font-sans pt-4 border-t border-white/5 pb-2">
                <span className="flex items-center gap-1">Pressione <ChevronLeft className="w-3.5 h-3.5 inline" /> ou <ChevronRight className="w-3.5 h-3.5 inline" /> no teclado para navegar</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                <span>ESC para fechar</span>
              </div>
            </div>

            {/* RIGHT SIDEBAR: Sliders & Culling Tools */}
            <div className="w-full md:w-[380px] bg-dark-card border-l border-white/5 p-6 flex flex-col justify-between overflow-y-auto max-h-screen">
              <div className="space-y-6">
                
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Classificação & IA</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{selectedPhoto.time}</p>
                  </div>
                  {selectedPhoto.is_hero && (
                    <span className="px-2 py-1 bg-primary text-black text-[8px] uppercase font-black rounded tracking-wide shadow flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> HERO
                    </span>
                  )}
                </div>

                {/* Face mesh metrics badges */}
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3 font-sans text-xs">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Métricas de Rostos (IA)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                      <span className="block text-[8px] uppercase text-gray-500">Total Detectado</span>
                      <span className="text-white font-bold text-sm mt-0.5 block">{selectedPhoto.faces_count} {selectedPhoto.faces_count === 1 ? "Rosto" : "Rostos"}</span>
                    </div>

                    <div className={`p-2.5 rounded-lg border bg-black/30 ${
                      selectedPhoto.faces_count > 0 
                        ? selectedPhoto.eyes_open 
                          ? "border-green-500/10 text-green-400" 
                          : "border-red-500/10 text-red-400"
                        : "border-white/5 text-gray-500"
                    }`}>
                      <span className="block text-[8px] uppercase text-gray-500">Status dos Olhos</span>
                      <span className="font-bold text-xs mt-1 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {selectedPhoto.faces_count > 0 
                          ? selectedPhoto.eyes_open 
                            ? "Abertos" 
                            : "Fechados / Piscando"
                          : "Sem dados"
                        }
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-lg border bg-black/30 col-span-2 ${
                      selectedPhoto.smiling ? "border-yellow-500/10 text-yellow-400" : "border-white/5 text-gray-500"
                    }`}>
                      <span className="block text-[8px] uppercase text-gray-500">Expressão</span>
                      <span className="font-bold text-xs mt-1 flex items-center gap-1">
                        <Smile className="w-4 h-4" />
                        {selectedPhoto.smiling ? "Sorriso Detectado" : "Neutro / Sem Sorriso"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating selection panel */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Classificar Imagem</span>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-white/5">
                    {/* Stars */}
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= selectedPhoto.stars;
                        return (
                          <button
                            key={star}
                            onClick={() => handleUpdatePhotoMetadata(selectedPhoto, star, selectedPhoto.color_label)}
                            className="p-1 hover:scale-125 transition-transform cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${active ? "text-primary fill-primary" : "text-gray-600"}`} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Color Label */}
                    <div className="flex items-center gap-2">
                      {["Red", "Yellow", "Green", "Blue", "None"].map((col) => {
                        const active = selectedPhoto.color_label === col;
                        return (
                          <button
                            key={col}
                            onClick={() => handleUpdatePhotoMetadata(selectedPhoto, selectedPhoto.stars, col)}
                            className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                              col === "Red" ? "bg-red-500" :
                              col === "Yellow" ? "bg-yellow-500" :
                              col === "Green" ? "bg-green-500" :
                              col === "Blue" ? "bg-blue-500" : "border-gray-600 bg-transparent"
                            } ${active ? "ring-2 ring-white scale-125" : "opacity-40 hover:opacity-100"}`}
                            title={col}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Adjustment Sliders */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-primary" /> Ajustes Rápidos de Revelação
                    </span>
                    
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
                      <span>Temperatura (WB)</span>
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
                </div>

                {/* VISUAL PRESETS GRID (LUTs with thumbnails) */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Estilos Pré-definidos (LUTs)</span>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handleApplyPreset(preset.values)}
                        className="flex flex-col items-center gap-1.5 p-1 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group text-left"
                      >
                        {/* Preset preview thumbnail with current photo & preset filters */}
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedPhoto.proxyUrl}
                            alt={preset.name}
                            style={getPresetFilterStyle(preset.values)}
                            className="w-full h-full object-cover transition-all"
                          />
                          <div 
                            className="absolute inset-0 pointer-events-none"
                            style={getPresetTempOverlayStyle(preset.values.temp)}
                          />
                        </div>
                        <span className="text-[8px] font-sans font-bold text-gray-400 group-hover:text-primary transition-colors text-center block w-full truncate px-1">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Apply settings list */}
              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={handleApplyToAll}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" />
                  Aplicar Ajustes a Todas as Fotos
                </button>
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
