"use client";

import { useState } from "react";
import { useAdmin, Equipment } from "@/context/AdminContext";
import { Cpu, MapPin, Check, RotateCcw, AlertTriangle, UserCheck } from "lucide-react";

export default function InventoryTab() {
  const { equipments, locations, updateEquipmentStatus } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState<"equipamentos" | "locacoes">("equipamentos");
  
  // Checkout drawer/state
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [assignedCrew, setAssignedCrew] = useState("Carlos Silva");

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
        </div>
      </div>

      {/* Equipamentos view */}
      {activeSubTab === "equipamentos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {equipments.map((eq) => (
            <div
              key={eq.id}
              className="p-5 rounded-2xl bg-dark-card border border-white/5 flex flex-col justify-between space-y-4 hover:border-white/10 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">{eq.category}</span>
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
                <span className="text-[10px] text-gray-500 font-mono block mt-1">S/N: {eq.serialNumber}</span>
                {eq.status === "Em Uso" && (
                  <span className="text-[10px] text-primary font-sans mt-2 block">
                    Retirado por: <span className="font-bold">{eq.responsible}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 flex gap-2">
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
                <button
                  onClick={() => handleMaintenanceToggle(eq.id, eq.status)}
                  className={`px-3 py-1.5 border rounded-lg text-[9px] uppercase font-bold transition-colors cursor-pointer flex items-center justify-center ${
                    eq.status === "Em Manutenção"
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-red-500/5 border-red-500/10 text-red-400 hover:bg-red-500/10"
                  }`}
                  title={eq.status === "Em Manutenção" ? "Concluir Manutenção" : "Enviar para Manutenção"}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
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

      {/* Checkout Selection Drawer Overlay */}
      {selectedEq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
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
          </div>
        </div>
      )}
    </div>
  );
}
