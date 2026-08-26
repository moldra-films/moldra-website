"use client";

import { useState } from "react";
import { useAdmin, Equipment } from "@/context/AdminContext";
import { Cpu, MapPin, Check, RotateCcw, AlertTriangle, UserCheck, Plus, X, Edit, Trash2, Loader2, UploadCloud } from "lucide-react";
import R2UploadTest from "./R2UploadTest";
import { motion } from "framer-motion";

export default function InventoryTab() {
  const { 
    equipments, 
    locations, 
    updateEquipmentStatus, 
    addEquipment, 
    updateEquipment, 
    deleteEquipment, 
    addLocation 
  } = useAdmin();
  
  const [activeSubTab, setActiveSubTab] = useState<"equipamentos" | "locacoes" | "r2">("equipamentos");
  
  // Checkout drawer/state
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [assignedCrew, setAssignedCrew] = useState("Carlos Silva");

  // New/Edit Equipment states
  const [showAddEq, setShowAddEq] = useState(false);
  const [editEqId, setEditEqId] = useState<number | null>(null);
  const [newEq, setNewEq] = useState({
    name: "",
    category: "Câmeras" as Equipment["category"],
    serialNumber: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // New Location states
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [newLoc, setNewLoc] = useState({
    name: "",
    address: "",
    rate: 0,
    contact: "",
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingPhoto(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch presigned URL.");
        }

        const { uploadUrl, fileUrl } = await res.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("Direct upload to Cloudflare R2 failed.");
        }

        setUploadedPhotos((prev) => [...prev, fileUrl]);
      } catch (err: any) {
        console.error("Photo upload error:", err);
        alert(err.message || "Falha no upload da foto.");
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    setUploadedPhotos((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleStartEdit = (eq: Equipment) => {
    setEditEqId(eq.id);
    setNewEq({
      name: eq.name,
      category: eq.category,
      serialNumber: eq.serialNumber,
    });
    setUploadedPhotos(eq.photos || []);
    setShowAddEq(true);
  };

  const handleDeleteEquipmentClick = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o equipamento "${name}"?`)) {
      deleteEquipment(id);
    }
  };

  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();

    if (editEqId !== null) {
      updateEquipment(editEqId, {
        name: newEq.name,
        category: newEq.category,
        serialNumber: newEq.serialNumber,
        photos: uploadedPhotos,
      });
    } else {
      addEquipment({
        name: newEq.name,
        category: newEq.category,
        serialNumber: newEq.serialNumber,
        status: "Disponível",
        lastMaintenance: new Date().toISOString().split("T")[0],
        responsible: "Nenhum",
        photos: uploadedPhotos,
      });
    }

    setNewEq({
      name: "",
      category: "Câmeras",
      serialNumber: "",
    });
    setUploadedPhotos([]);
    setEditEqId(null);
    setShowAddEq(false);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    addLocation({
      name: newLoc.name,
      address: newLoc.address,
      rate: Number(newLoc.rate),
      status: "Disponível",
      contact: newLoc.contact,
    });
    setNewLoc({
      name: "",
      address: "",
      rate: 0,
      contact: "",
    });
    setShowAddLoc(false);
  };

  const handleMaintenanceToggle = (id: number, currentStatus: Equipment["status"]) => {
    const nextStatus: Equipment["status"] = currentStatus === "Em Manutenção" ? "Disponível" : "Em Manutenção";
    updateEquipmentStatus(id, nextStatus, "Nenhum");
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEq) return;
    updateEquipmentStatus(selectedEq.id, "Em Uso", assignedCrew);
    setSelectedEq(null);
  };

  const handleReturn = (id: number) => {
    updateEquipmentStatus(id, "Disponível", "Nenhum");
  };

  return (
    <div className="p-8 space-y-8">
      {/* Subtab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">Logística & Ativos</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">Controle de inventário técnico, empréstimos para diárias e catálogo de locações parceiras.</p>
        </div>

        <div className="flex items-center gap-3">
          {activeSubTab === "equipamentos" && (
            <button
              onClick={() => {
                setEditEqId(null);
                setNewEq({ name: "", category: "Câmeras", serialNumber: "" });
                setUploadedPhotos([]);
                setShowAddEq(true);
              }}
              className="px-4 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Equipamento
            </button>
          )}
          {activeSubTab === "locacoes" && (
            <button
              onClick={() => setShowAddLoc(true)}
              className="px-4 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Locação
            </button>
          )}

          <div className="flex bg-dark-card border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab("equipamentos")}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                activeSubTab === "equipamentos" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Equipamentos
            </button>
            <button
              onClick={() => setActiveSubTab("locacoes")}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                activeSubTab === "locacoes" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Locações
            </button>
            <button
              onClick={() => setActiveSubTab("r2")}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                activeSubTab === "r2" ? "bg-primary text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Mídias (R2)
            </button>
          </div>
        </div>
      </div>

      {/* Equipamentos view */}
      {activeSubTab === "equipamentos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {equipments.map((eq) => (
            <div
              key={eq.id}
              className="rounded-2xl bg-dark-card border border-white/5 flex flex-col justify-between overflow-hidden hover:border-white/10 transition-colors group"
            >
              {/* Cover Photo block */}
              <div className="aspect-video w-full bg-black/40 border-b border-white/5 relative flex items-center justify-center overflow-hidden">
                {eq.photos && eq.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={eq.photos[0]}
                    alt={eq.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Cpu className="w-8 h-8 text-white/10" />
                )}
                
                {/* Floating category badge */}
                <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[9px] uppercase font-bold tracking-wider text-gray-300">
                  {eq.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">S/N: {eq.serialNumber}</span>
                    <span
                      className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${
                        eq.status === "Disponível"
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : eq.status === "Em Uso"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-display text-white mt-3 leading-snug">{eq.name}</h3>
                  {eq.status === "Em Uso" && (
                    <span className="text-[10px] text-primary font-sans mt-2 block">
                      Retirado por: <span className="font-bold text-white">{eq.responsible}</span>
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                  {eq.status === "Disponível" && (
                    <button
                      onClick={() => setSelectedEq(eq)}
                      className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[9px] uppercase font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      Retirar
                    </button>
                  )}
                  {eq.status === "Em Uso" && (
                    <button
                      onClick={() => handleReturn(eq.id)}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg text-[9px] uppercase font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Devolver
                    </button>
                  )}
                  
                  {/* Maintenance Button */}
                  <button
                    onClick={() => handleMaintenanceToggle(eq.id, eq.status)}
                    className={`px-2 py-1.5 border rounded-lg text-[9px] uppercase font-bold transition-colors cursor-pointer flex items-center justify-center ${
                      eq.status === "Em Manutenção"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/5 border-red-500/10 text-red-400 hover:bg-red-500/10"
                    }`}
                    title={eq.status === "Em Manutenção" ? "Concluir Manutenção" : "Enviar para Manutenção"}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleStartEdit(eq)}
                    className="p-1.5 bg-white/5 border border-white/5 text-gray-400 hover:text-primary hover:border-primary/20 rounded-lg cursor-pointer transition-all"
                    title="Editar Equipamento"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteEquipmentClick(eq.id, eq.name)}
                    className="p-1.5 bg-white/5 border border-white/5 text-gray-400 hover:text-red-400 hover:border-red-500/20 rounded-lg cursor-pointer transition-all"
                    title="Excluir Equipamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Locacoes view */}
      {activeSubTab === "locacoes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="p-6 rounded-2xl bg-dark-card border border-white/5 flex flex-col justify-between space-y-4 hover:border-white/10 transition-colors"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-display text-white leading-snug">{loc.name}</h3>
                    <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-[9px] font-bold uppercase tracking-wider border border-green-500/20">
                      {loc.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-sans font-light leading-relaxed">{loc.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
                <div>
                  <span className="block text-gray-500 text-[9px] uppercase tracking-wider font-bold">Taxa Diária</span>
                  <span className="font-bold text-primary text-sm mt-0.5 block">R$ {loc.rate.toLocaleString()}/dia</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[9px] uppercase tracking-wider font-bold">Contato Locador</span>
                  <span className="text-gray-300 mt-0.5 block font-sans">{loc.contact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeSubTab === "r2" && <R2UploadTest />}

      {/* Checkout Selection Drawer Overlay */}
      {selectedEq && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-sm bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registrar Empréstimo</h3>
              <button onClick={() => setSelectedEq(null)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                X
              </button>
            </div>

            <form onSubmit={handleCheckout} className="p-6 space-y-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Equipamento Selecionado</span>
                <span className="text-xs font-bold text-white block">{selectedEq.name}</span>
                <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">S/N: {selectedEq.serialNumber}</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Atribuir a (Membro da Equipe)</label>
                <select
                  value={assignedCrew}
                  onChange={(e) => setAssignedCrew(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Carlos Silva">Carlos Silva (Videomaker)</option>
                  <option value="Natália Camurça">Natália Camurça (Diretora)</option>
                  <option value="Guilherme Lemos">Guilherme Lemos (Operador Drone)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Confirmar Saída
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Add / Edit Equipment Drawer */}
      {showAddEq && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-sm bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                {editEqId !== null ? "Editar Equipamento" : "Novo Equipamento"}
              </h3>
              <button
                onClick={() => {
                  setEditEqId(null);
                  setShowAddEq(false);
                }}
                className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome do Equipamento</label>
                <input
                  type="text"
                  required
                  value={newEq.name}
                  onChange={(e) => setNewEq({ ...newEq, name: e.target.value })}
                  placeholder="Ex: Canon EOS R5 C"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Categoria</label>
                <select
                  value={newEq.category}
                  onChange={(e) => setNewEq({ ...newEq, category: e.target.value as Equipment["category"] })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Câmeras">Câmeras</option>
                  <option value="Lentes">Lentes</option>
                  <option value="Drones">Drones</option>
                  <option value="Gimbals">Gimbals</option>
                  <option value="Iluminação">Iluminação</option>
                  <option value="Áudio">Áudio</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Número de Série (S/N)</label>
                <input
                  type="text"
                  required
                  value={newEq.serialNumber}
                  onChange={(e) => setNewEq({ ...newEq, serialNumber: e.target.value })}
                  placeholder="Ex: CA-R5C-9011"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Photos upload block */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Fotos do Equipamento</label>
                
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center px-4 py-2 border border-dashed border-white/10 hover:border-primary/30 rounded-xl cursor-pointer bg-black/20 text-gray-400 hover:text-white transition-all text-[10px] uppercase tracking-wider font-semibold">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    {uploadingPhoto ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5" />
                        Adicionar Foto
                      </span>
                    )}
                  </label>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {uploadedPhotos.map((url, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden border border-white/10 group bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(url)}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editEqId !== null ? "Salvar Alterações" : "Cadastrar Equipamento"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Add Location Drawer */}
      {showAddLoc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-md bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Cadastrar Nova Locação</h3>
              <button
                onClick={() => setShowAddLoc(false)}
                className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome da Locação</label>
                <input
                  type="text"
                  required
                  value={newLoc.name}
                  onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                  placeholder="Ex: Estúdio Industrial Galpão"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Endereço Completo</label>
                <input
                  type="text"
                  required
                  value={newLoc.address}
                  onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                  placeholder="Ex: Av. Europa, 1200 - São Paulo, SP"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Taxa Diária (R$)</label>
                  <input
                    type="number"
                    required
                    value={newLoc.rate}
                    onChange={(e) => setNewLoc({ ...newLoc, rate: Number(e.target.value) })}
                    placeholder="Ex: 1500"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Contato Locador</label>
                  <input
                    type="text"
                    required
                    value={newLoc.contact}
                    onChange={(e) => setNewLoc({ ...newLoc, contact: e.target.value })}
                    placeholder="Ex: João (11) 98888-7777"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cadastrar Locação
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
