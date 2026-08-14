"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck,
  LogOut,
  Camera
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    document.cookie = "moldra-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "moldra-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    supabase.auth.signOut().then(() => {
      router.push("/login");
    });
  };

  const getDisplayName = (email: string) => {
    if (!email) return "Natália Camurça"; // Default fallback
    const lower = email.toLowerCase();
    if (lower.includes("mikelly")) return "Mikelly Maduro";
    if (lower.includes("natalia")) return "Natália Camurça";
    if (lower.includes("admin")) return "Administrador";
    return email.split("@")[0];
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = getDisplayName(userEmail);
  const initials = getInitials(displayName);

  const menuItems = [
    { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { id: "crm", label: "CRM & Funil", icon: Users },
    { id: "projects", label: "Projetos & Pauta", icon: Film },
    { id: "tasks", label: "Quadro de Tarefas", icon: CheckSquare },
    { id: "finance", label: "Financeiro", icon: DollarSign },
    { id: "inventory", label: "Equipamentos & Locações", icon: Package },
    { id: "approval", label: "Portal de Aprovação", icon: Eye },
    { id: "event-media", label: "Mídias de Eventos", icon: Camera },
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
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-gray-400 hover:text-white group select-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md shadow-primary/20"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-black" : "text-gray-400 group-hover:text-white"
                }`} />
                <span className={`transition-colors ${
                  isActive ? "text-black font-semibold" : "text-gray-400 group-hover:text-white"
                }`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User Profile Indicator */}
      <div className="p-4 border-t border-white/5 bg-[#121212]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs font-display">
            {initials}
          </div>
          <div>
            <span className="text-xs font-bold text-white block truncate max-w-[120px]" title={displayName}>
              {displayName}
            </span>
            <span className="text-[10px] text-gray-500 block uppercase font-sans">
              {userEmail.toLowerCase().includes("admin") || userEmail.toLowerCase().includes("moldra") ? "Administrador" : "Equipe"}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-md border border-white/5 cursor-pointer transition-colors"
          title="Sair do Painel"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
