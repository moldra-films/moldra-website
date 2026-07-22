"use client";

import { useState, useRef } from "react";
import { useAdmin, Project } from "@/context/AdminContext";
import { Play, Send, CheckCircle2, MessageSquare, AlertCircle, FileText } from "lucide-react";

export default function ApprovalTab() {
  const { projects, addProjectComment, updateProjectStatus } = useAdmin();
  const [selectedProjId, setSelectedProjId] = useState<number>(projects[0]?.id || 1);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeProj = projects.find((p) => p.id === selectedProjId) || projects[0];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeProj) return;

    // Get current time formatted from video player ref
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
      author: "Mikelly Maduro (Equipe)",
    });

    setNewComment("");
  };

  const handleApproveProject = () => {
    if (!activeProj) return;
    updateProjectStatus(activeProj.id, "Concluído");
    alert(`O projeto "${activeProj.name}" foi aprovado com sucesso!`);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">Portal de Aprovação de Projetos</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Simulador de portal do cliente. Assista aos cortes, faça comentários indexados por timestamp e aprove a versão final.
          </p>
        </div>

        <select
          value={selectedProjId}
          onChange={(e) => setSelectedProjId(Number(e.target.value))}
          className="bg-dark-card border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/40 cursor-pointer font-sans"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.version})
            </option>
          ))}
        </select>
      </div>

      {activeProj ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Video Player & Version details */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-white/5">
              <video
                ref={videoRef}
                src={activeProj.videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex justify-between items-center bg-dark-card border border-white/5 p-4 rounded-xl">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Corte Ativo</span>
                <h3 className="text-xs font-bold text-white mt-0.5">{activeProj.name} - Versão {activeProj.version}</h3>
              </div>
              
              <button
                onClick={handleApproveProject}
                disabled={activeProj.status === "Concluído"}
                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  activeProj.status === "Concluído"
                    ? "bg-green-500/10 border-green-500/20 text-green-400 cursor-not-allowed"
                    : "bg-primary hover:bg-[#B39356] border-primary text-black"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activeProj.status === "Concluído" ? "Aprovado" : "Aprovar Versão Final"}
              </button>
            </div>
          </div>

          {/* Right Column: Timecoded comments and entry form */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-dark-card border border-white/5 p-6 h-[480px]">
            <div className="flex flex-col h-full justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-4 border-b border-white/5 pb-3">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Comentários por Timestamp</h3>
                </div>

                {/* Comment list */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-white/5">
                  {activeProj.comments.map((comm) => (
                    <div key={comm.id} className="pt-3 first:pt-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[11px] text-white font-sans">{comm.author}</span>
                        <span className="px-2 py-0.5 bg-primary/15 text-primary rounded font-mono text-[9px] font-bold">
                          {comm.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 font-sans font-light leading-relaxed">{comm.text}</p>
                    </div>
                  ))}
                  {activeProj.comments.length === 0 && (
                    <div className="text-center py-12 text-xs text-gray-500 font-sans">
                      Nenhum comentário indexado. Dê play e envie observações no tempo atual!
                    </div>
                  )}
                </div>
              </div>

              {/* Form entry */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-4 border-t border-white/5">
                <input
                  type="text"
                  required
                  placeholder="Escreva sua alteração..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-primary rounded-xl cursor-pointer transition-colors"
                  title="Enviar comentário com timestamp do player"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-xs text-gray-500 font-sans">
          Nenhum projeto disponível para aprovação
        </div>
      )}
    </div>
  );
}
