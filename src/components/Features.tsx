"use client";

import { motion } from "framer-motion";
import { Cpu, Users, Eye, Zap, Smile, CheckSquare } from "lucide-react";

export default function Features() {
  const highlights = [
    {
      icon: Cpu,
      title: "Equipamentos Profissionais",
      description: "Câmeras de cinema de ponta, lentes cinematográficas premium, estabilizadores robóticos e captação aérea em alta definição.",
    },
    {
      icon: Users,
      title: "Equipe Especializada",
      description: "Diretores, roteiristas, operadores de câmera, editores e coloristas dedicados a extrair o melhor de cada narrativa.",
    },
    {
      icon: Eye,
      title: "Alta Qualidade de Imagem",
      description: "Finalização com color grading cinematográfico avançado e correção cromática rigorosa, garantindo apelo visual premium.",
    },
    {
      icon: Zap,
      title: "Entrega Rápida",
      description: "Workflow de pós-produção ágil e cronograma estruturado para entregar seu filme dentro dos prazos, sem abrir mão da excelência.",
    },
    {
      icon: Smile,
      title: "Atendimento Personalizado",
      description: "Acompanhamos de perto os seus objetivos de marketing e branding para construir um conteúdo alinhado à sua audiência.",
    },
    {
      icon: CheckSquare,
      title: "Produção Completa",
      description: "Gerenciamento completo em 360º: desde o briefing e a roteirização até a gravação e a finalização com efeitos visuais e áudio.",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  } as const;

  return (
    <section className="relative py-24 bg-dark-bg text-white overflow-hidden">
      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 -translate-y-1/2 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Sticky Left Box */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <span className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block">
              Diferenciais
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display mb-6">
              Por que escolher a <span className="text-primary">Moldra Films?</span>
            </h2>
            <p className="text-gray-400 font-sans font-light leading-relaxed mb-8">
              Comprometemo-nos a entregar produções audiovisuais extraordinárias, unindo a visão artística de nossos diretores à precisão técnica de nossa pós-produção.
            </p>
            <div className="h-[1px] w-20 bg-primary" />
          </div>

          {/* Right Highlights Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8"
          >
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 rounded-2xl bg-dark-card border border-white/5 flex flex-col justify-start hover:border-white/10 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                  <item.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-bold font-display text-white mb-3 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-gray-400 font-sans font-light leading-relaxed text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
