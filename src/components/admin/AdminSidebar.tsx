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
  Camera,
  X,
  ChevronDown,
  Zap
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAdmin } from "@/context/AdminContext";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const financeSubItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "transactions", label: "Movimentações" },
  { id: "reconciliation", label: "Conciliação" },
  { id: "receivables-payables", label: "Pagar & Receber" },
  { id: "statements", label: "Relatórios & DRE" },
  { id: "assets-goals", label: "Metas & Patrimônio" },
  { id: "audit", label: "Auditoria" },
];

export default function AdminSidebar({ activeTab, setActiveTab, isOpen, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const { activeFinanceSubTab, setActiveFinanceSubTab } = useAdmin();
  const [isFinanceOpen, setIsFinanceOpen] = useState(activeTab === "finance");

  useEffect(() => {
    if (activeTab === "finance") {
      setIsFinanceOpen(true);
    }
  }, [activeTab]);

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
    { id: "moldra-engine", label: "Moldra Engine", icon: Zap },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}
      <aside className={`fixed md:sticky top-0 left-0 z-50 w-64 bg-[#0B0B0B] border-r border-white/5 flex flex-col justify-between shrink-0 h-screen transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        {/* Upper Area: Logo & Menu */}
        <div className="flex flex-col">
          {/* Brand Logo header */}
          <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
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
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                title="Fechar Menu"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const isFinance = item.id === "finance";
            return (
              <div key={item.id} className="space-y-1">
                <motion.button
                  onClick={() => {
                    if (isFinance) {
                      setIsFinanceOpen(!isFinanceOpen);
                      setActiveTab("finance");
                    } else {
                      setActiveTab(item.id);
                      if (onClose) onClose();
                    }
                  }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-gray-400 hover:text-white group select-none"
                >
                  <div className="flex items-center gap-3">
                    {isActive && !isFinance && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md shadow-primary/20"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    {isActive && isFinance && (
                      <div className="absolute inset-0 bg-white/5 rounded-xl -z-10 border border-white/5" />
                    )}
                    <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? (isFinance ? "text-primary" : "text-black") : "text-gray-400 group-hover:text-white"
                    }`} />
                    <span className={`transition-colors ${
                      isActive ? (isFinance ? "text-white font-bold" : "text-black font-semibold") : "text-gray-400 group-hover:text-white"
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  {isFinance && (
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isFinanceOpen ? "rotate-180 text-primary" : ""}`} />
                  )}
                </motion.button>

                {isFinance && (
                  <AnimatePresence initial={false}>
                    {isFinanceOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="pl-8 pr-2 py-0.5 space-y-1 overflow-hidden"
                      >
                        {financeSubItems.map((sub) => {
                          const isSubActive = activeFinanceSubTab === sub.id && activeTab === "finance";
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setActiveTab("finance");
                                setActiveFinanceSubTab(sub.id);
                                if (onClose) onClose();
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                                isSubActive 
                                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                                  : "text-gray-500 hover:text-white"
                              }`}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
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
    </>
  );
}
