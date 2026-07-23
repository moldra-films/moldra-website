"use client";

import { useState, useEffect } from "react";
import { Bell, Search, X, Check, MessageSquare, AlertCircle, Info, Sun, Moon } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const { notifications, markAllNotificationsRead } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("moldra_theme") as "dark" | "light" | null;
      const initialTheme = savedTheme || "dark";
      setTheme(initialTheme);
      if (initialTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("moldra_theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <Check className="w-4 h-4 text-green-400" />;
      case "payment":
        return <Check className="w-4 h-4 text-primary" />;
      case "maintenance":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <header className="h-20 border-b border-white/5 bg-[#0B0B0B] px-8 flex items-center justify-between z-30 sticky top-0">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold font-display text-white tracking-wide">{title}</h1>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          title={theme === "dark" ? "Ativar Modo Clássico (Claro)" : "Ativar Modo Escuro"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {/* Search Input Mock */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar projetos, clientes..."
            className="w-64 bg-white/5 border border-white/5 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all font-sans font-light"
          />
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-black font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
              {/* Backdrop Clicker */}
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowNotifications(false)}
              />

              <div className="absolute right-0 mt-3 w-80 bg-dark-card border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Notificações
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markAllNotificationsRead();
                      }}
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Ler todas
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 flex gap-3 transition-colors ${
                          n.unread ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-white mb-0.5">{n.title}</h5>
                          <p className="text-[11px] text-gray-400 font-sans font-light leading-relaxed mb-1">
                            {n.description}
                          </p>
                          <span className="text-[9px] text-gray-500 font-sans font-light">{n.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-500 font-sans">
                      Sem novas notificações
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
