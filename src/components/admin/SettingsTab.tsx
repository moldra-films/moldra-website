"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Shield, 
  HardDrive, 
  Link as LinkIcon, 
  ShieldCheck, 
  Database, 
  Sliders, 
  UserPlus, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Upload, 
  Camera, 
  User, 
  Check, 
  Loader2, 
  X,
  Sparkles,
  Download,
  RotateCcw,
  FileArchive
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAdmin } from "@/context/AdminContext";

export interface Account {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function SettingsTab() {
  const { serviceTypes, addServiceType, deleteServiceType, confirmModal } = useAdmin();
  const [newService, setNewService] = useState("");

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.trim()) return;
    addServiceType(newService);
    setNewService("");
  };

  const [integrations, setIntegrations] = useState([
    { name: "Google Calendar", active: true, desc: "Sincronização de diárias e filmagens" },
    { name: "Google Drive & Dropbox", active: true, desc: "Biblioteca de roteiros e logos" },
    { name: "WhatsApp Business API", active: false, desc: "Avisos automáticos de orçamentos e aprovações" },
    { name: "Stripe & Asaas gateway", active: false, desc: "Faturamento e recebimento em cartão/boleto" },
    { name: "Slack & Discord webhook", active: true, desc: "Log de atividades de produção interno" },
  ]);

  // Auth User Creation states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "client">("admin");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  // Current logged in user info
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [myDisplayName, setMyDisplayName] = useState("");
  const [myAvatarUrl, setMyAvatarUrl] = useState("");
  const [savingMyProfile, setSavingMyProfile] = useState(false);
  const [myProfileMsg, setMyProfileMsg] = useState("");
  const [uploadingMyAvatar, setUploadingMyAvatar] = useState(false);

  // Accounts list
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [updatingAccountAvatarId, setUpdatingAccountAvatarId] = useState<string | null>(null);

  const newAvatarInputRef = useRef<HTMLInputElement>(null);
  const myAvatarInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  // Backup & Recovery states
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState("");
  const [cloudBackups, setCloudBackups] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  const loadCloudBackups = async () => {
    try {
      setLoadingBackups(true);
      const res = await fetch("/api/backup/list");
      if (res.ok) {
        const data = await res.json();
        setCloudBackups(data.backups || []);
      }
    } catch (e) {
      console.error("Error loading cloud backups:", e);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open("/api/backup?download=true", "_blank");
  };

  const handleCreateSnapshot = async () => {
    setBackupLoading(true);
    setBackupMsg("");
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setBackupMsg(`Ponto de restauração salvo com sucesso! (${data.date})`);
        loadCloudBackups();
      } else {
        setBackupMsg(`Erro ao salvar ponto de restauração: ${data.error}`);
      }
    } catch (err: any) {
      setBackupMsg(`Erro de conexão: ${err.message}`);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        confirmModal({
          title: "Restaurar Backup Completo",
          message: `Deseja realmente restaurar os dados do arquivo "${file.name}"? Todos os registros atuais serão substituídos pelos dados deste arquivo (um snapshot de segurança atual será gerado antes).`,
          confirmText: "Restaurar Agora",
          variant: "warning",
          onConfirm: async () => {
            setBackupLoading(true);
            try {
              const res = await fetch("/api/backup/restore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(json),
              });
              const resData = await res.json();
              if (res.ok) {
                alert("Backup restaurado com sucesso! O painel será recarregado.");
                window.location.reload();
              } else {
                alert(`Erro ao restaurar: ${resData.error || "Erro desconhecido"}`);
              }
            } catch (err: any) {
              alert(`Falha na restauração: ${err.message}`);
            } finally {
              setBackupLoading(false);
            }
          },
        });
      } catch (err) {
        alert("O arquivo selecionado não é um arquivo JSON de backup válido.");
      }
    };
    reader.readAsText(file);
    if (restoreFileInputRef.current) restoreFileInputRef.current.value = "";
  };

  const handleRestoreFromCloud = async (url: string, fileName: string) => {
    confirmModal({
      title: "Restaurar Ponto da Nuvem",
      message: `Deseja restaurar o backup "${fileName}"? Os dados atuais serão revertidos para este ponto no tempo (um backup de segurança atual será criado automaticamente antes).`,
      confirmText: "Confirmar Restauração",
      variant: "warning",
      onConfirm: async () => {
        setBackupLoading(true);
        try {
          const resJson = await fetch(url);
          const data = await resJson.json();

          const restoreRes = await fetch("/api/backup/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (restoreRes.ok) {
            alert("Ponto de restauração aplicado com sucesso! O painel será recarregado.");
            window.location.reload();
          } else {
            const err = await restoreRes.json();
            alert(`Erro ao restaurar: ${err.error}`);
          }
        } catch (e: any) {
          alert(`Falha ao carregar backup da nuvem: ${e.message}`);
        } finally {
          setBackupLoading(false);
        }
      },
    });
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/admin-accounts");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAccounts(data);
      }
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    loadCloudBackups();

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setCurrentUserEmail(data.user.email);
      }
    };
    fetchUser();
  }, []);

  // Update current user's profile view once accounts or email are loaded
  useEffect(() => {
    if (currentUserEmail && accounts.length > 0) {
      const myAcc = accounts.find(
        (a) => a.email.toLowerCase() === currentUserEmail.toLowerCase()
      );
      if (myAcc) {
        setMyDisplayName(myAcc.name || myAcc.email.split("@")[0]);
        setMyAvatarUrl(myAcc.avatarUrl || "");
      } else {
        const defaultName = currentUserEmail.split("@")[0];
        setMyDisplayName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
      }
    }
  }, [currentUserEmail, accounts]);

  const toggleIntegration = (index: number) => {
    setIntegrations((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, active: !item.active } : item))
    );
  };

  // Helper to upload image to Cloudflare R2
  const uploadImageToR2 = async (file: File): Promise<string> => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: `avatars/${Date.now()}-${file.name}`,
        fileType: file.type,
        folder: "avatars",
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Falha ao gerar link de upload.");
    }

    const { uploadUrl, fileUrl } = await res.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Falha no upload direto para a nuvem Cloudflare R2.");
    }

    return fileUrl;
  };

  // Upload handler for "Meu Perfil"
  const handleMyAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingMyAvatar(true);
      setMyProfileMsg("");
      try {
        const uploadedUrl = await uploadImageToR2(file);
        setMyAvatarUrl(uploadedUrl);

        // Auto-persist directly to profiles
        let currentAccount = accounts.find(
          (a) => a.email.toLowerCase() === currentUserEmail.toLowerCase()
        );

        let updatedAccounts: Account[];
        if (currentAccount) {
          updatedAccounts = accounts.map((acc) =>
            acc.email.toLowerCase() === currentUserEmail.toLowerCase()
              ? { ...acc, avatarUrl: uploadedUrl, name: myDisplayName || acc.name }
              : acc
          );
        } else {
          const newAcc: Account = {
            id: `profile-${Date.now()}`,
            email: currentUserEmail,
            name: myDisplayName || currentUserEmail.split("@")[0],
            role: "admin",
            avatarUrl: uploadedUrl,
            createdAt: new Date().toISOString(),
          };
          updatedAccounts = [...accounts, newAcc];
        }

        setAccounts(updatedAccounts);

        await fetch("/api/admin-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAccounts),
        });

        window.dispatchEvent(new CustomEvent("moldra-user-updated"));
        setMyProfileMsg("Foto de perfil atualizada com sucesso!");
      } catch (err: any) {
        console.error("Error uploading my avatar:", err);
        setMyProfileMsg(`Erro no upload: ${err.message}`);
      } finally {
        setUploadingMyAvatar(false);
      }
    }
  };

  // Save changes to Display Name
  const handleSaveMyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMyProfile(true);
    setMyProfileMsg("");

    try {
      let currentAccount = accounts.find(
        (a) => a.email.toLowerCase() === currentUserEmail.toLowerCase()
      );

      let updatedAccounts: Account[];
      if (currentAccount) {
        updatedAccounts = accounts.map((acc) =>
          acc.email.toLowerCase() === currentUserEmail.toLowerCase()
            ? { ...acc, name: myDisplayName, avatarUrl: myAvatarUrl }
            : acc
        );
      } else {
        const newAcc: Account = {
          id: `profile-${Date.now()}`,
          email: currentUserEmail,
          name: myDisplayName || currentUserEmail.split("@")[0],
          role: "admin",
          avatarUrl: myAvatarUrl,
          createdAt: new Date().toISOString(),
        };
        updatedAccounts = [...accounts, newAcc];
      }

      setAccounts(updatedAccounts);

      await fetch("/api/admin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccounts),
      });

      window.dispatchEvent(new CustomEvent("moldra-user-updated"));
      setMyProfileMsg("Perfil salvo com sucesso!");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setMyProfileMsg(`Erro ao salvar: ${err.message}`);
    } finally {
      setSavingMyProfile(false);
    }
  };

  // Upload handler for new user creation form
  const handleNewAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingAvatar(true);
      try {
        const uploadedUrl = await uploadImageToR2(file);
        setAvatarUrl(uploadedUrl);
      } catch (err: any) {
        console.error("Error uploading new user avatar:", err);
        alert(`Erro ao fazer upload da foto de perfil: ${err.message}`);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  // Quick avatar change for any account in the list
  const handleAccountAvatarChange = async (
    accountId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUpdatingAccountAvatarId(accountId);
      try {
        const uploadedUrl = await uploadImageToR2(file);
        const updatedAccounts = accounts.map((acc) =>
          acc.id === accountId ? { ...acc, avatarUrl: uploadedUrl } : acc
        );
        setAccounts(updatedAccounts);

        await fetch("/api/admin-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAccounts),
        });

        window.dispatchEvent(new CustomEvent("moldra-user-updated"));
      } catch (err: any) {
        console.error("Error updating account avatar:", err);
        alert(`Erro ao atualizar foto de perfil: ${err.message}`);
      } finally {
        setUpdatingAccountAvatarId(null);
      }
    }
  };

  // Create new user access
  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
            role: selectedRole,
            avatar_url: avatarUrl || undefined,
          },
        },
      });

      if (error) throw error;

      // Add new account to the accounts list
      const newAccount: Account = {
        id: data.user?.id || Date.now().toString(),
        email,
        name: name || email.split("@")[0],
        role: selectedRole,
        avatarUrl: avatarUrl || undefined,
        createdAt: new Date().toISOString(),
      };

      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);

      // Save to Supabase/R2 database
      await fetch("/api/admin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccounts),
      });

      window.dispatchEvent(new CustomEvent("moldra-user-updated"));

      setIsSuccess(true);
      setMsg(
        `Sucesso! Acesso criado para ${name || email}. O usuário já foi cadastrado com sua foto de perfil e permissões configuradas.`
      );
      setName("");
      setEmail("");
      setPassword("");
      setAvatarUrl("");
    } catch (err: any) {
      console.error(err);
      setIsSuccess(false);
      setMsg(`Erro ao criar acesso: ${err.message || "Verifique sua conexão com o Supabase."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string, accountEmail: string) => {
    if (accountEmail === "admin@moldrafilms.com.br") {
      confirmModal({
        title: "Operação Bloqueada",
        message: "Este é o acesso administrativo principal do sistema e não pode ser removido.",
        confirmText: "Entendido",
        cancelText: "Fechar",
        variant: "warning",
        onConfirm: () => {},
      });
      return;
    }

    confirmModal({
      title: "Remover Usuário",
      message: `Tem certeza que deseja remover o acesso para ${accountEmail}?`,
      confirmText: "Remover Usuário",
      variant: "danger",
      onConfirm: async () => {
        const updatedAccounts = accounts.filter((acc) => acc.id !== id);
        setAccounts(updatedAccounts);

        try {
          await fetch("/api/admin-accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedAccounts),
          });
          window.dispatchEvent(new CustomEvent("moldra-user-updated"));
        } catch (err) {
          console.error("Error removing account:", err);
        }
      },
    });
  };

  const getInitials = (nameStr?: string, emailStr?: string) => {
    const target = nameStr || emailStr || "U";
    const parts = target.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return target.substring(0, 2).toUpperCase();
  };

  const roles = [
    { role: "Administrador", scope: "Acesso total a todos os módulos, financeiro e configurações de equipe." },
    { role: "Comercial / Atendimento", scope: "Acesso restrito ao CRM, Funil de Leads e emissão de Orçamentos." },
    { role: "Financeiro", scope: "Acesso exclusivo a contas a pagar/receber, DRE, fluxos e emissão de recibos." },
    { role: "Equipe Criativa (Editor/Videomaker)", scope: "Acesso a Projetos, Quadro de Tarefas e check-out de equipamentos." },
    { role: "Cliente (Externo)", scope: "Acesso restrito unicamente ao Portal de Aprovação de cortes de vídeo." },
  ];

  return (
    <div className="p-8 space-y-12">
      {/* 1. Logged-in User Profile Section (Meu Perfil) */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Meu Perfil de Acesso</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Conta Conectada
            </span>
          </div>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Personalize seu nome de exibição e foto de perfil no painel de controle da Moldra Films.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-card border border-white/5 max-w-2xl">
          <form onSubmit={handleSaveMyProfile} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Profile Avatar with Hover Upload */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 group-hover:border-primary/50 overflow-hidden flex items-center justify-center transition-all shadow-lg relative">
                {myAvatarUrl ? (
                  <img
                    src={myAvatarUrl}
                    alt={myDisplayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl font-display">
                    {getInitials(myDisplayName, currentUserEmail)}
                  </div>
                )}

                {/* Upload Overlay */}
                <button
                  type="button"
                  onClick={() => myAvatarInputRef.current?.click()}
                  disabled={uploadingMyAvatar}
                  className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Alterar foto de perfil"
                >
                  {uploadingMyAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-primary mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Alterar</span>
                    </>
                  )}
                </button>
              </div>

              <input
                ref={myAvatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleMyAvatarUpload}
                className="hidden"
                disabled={uploadingMyAvatar}
              />

              <button
                type="button"
                onClick={() => myAvatarInputRef.current?.click()}
                className="mt-2 w-full text-center text-[10px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                {myAvatarUrl ? "Trocar Foto" : "Enviar Foto"}
              </button>
            </div>

            {/* Profile Details Form */}
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    required
                    value={myDisplayName}
                    onChange={(e) => setMyDisplayName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">
                    E-mail Conectado
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUserEmail || "Carregando..."}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-400 font-sans cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400 font-sans">
                  Sua foto aparecerá na barra lateral, no cabeçalho e nos comentários da equipe.
                </span>
                <button
                  type="submit"
                  disabled={savingMyProfile}
                  className="px-5 py-2 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  {savingMyProfile ? "Salvando..." : "Salvar Perfil"}
                </button>
              </div>

              {myProfileMsg && (
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-sans flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{myProfileMsg}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* 2. Access Creator Form (Criar Novo Acesso com Foto de Perfil) */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Criar Novo Acesso (Usuário / Cliente)</h3>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Cadastre novos membros da sua equipe ou envie credenciais exclusivas para seus clientes acessarem o portal.
          </p>
        </div>

        <form onSubmit={handleCreateAccess} className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-5 max-w-2xl">
          {/* Avatar upload for new user */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-gray-500" />
                )}
              </div>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md cursor-pointer transition-colors"
                  title="Remover foto"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                Foto de Perfil do Usuário (Opcional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={newAvatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                <button
                  type="button"
                  onClick={() => newAvatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-primary" />
                  )}
                  {uploadingAvatar ? "Enviando..." : avatarUrl ? "Substituir Foto" : "Selecionar Foto"}
                </button>
                {avatarUrl && (
                  <span className="text-[10px] text-green-400 font-sans flex items-center gap-1">
                    <Check className="w-3 h-3" /> Foto anexada
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Vitor Souza"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Endereço de E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@cliente.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Senha Temporária</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Defina uma senha segura"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Tipo de Acesso (Cargo)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={selectedRole === "client"}
                    onChange={() => setSelectedRole("client")}
                    className="accent-primary"
                  />
                  Cliente (Portal do Cliente)
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={selectedRole === "admin"}
                    onChange={() => setSelectedRole("admin")}
                    className="accent-primary"
                  />
                  Equipe / Admin (ERP Completo)
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingAvatar}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Criando..." : "Criar Acesso"}
            </button>
          </div>

          {msg && (
            <div className={`p-3 rounded-xl flex items-start gap-2 text-xs font-sans mt-3 border ${
              isSuccess 
                ? "bg-green-500/10 border-green-500/20 text-green-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span className="font-light leading-relaxed">{msg}</span>
            </div>
          )}
        </form>
      </div>

      {/* 3. Active Accounts List with Avatars & Quick Avatar Update */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contas de Acesso Cadastradas</h3>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Visualize todos os usuários e clientes com credenciais de login. Você pode adicionar ou alterar a foto de perfil de qualquer conta a qualquer momento.
          </p>
        </div>

        <div className="rounded-2xl bg-dark-card border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Foto / Usuário</th>
                <th className="p-4">Cargo / Nível</th>
                <th className="p-4">Data Cadastro</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300 font-sans">
              {accounts.map((acc) => {
                const isCurrent = acc.email.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <tr key={acc.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="relative group shrink-0">
                          {acc.avatarUrl ? (
                            <img
                              src={acc.avatarUrl}
                              alt={acc.name || acc.email}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs font-display">
                              {getInitials(acc.name, acc.email)}
                            </div>
                          )}

                          {/* Quick change button overlay */}
                          <label
                            className="absolute inset-0 bg-black/60 rounded-xl backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Alterar foto deste usuário"
                          >
                            {updatingAccountAvatarId === acc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                              <Camera className="w-4 h-4 text-white" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleAccountAvatarChange(acc.id, e)}
                              disabled={updatingAccountAvatarId === acc.id}
                            />
                          </label>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">
                              {acc.name || acc.email.split("@")[0]}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold uppercase">
                                Você
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 block font-light">
                            {acc.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 uppercase tracking-wider text-[10px]">
                      <span className={`px-2.5 py-1 rounded-md font-bold ${
                        acc.role === "admin" 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/10"
                      }`}>
                        {acc.role === "admin" ? "Admin / Equipe" : "Cliente"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 font-light font-mono">
                      {new Date(acc.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <label
                          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                          title="Alterar foto de perfil"
                        >
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAccountAvatarChange(acc.id, e)}
                            disabled={updatingAccountAvatarId === acc.id}
                          />
                        </label>
                        <button
                          disabled={acc.email === "admin@moldrafilms.com.br"}
                          onClick={() => handleDeleteAccount(acc.id, acc.email)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            acc.email === "admin@moldrafilms.com.br"
                              ? "text-gray-600 cursor-not-allowed opacity-35"
                              : "hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                          }`}
                          title={acc.email === "admin@moldrafilms.com.br" ? "Acesso padrão" : "Remover acesso"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-light">
                    Nenhuma conta de acesso cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Access Permission Roles */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Níveis de Permissão (NPS)</h3>
          <p className="text-xs text-gray-500 font-sans mt-1">Acesso segmentado a módulos operacionais e de faturamento.</p>
        </div>

        <div className="rounded-2xl bg-dark-card border border-white/5 divide-y divide-white/5 overflow-hidden">
          {roles.map((r, i) => (
            <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-4.5 h-4.5 text-primary" />
                <span className="text-xs font-bold font-display text-white">{r.role}</span>
              </div>
              <p className="text-xs text-gray-400 font-sans font-light leading-relaxed max-w-xl">{r.scope}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Integrations Toggle Row */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Integrações de Ferramentas</h3>
          <p className="text-xs text-gray-500 font-sans mt-1">Conecte o ERP da Moldra Films a serviços externos de armazenamento e notificações.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-dark-card border border-white/5 flex flex-col justify-between space-y-4 hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <LinkIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">{item.name}</h4>
                    <p className="text-[10px] text-gray-500 font-sans mt-1 leading-snug">{item.desc}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[9px] uppercase font-bold text-gray-400">Status Conexão</span>
                
                <button
                  onClick={() => toggleIntegration(index)}
                  className={`px-3 py-1 rounded-lg text-[9px] uppercase font-extrabold tracking-wider transition-all cursor-pointer border ${
                    item.active
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                  }`}
                >
                  {item.active ? "Ativado" : "Desativado"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Dynamic Service Categories Manager */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Categorias de Serviços da Produtora</h3>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Cadastre novas especialidades ou remova serviços que a Moldra Films não disponibiliza mais no portfólio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* List of current service categories */}
          <div className="rounded-2xl bg-dark-card border border-white/5 divide-y divide-white/5 overflow-hidden">
            {serviceTypes.map((service, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-white font-display">{service}</span>
                <button
                  onClick={() => {
                    confirmModal({
                      title: "Remover Categoria",
                      message: `Deseja realmente remover a categoria de serviço "${service}" do portfólio?`,
                      confirmText: "Remover Categoria",
                      variant: "danger",
                      onConfirm: () => {
                        deleteServiceType(service);
                      },
                    });
                  }}
                  className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                  title="Remover Categoria"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {serviceTypes.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-500">Nenhuma categoria cadastrada.</div>
            )}
          </div>

          {/* Form to add a new category */}
          <form onSubmit={handleAddService} className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4 h-fit">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nova Categoria de Serviço</label>
              <input
                type="text"
                required
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Ex: Transmissão ao Vivo (Live Streaming)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Categoria
            </button>
          </form>
        </div>
      </div>

      {/* 7. Central de Seguranca e Backups */}
      <div className="space-y-6 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Central de Segurança & Backups do Banco de Dados</h3>
              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[9px] font-bold uppercase">
                Blindagem Ativa
              </span>
            </div>
            <p className="text-xs text-gray-400 font-sans mt-1">
              Baixe uma cópia completa dos seus dados para seu computador, crie pontos de restauração no Cloudflare R2 ou restaure cadastros anteriores a qualquer momento.
            </p>
          </div>

          <button
            onClick={loadCloudBackups}
            disabled={loadingBackups}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            title="Atualizar lista de backups"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingBackups ? "animate-spin" : ""}`} />
            <span className="text-[10px] uppercase font-bold">Atualizar</span>
          </button>
        </div>

        {backupMsg && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-medium flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            {backupMsg}
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Baixar Backup Local */}
          <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-3 flex flex-col justify-between hover:border-primary/30 transition-all">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Download do Backup (JSON)</h4>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                Baixa um arquivo com todos os dados: Leads, Clientes, Projetos, Tarefas, Equipamentos, Financeiro e Configurações.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 bg-primary hover:bg-[#B39356] text-black font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow shadow-primary/20"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Cópia Agora
            </button>
          </div>

          {/* Card 2: Salvar Ponto na Nuvem (R2) */}
          <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-3 flex flex-col justify-between hover:border-blue-500/30 transition-all">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Criar Ponto na Nuvem</h4>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                Salva um snapshot congelado instantâneo no cofre do Cloudflare R2 com data e hora para recuperação imediata.
              </p>
            </div>
            <button
              onClick={handleCreateSnapshot}
              disabled={backupLoading}
              className="w-full py-2.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {backupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {backupLoading ? "Gravando Snapshot..." : "Salvar Ponto na Nuvem"}
            </button>
          </div>

          {/* Card 3: Restaurar a Partir de Arquivo */}
          <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-3 flex flex-col justify-between hover:border-yellow-500/30 transition-all">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Restaurar do Arquivo</h4>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                Selecione qualquer arquivo .json baixado anteriormente para restaurar todas as tabelas e cadastros no sistema.
              </p>
            </div>
            <input
              type="file"
              ref={restoreFileInputRef}
              accept=".json"
              onChange={handleFileRestore}
              className="hidden"
            />
            <button
              onClick={() => restoreFileInputRef.current?.click()}
              disabled={backupLoading}
              className="w-full py-2.5 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload & Restaurar
            </button>
          </div>
        </div>

        {/* Cloud Snapshots History */}
        <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileArchive className="w-4 h-4 text-primary" />
              Pontos de Restauração Salvos na Nuvem (R2 Vault)
              <span className="px-1.5 py-0.5 bg-white/5 text-gray-400 rounded text-[9px] font-mono">
                {cloudBackups.length}
              </span>
            </h4>
            <span className="text-[10px] text-gray-500 font-sans">
              Histórico seguro mantido na infraestrutura Cloudflare
            </span>
          </div>

          <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-1">
            {cloudBackups.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                Nenhum snapshot salvo na nuvem ainda. Clique em "Salvar Ponto na Nuvem" acima para criar o primeiro.
              </div>
            ) : (
              cloudBackups.map((b, i) => (
                <div key={i} className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-white/5 rounded-xl transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{b.fileName}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Gravado em: {b.formattedDate} • Tamanho: {b.sizeKb} KB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Baixar
                    </a>
                    <button
                      onClick={() => handleRestoreFromCloud(b.url, b.fileName)}
                      disabled={backupLoading}
                      className="px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Restaurar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
