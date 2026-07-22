"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import {
  Download,
  CheckCircle,
  MessageSquare,
  Send,
  LogOut,
  FileDown,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Clock
} from "lucide-react";

function ClientPortalContent() {
  const router = useRouter();
  const { projects, addProjectComment, updateProjectStatus } = useAdmin();
  
  // Default to first active project or fallback
  const [selectedProjId, setSelectedProjId] = useState<number>(projects[0]?.id || 1);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeProj = projects.find((p) => p.id === selectedProjId) || projects[0];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeProj) return;

    let timestamp = "00:00";
    if (videoRef.current) {
      const currentSeconds = Math.floor(videoRef.current.currentTime);
      const mins = Math.floor(currentSeconds / 60);
      const secs = currentSeconds % 60;
      timestamp = `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
    }

    addProjectComment(activeProj.id, {
      timestamp,
      text: newComment,
      author: "Cliente (Aprovador)",
    });

    setNewComment("");
  };

  const handleApproveProject = () => {
    if (!activeProj) return;
    updateProjectStatus(activeProj.id, "Concluído");
    alert(`O corte "${activeProj.name}" foi aprovado com sucesso! A equipe de pós-produção foi notificada.`);
  };
  const handleLogout = () => {
    document.cookie = "moldra-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "moldra-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };
  // Mock list of downloadable assets/photos stored on Cloudflare R2
  const r2Assets = [
    { name: "Corte Principal Master (ProRes 422).mov", size: "3.2 GB", type: "video" },
    { name: "Teaser Instagram Vertical (H.264).mp4", size: "145 MB", type: "video" },
    { name: "Fotografias Tratadas Lote 1 (RAW + JPEG).zip", size: "820 MB", type: "image" },
    { name: "Trilha Sonora Original e Efeitos de Efeitos.wav", size: "48 MB", type: "audio" },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between font-sans">
      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-black/40 py-4 px-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Moldra Films Logo"
              width={140}
              height={40}
              className="h-8 w-auto object-contain"
            />
            <span className="hidden sm:inline px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/25 rounded-full text-[9px] uppercase font-bold tracking-wider">
              Portal do Cliente
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-sans hidden sm:inline">
              Olá, <span className="font-bold text-white">Client Project Approver</span>
            </span>
            <button
              onClick={handleLogout}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer border border-white/5 flex items-center gap-1.5 text-xs font-bold"
              title="Sair do Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel grid layout */}
      <main className="flex-1 container mx-auto px-6 py-8 space-y-8">
        {/* Title selector row */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-base font-bold uppercase tracking-wider text-white">
              Cortes de Vídeo & Entregáveis
            </h1>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Assista à última versão enviada pela equipe de pós-produção, insira observações e baixe seus arquivos direto da Cloudflare R2.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-sans">Visualizando Projeto:</span>
            <select
              value={selectedProjId}
              onChange={(e) => setSelectedProjId(Number(e.target.value))}
              className="bg-dark-card border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/40 cursor-pointer font-sans"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Versão {p.version})
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeProj ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Video player */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-white/5 shadow-2xl">
                <video
                  ref={videoRef}
                  src={activeProj.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-card border border-white/5 p-5 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
                      Corte Atual
                    </span>
                    <span className="px-1.5 py-0.5 bg-white/5 text-gray-400 rounded text-[9px] font-mono">
                      v{activeProj.version}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-1">
                    {activeProj.name} - Versão Revisada
                  </h3>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <a
                    href={activeProj.videoUrl}
                    download
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-white/5 hover:bg-white/10 text-primary border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Vídeo
                  </a>
                  
                  <button
                    onClick={handleApproveProject}
                    disabled={activeProj.status === "Concluído"}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                      activeProj.status === "Concluído"
                        ? "bg-green-500/10 border-green-500/20 text-green-400 cursor-not-allowed"
                        : "bg-primary hover:bg-[#B39356] border-primary text-black"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {activeProj.status === "Concluído" ? "Aprovado" : "Aprovar Corte"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Timecoded Comments */}
            <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-dark-card border border-white/5 p-6 h-[480px]">
              <div className="flex flex-col h-full justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-4 border-b border-white/5 pb-3 justify-between">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Notas & Alterações
                      </h3>
                    </div>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> Auto-Timecode
                    </span>
                  </div>

                  {/* Comment list */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-white/5">
                    {activeProj.comments.map((comm) => (
                      <div key={comm.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[11px] text-white font-sans">
                            {comm.author}
                          </span>
                          <span className="px-2 py-0.5 bg-primary/15 text-primary rounded font-mono text-[9px] font-bold">
                            {comm.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 font-sans font-light leading-relaxed">
                          {comm.text}
                        </p>
                      </div>
                    ))}
                    {activeProj.comments.length === 0 && (
                      <div className="text-center py-12 text-xs text-gray-500 font-sans">
                        Dê o play no vídeo e envie observações se precisar de alterações no frame atual!
                      </div>
                    )}
                  </div>
                </div>

                {/* Form entry */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-4 border-t border-white/5">
                  <input
                    type="text"
                    required
                    placeholder="Sugira alterações no tempo atual..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-primary rounded-xl cursor-pointer transition-colors"
                    title="Enviar anotação"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-xs text-gray-500 font-sans">
            Nenhum projeto ativo disponível para revisão.
          </div>
        )}

        {/* Master files grid - Cloudflare R2 downloads */}
        <div className="space-y-4 pt-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Arquivos Finais & Materiais Brutos (Cloudflare R2)
            </h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Faça o download de arquivos pesados, fotos tratadas e trilhas sonoras. Acesso direto e seguro sem links externos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {r2Assets.map((asset, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-dark-card border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {asset.type === "video" ? (
                      <Video className="w-4 h-4 text-primary" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white font-display truncate leading-snug" title={asset.name}>
                      {asset.name}
                    </h4>
                    <span className="text-[10px] text-gray-500 block mt-0.5 font-mono">
                      Tamanho: {asset.size}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Iniciando download seguro de: ${asset.name} da Cloudflare R2...`)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-[9px] uppercase tracking-wider font-extrabold text-primary transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Baixar Arquivo
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-[10px] text-gray-500 font-sans mt-12 bg-black/25">
        &copy; {new Date().getFullYear()} Moldra Films. Todos os direitos reservados. Painel integrado com Cloudflare R2 & Supabase.
      </footer>
    </div>
  );
}

export default function ClientPortal() {
  return (
    <AdminProvider>
      <ClientPortalContent />
    </AdminProvider>
  );
}
