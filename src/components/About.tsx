"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Award, Users, Film, Target } from "lucide-react";

export default function About() {
  const stats = [
    { icon: Film, value: "500+", label: "Vídeos Produzidos" },
    { icon: Users, value: "150+", label: "Clientes Atendidos" },
    { icon: Award, value: "15+", label: "Prêmios & Festivais" },
    { icon: Target, value: "100%", label: "Dedicação e Qualidade" },
  ];

  return (
    <section id="sobre" className="relative py-24 bg-dark-bg text-white overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Cinematic Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent z-10" />
              <Image
                src="/about_cinematic.png"
                alt="Moldra Films Studio Set"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              {/* Decorative Frame */}
              <div className="absolute -inset-2 border border-primary/20 rounded-2xl pointer-events-none translate-x-4 translate-y-4 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" />
            </div>
          </motion.div>

          {/* Right Column: Copywriting */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <span className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block">
              Quem Somos
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8 font-display">
              Criamos narrativas que <span className="text-primary">marcam gerações.</span>
            </h2>
            
            <p className="text-lg text-gray-300 font-light leading-relaxed mb-6 font-sans">
              Na Moldra Films acreditamos que cada projeto possui uma história única. Nossa missão é transformar ideias em vídeos que emocionam, conectam pessoas e fortalecem marcas através de imagens impactantes e produção profissional.
            </p>
            <p className="text-gray-400 font-sans font-light leading-relaxed mb-12">
              Com equipamentos de última geração e uma equipe apaixonada por contar histórias, nós cuidamos de cada etapa do processo. Desde o roteiro e planejamento inicial até a direção de arte, captação, edição de som, color grading e pós-produção final.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-start">
                  <div className="p-2 bg-white/5 rounded-lg mb-3 border border-white/5">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold font-display text-white">{stat.value}</span>
                  <span className="text-xs text-gray-400 font-sans font-light tracking-wide">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Leadership Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="mt-24 pt-16 border-t border-white/10"
        >
          <span className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block text-center">
            Liderança
          </span>
          <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-display mb-12 text-center">
            As Mentes por Trás da <span className="text-primary">Moldra Films</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Mikelly Maduro */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-dark-card border border-white/5 hover:border-primary/20 transition-all duration-300 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-xl text-primary font-display shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                MM
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-lg font-bold font-display text-white mb-1 group-hover:text-primary transition-colors duration-300">Mikelly Maduro</h4>
                <p className="text-xs text-gray-400 font-sans font-light uppercase tracking-widest mb-3">CEO & Co-Fundadora</p>
                <p className="text-sm text-gray-300 font-sans font-light leading-relaxed">
                  Líder de estratégia e conexões comerciais, impulsionando a expansão da marca e novos projetos.
                </p>
              </div>
            </div>

            {/* Natália Camurça */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-dark-card border border-white/5 hover:border-primary/20 transition-all duration-300 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-xl text-primary font-display shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                NC
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-lg font-bold font-display text-white mb-1 group-hover:text-primary transition-colors duration-300">Natália Camurça</h4>
                <p className="text-xs text-gray-400 font-sans font-light uppercase tracking-widest mb-3">CEO & Co-Fundadora</p>
                <p className="text-sm text-gray-300 font-sans font-light leading-relaxed">
                  Diretora de criação e pós-produção executiva, garantindo a excelência artística dos projetos.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
