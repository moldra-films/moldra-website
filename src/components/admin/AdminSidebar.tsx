"use client";

import {
  LayoutDashboard,
  Users,
  Film,
  CheckSquare,
  DollarSign,
  Package,
  Eye,
  Cpu,
  Settings,
  ShieldCheck
} from "lucide-react";
import Image from "next/image";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { id: "crm", label: "CRM & Funil", icon: Users },
    { id: "projects", label: "Projetos & Pauta", icon: Film },
    { id: "tasks", label: "Quadro de Tarefas", icon: CheckSquare },
    { id: "finance", label: "Financeiro", icon: DollarSign },
    { id: "inventory", label: "Equipamentos & Locações", icon: Package },
    { id: "approval", label: "Portal de Aprovação", icon: Eye },
    { id: "copilot", label: "IA Copilot", icon: Cpu },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0B0B] border-r border-white/5 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Upper Area: Logo & Menu */}
      <div className="flex flex-col">
        {/* Brand Logo header */}
        <div className="px-6 py-6 border-b border-white/5 flex flex-col gap-2">
          <Image
            src="/logo.png"
            alt="Moldra Films Logo"
            width={140}
            height={35}
            className="h-8 w-auto object-contain self-start"
          />
          <span className="block text-[9px] uppercase tracking-widest text-gray-500 font-sans pl-1">
            ERP + CRM Panel
          </span>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-black font-semibold shadow-md shadow-primary/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User Profile Indicator */}
      <div className="p-4 border-t border-white/5 bg-[#121212]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs font-display">
            NC
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Natália Camurça</span>
            <span className="text-[10px] text-gray-500 block uppercase font-sans">Administrador</span>
          </div>
        </div>
        
        <div className="p-1.5 bg-green-500/10 text-green-400 rounded-md border border-green-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      </div>
    </aside>
  );
}
