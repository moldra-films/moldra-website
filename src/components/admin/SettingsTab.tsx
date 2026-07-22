"use client";

import { useState } from "react";
import { Settings, Shield, HardDrive, Link, ShieldCheck, Database, Sliders } from "lucide-react";

export default function SettingsTab() {
  const [integrations, setIntegrations] = useState([
    { name: "Google Calendar", active: true, desc: "Sincronização de diárias e filmagens" },
    { name: "Google Drive & Dropbox", active: true, desc: "Biblioteca de roteiros e logos" },
    { name: "WhatsApp Business API", active: false, desc: "Avisos automáticos de orçamentos e aprovações" },
    { name: "Stripe & Asaas gateway", active: false, desc: "Faturamento e recebimento em cartão/boleto" },
    { name: "Slack & Discord webhook", active: true, desc: "Log de atividades de produção interno" },
  ]);

  const toggleIntegration = (index: number) => {
    setIntegrations((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, active: !item.active } : item))
    );
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
      {/* Integrations Toggle Row */}
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
                    <Link className="w-4 h-4 text-primary" />
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

      {/* Access Permission Roles */}
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
    </div>
  );
}
