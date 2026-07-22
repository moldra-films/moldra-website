"use client";

import { motion } from "framer-motion";
import { Play, ArrowRight, Film } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  onScrollToPortfolio: () => void;
  onScrollToContact: () => void;
}

export default function Hero({ onScrollToPortfolio, onScrollToContact }: HeroProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-dark-bg flex items-center justify-center">
      {/* Video Background with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover scale-[1.05] filter brightness-50 contrast-125"
        >
          <source
            src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e36913c1ca117bf34185e5d3152&profile_id=139&oauth2_token_id=57447761"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-black/70" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center h-full">
        {/* Sleek Cinematic Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex justify-center mb-8"
        >
          <Image
            src="/logo.png"
            alt="Moldra Films Logo"
            width={240}
            height={65}
            className="h-16 w-auto object-contain"
          />
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-5xl mb-6 font-display"
        >
          Transformamos ideias em imagens que{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#E5C180] to-white">
            contam histórias.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-300 font-sans font-light max-w-2xl mb-12 leading-relaxed"
        >
          Produção audiovisual profissional para empresas, marcas e criadores de conteúdo.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={onScrollToContact}
            className="group px-8 py-4 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-full transition-all duration-300 shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer font-sans transform hover:scale-105"
          >
            Solicitar Orçamento
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={onScrollToPortfolio}
            className="group px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2 backdrop-blur-md cursor-pointer font-sans transform hover:scale-105"
          >
            <Play className="w-4 h-4 fill-white transition-transform duration-300 group-hover:scale-110" />
            Ver Portfólio
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={onScrollToPortfolio}
        >
          <span className="text-xs tracking-[0.2em] uppercase text-white/50 font-light">Scroll</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
