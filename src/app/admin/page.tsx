"use client";

import { useState } from "react";
import { AdminProvider } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

// Tabs
import DashboardTab from "@/components/admin/DashboardTab";
import CRMTab from "@/components/admin/CRMTab";
import ProjectsTab from "@/components/admin/ProjectsTab";
import TasksTab from "@/components/admin/TasksTab";
import FinanceTab from "@/components/admin/FinanceTab";
import InventoryTab from "@/components/admin/InventoryTab";
import ApprovalTab from "@/components/admin/ApprovalTab";
import AICopilotTab from "@/components/admin/AICopilotTab";
import SettingsTab from "@/components/admin/SettingsTab";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Painel de Controle Principal";
      case "crm":
        return "CRM & Gestão de Leads";
      case "projects":
        return "Projetos & Pauta de Gravações";
      case "tasks":
        return "Gerenciamento de Tarefas";
      case "finance":
        return "Faturamentos & Contabilidade";
      case "inventory":
        return "Gestão de Inventário & Locações";
      case "approval":
        return "Portal do Cliente & Aprovação";
      case "copilot":
        return "IA Copilot Produtora";
      case "settings":
        return "Configurações Globais";
      default:
        return "Painel Administrativo";
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "crm":
        return <CRMTab />;
      case "projects":
        return <ProjectsTab />;
      case "tasks":
        return <TasksTab />;
      case "finance":
        return <FinanceTab />;
      case "inventory":
        return <InventoryTab />;
      case "approval":
        return <ApprovalTab />;
      case "copilot":
        return <AICopilotTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <AdminProvider>
      <div className="flex h-screen bg-[#0B0B0B] text-white overflow-hidden font-sans">
        {/* Fixed Left Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Flex-grow Main Content Panel */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header Panel */}
          <AdminHeader title={getTabTitle()} />

          {/* Tab Content Display Area */}
          <main className="flex-1 overflow-y-auto bg-black/30">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
