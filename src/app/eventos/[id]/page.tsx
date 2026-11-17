"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdmin, EventPhoto } from "@/context/AdminContext";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, ShoppingCart, Info, Eye, Download, ShieldCheck, X, QrCode, Copy, Tag, Gift, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function EventGalleryContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = Number(params.id);
  
  const { eventMedias } = useAdmin();
  const event = eventMedias.find((e) => e.id === eventId);

  // States
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [buyAllPackage, setBuyAllPackage] = useState(false);
  const [activePhoto, setActivePhoto] = useState<EventPhoto | null>(null);
  
  // Checkout States
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [deliveredFiles, setDeliveredFiles] = useState<{ id: string; name: string; url: string; thumbUrl?: string }[]>([]);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    description?: string;
  } | null>(null);

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

  // Asks the SERVER whether an order is paid. Only then are the original files released.
  const verifyOrder = React.useCallback(async (orderId: string, paymentId?: string) => {
    setVerifying(true);
    try {
      const res = await fetch("/api/photos/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentId }),
      });
      if (!res.ok) return "error" as const;
      const data = await res.json();
      if (data.paid) {
        setDeliveredFiles(data.files || []);
        setPendingOrderId(null);
        setPaymentNotice("");
        setPurchaseSuccess(true);
        return "paid" as const;
      }
      setPendingOrderId(orderId);
      return "pending" as const;
    } catch {
      return "error" as const;
    } finally {
      setVerifying(false);
    }
  }, []);

  // Restore access on this device: the order id saved at checkout is re-checked by the server.
  useEffect(() => {
    if (typeof window === "undefined" || !event) return;
    if (searchParams?.get("payment")) return; // handled by the redirect effect below
    const saved = localStorage.getItem(`moldra_order_${event.id}`);
    if (saved) verifyOrder(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id, searchParams]);

  // Handle Mercado Pago return (?payment=success|failure|pending&order=...&payment_id=...)
  useEffect(() => {
    if (typeof window === "undefined" || !searchParams || !event) return;

    const status = searchParams.get("payment");
    if (!status) return;

    const orderId = searchParams.get("order") || localStorage.getItem(`moldra_order_${event.id}`) || "";
    const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id") || undefined;

    // Clear URL parameters
    router.replace(window.location.pathname);

    if (status === "failure") {
      setPaymentNotice("O pagamento foi cancelado ou não pôde ser processado. Você pode tentar novamente.");
      return;
    }
    if (!orderId) {
      setPaymentNotice("Não encontramos o pedido deste pagamento. Fale com a Moldra Films informando o comprovante.");
      return;
    }

    localStorage.setItem(`moldra_order_${event.id}`, orderId);
    verifyOrder(orderId, paymentId).then((result) => {
      if (result === "pending") {
        setPaymentNotice("Seu pagamento está em análise. Assim que for aprovado, as fotos serão liberadas aqui. Use o botão abaixo para verificar.");
      } else if (result === "error") {
        setPaymentNotice("Não conseguimos confirmar o pagamento agora. Tente verificar novamente em instantes.");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, event?.id]);

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
  const isPackageAdvantageous = totalIndividualCount > 0 && event.packagePrice > 0 && priceIndividual >= event.packagePrice;
  
  const basePrice = buyAllPackage ? event.packagePrice : priceIndividual;

  // Calculate discount from applied coupon
  let discountAmount = 0;
  if (appliedCoupon && basePrice > 0) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.round((basePrice * (appliedCoupon.discountValue / 100)) * 100) / 100;
    } else {
      discountAmount = Math.min(basePrice, appliedCoupon.discountValue);
    }
  }
  const finalPrice = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);
  const isFree = (appliedCoupon?.discountValue === 100 || finalPrice === 0) && basePrice > 0;
  const checkoutItemsCount = buyAllPackage ? event.photos.length : totalIndividualCount;
  const activePurchaseMode = buyAllPackage ? "Pacote Completo" : "Fotos Individuais";

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), amount: basePrice }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setAppliedCoupon(null);
        setCouponError(data.error || "Cupom inválido ou expirado.");
      } else {
        setAppliedCoupon(data.coupon);
        setCouponError("");
      }
    } catch {
      setCouponError("Erro ao validar cupom.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleCheckout = async () => {
    if (checkoutItemsCount === 0) return;
    setCheckoutLoading(true);

    try {
      // The server computes the price from the database; we only say WHAT is being bought.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          mode: buyAllPackage ? "package" : "individual",
          photoIds: buyAllPackage ? [] : selectedPhotos,
          couponCode: appliedCoupon?.code,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const detailMsg = errorData.details ? `: ${errorData.details}` : "";
        throw new Error(`${errorData.error || "Checkout preferente falhou"}${detailMsg}`);
      }
      const data = await res.json();

      // Remember the order so access can be restored on this device after paying.
      if (data.orderId && typeof window !== "undefined") {
        localStorage.setItem(`moldra_order_${event.id}`, data.orderId);
      }

      // If 100% free via coupon, immediately deliver without Mercado Pago!
      if (data.free) {
        await verifyOrder(data.orderId);
        setPurchaseSuccess(true);
        return;
      }

      if (data.initPoint) {
        // Redirect to Mercado Pago checkout
        window.location.href = data.initPoint;
      } else {
        throw new Error("Link de checkout do Mercado Pago não recebido do servidor.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao processar o checkout: ${err.message || "Não foi possível iniciar o pagamento. Por favor, tente novamente ou contate o suporte."}`);
    } finally {
      setCheckoutLoading(false);
    }
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

        {(paymentNotice || pendingOrderId) && !purchaseSuccess && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary space-y-3">
            {paymentNotice && <p className="leading-relaxed">{paymentNotice}</p>}
            {pendingOrderId && (
              <button
                onClick={() => verifyOrder(pendingOrderId)}
                disabled={verifying}
                className="px-4 py-2 bg-primary text-black font-semibold rounded-lg uppercase tracking-wider text-[10px] cursor-pointer disabled:opacity-50"
              >
                {verifying ? "Verificando..." : "Já paguei — verificar pagamento"}
              </button>
            )}
          </div>
        )}

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
              {deliveredFiles.map((photo) => (
                <div key={photo.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg relative overflow-hidden shrink-0 border border-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.thumbUrl || photo.url} alt={photo.name} className="absolute inset-0 w-full h-full object-cover" />
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
                setDeliveredFiles([]);
                if (typeof window !== "undefined") {
                  localStorage.removeItem(`moldra_order_${event.id}`);
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
                        src={photo.thumbUrl || photo.url}
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
                      ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                      : "bg-black/30 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Pacote Promocional</span>
                      {buyAllPackage && (
                        <span className="px-1.5 py-0.5 bg-primary text-black text-[9px] font-bold rounded uppercase">Ativo</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white font-display">Álbum Completo (Todas as Fotos)</h4>
                    <p className="text-[10px] text-gray-400 font-light">Acesso a todas as {event.photos.length} fotos do evento</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-white block">R$ {event.packagePrice},00</span>
                    <span className="text-[9px] text-primary font-medium block">
                      {buyAllPackage ? "Pacote selecionado ✓" : "Selecionar pacote"}
                    </span>
                  </div>
                </div>

                {/* Selected Count Indicator */}
                {!buyAllPackage ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400 font-light">
                      <span>Fotos Selecionadas:</span>
                      <span className="text-white font-semibold font-mono">{totalIndividualCount} un</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-light">
                      <span>Valor por Foto:</span>
                      <span className="text-white font-semibold font-mono">R$ {event.pricePerPhoto},00</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-light pt-1 border-t border-white/5">
                      <span>Subtotal Avulso:</span>
                      <span className="text-white font-bold font-mono">R$ {priceIndividual},00</span>
                    </div>

                    {isPackageAdvantageous && (
                      <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 space-y-2 mt-2">
                        <div className="text-[11px] text-primary leading-relaxed">
                          💡 <strong>Você selecionou {totalIndividualCount} fotos (R$ {priceIndividual},00).</strong>
                          <p className="text-[10px] text-gray-300 mt-0.5">
                            O total das fotos avulsas ultrapassou o valor do pacote. Você pode optar pelo <strong>Álbum Completo com todas as {event.photos.length} fotos</strong> por apenas <strong>R$ {event.packagePrice},00</strong>!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBuyAllPackage(true)}
                          className="w-full py-2 bg-primary hover:bg-[#B39356] text-black font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                        >
                          <Check className="w-3.5 h-3.5" /> Pagar Pacote Completo (R$ {event.packagePrice},00)
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                    <div className="flex justify-between text-gray-300">
                      <span>Modalidade:</span>
                      <span className="text-primary font-bold">Álbum Completo</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span>Total de fotos inclusas:</span>
                      <span className="text-white font-mono">{event.photos.length} fotos</span>
                    </div>
                    <p className="text-[10px] text-gray-400 pt-1">
                      Todas as {event.photos.length} fotos serão liberadas em alta resolução após a confirmação do pagamento.
                    </p>
                    <button
                      type="button"
                      onClick={() => setBuyAllPackage(false)}
                      className="text-[10px] text-primary hover:underline pt-1 cursor-pointer block"
                    >
                      ← Mudar para seleção de fotos avulsas
                    </button>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-primary" /> Cupom de Desconto
                    </span>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[9px] text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        Remover cupom
                      </button>
                    )}
                  </div>

                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (couponError) setCouponError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Ex: VIP100"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase tracking-wider focus:outline-none focus:border-primary placeholder:text-gray-600 placeholder:normal-case"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim() || validatingCoupon}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
                      >
                        {validatingCoupon ? "..." : "Aplicar"}
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="font-mono font-bold">{appliedCoupon.code}</span>
                        <span className="text-[10px] text-gray-300">
                          ({appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}% OFF` : `R$ ${appliedCoupon.discountValue} OFF`})
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold text-xs">
                        -R$ {discountAmount.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[10px] text-red-400">{couponError}</p>
                  )}
                </div>

                {/* Pricing totals */}
                <div className="pt-4 border-t border-white/5 space-y-1.5">
                  {appliedCoupon && (
                    <>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Subtotal:</span>
                        <span className="font-mono">R$ {basePrice},00</span>
                      </div>
                      <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                        <span>Desconto ({appliedCoupon.code}):</span>
                        <span className="font-mono">-R$ {discountAmount.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs text-gray-400">Total a Pagar:</span>
                    <div className="text-right">
                      {isFree ? (
                        <span className="text-2xl font-bold font-display text-emerald-400">GRÁTIS (R$ 0,00)</span>
                      ) : (
                        <span className="text-2xl font-bold font-display text-primary">R$ {finalPrice},00</span>
                      )}
                      <span className="block text-[9px] text-gray-500 font-sans uppercase tracking-wider mt-0.5">
                        Faturamento via {activePurchaseMode} ({checkoutItemsCount} fotos)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trigger Payment Button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutItemsCount === 0 || checkoutLoading}
                  className={`w-full py-3.5 font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
                    isFree
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                      : "bg-primary hover:bg-[#B39356] text-black shadow-primary/20"
                  }`}
                >
                  {isFree ? (
                    <>
                      <Gift className="w-4 h-4 shrink-0" />
                      {checkoutLoading ? "Liberando fotos..." : "Liberar Fotos Gratuitamente"}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 shrink-0" />
                      {checkoutLoading ? "Processando..." : `Pagar R$ ${finalPrice},00 via Mercado Pago`}
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Lightbox Image Preview Modal */}
      <AnimatePresence>
        {activePhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePhoto(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-6xl h-[85vh] sm:h-[90vh] rounded-2xl overflow-hidden shadow-2xl z-10 border border-white/10 bg-black/95 flex items-center justify-center"
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
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black/95 rounded-full border border-white/15 hover:border-primary text-gray-300 hover:text-white transition-all cursor-pointer z-20 group"
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
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 bg-black/70 hover:bg-black/95 rounded-full border border-white/15 hover:border-primary text-gray-300 hover:text-white transition-all cursor-pointer z-20 group"
                title="Próxima foto"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/70 hover:bg-black/95 rounded-full border border-white/15 hover:border-primary text-gray-300 hover:text-white transition-all cursor-pointer z-20"
                title="Fechar visualização"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Footer Indicator & Selection Action */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 z-20">
                <span className="px-3.5 py-2 rounded-xl bg-black/80 backdrop-blur-md text-xs text-gray-300 border border-white/10 font-mono truncate max-w-[200px] sm:max-w-xs">
                  {activePhoto.name}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectPhoto(activePhoto.id);
                  }}
                  disabled={buyAllPackage}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border shadow-lg ${
                    buyAllPackage
                      ? "bg-primary/20 text-primary border-primary/30 cursor-not-allowed opacity-80"
                      : selectedPhotos.includes(activePhoto.id)
                      ? "bg-primary text-black border-primary shadow-primary/20"
                      : "bg-black/80 hover:bg-black text-white border-white/20 hover:border-primary"
                  }`}
                >
                  {buyAllPackage ? (
                    <>
                      <Check className="w-4 h-4" /> Pacote Ativo
                    </>
                  ) : selectedPhotos.includes(activePhoto.id) ? (
                    <>
                      <Check className="w-4 h-4" /> Selecionada
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Selecionar Foto
                    </>
                  )}
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
