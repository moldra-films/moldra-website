"use client";

import React, { useState } from "react";
import { useAdmin, EventMedia, EventPhoto } from "@/context/AdminContext";
import { Camera, Plus, Calendar, DollarSign, Trash2, UploadCloud, X, CheckCircle2, Image as ImageIcon, Eye, Pencil, Tag, Gift, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function EventMediaTab() {
  const { eventMedias, addEventMedia, deleteEventMedia, addPhotosToEvent, deletePhotoFromEvent, updateEventMedia, transactions, deleteTransaction, confirmModal } = useAdmin();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Filter transactions for photo sales
  const photoSales = transactions.filter((t) => t.category === "Galeria de Fotos");

  // New Event Form state
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    pricePerPhoto: 15,
    packagePrice: 199,
    coverUrl: "",
    coverPosition: 50,
  });
  const [uploadingCover, setUploadingCover] = useState(false);

  // Edit Event Form state
  const [editingEvent, setEditingEvent] = useState<EventMedia | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    date: "",
    pricePerPhoto: 15,
    packagePrice: 199,
    coverUrl: "",
    coverPosition: 50,
  });

  const handleOpenEdit = (event: EventMedia, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingEvent(event);
    setEditForm({
      name: event.name,
      date: event.date,
      pricePerPhoto: event.pricePerPhoto,
      packagePrice: event.packagePrice,
      coverUrl: event.coverUrl || "",
      coverPosition: typeof event.coverPosition === "number" ? event.coverPosition : 50,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editForm.name || !editForm.date) return;
    updateEventMedia(editingEvent.id, {
      name: editForm.name,
      date: editForm.date,
      pricePerPhoto: Number(editForm.pricePerPhoto),
      packagePrice: Number(editForm.packagePrice),
      coverUrl: editForm.coverUrl || "",
      coverPosition: Number(editForm.coverPosition ?? 50),
    });
    setShowEditModal(false);
    setEditingEvent(null);
  };

  // Coupons Management State
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponMsg, setCouponMsg] = useState("");
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 100,
    description: "",
  });

  const loadCoupons = async () => {
    setLoadingCoupons(true);
    setCouponMsg("");
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCouponsList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      if (res.ok) {
        setCouponMsg("Cupom criado com sucesso!");
        setNewCoupon({ code: "", discountType: "percentage", discountValue: 100, description: "" });
        loadCoupons();
      } else {
        const err = await res.json();
        setCouponMsg(err.error || "Erro ao criar cupom.");
      }
    } catch {
      setCouponMsg("Erro ao criar cupom.");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadCoupons();
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  // Upload States
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedEvent = eventMedias.find((e) => e.id === selectedEventId);

  const handleUploadCover = async (file: File, isEdit: boolean) => {
    try {
      setUploadingCover(true);
      let processedFile = file;
      if (file.type.startsWith("image/")) {
        processedFile = await compressImage(file, 1600, 1600, 0.85);
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `capa-${Date.now()}-${file.name}`,
          fileType: file.type,
          folder: "capas",
        }),
      });
      if (!res.ok) throw new Error("Falha ao obter URL de upload");
      const { uploadUrl, fileUrl } = await res.json();
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: processedFile,
      });
      if (!uploadRes.ok) throw new Error("Falha no upload direto da capa");

      if (isEdit) {
        setEditForm((prev) => ({ ...prev, coverUrl: fileUrl }));
      } else {
        setNewEvent((prev) => ({ ...prev, coverUrl: fileUrl }));
      }
    } catch (err) {
      console.error("Erro ao subir capa:", err);
      alert("Erro ao fazer upload da imagem de capa. Tente novamente.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) return;
    addEventMedia({
      name: newEvent.name,
      date: newEvent.date,
      pricePerPhoto: Number(newEvent.pricePerPhoto),
      packagePrice: Number(newEvent.packagePrice),
      coverUrl: newEvent.coverUrl || undefined,
      coverPosition: Number(newEvent.coverPosition ?? 50),
    });
    setNewEvent({ name: "", date: "", pricePerPhoto: 15, packagePrice: 199, coverUrl: "", coverPosition: 50 });
    setShowCreateModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFileFromQueue = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const compressImage = (file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleUploadPhotos = async () => {
    if (!selectedEventId || uploadFiles.length === 0) return;
    setUploading(true);

    const uploadedPhotos: Omit<EventPhoto, "id">[] = [];

    for (let i = 0; i < uploadFiles.length; i++) {
      let file = uploadFiles[i];
      const fileKey = `${file.name}-${i}`;
      setUploadProgress((prev) => ({ ...prev, [fileKey]: 5 })); // Iniciar compressão

      try {
        if (file.type.startsWith("image/")) {
          file = await compressImage(file, 1600, 1600, 0.85);
        }
        setUploadProgress((prev) => ({ ...prev, [fileKey]: 15 })); // Uploading stage

        // Step 1: Request presigned URL from API route
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!res.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, fileUrl } = await res.json();
        setUploadProgress((prev) => ({ ...prev, [fileKey]: 50 }));

        // Step 2: Upload direct to R2
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) throw new Error("Failed direct upload");
        setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));

        uploadedPhotos.push({
          url: fileUrl,
          name: file.name,
        });
      } catch (err) {
        console.error(`Upload error for ${file.name}:`, err);
        setUploadProgress((prev) => ({ ...prev, [fileKey]: -1 })); // Error
      }
    }

    if (uploadedPhotos.length > 0) {
      addPhotosToEvent(selectedEventId, uploadedPhotos);
    }

    // Clean queue
    setUploadFiles([]);
    setUploading(false);
    setUploadProgress({});
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">Mídias de Eventos (Fotografia)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Publique galerias de fotos de eventos com marca d'água automática para venda on-line.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadCoupons();
              setShowCouponsModal(true);
            }}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10 hover:border-primary/30"
          >
            <Tag className="w-4 h-4 text-primary" />
            Cupons de Desconto
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      </div>

      {/* Main Grid: Event List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Events Directory */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Diretório de Eventos</h3>

          <div className="space-y-3">
            {eventMedias.map((event) => {
              const isSelected = selectedEventId === event.id;
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? "bg-primary/5 border-primary"
                      : "bg-dark-card border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {event.coverUrl || (event.photos && event.photos[0]) ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0 border border-white/10 bg-black/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={event.coverUrl || event.photos[0].url}
                            alt=""
                            style={{ objectPosition: `center ${event.coverPosition ?? 50}%` }}
                            className="w-full h-full object-cover"
                          />
                          {event.coverUrl && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-black" title="Capa personalizada definida" />
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-600">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-white font-display truncate max-w-[170px]">
                          {event.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" /> {event.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleOpenEdit(event, e)}
                        className="p-1.5 bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-primary rounded-lg border border-white/5 transition-colors cursor-pointer"
                        title="Editar Informações do Evento"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmModal({
                            title: "Excluir Galeria de Evento",
                            message: `Tem certeza que deseja remover o evento "${event.name}" e todas as suas fotos?`,
                            confirmText: "Excluir Evento",
                            variant: "danger",
                            onConfirm: () => {
                              deleteEventMedia(event.id);
                              if (selectedEventId === event.id) setSelectedEventId(null);
                            },
                          });
                        }}
                        className="p-1.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg border border-white/5 transition-colors cursor-pointer"
                        title="Deletar Evento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-gray-400">
                    <span>{event.photos.length} Fotos</span>
                    <span className="text-primary font-bold">R$ {event.pricePerPhoto}/foto</span>
                  </div>
                </div>
              );
            })}

            {eventMedias.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-2xl">
                Nenhum evento fotográfico cadastrado.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Event Media Manager */}
        <div className="lg:col-span-8 space-y-6">
          {selectedEvent ? (
            <div className="space-y-6">
              {/* Event Details Card */}
              <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Editar Galeria: {selectedEvent.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(selectedEvent)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-xs font-semibold rounded-lg border border-primary/20 text-primary hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Editar Informações
                    </button>
                    <a
                      href={`/eventos/${selectedEvent.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 text-xs font-semibold rounded-lg border border-white/5 hover:border-primary/20 text-gray-400 hover:text-white flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver Loja Pública
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block mb-1">Preço p/ Foto</span>
                    <span className="font-bold text-white text-sm">R$ {selectedEvent.pricePerPhoto},00</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Preço Pacote</span>
                    <span className="font-bold text-white text-sm">R$ {selectedEvent.packagePrice},00</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Total de Fotos</span>
                    <span className="font-bold text-white text-sm">{selectedEvent.photos.length} un</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Data Evento</span>
                    <span className="font-bold text-white text-sm">{selectedEvent.date}</span>
                  </div>
                </div>

                {/* Event Cover Status row */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {selectedEvent.coverUrl ? (
                      <>
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-primary/40 bg-black/40 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedEvent.coverUrl}
                            alt="Capa"
                            style={{ objectPosition: `center ${selectedEvent.coverPosition ?? 50}%` }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
                            <Star className="w-3 h-3 fill-primary" /> Capa Ativa do Evento
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Enquadramento: {selectedEvent.coverPosition ?? 50}% vertical • exibida no site
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                        <span>Nenhuma capa específica definida (o site exibe a 1ª foto da galeria).</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(selectedEvent)}
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      {selectedEvent.coverUrl ? "Ajustar / Trocar Capa" : "Adicionar Capa"}
                    </button>
                    {selectedEvent.coverUrl && (
                      <button
                        onClick={() => updateEventMedia(selectedEvent.id, { coverUrl: "" })}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Uploader Section */}
              <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-primary" /> Carregar Fotos
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Selector Box */}
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/30 transition-all cursor-pointer relative bg-black/20 group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <UploadCloud className="w-10 h-10 text-gray-500 group-hover:text-primary transition-colors mb-3" />
                    <span className="text-xs font-bold text-gray-300 font-sans">Escolher fotos do evento...</span>
                    <span className="text-[10px] text-gray-500 mt-1">Upload múltiplo suportado</span>
                  </div>

                  {/* Upload Queue Box */}
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3 h-48 overflow-y-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Fila de Upload ({uploadFiles.length} arquivos)
                    </span>
                    <div className="space-y-2">
                      {uploadFiles.map((file, idx) => {
                        const fileKey = `${file.name}-${idx}`;
                        const prog = uploadProgress[fileKey];
                        return (
                          <div key={idx} className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5 gap-4">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <ImageIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-[10px] text-gray-300 truncate font-mono">{file.name}</span>
                            </div>
                            
                            {prog !== undefined ? (
                              <span className={`text-[10px] font-bold ${prog === 100 ? "text-green-400" : prog === -1 ? "text-red-400" : "text-primary"}`}>
                                {prog === 100 ? "Pronto" : prog === -1 ? "Erro" : `${prog}%`}
                              </span>
                            ) : (
                              <button
                                onClick={() => removeFileFromQueue(idx)}
                                className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {uploadFiles.length === 0 && (
                        <div className="text-center py-10 text-[10px] text-gray-600 font-sans">Fila vazia</div>
                      )}
                    </div>
                  </div>
                </div>

                {uploadFiles.length > 0 && !uploading && (
                  <button
                    onClick={handleUploadPhotos}
                    className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Enviar Todas as Fotos para R2
                  </button>
                )}

                {uploading && (
                  <div className="text-center py-2 text-xs text-primary font-bold uppercase tracking-widest animate-pulse">
                    Enviando mídias para Cloudflare R2...
                  </div>
                )}
              </div>

              {/* Photos Gallery */}
              <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                  Fotos Cadastradas ({selectedEvent.photos.length})
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedEvent.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square relative rounded-xl overflow-hidden border border-white/5 group bg-black/40"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                      
                      {/* Watermark simulator overlay */}
                      <div className="absolute inset-0 bg-black/30 pointer-events-none flex items-center justify-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/20 select-none -rotate-12 border border-white/10 px-2 py-0.5 rounded">
                          MOLDRA FILMS
                        </span>
                      </div>

                      {/* Definir como Capa button */}
                      <button
                        onClick={() => {
                          const isCurrentlyCover = selectedEvent.coverUrl === photo.url;
                          updateEventMedia(selectedEvent.id, {
                            coverUrl: isCurrentlyCover ? "" : photo.url,
                          });
                        }}
                        className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer z-10 ${
                          selectedEvent.coverUrl === photo.url
                            ? "bg-primary text-black shadow-lg opacity-100 ring-2 ring-primary/40"
                            : "bg-black/75 hover:bg-primary/20 text-white/80 hover:text-white opacity-0 group-hover:opacity-100"
                        }`}
                        title={selectedEvent.coverUrl === photo.url ? "Clique para remover como capa" : "Definir esta foto como capa do evento"}
                      >
                        <Star className={`w-3 h-3 ${selectedEvent.coverUrl === photo.url ? "fill-black" : ""}`} />
                        <span>{selectedEvent.coverUrl === photo.url ? "Capa" : "Capa"}</span>
                      </button>

                      <button
                        onClick={() => {
                          confirmModal({
                            title: "Excluir Foto",
                            message: "Tem certeza que deseja excluir esta foto do evento?",
                            confirmText: "Excluir Foto",
                            variant: "danger",
                            onConfirm: () => {
                              deletePhotoFromEvent(selectedEvent.id, photo.id);
                            },
                          });
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Deletar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {selectedEvent.photos.length === 0 && (
                    <div className="col-span-full py-16 text-center text-xs text-gray-500 font-sans">
                      Nenhuma foto enviada para este evento ainda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-gray-500 border border-white/5 rounded-2xl bg-dark-card flex flex-col items-center justify-center space-y-4">
              <Camera className="w-8 h-8 text-gray-600" />
              <div>
                <span className="block font-bold text-white mb-1">Gerenciador de Mídias</span>
                <span className="block text-gray-500 font-light">Selecione ou crie um evento fotográfico à esquerda para fazer upload e gerenciar as fotos.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Sales Ledger Section */}
      <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Histórico de Pedidos & Faturamento (Mercado Pago)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Vendas confirmadas automaticamente via Mercado Pago na galeria pública de fotos de eventos.
          </p>
        </div>

        {/* Sales Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-black/35 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-sans">Vendas Realizadas</span>
            <span className="text-xl font-bold text-white block mt-1 font-mono">{photoSales.length} un</span>
          </div>
          <div className="p-4 rounded-xl bg-black/35 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-sans">Ticket Médio</span>
            <span className="text-xl font-bold text-primary block mt-1 font-mono">
              R$ {photoSales.length > 0 ? Math.round(photoSales.reduce((sum, s) => sum + s.value, 0) / photoSales.length) : 0},00
            </span>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">Faturamento Total</span>
            <span className="text-xl font-bold text-primary block mt-1 font-mono">
              R$ {photoSales.reduce((sum, s) => sum + s.value, 0).toLocaleString()},00
            </span>
          </div>
        </div>

        {/* Sales Table */}
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-black/40 text-gray-400 font-semibold tracking-wider uppercase text-[9px]">
                  <th className="p-3">Pedido / Descrição</th>
                  <th className="p-3">Data</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {photoSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-3">
                      <span className="font-semibold text-white block font-sans">{sale.description}</span>
                      <span className="text-[9px] text-gray-500 font-mono block">{sale.customer}</span>
                    </td>
                    <td className="p-3 text-gray-300 font-mono">{sale.date}</td>
                    <td className="p-3 font-bold text-white text-right font-mono">R$ {sale.value},00</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[8px] uppercase font-extrabold border bg-green-500/5 border-green-500/20 text-green-400">
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          confirmModal({
                            title: "Excluir Pedido de Fotos",
                            message: `Tem certeza que deseja excluir o pedido de "${sale.customer || "Cliente"}" no valor de R$ ${sale.value},00? Esta ação removerá o pedido do histórico financeiro.`,
                            confirmText: "Excluir Pedido",
                            variant: "danger",
                            onConfirm: () => {
                              deleteTransaction(sale.id);
                            },
                          });
                        }}
                        className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg border border-white/5 hover:border-red-500/30 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Excluir este pedido de fotos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {photoSales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-gray-500 font-sans">
                      Nenhum pedido de fotos processado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Novo Evento Fotográfico</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome do Evento</label>
                  <input
                    type="text"
                    required
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="Casamento de Lucas e Clara"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Data do Evento</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Valor por Foto</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={newEvent.pricePerPhoto}
                        onChange={(e) => setNewEvent({ ...newEvent, pricePerPhoto: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Valor do Pacote</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={newEvent.packagePrice}
                        onChange={(e) => setNewEvent({ ...newEvent, packagePrice: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Cover Upload in Create Event */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center justify-between">
                    <span>Foto de Capa do Evento (Opcional)</span>
                    {newEvent.coverUrl && (
                      <button
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, coverUrl: "", coverPosition: 50 })}
                        className="text-[9px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </label>
                  {newEvent.coverUrl ? (
                    <div className="space-y-3 p-3 rounded-xl bg-black/40 border border-white/10">
                      <div className="relative h-28 rounded-xl overflow-hidden border border-primary/40 bg-black/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={newEvent.coverUrl}
                          alt="Capa"
                          style={{ objectPosition: `center ${newEvent.coverPosition}%` }}
                          className="w-full h-full object-cover transition-all duration-150"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] text-primary font-bold">
                          {newEvent.coverPosition}% vertical
                        </span>
                      </div>

                      {/* Margin / Vertical Position Editor */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-300 font-medium">Ajustar Enquadramento (Fotos Verticais):</span>
                          <span className="text-primary font-mono font-bold text-[9px]">{newEvent.coverPosition}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={newEvent.coverPosition}
                          onChange={(e) => setNewEvent({ ...newEvent, coverPosition: Number(e.target.value) })}
                          className="w-full accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setNewEvent({ ...newEvent, coverPosition: 15 })}
                            className="flex-1 py-1 rounded text-[9px] font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 cursor-pointer"
                          >
                            🔝 Topo (Rostos)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewEvent({ ...newEvent, coverPosition: 50 })}
                            className="flex-1 py-1 rounded text-[9px] font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 cursor-pointer"
                          >
                            🎯 Centro
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewEvent({ ...newEvent, coverPosition: 85 })}
                            className="flex-1 py-1 rounded text-[9px] font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 cursor-pointer"
                          >
                            ⬇️ Base
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/10 hover:border-primary/40 rounded-xl cursor-pointer bg-black/20 hover:bg-black/30 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadCover(e.target.files[0], false);
                          }
                        }}
                      />
                      <UploadCloud className="w-6 h-6 text-gray-500 mb-1" />
                      <span className="text-[10px] text-gray-300 font-semibold">
                        {uploadingCover ? "Enviando capa..." : "Escolher imagem de capa"}
                      </span>
                      <span className="text-[9px] text-gray-500">Ou defina depois direto na galeria</span>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cadastrar Evento
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <AnimatePresence>
        {showEditModal && editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditModal(false);
                setEditingEvent(null);
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-md bg-dark-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-primary" /> Editar Evento Fotográfico
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                  className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome do Evento</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="Nome do Evento"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Data do Evento</label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Valor por Foto</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={editForm.pricePerPhoto}
                        onChange={(e) => setEditForm({ ...editForm, pricePerPhoto: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Valor do Pacote</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={editForm.packagePrice}
                        onChange={(e) => setEditForm({ ...editForm, packagePrice: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Section in Edit Event with Margin / Vertical Position Editor */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center justify-between">
                    <span>Foto de Capa do Evento</span>
                    {editForm.coverUrl && (
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, coverUrl: "", coverPosition: 50 })}
                        className="text-[9px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remover Capa
                      </button>
                    )}
                  </label>

                  {editForm.coverUrl ? (
                    <div className="space-y-3 p-3.5 rounded-xl bg-black/40 border border-white/10">
                      {/* Live Aspect-Ratio Banner Preview */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                          <span>Pré-visualização do Enquadramento (Banner):</span>
                          <span className="font-mono text-primary font-bold">{editForm.coverPosition}% vertical</span>
                        </div>
                        <div className="relative h-36 w-full rounded-xl overflow-hidden border border-primary/40 bg-black/60 shadow-inner group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editForm.coverUrl}
                            alt="Capa"
                            style={{ objectPosition: `center ${editForm.coverPosition}%` }}
                            className="w-full h-full object-cover transition-all duration-150"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 flex justify-between items-end">
                            <span className="text-[9px] text-white/80 font-medium">
                              Enquadramento no site
                            </span>
                            <span className="text-[9px] text-primary font-bold bg-black/80 px-2 py-0.5 rounded border border-primary/30">
                              {editForm.coverPosition <= 30 ? "Foco no Topo / Rostos" : editForm.coverPosition >= 70 ? "Foco na Base" : "Foco no Centro"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Margin / Vertical Position Slider */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-300 font-medium">Editor de Margem / Posição (Fotos Verticais):</span>
                          <span className="text-gray-500 font-mono text-[9px]">0% (Topo) a 100% (Base)</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={editForm.coverPosition}
                          onChange={(e) => setEditForm({ ...editForm, coverPosition: Number(e.target.value) })}
                          className="w-full accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                          <span>0% Topo</span>
                          <span>50% Centro</span>
                          <span>100% Base</span>
                        </div>

                        {/* Quick Presets for Vertical Photos */}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, coverPosition: 15 })}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                              editForm.coverPosition === 15
                                ? "bg-primary text-black border-primary shadow-sm"
                                : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/5"
                            }`}
                          >
                            🔝 Topo (Rostos)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, coverPosition: 50 })}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                              editForm.coverPosition === 50
                                ? "bg-primary text-black border-primary shadow-sm"
                                : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/5"
                            }`}
                          >
                            🎯 Centro
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, coverPosition: 85 })}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                              editForm.coverPosition === 85
                                ? "bg-primary text-black border-primary shadow-sm"
                                : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/5"
                            }`}
                          >
                            ⬇️ Base
                          </button>
                        </div>
                      </div>

                      {/* Replace image action */}
                      <div className="pt-2 border-t border-white/5 flex gap-2">
                        <label className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-[10px] uppercase tracking-wider rounded-lg cursor-pointer text-center border border-white/5 transition-all">
                          Substituir Imagem de Capa
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadCover(e.target.files[0], true);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/10 hover:border-primary/40 rounded-xl cursor-pointer bg-black/20 hover:bg-black/30 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadCover(e.target.files[0], true);
                          }
                        }}
                      />
                      <UploadCloud className="w-6 h-6 text-gray-500 mb-1" />
                      <span className="text-[10px] text-gray-300 font-semibold">
                        {uploadingCover ? "Enviando capa..." : "Fazer upload de nova capa"}
                      </span>
                      <span className="text-[9px] text-gray-500">Ou clique no botão 'Capa' em qualquer foto da galeria</span>
                    </label>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEvent(null);
                    }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Coupons Management Modal */}
      <AnimatePresence>
        {showCouponsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCouponsModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-2xl bg-dark-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Gerenciar Cupons de Desconto
                </h3>
                <button
                  onClick={() => setShowCouponsModal(false)}
                  className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Create Coupon Form */}
                <form onSubmit={handleCreateCoupon} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Criar Novo Cupom</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Código</label>
                      <input
                        type="text"
                        required
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="Ex: VIP100"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tipo</label>
                      <select
                        value={newCoupon.discountType}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                        {newCoupon.discountType === "percentage" ? "Desconto (%)" : "Desconto (R$)"}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max={newCoupon.discountType === "percentage" ? 100 : undefined}
                        value={newCoupon.discountValue}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Descrição</label>
                      <input
                        type="text"
                        value={newCoupon.description}
                        onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                        placeholder="Cortesia especial"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    {couponMsg ? (
                      <span className="text-[11px] text-primary">{couponMsg}</span>
                    ) : <span />}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary hover:bg-[#B39356] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Cadastrar Cupom
                    </button>
                  </div>
                </form>

                {/* Coupons List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Cupons Ativos ({couponsList.length})
                  </h4>

                  {loadingCoupons ? (
                    <div className="text-center py-6 text-xs text-gray-500">Carregando cupons...</div>
                  ) : couponsList.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500 border border-dashed border-white/10 rounded-xl">
                      Nenhum cupom cadastrado.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {couponsList.map((c) => (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs">
                              {c.code}
                            </span>
                            <div>
                              <span className="text-xs font-semibold text-white block">
                                {c.discountType === "percentage" ? `${c.discountValue}% de Desconto` : `R$ ${c.discountValue},00 de Desconto`}
                                {c.discountValue === 100 && c.discountType === "percentage" && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                                    100% Grátis
                                  </span>
                                )}
                              </span>
                              {c.description && (
                                <span className="text-[10px] text-gray-400 block">{c.description}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 font-mono">
                              Usos: {c.usedCount || 0}
                            </span>
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Cupom"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
