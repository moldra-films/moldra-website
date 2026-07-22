"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Eye } from "lucide-react";

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
}

export default function Portfolio() {
  const categories = [
    "Todos",
    "Institucional",
    "Comercial",
    "Eventos",
    "Redes Sociais",
    "Drone",
    "Fotografia",
  ];

  const projects: Project[] = [
    {
      id: 1,
      title: "Legado Corporativo",
      category: "Institucional",
      description: "Vídeo institucional para empresa global de tecnologia, destacando cultura e inovação.",
      videoUrl: "https://player.vimeo.com/external/435674703.sd.mp4?s=7f77e2da58c54d7ffab833504f478e1215b2e5cc&profile_id=139&oauth2_token_id=57447761",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Essência do Tempo",
      category: "Comercial",
      description: "Campanha comercial premium para relógio de luxo, com foco em detalhes macro e sofisticação.",
      videoUrl: "https://player.vimeo.com/external/340322137.sd.mp4?s=d0cc8a79b19e917d21ca520f9119420077c98889&profile_id=139&oauth2_token_id=57447761",
      thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Neon Pulse Festival",
      category: "Eventos",
      description: "Aftermovie oficial de festival de música eletrônica, capturando energia e luzes.",
      videoUrl: "https://player.vimeo.com/external/409419139.sd.mp4?s=5cf2abde57c4c9fae9a8f4c278c7c91c360877bd&profile_id=139&oauth2_token_id=57447761",
      thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Sabor & Fogo",
      category: "Redes Sociais",
      description: "Reels gastronômico e dinâmico apresentando a preparação de um prato assinatura de chef premiado.",
      videoUrl: "https://player.vimeo.com/external/477117173.sd.mp4?s=12e06180a563b7aa7d6ff68a735626f8d3c5f212&profile_id=139&oauth2_token_id=57447761",
      thumbnail: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      title: "Cumes Indomáveis",
      category: "Drone",
      description: "Exploração visual aérea de montanhas rochosas cobertas por neve profunda ao amanhecer.",
      videoUrl: "https://player.vimeo.com/external/517616641.sd.mp4?s=56c1a89c92336336e9ff342f1cf1d2de2af00cc8&profile_id=139&oauth2_token_id=57447761",
      thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      title: "Retrato Singular",
      category: "Fotografia",
      description: "Sessão editorial fotográfica em estúdio explorando contraste, sombras e drama.",
      videoUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e36913c1ca117bf34185e5d3152&profile_id=139&oauth2_token_id=57447761",
      thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = activeCategory === "Todos"
    ? projects
    : projects.filter((project) => project.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="portfolio" className="relative py-24 bg-dark-bg text-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block">
              Nosso Trabalho
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display">
              Portfólio <span className="text-primary">Cinematográfico</span>
            </h2>
          </div>

          {/* Categories Tab Selector */}
          <div className="flex flex-wrap gap-2 md:max-w-xl">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer ${
                  activeCategory === category
                    ? "bg-primary text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="group relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-dark-card cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                {/* Thumbnail Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-50"
                />

                {/* Dark overlay showing title, category, description and Play button on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10">
                  <span className="text-primary text-xs font-semibold tracking-wider uppercase mb-1">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold font-display text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-sans font-light leading-relaxed mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  {/* Action row */}
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-black transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                    </span>
                    Assistir Projeto
                  </div>
                </div>

                {/* Standard layout marker when not hovered */}
                <div className="absolute bottom-4 left-4 right-4 z-0 group-hover:opacity-0 transition-opacity duration-300 flex items-center justify-between bg-black/60 backdrop-blur-md py-2.5 px-4 rounded-lg border border-white/5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white">
                    {project.title}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-primary">
                    {project.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox / Video Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl bg-dark-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Close Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40">
                <div>
                  <span className="text-xs uppercase text-primary font-semibold tracking-wider">
                    {selectedProject.category}
                  </span>
                  <h3 className="text-lg font-bold font-display text-white mt-0.5">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={selectedProject.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Video Description Info Footer */}
              <div className="p-6 bg-black/40 border-t border-white/5">
                <p className="text-sm text-gray-300 font-sans font-light leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
