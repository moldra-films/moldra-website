import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Moldra Films | Produção Audiovisual Cinematográfica",
  description:
    "Transformamos ideias em imagens que contam histórias. Produção audiovisual profissional para empresas, marcas e criadores de conteúdo. Comercial, institucional, drone e fotografia.",
  keywords: [
    "Moldra Films",
    "produção audiovisual",
    "produtora de vídeo",
    "comerciais",
    "vídeo corporativo",
    "filmagem aérea drone",
    "fotografia profissional SP",
    "editor de vídeo",
  ],
  authors: [{ name: "Moldra Films" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable} scroll-smooth h-full`}
    >
      <body className="min-h-full font-sans bg-dark-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}
