"use client";

import React from "react";
import { useAdmin } from "@/context/AdminContext";
import Link from "next/link";
import Image from "next/image";
import { Camera, Calendar, ArrowRight, ImageIcon } from "lucide-react";

export default function PublicEventsPage() {
  const { eventMedias } = useAdmin();

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary/20 relative overflow-hidden py-16 px-6">
      {/* Background radial decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Navigation & Brand Header */}
        <div className="flex justify-between items-center pb-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Moldra Films Logo"
              width={130}
              height={36}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">
            Galeria Pública de Mídias
          </span>
        </div>

        {/* Title Section */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            Fotografia & Eventos
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display uppercase tracking-wider text-white">
            Suas fotos estão prontas.
          </h1>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Busque o seu evento abaixo, selecione suas fotos preferidas com marca d'água de proteção e realize o pagamento seguro para recebê-las em alta resolução sem marca d'água.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {eventMedias.map((event) => {
            const hasPhotos = event.photos && event.photos.length > 0;
            const coverPhoto = hasPhotos ? event.photos[0].url : null;

            return (
              <div
                key={event.id}
                className="group rounded-2xl bg-dark-card border border-white/5 overflow-hidden flex flex-col justify-between hover:border-primary/30 transition-all duration-300 shadow-xl"
              >
                {/* Event Cover Image */}
                <div className="aspect-video relative bg-black/45 flex items-center justify-center overflow-hidden border-b border-white/5">
                  {coverPhoto ? (
                    <>
                      <Image
                        src={coverPhoto}
                        alt={event.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 30vw"
                      />
                      {/* Watermark simulator overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-white/20 select-none -rotate-12 border border-white/5 px-2 py-0.5 rounded">
                          MOLDRA FILMS
                        </span>
                      </div>
                    </>
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-700" />
                  )}
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/75 backdrop-blur-sm border border-white/5 text-[9px] font-bold uppercase tracking-wider text-primary">
                    {event.photos.length} fotos
                  </div>
                </div>

                {/* Info and Navigation Body */}
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-sans">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {event.date}
                    </div>

                    <h3 className="text-base font-bold text-white font-display group-hover:text-primary transition-colors leading-snug">
                      {event.name}
                    </h3>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-bold mb-0.5">Avulsa</span>
                        <span className="text-white font-bold">R$ {event.pricePerPhoto},00 <span className="text-[10px] text-gray-500 font-light">/ un</span></span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 block text-[9px] uppercase font-bold mb-0.5">Pacote Completo</span>
                        <span className="text-primary font-bold">R$ {event.packagePrice},00</span>
                      </div>
                    </div>

                    <Link
                      href={`/eventos/${event.id}`}
                      className="w-full py-3 bg-white/5 hover:bg-primary border border-white/5 hover:border-primary text-gray-300 hover:text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 group/btn"
                    >
                      Acessar Galeria
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {eventMedias.length === 0 && (
            <div className="col-span-full py-24 text-center border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-4">
              <Camera className="w-10 h-10 text-gray-700" />
              <div>
                <span className="block font-bold text-white mb-1">Nenhum evento ativo</span>
                <span className="block text-gray-500 text-xs font-light">Atualmente não há eventos cadastrados para venda de fotos.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-16 border-t border-white/5 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Moldra Films. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
