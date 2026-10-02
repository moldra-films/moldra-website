"use client";

import { useState, useEffect } from "react";
import { Film, Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  onScrollToSection: (id: string) => void;
}

export default function Navbar({ onScrollToSection }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Sobre", id: "sobre" },
    { label: "Serviços", id: "servicos" },
    { label: "Portfólio", id: "portfolio" },
    { label: "Processo", id: "processo" },
    { label: "Contato", id: "contato" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-md py-4 border-b border-white/5"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Image
              src="/logo.png"
              alt="Moldra Films Logo"
              width={160}
              height={45}
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onScrollToSection(item.id)}
                className="text-sm font-semibold tracking-wide text-gray-300 hover:text-primary transition-colors duration-300 cursor-pointer font-sans"
              >
                {item.label}
              </button>
            ))}

            <Link
              href="/eventos"
              className="text-sm font-semibold tracking-wide text-gray-300 hover:text-primary transition-colors duration-300 cursor-pointer font-sans"
            >
              Eventos
            </Link>
            
            {/* Direct CTA */}
            <button
              onClick={() => onScrollToSection("contato")}
              className="px-5 py-2 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg shadow-primary/10 transform hover:scale-105 shrink-0"
            >
              Orçamento
            </button>

            {/* Portal do Cliente link */}
            <a
              href="/login"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-primary border border-primary/25 hover:border-primary/50 font-semibold rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-center shrink-0"
            >
              Portal do Cliente
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-300 hover:text-primary transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0"
              title={theme === "dark" ? "Ativar Modo Clássico (Claro)" : "Ativar Modo Escuro"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile & Tablet (iPad) Menu Toggle button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-300 hover:text-primary transition-all duration-300 cursor-pointer flex items-center justify-center"
              title={theme === "dark" ? "Ativar Modo Clássico (Claro)" : "Ativar Modo Escuro"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:text-white rounded-lg focus:outline-none cursor-pointer"
              aria-label="Abrir menu"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-30 pt-28 px-8 sm:px-12 md:px-16 lg:hidden flex flex-col justify-between pb-12 overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 max-w-lg mx-auto w-full">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsOpen(false);
                    onScrollToSection(item.id);
                  }}
                  className="text-2xl md:text-3xl font-bold tracking-wide text-left text-gray-300 hover:text-primary transition-colors duration-300 cursor-pointer font-display border-b border-white/5 pb-4"
                >
                  {item.label}
                </button>
              ))}

              <Link
                href="/eventos"
                onClick={() => setIsOpen(false)}
                className="text-2xl md:text-3xl font-bold tracking-wide text-left text-gray-300 hover:text-primary transition-colors duration-300 cursor-pointer font-display border-b border-white/5 pb-4"
              >
                Eventos
              </Link>
            </nav>

            <div className="flex flex-col gap-3 max-w-lg mx-auto w-full mt-8">
              <a
                href="/login"
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-primary/20 text-primary font-semibold rounded-xl text-center transition-colors cursor-pointer block text-base"
              >
                Portal do Cliente
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onScrollToSection("contato");
                }}
                className="w-full py-4 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-center transition-colors cursor-pointer text-base shadow-lg shadow-primary/10"
              >
                Solicitar Orçamento
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
