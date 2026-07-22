"use client";

import { motion } from "framer-motion";
import { MessageSquare, Calendar, Video, CheckCircle2 } from "lucide-react";

export default function Process() {
  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Briefing",
      description:
        "Reunião de alinhamento para entender os objetivos da sua marca, o público-alvo, a mensagem principal e a verba disponível para o projeto.",
    },
    {
      number: "02",
      icon: Calendar,
      title: "Planejamento",
      description:
        "Criação de roteiro, storyboard, decupagem de cenas, agendamento de locações, seleção de elenco e cronograma detalhado de gravação.",
    },
    {
      number: "03",
      icon: Video,
      title: "Produção",
      description:
        "Filmagem presencial com nossa equipe de diretores e técnicos. Câmeras profissionais, iluminação cinematográfica, captação de áudio e voos de drone.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Pós-Produção e Entrega",
      description:
        "Edição avançada, color grading, inserção de trilhas sonoras, efeitos sonoros (foley), motion graphics, legendas e exportação otimizada.",
    },
  ];

  return (
    <section id="processo" className="relative py-24 bg-dark-card text-white overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block">
            Fluxo de Trabalho
            </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display">
            Como damos vida às <span className="text-primary">suas ideias</span>
          </h2>
          <p className="text-gray-400 font-sans font-light mt-4 text-lg">
            Um processo estruturado em etapas claras para garantir qualidade cinematográfica e entregas pontuais.
          </p>
        </div>

        {/* Timeline Desktop/Mobile */}
        <div className="relative">
          {/* Central Line for Desktop */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/80 via-primary/30 to-transparent" />

          {/* Left Line for Mobile */}
          <div className="lg:hidden absolute left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/80 via-primary/30 to-transparent" />

          <div className="space-y-16">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row items-start lg:items-center relative ${
                    isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Timeline Node Icon (Centered) */}
                  {/* Desktop Node */}
                  <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-dark-bg border-2 border-primary items-center justify-center z-20 shadow-lg shadow-primary/20">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>

                  {/* Mobile Node */}
                  <div className="lg:hidden absolute left-0 w-8 h-8 rounded-full bg-dark-bg border-2 border-primary flex items-center justify-center z-20 shadow-md">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>

                  {/* Content Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    className={`w-full lg:w-[calc(50%-32px)] pl-12 lg:pl-0 ${
                      isEven ? "lg:pr-12 lg:text-right" : "lg:pl-12 lg:text-left"
                    }`}
                  >
                    <div className="p-8 rounded-2xl bg-[#0B0B0B]/70 border border-white/5 hover:border-white/10 transition-colors duration-300 relative overflow-hidden group">
                      {/* Step Number in Background */}
                      <span
                        className={`absolute text-8xl font-black font-display opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500 ${
                          isEven ? "left-4 top-2" : "right-4 top-2"
                        }`}
                        style={{ WebkitTextStroke: "1px white", fill: "transparent" }}
                      >
                        {step.number}
                      </span>

                      <div className={`flex flex-col ${isEven ? "lg:items-end" : "lg:items-start"}`}>
                        <span className="text-primary font-bold text-xs uppercase tracking-widest mb-1.5 font-display">
                          Etapa {step.number}
                        </span>
                        <h3 className="text-xl font-bold font-display text-white mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-400 font-sans font-light leading-relaxed text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
