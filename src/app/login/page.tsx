"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { KeyRound, Mail, AlertCircle, User, Building2, ArrowLeft, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  
  // Fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userEmail = session.user?.email || "";
        
        // Fetch accounts from R2 to check whitelist
        const accountsRes = await fetch("/api/admin-accounts");
        const activeAccounts = await accountsRes.json();
        
        const isDefaultAdmin = 
          userEmail === "admin@moldrafilms.com.br" ||
          userEmail === "mikelly@moldrafilms.com.br" ||
          userEmail === "natalia@moldrafilms.com.br" ||
          userEmail === "mikaelmaduro@gmail.com";

        const isRegistered = activeAccounts.some((acc: any) => acc.email.toLowerCase() === userEmail.toLowerCase());

        // If authenticated via Google or newly signed up but not whitelisted yet,
        // automatically whitelist them as client
        if (!isRegistered && !isDefaultAdmin) {
          const newAccount = {
            id: `client-${Date.now()}`,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Cliente",
            email: userEmail,
            role: "client",
            createdAt: new Date().toISOString(),
          };
          
          await fetch("/api/admin-accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAccount),
          });
          
          activeAccounts.push(newAccount);
        }

        const dbAccount = activeAccounts.find((acc: any) => acc.email.toLowerCase() === userEmail.toLowerCase());
        const role = dbAccount ? dbAccount.role : (isDefaultAdmin ? "admin" : "client");

        // Save session cookies
        document.cookie = "moldra-session=active; path=/; max-age=86400";
        document.cookie = `moldra-role=${role}; path=/; max-age=86400`;

        router.push(role === "admin" ? "/admin" : "/client");
      }
    };
    checkActiveSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userEmail = data.user?.email || "";
      const userRole = data.user?.user_metadata?.role;

      // Fetch whitelist
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

      // Set cookie for Next.js Middleware check
      document.cookie = "moldra-session=active; path=/; max-age=86400";
      document.cookie = `moldra-role=${role}; path=/; max-age=86400`;

      router.push(role === "admin" ? "/admin" : "/client");
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company: company,
            role: "client"
          }
        }
      });

      if (error) throw error;

      // Auto-register in R2 active whitelist database
      const newAccount = {
        id: `client-${Date.now()}`,
        name: name,
        email: email,
        role: "client",
        createdAt: new Date().toISOString(),
      };
      
      await fetch("/api/admin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      setSuccessMsg("Cadastro realizado com sucesso! Você já pode realizar o login.");
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrorMsg(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
      setSuccessMsg("E-mail de recuperação de senha enviado! Verifique seu lixo ou caixa de entrada.");
    } catch (err: any) {
      console.error("Reset error:", err);
      setErrorMsg(err.message || "Erro ao enviar e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google login error:", err);
      setErrorMsg(err.message || "Erro ao autenticar com o Google.");
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-black/40 border border-white/5 p-8 rounded-2xl backdrop-blur-md space-y-6 relative z-10 shadow-2xl">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Image
            src="/logo.png"
            alt="Moldra Films Logo"
            width={160}
            height={45}
            className="h-9 w-auto object-contain"
          />
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            {mode === "signin" && "Portal do Cliente • Acesse seus entregáveis"}
            {mode === "signup" && "Cadastre sua conta de cliente"}
            {mode === "forgot" && "Recuperação de Senha"}
          </p>
        </div>

        {/* Global Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-400 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-light leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-2 text-xs text-green-400 font-sans">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-light leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Dynamic Views */}
        {mode === "signin" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Senha</label>
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }}
                  className="text-[9px] text-primary hover:underline font-semibold"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {/* Google OAuth Option */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[9px] text-gray-500 uppercase tracking-widest">Ou acesse com</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Entrar com Gmail / Google
            </button>

            <p className="text-center text-[10px] text-gray-500">
              Não tem uma conta corporativa?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setErrorMsg(""); setSuccessMsg(""); }}
                className="text-primary hover:underline font-bold"
              >
                Cadastre-se
              </button>
            </p>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Empresa (Identificação)</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Construtora Apex"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: joao@empresa.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Confirmar</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Cadastrar Conta"}
            </button>

            <p className="text-center text-[10px] text-gray-500">
              Já possui uma conta?{" "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }}
                className="text-primary hover:underline font-bold"
              >
                Faça Login
              </button>
            </p>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-gray-400 font-sans font-light leading-relaxed">
              Digite seu endereço de e-mail abaixo. Enviaremos um link seguro para que você possa redefinir sua senha.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">E-mail Cadastrado</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans font-light"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar E-mail de Recuperação"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }}
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-white/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para o Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
