"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdmin, EventPhoto } from "@/context/AdminContext";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, ShoppingCart, Info, Eye, Download, ShieldCheck, X, QrCode, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function EventGalleryContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = Number(params.id);
  
  const { eventMedias, addNotification, addTransaction } = useAdmin();
  const event = eventMedias.find((e) => e.id === eventId);

  // States
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [buyAllPackage, setBuyAllPackage] = useState(false);
  const [activePhoto, setActivePhoto] = useState<EventPhoto | null>(null);
  
  // Checkout States
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  // Anti-Right-Click protection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Window Focus/Blur listeners for screenshot protection
  useEffect(() => {
    const handleBlur = () => setIsWindowFocused(false);
    const handleFocus = () => setIsWindowFocused(true);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Keyboard Arrow controls for Lightbox
  useEffect(() => {
    if (!activePhoto || !event) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        const currentIndex = event.photos.findIndex((p) => p.id === activePhoto.id);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + event.photos.length) % event.photos.length;
          setActivePhoto(event.photos[prevIndex]);
        }
      } else if (e.key === "ArrowRight") {
        const currentIndex = event.photos.findIndex((p) => p.id === activePhoto.id);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % event.photos.length;
          setActivePhoto(event.photos[nextIndex]);
        }
      } else if (e.key === "Escape") {
        setActivePhoto(null);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto, event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-xl font-bold font-display">Galeria não encontrada</h1>
        <p className="text-xs text-gray-500">O evento solicitado não existe ou foi removido.</p>
        <Link href="/eventos" className="px-4 py-2 bg-primary text-black font-semibold rounded-xl text-xs uppercase tracking-wider">
          Voltar aos Eventos
        </Link>
      </div>
    );
  }

  const toggleSelectPhoto = (photoId: string) => {
    if (buyAllPackage) return; // Locked to all
    setSelectedPhotos((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  // Pricing calculations
  const totalIndividualCount = selectedPhotos.length;
  const priceIndividual = totalIndividualCount * event.pricePerPhoto;
  const isPackageCheaper = priceIndividual >= event.packagePrice;
  
  // Final checkout variables
  const finalPrice = buyAllPackage || isPackageCheaper ? event.packagePrice : priceIndividual;
  const checkoutItemsCount = buyAllPackage || isPackageCheaper ? event.photos.length : totalIndividualCount;
  const activePurchaseMode = buyAllPackage || isPackageCheaper ? "Pacote Completo" : "Individual";

  // Load purchase state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && event) {
      const savedPurchased = localStorage.getItem(`purchased_photos_${event.id}`);
      if (savedPurchased) {
        try {
          const parsed = JSON.parse(savedPurchased);
          if (parsed === "all") {
            setBuyAllPackage(true);
            setPurchaseSuccess(true);
          } else if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedPhotos(parsed);
            setPurchaseSuccess(true);
          }
        } catch (e) {
          console.error("Erro ao analisar compras salvas:", e);
        }
      }
    }
  }, [event]);

  // Handle Mercado Pago query parameter redirects
  useEffect(() => {
    if (typeof window === "undefined" || !searchParams || !event) return;

    const paymentStatus = searchParams.get("payment");
    if (!paymentStatus) return;

    const pendingKey = `pending_purchase_${event.id}`;
    const pendingData = localStorage.getItem(pendingKey);

    if (paymentStatus === "success") {
      if (pendingData) {
        try {
          const { selectedPhotos: savedPhotos, buyAllPackage: savedBuyAll, finalPrice: savedPrice, checkoutItemsCount: savedCount } = JSON.parse(pendingData);
          
          setSelectedPhotos(savedPhotos);
          setBuyAllPackage(savedBuyAll);
          setPurchaseSuccess(true);

          // Save purchase permanently on this device
          localStorage.setItem(`purchased_photos_${event.id}`, JSON.stringify(savedBuyAll ? "all" : savedPhotos));

          // Log transaction in context
          addTransaction({
            type: "Receita",
            category: "Galeria de Fotos",
            value: savedPrice,
            date: new Date().toISOString().split("T")[0],
            description: `Compra de fotos via Mercado Pago - Evento ${event.name} (${savedCount} fotos)`,
            status: "Pago",
            customer: `Cliente - Evento ${event.name}`
          });

          // Add notifications
          addNotification(
            "Compra Aprovada via Mercado Pago",
            `Faturamento de R$ ${savedPrice.toLocaleString()},00 confirmado para o evento '${event.name}'.`,
            "payment"
          );
        } catch (e) {
          console.error("Erro ao analisar dados da compra pendente:", e);
          setPurchaseSuccess(true);
        }
      } else {
        setPurchaseSuccess(true);
      }
    } else if (paymentStatus === "failure") {
      addNotification(
        "Pagamento Cancelado / Falhou",
        `A tentativa de compra no evento '${event.name}' não foi concluída.`,
        "payment"
      );
      alert("O pagamento via Mercado Pago foi cancelado ou não pôde ser processado. Por favor, tente novamente.");
    } else if (paymentStatus === "pending") {
      addNotification(
        "Pagamento Pendente",
        `O pagamento do evento '${event.name}' está em análise pelo Mercado Pago.`,
        "payment"
      );
      alert("Seu pagamento está pendente de processamento pelo Mercado Pago. Assim que for aprovado, o acesso às fotos será liberado.");
    }

    // Clean up
    localStorage.removeItem(pendingKey);
    
    // Clear URL parameters
    const cleanUrl = window.location.pathname;
    router.replace(cleanUrl);
  }, [searchParams, event, router, addTransaction, addNotification]);

  const handleCheckout = async () => {
    if (checkoutItemsCount === 0) return;
    setCheckoutLoading(true);

    try {
      const items = buyAllPackage || isPackageCheaper
        ? [{ title: `Pacote Completo de Fotos - ${event.name}`, quantity: 1, unit_price: event.packagePrice }]
        : selectedPhotos.map((id) => {
            const p = event.photos.find((ph) => ph.id === id);
            return {
              title: `Foto ${p?.name || "Avulsa"} - ${event.name}`,
              quantity: 1,
              unit_price: event.pricePerPhoto
            };
          });

      // Save purchase information in localStorage before redirecting
      if (typeof window !== "undefined") {
        localStorage.setItem(`pending_purchase_${event.id}`, JSON.stringify({
          selectedPhotos,
          buyAllPackage,
          finalPrice,
          checkoutItemsCount,
          activePurchaseMode
        }));
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, eventId: event.id }),
      });

      if (!res.ok) throw new Error("Checkout preferente falhou");
      const data = await res.json();

      if (data.initPoint) {
        // Redirect to Mercado Pago checkout
        window.location.href = data.initPoint;
      } else if (data.simulatedPix) {
        // Show QR Code Pix modal simulator
        setPixCode(data.simulatedPix);
        setShowPixModal(true);
      }
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao processar o checkout. Iniciando simulação de PIX offline.");
      setPixCode("00020101021226870014br.gov.bcb.pix2565pix.mercado-pago.com.br/qr/v2/mock-moldrafilms-pix-payment");
      setShowPixModal(true);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSimulatePaymentApproval = () => {
    setPurchaseSuccess(true);
    setShowPixModal(false);

    // Save purchase permanently
    if (typeof window !== "undefined") {
      localStorage.setItem(`purchased_photos_${event.id}`, JSON.stringify(buyAllPackage ? "all" : selectedPhotos));
    }

    // Add transaction to context
    addTransaction({
      type: "Receita",
      category: "Galeria de Fotos",
      value: finalPrice,
      date: new Date().toISOString().split("T")[0],
      description: `Compra de fotos (PIX Simulado) - Evento ${event.name} (${checkoutItemsCount} fotos)`,
      status: "Pago",
      customer: `Cliente - Evento ${event.name}`
    });

    addNotification("Compra Aprovada!", `Pagamento do evento '${event.name}' realizado com sucesso via PIX simulado.`, "payment");
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary/20 relative overflow-hidden py-12 px-6">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-10">
        
        {/* Navigation / Header */}
        <div className="flex justify-between items-center pb-6 border-b border-white/5">
          <Link href="/eventos" className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors uppercase tracking-widest font-bold">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Eventos
          </Link>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Moldra Films Logo"
              width={110}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Purchase Success State */}
        {purchaseSuccess ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center max-w-2xl mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto text-green-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display uppercase tracking-wider text-green-400">Pagamento Aprovado!</h2>
              <p className="text-xs text-gray-300 font-light leading-relaxed">
                Obrigado por sua compra. Abaixo estão liberados os links originais em alta resolução (sem marca d'água) para download.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-6 border-t border-white/5">
              {(buyAllPackage || isPackageCheaper ? event.photos : event.photos.filter((p) => selectedPhotos.includes(p.id))).map((photo) => (
                <div key={photo.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg relative overflow-hidden shrink-0 border border-white/5">
                      <Image src={photo.url} alt={photo.name} fill className="object-cover" />
                    </div>
                    <span className="text-[11px] text-gray-300 truncate font-mono">{photo.name}</span>
                  </div>
                  <a
                    href={photo.url}
                    download={photo.name}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-primary hover:bg-[#B39356] text-black rounded-lg cursor-pointer transition-colors"
                    title="Baixar Foto Original"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setPurchaseSuccess(false);
                setSelectedPhotos([]);
                setBuyAllPackage(false);
                if (typeof window !== "undefined") {
                  localStorage.removeItem(`purchased_photos_${event.id}`);
                }
              }}
              className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-colors cursor-pointer"
            >
              Comprar mais fotos
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery Section */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <span className="text-primary uppercase tracking-[0.2em] text-[10px] font-semibold">
                  Galeria de Evento
                </span>
                <h1 className="text-2xl sm:text-4xl font-bold font-display uppercase tracking-wider text-white">
                  {event.name}
                </h1>
                <p className="text-xs text-gray-500 font-light flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" /> Clique nas fotos para pré-visualizar em tamanho maior.
                </p>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {event.photos.map((photo) => {
                  const isSelected = selectedPhotos.includes(photo.id) || buyAllPackage;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => toggleSelectPhoto(photo.id)}
                      className={`group aspect-square relative rounded-2xl overflow-hidden border transition-all duration-300 bg-black/40 ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 scale-[0.98]"
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                        loading="lazy"
                      />
                      
                      {/* Repeating watermark grid overlay */}
                      <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center select-none overflow-hidden">
                        <span className="text-[9px] uppercase font-mono font-bold tracking-[0.25em] text-white/20 -rotate-12 border border-white/5 px-2 py-0.5 rounded">
                          MOLDRA FILMS
                        </span>
                      </div>

                      {/* Selector indicator */}
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary border-primary text-black"
                          : "bg-black/50 border-white/20 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      {/* Lightbox Trigger button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhoto(photo);
                        }}
                        className="absolute bottom-3 right-3 p-2.5 bg-black/85 backdrop-blur-sm border border-primary/40 hover:border-primary text-primary hover:text-white rounded-xl transition-all cursor-pointer shadow-lg z-10 flex items-center justify-center transform active:scale-95"
                        title="Ver ampliação"
                      >
                        <Eye className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  );
                })}

                {event.photos.length === 0 && (
                  <div className="col-span-full py-24 text-center text-xs text-gray-500 font-sans">
                    Nenhuma foto cadastrada nesta galeria ainda.
                  </div>
                )}
              </div>
            </div>

            {/* Shopping Cart Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Resumo do Pedido</h3>

              <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
                
                {/* Package Deal Toggle */}
                <div
                  onClick={() => setBuyAllPackage(!buyAllPackage)}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                    buyAllPackage
                      ? "bg-primary/5 border-primary"
                      : "bg-black/30 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Oportunidade</span>
                    <h4 className="text-xs font-bold text-white font-display">Pacote de Fotos Completo</h4>
                    <p className="text-[9px] text-gray-400 font-light">Todas as {event.photos.length} fotos do evento</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">R$ {event.packagePrice},00</span>
                    <span className="text-[9px] text-gray-500 block">Lote Completo</span>
                  </div>
                </div>

                {/* Selected Count Indicator */}
                {!buyAllPackage && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400 font-light">
                      <span>Fotos Selecionadas:</span>
                      <span className="text-white font-semibold font-mono">{totalIndividualCount} un</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-light">
                      <span>Valor Unitário:</span>
                      <span className="text-white font-semibold font-mono">R$ {event.pricePerPhoto},00</span>
                    </div>

                    {isPackageCheaper && (
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[10px] text-primary font-sans leading-normal">
                        <strong>Dica de Economia:</strong> A compra avulsa destas fotos supera o preço do pacote. O valor foi fixado no preço promocional de <strong>R$ {event.packagePrice},00</strong>.
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing totals */}
                <div className="pt-4 border-t border-white/5 flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Total Geral:</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-display text-primary">R$ {finalPrice},00</span>
                    <span className="block text-[9px] text-gray-500 font-sans uppercase tracking-wider mt-0.5">
                      Faturamento via {activePurchaseMode} ({checkoutItemsCount} fotos)
                    </span>
                  </div>
                </div>

                {/* Trigger Payment Button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutItemsCount === 0 || checkoutLoading}
                  className="w-full py-3.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  {checkoutLoading ? "Processando..." : `Pagar via Mercado Pago`}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Lightbox Image Preview Modal */}
      <AnimatePresence>
        {activePhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePhoto(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-3xl aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden shadow-2xl z-10 border border-white/5 bg-black"
            >
              {/* Image box */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.url}
                alt={activePhoto.name}
                draggable="false"
                className={`w-full h-full object-contain pointer-events-none select-none transition-all duration-300 ${
                  !isWindowFocused ? "blur-3xl opacity-20 scale-95" : ""
                }`}
                style={{ WebkitUserDrag: "none" } as any}
              />

              {/* Focus Loss Protection Overlay (Screenshot blur blocker) */}
              {!isWindowFocused && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-30">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary mb-3">
                    <ShieldCheck className="w-8 h-8 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Captura Ocultada</h4>
                  <p className="text-[9px] text-gray-400 mt-1.5 max-w-[200px] leading-relaxed">
                    A visualização foi temporariamente ocultada para proteção de direitos autorais.
                  </p>
                </div>
              )}

              {/* Giant Repeating protective watermark grid */}
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10">
                {/* Fine diagonal mesh pattern overlay (highly disrupts AI inpainting tools) */}
                <div 
                  className="absolute inset-0 opacity-[0.22]"
                  style={{
                    backgroundImage: `
                      repeating-linear-gradient(45deg, rgba(200, 169, 106, 0.2) 0px, rgba(200, 169, 106, 0.2) 1px, transparent 1px, transparent 24px),
                      repeating-linear-gradient(-45deg, rgba(200, 169, 106, 0.2) 0px, rgba(200, 169, 106, 0.2) 1px, transparent 1px, transparent 24px)
                    `
                  }}
                />

                {/* Central prominent logo watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <span className="text-4xl sm:text-6xl font-extrabold tracking-[0.25em] text-white border-4 border-white px-6 py-2 rounded-2xl select-none -rotate-12 uppercase font-display">
                    MOLDRA
                  </span>
                </div>

                {/* Repeating warning lines */}
                <div className="absolute inset-0 flex flex-col justify-around py-16">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex justify-around opacity-[0.10] text-white text-[10px] sm:text-sm font-mono font-extrabold tracking-widest -rotate-12 select-none uppercase">
                      <span>MOLDRA FILMS PRÉ-VISUALIZAÇÃO</span>
                      <span className="hidden sm:inline">MOLDRA FILMS PRÉ-VISUALIZAÇÃO</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left Arrow Navigation Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = event.photos.findIndex((p) => p.id === activePhoto.id);
                  if (currentIndex !== -1) {
                    const prevIndex = (currentIndex - 1 + event.photos.length) % event.photos.length;
                    setActivePhoto(event.photos[prevIndex]);
                  }
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/95 rounded-full border border-white/10 hover:border-primary text-gray-400 hover:text-white transition-colors cursor-pointer z-20 group"
                title="Foto anterior"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Right Arrow Navigation Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = event.photos.findIndex((p) => p.id === activePhoto.id);
                  if (currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % event.photos.length;
                    setActivePhoto(event.photos[nextIndex]);
                  }
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/95 rounded-full border border-white/10 hover:border-primary text-gray-400 hover:text-white transition-colors cursor-pointer z-20 group"
                title="Próxima foto"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/95 rounded-full border border-white/10 hover:border-primary text-gray-400 hover:text-white transition-colors cursor-pointer z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Footer Indicator info */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-sm text-[10px] text-gray-400 border border-white/5 font-mono">
                  {activePhoto.name} (Protegido por Direitos Autorais)
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated PIX QR Code Checkout Modal (Offline Fallback/Sandbox Demo) */}
      <AnimatePresence>
        {showPixModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPixModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-sm bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative z-10 text-center p-6 space-y-6"
            >
              {/* Header */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Pagamento via PIX</h3>
                <p className="text-[10px] text-gray-500 font-sans">Homologação de Checkout & Simulação</p>
              </div>

              {/* Price Details */}
              <div className="py-3 bg-black/35 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 block mb-0.5 font-light">Valor a pagar:</span>
                <span className="text-xl font-bold font-display text-primary">R$ {finalPrice},00</span>
              </div>

              {/* QR Code Container */}
              <div className="w-48 h-48 bg-white rounded-xl p-3 mx-auto flex items-center justify-center relative overflow-hidden group shadow-lg border border-white/10">
                <QrCode className="w-full h-full text-black stroke-[1.5]" />
                {/* Fake overlay PIX logo center */}
                <div className="absolute w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[8px] text-black">
                  PIX
                </div>
              </div>

              {/* PIX Copy Code Row */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-gray-500 block text-left">Código PIX Copia e Cola</span>
                <div className="flex bg-black/45 border border-white/10 rounded-xl p-2 items-center justify-between gap-4">
                  <span className="text-[9px] text-gray-400 font-mono truncate flex-1 text-left select-all">{pixCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pixCode);
                      alert("Código PIX copiado!");
                    }}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-primary border border-white/5 rounded-lg cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Simulator Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleSimulatePaymentApproval}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Simular Aprovação (Liberar Fotos)
                </button>
                
                <button
                  onClick={() => setShowPixModal(false)}
                  className="w-full py-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-transparent hover:border-white/5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancelar Pagamento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print protection injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { display: none !important; }
        }
      `}} />
    </div>
  );
}

export default function EventGalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-bg text-white flex items-center justify-center text-xs text-gray-400">Carregando galeria...</div>}>
      <EventGalleryContent />
    </Suspense>
  );
}
