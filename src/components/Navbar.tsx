"use client";

import { useState, useEffect } from "react";
import { Film, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface NavbarProps {
  onScrollToSection: (id: string) => void;
}

export default function Navbar({ onScrollToSection }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onScrollToSection(item.id)}
                className="text-sm font-semibold tracking-wide text-gray-300 hover:text-primary transition-colors duration-300 cursor-pointer font-sans"
              >
                {item.label}
              </button>
            ))}
            
            {/* Direct CTA */}
            <button
              onClick={() => onScrollToSection("contato")}
              className="px-6 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg shadow-primary/10 transform hover:scale-105"
            >
              Orçamento
            </button>
          </nav>

          {/* Mobile Menu Toggle button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg focus:outline-none cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-30 pt-24 px-6 md:hidden flex flex-col justify-between pb-12"
          >
            <nav className="flex flex-col gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsOpen(false);
                    onScrollToSection(item.id);
                  }}
                  className="text-2xl font-bold tracking-wide text-left text-gray-300 hover:text-primary transition-colors duration-300 cursor-pointer font-display border-b border-white/5 pb-4"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={() => {
                setIsOpen(false);
                onScrollToSection("contato");
              }}
              className="w-full py-4 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-center transition-colors cursor-pointer"
            >
              Solicitar Orçamento
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
