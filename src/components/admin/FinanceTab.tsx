"use client";

import { useState } from "react";
import { useAdmin, Transaction } from "@/context/AdminContext";
import { Plus, Check, DollarSign, FileText, Send, Share2, Printer, X } from "lucide-react";

export default function FinanceTab() {
  const { transactions, clients, addTransaction, markTransactionPaid } = useAdmin();
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null);

  // New Transaction Form State
  const [newTrans, setNewTrans] = useState({
    type: "Receita" as Transaction["type"],
    category: "Projetos",
    value: 0,
    description: "",
    customer: clients[0]?.company || "Geral",
  });

  // Invoice builder state
  const [invoiceForm, setInvoiceForm] = useState({
    client: clients[0]?.company || "Innova Corp",
    itemDesc: "Serviço de Captação e Edição de Vídeo Comercial",
    itemQty: 1,
    itemPrice: 15000,
    paymentMethod: "50% entrada + 50% entrega (Boleto)",
    deadlineDays: 15,
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      type: newTrans.type,
      category: newTrans.category,
      value: Number(newTrans.value),
      date: new Date().toISOString().split("T")[0],
      description: newTrans.description,
      status: "Pendente",
      customer: newTrans.customer,
    });
    setNewTrans({
      type: "Receita",
      category: "Projetos",
      value: 0,
      description: "",
      customer: clients[0]?.company || "Geral",
    });
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add transaction to context
    const totalVal = invoiceForm.itemPrice * invoiceForm.itemQty;
    const desc = `${invoiceForm.itemDesc} (Orçamento Gerado)`;
    
    addTransaction({
      type: "Receita",
      category: "Projetos",
      value: totalVal,
      date: new Date().toISOString().split("T")[0],
      description: desc,
      status: "Pendente",
      customer: invoiceForm.client,
    });

    // Automatically display the receipt for printing
    const dummyTrans: Transaction = {
      id: transactions.length + 1,
      type: "Receita",
      category: "Projetos",
      value: totalVal,
      date: new Date().toISOString().split("T")[0],
      description: desc,
      status: "Pendente",
      customer: invoiceForm.client,
    };
    
    setShowReceipt(dummyTrans);
    setShowInvoiceBuilder(false);
  };

  // Calculations
  const receitas = transactions.filter((t) => t.type === "Receita");
  const despesas = transactions.filter((t) => t.type === "Despesa");

  const totalReceitasPagas = receitas.filter((t) => t.status === "Pago").reduce((s, t) => s + t.value, 0);
  const totalDespesasPagas = despesas.filter((t) => t.status === "Pago").reduce((s, t) => s + t.value, 0);
  const totalImpostos = totalReceitasPagas * 0.06; // 6% simplified tax representation
  const lucroLiquido = totalReceitasPagas - totalDespesasPagas - totalImpostos;

  return (
    <div className="p-8 space-y-12">
      {/* Upper Widgets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">ERP Financeiro & Fluxo de Caixa</h2>
          <p className="text-xs text-gray-500 font-sans mt-1">Gere propostas de orçamentos, faturas, controle contas a pagar e consulte o DRE.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowInvoiceBuilder(true)}
            className="px-5 py-2.5 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Gerar Orçamento / Fatura
          </button>
        </div>
      </div>

      {/* Simplified DRE metrics display panel */}
      <div className="p-6 rounded-2xl bg-dark-card border border-white/5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">DRE Simplificado (Demonstrativo do Resultado do Exercício)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-black/35 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-sans">Receita Bruta</span>
            <span className="text-lg font-bold text-white block mt-1">R$ {totalReceitasPagas.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl bg-black/35 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-sans">Despesas Operacionais</span>
            <span className="text-lg font-bold text-white block mt-1">R$ {totalDespesasPagas.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl bg-black/35 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-sans">Impostos Estimados (6%)</span>
            <span className="text-lg font-bold text-red-400 block mt-1">R$ {totalImpostos.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <span className="text-[10px] text-primary uppercase font-bold">Lucro Líquido Real</span>
            <span className="text-lg font-bold text-primary block mt-1">R$ {lucroLiquido.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Ledger of Cash Flow and Quick Entry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cash Flow Ledger Transactions */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Livro Caixa / Transações Recentes</h3>
          <div className="rounded-2xl bg-dark-card border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20 text-gray-400 font-semibold tracking-wider uppercase text-[10px]">
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((trans) => (
                    <tr key={trans.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-white block font-sans">{trans.description}</span>
                        <span className="text-[10px] text-gray-500 font-sans block">{trans.customer}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            trans.type === "Receita"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {trans.type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">R$ {trans.value.toLocaleString()}</td>
                      <td className="p-4 text-gray-300 font-mono">{trans.date}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                            trans.status === "Pago"
                              ? "bg-green-500/5 border-green-500/20 text-green-400"
                              : "bg-yellow-500/5 border-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {trans.status}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        {trans.status === "Pendente" && (
                          <button
                            onClick={() => markTransactionPaid(trans.id)}
                            className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded text-[9px] uppercase font-bold cursor-pointer transition-colors"
                          >
                            Baixar
                          </button>
                        )}
                        <button
                          onClick={() => setShowReceipt(trans)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded text-[9px] uppercase font-bold cursor-pointer transition-colors"
                        >
                          Recibo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Transaction Entry Form */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-dark-card border border-white/5 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Lançamento Rápido</h3>
          <form onSubmit={handleCreateTransaction} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Tipo de Lançamento</label>
              <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewTrans({ ...newTrans, type: "Receita" })}
                  className={`py-2 text-[10px] uppercase font-bold rounded-lg cursor-pointer ${
                    newTrans.type === "Receita" ? "bg-primary text-black" : "text-gray-400"
                  }`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => setNewTrans({ ...newTrans, type: "Despesa" })}
                  className={`py-2 text-[10px] uppercase font-bold rounded-lg cursor-pointer ${
                    newTrans.type === "Despesa" ? "bg-red-500 text-white" : "text-gray-400"
                  }`}
                >
                  Despesa
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Descrição</label>
              <input
                type="text"
                required
                value={newTrans.description}
                onChange={(e) => setNewTrans({ ...newTrans, description: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                placeholder="Fatura de energia, Cachê editor..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Valor (R$)</label>
                <input
                  type="number"
                  required
                  value={newTrans.value || ""}
                  onChange={(e) => setNewTrans({ ...newTrans, value: Number(e.target.value) })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="3000"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Entidade / Cliente</label>
                <input
                  type="text"
                  required
                  value={newTrans.customer}
                  onChange={(e) => setNewTrans({ ...newTrans, customer: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="Innova Corp / Bruna Freelancer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Lançar Fatura
            </button>
          </form>
        </div>
      </div>

      {/* Invoice Builder Modal */}
      {showInvoiceBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gerar Fatura / Orçamento de Serviço</h3>
              <button onClick={() => setShowInvoiceBuilder(false)} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Cliente Destinatário</label>
                <select
                  value={invoiceForm.client}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, client: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.company}>{c.company}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Especificação do Item</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.itemDesc}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, itemDesc: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Quantidade</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.itemQty}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, itemQty: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.itemPrice}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, itemPrice: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Condição de Pagamento</label>
                  <input
                    type="text"
                    value={invoiceForm.paymentMethod}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Validade da Proposta (Dias)</label>
                  <input
                    type="number"
                    value={invoiceForm.deadlineDays}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, deadlineDays: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Gerar & Exibir Fatura
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Recibo / Print Invoice popover overlay */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white text-black p-8 rounded-2xl shadow-2xl relative border border-gray-200">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-6">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#B39356]">Moldra Films Ltda.</span>
                <h3 className="text-xl font-bold font-display mt-1">FATURA DE ORÇAMENTO / SERVIÇO</h3>
                <span className="text-[10px] text-gray-500 font-sans block mt-1">CNPJ: 45.988.112/0001-90 | contato@moldrafilms.com</span>
              </div>
              <button
                onClick={() => setShowReceipt(null)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black cursor-pointer absolute right-4 top-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Invoicing Info */}
            <div className="grid grid-cols-2 gap-8 text-xs mb-8">
              <div>
                <span className="block font-bold text-gray-500 uppercase text-[9px] tracking-wider">Destinatário</span>
                <span className="font-bold block text-sm mt-1">{showReceipt.customer}</span>
                <span className="text-gray-600 font-sans font-light mt-1 block">Faturamento institucional comercial.</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-gray-500 uppercase text-[9px] tracking-wider">Fatura Detalhes</span>
                <span className="block mt-1">Número: <span className="font-mono font-bold">#MOL-029{showReceipt.id}</span></span>
                <span className="block text-gray-600 font-sans">Data Emissão: {showReceipt.date}</span>
                <span className="block text-gray-600 font-sans">Status: <span className="font-bold text-[#B39356]">{showReceipt.status}</span></span>
              </div>
            </div>

            {/* Price Table description */}
            <div className="border border-gray-300 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 font-bold uppercase text-[9px] tracking-wider text-gray-600">
                    <th className="p-3">Item / Descrição</th>
                    <th className="p-3 text-center">Quant.</th>
                    <th className="p-3 text-right">Unitário</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-3 font-semibold text-gray-800">{showReceipt.description}</td>
                    <td className="p-3 text-center text-gray-600">1</td>
                    <td className="p-3 text-right text-gray-600">R$ {showReceipt.value.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-gray-800">R$ {showReceipt.value.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total balance row */}
            <div className="flex justify-between items-center border-t border-gray-300 pt-6 mb-8">
              <span className="text-xs text-gray-500">Impostos retidos na fonte: 6% tomados pelo prestador.</span>
              <div className="text-right">
                <span className="text-xs uppercase font-bold text-gray-500 block">Total Geral</span>
                <span className="text-2xl font-bold font-display text-black block mt-1">R$ {showReceipt.value.toLocaleString()}</span>
              </div>
            </div>

            {/* Simulated Action buttons */}
            <div className="flex gap-4 border-t border-gray-200 pt-6">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Fatura
              </button>
              <button
                onClick={() => {
                  alert("Link da Fatura copiado para área de transferência!");
                }}
                className="py-3 px-6 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
