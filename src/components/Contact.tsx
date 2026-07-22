"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, MapPin, CheckCircle, Send } from "lucide-react";

const InstagramIcon = () => (
  <svg
    className="w-5 h-5 text-[#E1306C]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);


export default function Contact() {
  const [formData, setFormData] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    tipoProjeto: "Vídeo Institucional",
    mensagem: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      setFormData({
        nome: "",
        empresa: "",
        email: "",
        telefone: "",
        tipoProjeto: "Vídeo Institucional",
        mensagem: "",
      });
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contato" className="relative py-24 bg-dark-bg text-white overflow-hidden">
      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* CTA Heading */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-primary uppercase tracking-[0.25em] text-xs font-semibold mb-3 block animate-pulse">
            Solicite um Orçamento
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-display mb-4">
            Vamos contar a história da <span className="text-primary">sua marca?</span>
          </h2>
          <p className="text-gray-400 font-sans font-light text-base md:text-lg">
            Entre em contato e solicite um orçamento sem compromisso. Nossa equipe responderá em até 24 horas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Contact Channels Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold font-display text-white tracking-wide">
                Canais de <span className="text-primary">Contato</span>
              </h3>
              <p className="text-gray-400 font-sans font-light leading-relaxed">
                Prefere conversar diretamente? Escolha o melhor canal abaixo ou nos faça uma visita comercial.
              </p>

              <div className="space-y-6">
                {/* Whatsapp */}
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-card border border-white/5 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#25D366]/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Phone className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-light block uppercase tracking-wider">WhatsApp</span>
                    <span className="text-sm font-semibold text-white font-sans group-hover:text-primary transition-colors duration-300">+55 (11) 99999-9999</span>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/moldrafilms"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-card border border-white/5 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#E1306C]/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <InstagramIcon />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-light block uppercase tracking-wider">Instagram</span>
                    <span className="text-sm font-semibold text-white font-sans group-hover:text-primary transition-colors duration-300">@moldrafilms</span>
                  </div>
                </a>

                {/* E-mail */}
                <a
                  href="mailto:contato@moldrafilms.com"
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-card border border-white/5 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-light block uppercase tracking-wider">E-mail</span>
                    <span className="text-sm font-semibold text-white font-sans group-hover:text-primary transition-colors duration-300">contato@moldrafilms.com</span>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-card border border-white/5">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-light block uppercase tracking-wider">Localização</span>
                    <span className="text-sm font-semibold text-white font-sans">São Paulo, SP - Brasil</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-xs text-gray-500 font-sans hidden lg:block">
              Ao enviar este formulário, você concorda com nossos termos de privacidade e compartilhamento de dados básicos.
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 rounded-3xl bg-dark-card border border-white/5 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="flex flex-col">
                        <label htmlFor="nome" className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2 font-display">
                          Nome *
                        </label>
                        <input
                          type="text"
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          required
                          placeholder="Seu nome completo"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all duration-300 font-sans font-light"
                        />
                      </div>

                      {/* Company */}
                      <div className="flex flex-col">
                        <label htmlFor="empresa" className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2 font-display">
                          Empresa
                        </label>
                        <input
                          type="text"
                          id="empresa"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleChange}
                          placeholder="Nome da sua empresa"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all duration-300 font-sans font-light"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Email */}
                      <div className="flex flex-col">
                        <label htmlFor="email" className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2 font-display">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="contato@empresa.com"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all duration-300 font-sans font-light"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col">
                        <label htmlFor="telefone" className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2 font-display">
                          Telefone *
                        </label>
                        <input
                          type="tel"
                          id="telefone"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleChange}
                          required
                          placeholder="(11) 99999-9999"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all duration-300 font-sans font-light"
                        />
                      </div>
                    </div>

                    {/* Project Type */}
                    <div className="flex flex-col">
                      <label htmlFor="tipoProjeto" className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2 font-display">
                        Tipo de Projeto
                      </label>
                      <select
                        id="tipoProjeto"
                        name="tipoProjeto"
                        value={formData.tipoProjeto}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all duration-300 cursor-pointer font-sans font-light"
                      >
                        <option value="Vídeo Institucional" className="bg-dark-card text-white">Vídeo Institucional</option>
                        <option value="Produção Audiovisual" className="bg-dark-card text-white">Produção Audiovisual</option>
                        <option value="Campanha Comercial" className="bg-dark-card text-white">Campanha Comercial</option>
                        <option value="Cobertura de Evento" className="bg-dark-card text-white">Cobertura de Evento</option>
                        <option value="Conteúdo Redes Sociais" className="bg-dark-card text-white">Conteúdo para Redes Sociais</option>
                        <option value="Filmagem Aérea / Drone" className="bg-dark-card text-white">Filmagem Aérea / Drone</option>
                        <option value="Produção Fotográfica" className="bg-dark-card text-white">Produção Fotográfica</option>
                        <option value="Outro" className="bg-dark-card text-white">Outro tipo de projeto</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col">
                      <label htmlFor="mensagem" className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2 font-display">
                        Mensagem *
                      </label>
                      <textarea
                        id="mensagem"
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Escreva brevemente os detalhes do seu projeto..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all duration-300 resize-none font-sans font-light"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-4 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans transform hover:scale-[1.01]"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar Solicitação
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-message"
                    className="flex flex-col items-center justify-center py-16 text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-primary animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-bold font-display text-white mb-3">
                      Solicitação Enviada!
                    </h3>
                    <p className="text-gray-400 font-sans font-light leading-relaxed max-w-md mb-8">
                      Obrigado por entrar em contato. Nossos produtores já foram notificados e retornarão em breve para planejar a sua história.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      Enviar Nova Mensagem
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
