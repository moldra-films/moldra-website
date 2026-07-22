"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Mendes",
      role: "Diretora de Marketing",
      company: "Innova Corp",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      content:
        "A Moldra Films superou todas as nossas expectativas. Conseguiram captar a essência da nossa marca e transformar um conceito complexo em um vídeo institucional emocionante e direto. O retorno que tivemos da nossa campanha foi fantástico.",
      rating: 5,
    },
    {
      id: 2,
      name: "Rodrigo Albuquerque",
      role: "Fundador & CEO",
      company: "Apex Wear",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      content:
        "Trabalhar com a Moldra foi uma experiência excelente. O comercial da nossa nova coleção ficou sensacional, com uma estética premium e direção de arte impecável. Equipe profissional, pontual e extremamente talentosa.",
      rating: 5,
    },
    {
      id: 3,
      name: "Juliana Freitas",
      role: "Diretora de Eventos",
      company: "Summit Tech",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      content:
        "A cobertura do nosso evento anual foi impecável. Eles conseguiram capturar toda a vibração e os melhores momentos sem interferir no andamento das palestras. O aftermovie final nos rendeu muitos elogios e novas inscrições.",
      rating: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative py-24 bg-dark-bg text-white overflow-hidden border-b border-white/5">
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display">
            O que dizem os <span className="text-primary">nossos parceiros</span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="p-8 md:p-12 rounded-3xl bg-dark-card border border-white/5 relative flex flex-col md:flex-row items-center gap-8 md:gap-12"
            >
              {/* Quote Icon Background */}
              <Quote className="absolute right-8 bottom-8 w-24 h-24 text-white/[0.02] pointer-events-none" />

              {/* Author Image */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Review Content */}
              <div className="flex-1 flex flex-col">
                {/* Star rating */}
                <div className="flex gap-1 mb-4 justify-center md:justify-start">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-300 font-sans font-light italic leading-relaxed text-base md:text-lg mb-6 text-center md:text-left">
                  &ldquo;{testimonials[currentIndex].content}&rdquo;
                </p>

                {/* Author Info */}
                <div className="text-center md:text-left">
                  <h4 className="text-lg font-bold font-display text-white">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-xs text-gray-400 font-sans font-light mt-0.5">
                    {testimonials[currentIndex].role} &bull;{" "}
                    <span className="text-primary font-medium">
                      {testimonials[currentIndex].company}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={handlePrev}
              className="p-3 bg-dark-card hover:bg-[#222222] border border-white/5 hover:border-primary/20 text-gray-400 hover:text-white rounded-full transition-all duration-300 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 bg-dark-card hover:bg-[#222222] border border-white/5 hover:border-primary/20 text-gray-400 hover:text-white rounded-full transition-all duration-300 cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
