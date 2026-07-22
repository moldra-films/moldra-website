"use client";

import { motion } from "framer-motion";
import { Camera, Video, MonitorPlay, Film, Share2, Award } from "lucide-react";

export default function Services() {
  const servicesList = [
    {
      icon: Camera,
      title: "Captação de Imagens",
      description: "Filmagem profissional em alta resolução (4K/8K) e captação aérea com drone, trazendo ângulos deslumbrantes para o seu projeto.",
    },
    {
      icon: Video,
      title: "Edição de Vídeos",
      description: "Pós-produção completa com montagem dinâmica, color grading avançado, motion graphics e mixagem de som imersiva.",
    },
    {
      icon: Film,
      title: "Vídeos Institucionais",
      description: "Filmes corporativos autênticos que narram a história, valores e infraestrutura da sua marca para conquistar e engajar clientes.",
    },
    {
      icon: Award,
      title: "Comerciais & Eventos",
      description: "Produção de comerciais publicitários cinematográficos e cobertura completa de eventos, capturando momentos essenciais com precisão.",
    },
    {
      icon: Share2,
      title: "Redes Sociais",
      description: "Produção de Reels, TikToks e Shorts otimizados para prender a atenção do público nos primeiros segundos e maximizar o engajamento.",
    },
    {
      icon: MonitorPlay,
      title: "Fotografia Profissional",
      description: "Retratos corporativos, fotografia de produto, cobertura de eventos e ensaios premium com tratamento de imagem sofisticado.",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  } as const;

  return (
    <section id="servicos" className="relative py-24 bg-dark-card text-white overflow-hidden">
      {/* Subtle details */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block"
          >
            Nossas Especialidades
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight font-display"
          >
            Serviços de <span className="text-primary">Produção Audiovisual</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-gray-400 font-sans font-light mt-4 text-lg"
          >
            Do desenvolvimento do roteiro à entrega final, oferecemos soluções completas para destacar sua marca no mercado.
          </motion.p>
        </div>

        {/* Grid of Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {servicesList.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative p-8 rounded-2xl bg-[#0B0B0B]/60 border border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden"
            >
              {/* Card Hover Radial Gradient Background */}
              <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Icon Container with border accent */}
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/45 transition-all duration-300">
                <service.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-4 font-display text-white tracking-wide group-hover:text-primary transition-colors duration-300">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 font-sans font-light leading-relaxed text-sm group-hover:text-gray-300 transition-colors duration-300">
                {service.description}
              </p>

              {/* Decorative Accent Line */}
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
