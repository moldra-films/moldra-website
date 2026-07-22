"use client";

import { Film, ArrowUp } from "lucide-react";
import Image from "next/image";

const InstagramIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);


interface FooterProps {
  onScrollToSection: (id: string) => void;
}

export default function Footer({ onScrollToSection }: FooterProps) {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-white py-16 border-t border-white/5 relative">
      <div className="container mx-auto px-6">
        {/* Top footer area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={handleScrollTop}>
              <Image
                src="/logo.png"
                alt="Moldra Films Logo"
                width={150}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-gray-400 font-sans font-light leading-relaxed max-w-sm">
              Somos uma produtora audiovisual focada em criar conteúdos cinematográficos impactantes que fortalecem e consolidam marcas no mercado.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com/moldrafilms"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://youtube.com/@moldrafilms"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
              >
                <YoutubeIcon />
              </a>
              <a
                href="https://facebook.com/moldrafilms"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-[0.2em] mb-6 font-display">
              Navegação
            </h4>
            <ul className="space-y-3">
              {["sobre", "servicos", "portfolio", "processo", "contato"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onScrollToSection(item)}
                    className="text-sm text-gray-400 hover:text-primary transition-colors duration-300 cursor-pointer capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Hours / Contact Info */}
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-[0.2em] mb-6 font-display">
              Endereço & Suporte
            </h4>
            <p className="text-sm text-gray-400 font-sans font-light leading-relaxed mb-4">
              Av. Paulista, 1000 - Bela Vista
              <br />
              São Paulo, SP - CEP 01310-100
            </p>
            <p className="text-xs text-gray-500 font-sans font-light">
              Segunda a Sexta, das 09h às 18h.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-white/5 mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-sans font-light">
            &copy; {new Date().getFullYear()} Moldra Films. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-500 hover:text-primary transition-colors font-sans">
              Política de Privacidade
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-primary transition-colors font-sans">
              Termos de Uso
            </a>
          </div>

          {/* Scroll to top button */}
          <button
            onClick={handleScrollTop}
            className="p-3 bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/20 rounded-full transition-all duration-300 cursor-pointer text-gray-400 hover:text-white"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
