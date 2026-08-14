"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { KeyRound, Mail, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userEmail = data.user?.email || "";
      const userRole = data.user?.user_metadata?.role;

      // Fetch allowed accounts from our R2 database to verify active status
      const accountsRes = await fetch("/api/admin-accounts");
      const activeAccounts = await accountsRes.json();
      
      const isDefaultAdmin = 
        userEmail === "admin@moldrafilms.com.br" ||
        userEmail === "mikelly@moldrafilms.com.br" ||
        userEmail === "natalia@moldrafilms.com.br" ||
        userEmail === "mikaelmaduro@gmail.com";

      const isActive = activeAccounts.some((acc: any) => acc.email.toLowerCase() === userEmail.toLowerCase()) || isDefaultAdmin;

      if (!isActive) {
        await supabase.auth.signOut();
        throw new Error("Esta conta foi desativada ou removida pelo administrador.");
      }

      const dbAccount = activeAccounts.find((acc: any) => acc.email.toLowerCase() === userEmail.toLowerCase());
      const role = dbAccount ? dbAccount.role : (isDefaultAdmin ? "admin" : (userRole || "client"));
      const isStaff = role === "admin" || userEmail.includes("moldra") || userEmail.startsWith("admin");

      if (!isStaff) {
        await supabase.auth.signOut();
        throw new Error("Acesso negado. Esta página de login é restrita à equipe administrativa.");
      }

      // Set cookie for Next.js Middleware check
      document.cookie = "moldra-session=active; path=/; max-age=86400";
      document.cookie = "moldra-role=admin; path=/; max-age=86400";

      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-black/40 border border-white/5 p-8 rounded-2xl backdrop-blur-md space-y-8 relative z-10 shadow-2xl">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Image
            src="/logo.png"
            alt="Moldra Films Logo"
            width={180}
            height={50}
            className="h-10 w-auto object-contain"
          />
          <p className="text-[10px] text-primary uppercase tracking-widest font-bold">
            Área Administrativa (Equipe)
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@moldrafilms.com.br"
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-400 font-sans">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-light leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>
      </div>
    </div>
  );
}
