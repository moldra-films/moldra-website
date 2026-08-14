"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabaseClient";
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
  const { projects, clients, addProjectComment, updateProjectStatus, eventMedias } = useAdmin();
  
  const [selectedProjId, setSelectedProjId] = useState<number>(1);
  const [newComment, setNewComment] = useState("");
  const [purchasedItems, setPurchasedItems] = useState<{ eventName: string; photoName: string; url: string; date: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && eventMedias.length > 0) {
      const items: { eventName: string; photoName: string; url: string; date: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("purchased_photos_")) {
          const eventId = Number(key.replace("purchased_photos_", ""));
          const event = eventMedias.find((e) => e.id === eventId);
          if (event) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || "");
              if (data === "all") {
                event.photos.forEach((photo) => {
                  items.push({
                    eventName: event.name,
                    photoName: photo.name,
                    url: photo.url,
                    date: event.date
                  });
                });
              } else if (Array.isArray(data)) {
                data.forEach((photoId) => {
                  const photo = event.photos.find((p) => p.id === photoId);
                  if (photo) {
                    items.push({
                      eventName: event.name,
                      photoName: photo.name,
                      url: photo.url,
                      date: event.date
                    });
                  }
                });
              }
            } catch (e) {
              console.error("Erro ao processar fotos adquiridas do localStorage:", e);
            }
          }
        }
      }
      setPurchasedItems(items);
    }
  }, [eventMedias]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const [userEmail, setUserEmail] = useState("");
  const [userCompany, setUserCompany] = useState("");
  const [userName, setUserName] = useState("Cliente");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserEmail(session.user?.email || "");
        setUserName(session.user?.user_metadata?.full_name || session.user?.email?.split("@")[0] || "Cliente");
        setUserCompany(session.user?.user_metadata?.company || "");
      }
      setAuthLoading(false);
    };
    fetchUserSession();
  }, []);

  const clientProjects = projects.filter((p) => {
    if (!userEmail) return false;
    
    const isEmailMatch = p.clientName.toLowerCase() === userEmail.toLowerCase();
    const isCompanyMatch = userCompany && p.clientName.toLowerCase() === userCompany.toLowerCase();
    
    const matchedClientObj = clients.find((c) => c.email.toLowerCase() === userEmail.toLowerCase());
    const isMatchedClientCompany = matchedClientObj && p.clientName.toLowerCase() === matchedClientObj.company.toLowerCase();

    return isEmailMatch || isCompanyMatch || isMatchedClientCompany;
  });

  useEffect(() => {
    if (clientProjects.length > 0 && !clientProjects.some(p => p.id === selectedProjId)) {
      setSelectedProjId(clientProjects[0].id);
    }
  }, [clientProjects, selectedProjId]);

  const activeProj = clientProjects.find((p) => p.id === selectedProjId) || clientProjects[0];

  const timeToSeconds = (timestamp: string): number => {
    const parts = timestamp.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      return mins * 60 + secs;
    }
    return 0;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
  };

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
  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "moldra-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "moldra-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };


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
              Olá, <span className="font-bold text-white">{userName}</span> {userCompany && <span className="text-gray-500 font-light font-sans">&bull; {userCompany}</span>}
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
                  onDurationChange={(e) => setVideoDuration(e.currentTarget.duration)}
                  onTimeUpdate={(e) => setVideoCurrentTime(e.currentTarget.currentTime)}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Custom Interactive Timeline with Comment Dots */}
              {videoDuration > 0 && (
                <div className="space-y-2 bg-dark-card border border-white/5 p-4 rounded-xl">
                  <label className="block text-[9px] uppercase font-bold text-gray-500">Marcadores de Alteração (Comentários)</label>
                  <div className="relative h-2 bg-white/10 rounded-full cursor-pointer group" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const width = rect.width;
                    const clickPercent = clickX / width;
                    if (videoRef.current) {
                      videoRef.current.currentTime = clickPercent * videoDuration;
                    }
                  }}>
                    {/* Playback Progress */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full"
                      style={{ width: `${(videoCurrentTime / videoDuration) * 100}%` }}
                    />
                    
                    {/* Comment Dots */}
                    {activeProj.comments.map((comment) => {
                      const commentSecs = timeToSeconds(comment.timestamp);
                      const percent = (commentSecs / videoDuration) * 100;
                      if (percent > 100) return null;
                      return (
                        <div 
                          key={comment.id}
                          className="absolute w-3.5 h-3.5 -mt-0.5 -ml-1.5 rounded-full bg-red-500 border-2 border-black hover:scale-125 transition-transform cursor-pointer group/dot z-20"
                          style={{ left: `${percent}%` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (videoRef.current) {
                              videoRef.current.currentTime = commentSecs;
                            }
                          }}
                          title={`Pular para comentário de ${comment.author} em ${comment.timestamp}`}
                        >
                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 text-[10px] text-gray-200 rounded-lg opacity-0 pointer-events-none group-hover/dot:opacity-100 transition-opacity whitespace-normal z-50 shadow-2xl">
                            <span className="font-bold text-white block mb-0.5">{comment.author} ({comment.timestamp})</span>
                            {comment.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Time Labels */}
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono pt-1">
                    <span>{formatTime(videoCurrentTime)}</span>
                    <span>{formatTime(videoDuration)}</span>
                  </div>
                </div>
              )}

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

        {/* Purchased Photos Section */}
        <div className="border-t border-white/5 pt-10 space-y-6">
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Fotos Adquiridas em Eventos
            </h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Visualize e faça o download em alta resolução das fotos que você comprou nas nossas galerias de eventos.
            </p>
          </div>

          {purchasedItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {purchasedItems.map((item, idx) => (
                <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black/40 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between">
                  {/* Photo Image */}
                  <div className="relative w-full flex-1 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.photoName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                    />
                  </div>

                  {/* Card Details & Download Button */}
                  <div className="p-3 bg-black/80 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-300 font-mono truncate">{item.photoName}</p>
                      <p className="text-[8px] text-primary truncate uppercase tracking-wider font-light mt-0.5">{item.eventName}</p>
                    </div>

                    <a
                      href={item.url}
                      download={item.photoName}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-primary hover:bg-[#B39356] text-black rounded-lg cursor-pointer transition-colors shrink-0"
                      title="Baixar Foto Alta Resolução"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-dark-card border border-white/5 text-center max-w-md mx-auto space-y-4">
              <ImageIcon className="w-10 h-10 text-gray-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Nenhuma foto encontrada</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
                  Você ainda não comprou nenhuma foto de eventos neste navegador. Visite a seção de eventos para escolher suas fotos favoritas.
                </p>
              </div>
              <a
                href="/eventos"
                className="inline-block px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] text-primary border border-primary/20 hover:border-primary/50 font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Ver Eventos Disponíveis
              </a>
            </div>
          )}
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
