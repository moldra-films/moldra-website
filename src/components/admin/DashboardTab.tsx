"use client";

import { useAdmin } from "@/context/AdminContext";
import { Film, Users, DollarSign, Calendar, Clock, ChevronRight, Activity } from "lucide-react";

export default function DashboardTab() {
  const { projects, clients, transactions, leads } = useAdmin();

  // Dynamic calculations
  const activeProjects = projects.filter((p) => p.status !== "Concluído");
  const deliveredProjectsCount = projects.filter((p) => p.status === "Concluído").length;

  const totalRevenue = transactions
    .filter((t) => t.type === "Receita" && t.status === "Pago")
    .reduce((sum, t) => sum + t.value, 0);

  const accountsReceivable = transactions
    .filter((t) => t.type === "Receita" && t.status === "Pendente")
    .reduce((sum, t) => sum + t.value, 0);

  const accountsPayable = transactions
    .filter((t) => t.type === "Despesa" && t.status === "Pendente")
    .reduce((sum, t) => sum + t.value, 0);

  const activeClientsCount = clients.length;
  const pendingLeadsCount = leads.length;

  // Format currency helper
  const formatCurrency = (val: number) => {
    return "R$ " + val.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
  };

  const metrics = [
    { label: "Projetos Ativos", value: activeProjects.length, icon: Film, color: "text-blue-400" },
    { label: "Clientes Ativos", value: activeClientsCount, icon: Users, color: "text-green-400" },
    { label: "Leads em Negociação", value: pendingLeadsCount, icon: Clock, color: "text-yellow-400" },
    { label: "Faturamento Acumulado", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-primary" },
    { label: "A Receber", value: formatCurrency(accountsReceivable), icon: DollarSign, color: "text-purple-400" },
    { label: "A Pagar", value: formatCurrency(accountsPayable), icon: DollarSign, color: "text-red-400" },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-dark-card border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500 font-sans font-light tracking-wide">{metric.label}</span>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </div>
            <span className="text-xl font-bold font-display text-white">{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Analytics Charts & System Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SVG Analytics Chart 1 */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-dark-card border border-white/5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Receita Mensal</h3>
            <span className="text-xs text-primary font-semibold">Tendência 2026</span>
          </div>
          {/* Custom SVG Bar Chart */}
          <div className="relative h-64 w-full flex items-end justify-between px-2 pt-6">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-white/5 h-[1px]" />
              <div className="w-full border-t border-white/5 h-[1px]" />
              <div className="w-full border-t border-white/5 h-[1px]" />
              <div className="w-full border-t border-white/5 h-[1px]" />
            </div>

            {/* Bars */}
            {[
              { month: "Jan", val: 32000, pct: "45%" },
              { month: "Fev", val: 28000, pct: "39%" },
              { month: "Mar", val: 45000, pct: "64%" },
              { month: "Abr", val: 62000, pct: "88%" },
              { month: "Mai", val: 49000, pct: "70%" },
              { month: "Jun", val: 56000, pct: "80%" },
              { month: "Jul", val: 71000, pct: "100%" },
            ].map((d, index) => (
              <div key={index} className="flex flex-col items-center gap-2 group relative z-10 w-1/12">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-[10px] text-primary font-bold whitespace-nowrap z-20 shadow-lg">
                  {formatCurrency(d.val)}
                </div>
                {/* Bar */}
                <div
                  style={{ height: d.pct }}
                  className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-md transition-all duration-500 group-hover:brightness-110 group-hover:scale-y-[1.02] origin-bottom shadow-lg shadow-primary/10"
                />
                <span className="text-[10px] text-gray-500 font-sans mt-2">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-dark-card border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Categorias</h3>
            <div className="space-y-4">
              {[
                { label: "Vídeo Institucional", val: 40, color: "bg-primary" },
                { label: "Comercial", val: 30, color: "bg-blue-500" },
                { label: "Redes Sociais", val: 15, color: "bg-yellow-500" },
                { label: "Fotografia", val: 10, color: "bg-purple-500" },
                { label: "Drone", val: 5, color: "bg-red-500" },
              ].map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-light font-sans">{c.label}</span>
                    <span className="text-white font-bold">{c.val}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color}`} style={{ width: `${c.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-gray-500 font-sans font-light mt-6 text-center">
            Mapeado com base no faturamento de 2026.
          </div>
        </div>
      </div>

      {/* Agenda & Latest Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agenda Card */}
        <div className="p-6 rounded-2xl bg-dark-card border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Próximas Gravações</h3>
            </div>
            <span className="text-xs text-gray-500 font-sans">Pauta semanal</span>
          </div>

          <div className="space-y-4">
            {activeProjects.length > 0 ? (
              activeProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1 font-display">{p.name}</h4>
                    <p className="text-[11px] text-gray-400 font-sans font-light">
                      {p.location} &bull; <span className="text-primary font-medium">{p.serviceType}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-white block">{p.dateShoot}</span>
                    <span className="text-[10px] text-gray-500 font-sans uppercase font-medium">{p.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-500 font-sans">
                Nenhum projeto agendado para gravação
              </div>
            )}
          </div>
        </div>

        {/* Latest activity stream */}
        <div className="p-6 rounded-2xl bg-dark-card border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Últimas Atividades</h3>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { user: "Natália Camurça", action: "adicionou comentário no projeto", target: "Coleção Verão Apex", time: "Há 10 minutos" },
              { user: "Mikelly Maduro", action: "converteu o lead para cliente", target: "Construtora Viver", time: "Há 2 horas" },
              { user: "Sistema", action: "gerou fatura de entrada para o projeto", target: "Innova Corp", time: "Há 5 horas" },
              { user: "Carlos Silva", action: "solicitou manutenção do equipamento", target: "DJI Inspire 3 Drone", time: "Ontem" },
            ].map((act, i) => (
              <div key={i} className="flex gap-3 text-xs leading-relaxed py-1.5">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-white">{act.user}</span>{" "}
                  <span className="text-gray-400 font-light">{act.action}</span>{" "}
                  <span className="text-primary font-medium">{act.target}</span>
                  <span className="block text-[10px] text-gray-500 font-sans mt-0.5">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
