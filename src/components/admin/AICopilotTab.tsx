"use client";

import { useState } from "react";
import { Cpu, Send, Sparkles, BookOpen, RefreshCw, FileText, CheckSquare, MessageSquare } from "lucide-react";

export default function AICopilotTab() {
  const [activeSubTool, setActiveSubTool] = useState<"roteiro" | "resumo" | "checklist">("roteiro");
  const [inputPrompt, setInputPrompt] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    setLoading(true);
    setGeneratedOutput("");

    // Simulate AI inference time
    setTimeout(() => {
      setLoading(false);
      if (activeSubTool === "roteiro") {
        setGeneratedOutput(`### Roteiro Cinematográfico Auto-Gerado: "${inputPrompt}"
---

**CENA 1 - INTRODUÇÃO (Abertura de Impacto)**
* **Visual:** Tomada aérea aproximando-se lentamente da locação. Luz baixa (Golden Hour). Transição fluida com velocidade acelerada em direção ao close-up do protagonista.
* **Áudio:** Trilha sonora eletrônica de batida pesada com início suave (crescendo gradativo). Efeitos sonoros sutis de vento e batidas sincronizadas.
* **Locução (V.O.):** "Grandes momentos não acontecem por acaso. Eles são construídos de forma intencional."

**CENA 2 - O DESAFIO (Conexão e Dores)**
* **Visual:** Close-up macro no rosto concentrado do protagonista. Gotas de suor/detalhe de expressão. Transição rápida lateral.
* **Áudio:** Batida abafada, foco nos efeitos sonoros ambientes (foley de respiração profunda e passos rápidos).
* **Locução (V.O.):** "Cada segundo conta quando o seu objetivo é redefinir limites."

**CENA 3 - A SOLUÇÃO (Moldra Films final cut)**
* **Visual:** Luzes cênicas brilhando de trás, silhueta do produto/serviço sendo executado com máxima nitidez (resolução 8K). Slow motion de 120fps.
* **Áudio:** Trilha explode em batidas intensas e animadoras.
* **Locução (V.O.):** "Com a Moldra Films, a história da sua marca ganha a força visual que ela realmente merece."

**CENA 4 - CALL TO ACTION (Fechamento)**
* **Visual:** Tela escura com logo central da empresa em ouro escovado.
* **Áudio:** Finalização harmônica e ecoante.
* **Texto em tela:** "Solicite um orçamento. Moldra Films."`);
      } else if (activeSubTool === "resumo") {
        setGeneratedOutput(`### Resumo Analítico de Briefing / Reunião
---

**1. Objetivos Principais:**
* Transmitir sofisticação técnica e precisão operacional da marca.
* Apresentar o novo portfólio corporativo em múltiplos formatos para campanhas patrocinadas (Linkedin/Instagram).

**2. Público-Alvo:**
* Diretores de arte, gerentes de produto, agências criativas e investidores institucionais.

**3. Entregas Acordadas:**
* 1x Filme Principal (16:9) - Duração de 1min30s.
* 3x Teasers Verticais (9:16) - Duração de 15s cada.
* Cobertura fotográfica em alta definição dos bastidores do set de gravação.

**4. Ações Recomendadas pela IA:**
* Agendar visita técnica na locação com pelo menos 48h de antecedência.
* Utilizar lentes anamórficas para destacar a textura metálica dos produtos no corte comercial.`);
      } else {
        setGeneratedOutput(`### Checklist de Equipamentos & Produção Sugerido
---

**CATEGORIA: CÂMERAS & LENTES**
* [ ] Câmera Principal (Sony FX3 ou RED Raptor)
* [ ] Lente Prime 35mm f/1.4 (Entrevistas)
* [ ] Lente Prime 85mm f/1.4 (Retratos e close-ups)
* [ ] Filtros ND Variáveis e Filtro Mist (Estilo difusão cênica)

**CATEGORIA: ESTABILIZAÇÃO & DIÁRIA**
* [ ] Gimbal Robótico (DJI Ronin RS3 Pro)
* [ ] Tripé hidráulico de vídeo pesado
* [ ] Drone DJI Inspire 3 + Baterias sobressalentes carregadas

**CATEGORIA: ILUMINAÇÃO & ÁUDIO**
* [ ] Iluminador Led Principal (Aputure 600d Pro + Softbox)
* [ ] Bastões de Led RGB (Nanlite PavoTube) para iluminação de preenchimento
* [ ] Gravador Zoom H6 + Microfone Lapela sem fio (Rode Wireless PRO)

**CATEGORIA: LOGÍSTICA**
* [ ] Termos impressos de cessão de direitos de imagem e locação assinados
* [ ] HDs formatados em sistema exFAT`);
      }
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-white">IA Copilot Audiovisual</h2>
            <p className="text-xs text-gray-500 font-sans mt-1">Gere roteiros estruturados, resumos de reuniões e checklists técnicos integrados por IA.</p>
          </div>
        </div>

        {/* Sub-tools switchers */}
        <div className="flex bg-dark-card border border-white/5 p-1 rounded-xl">
          {([
            { id: "roteiro", label: "Roteirizador", icon: BookOpen },
            { id: "resumo", label: "Resumidor", icon: FileText },
            { id: "checklist", label: "Checklists", icon: CheckSquare },
          ] as const).map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveSubTool(tool.id);
                setGeneratedOutput("");
                setInputPrompt("");
              }}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTool === tool.id ? "bg-primary text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <tool.icon className="w-3.5 h-3.5" />
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Field */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-dark-card border border-white/5 flex flex-col justify-between h-[350px]">
          <div className="space-y-4">
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Copilot Prompt
            </span>
            <p className="text-xs text-gray-400 font-sans font-light leading-relaxed">
              {activeSubTool === "roteiro"
                ? "Digite a ideia ou tema do vídeo institucional/comercial para que a IA gere um roteiro com descrição visual e áudio por cenas."
                : activeSubTool === "resumo"
                ? "Insira as anotações brutas ou transcrições de reuniões para consolidar objetivos e cronogramas recomendados."
                : "Digite o escopo da gravação (ex: Gravação externa na praia) para gerar a lista de equipamentos sugerida."}
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <textarea
              required
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              rows={4}
              placeholder={
                activeSubTool === "roteiro"
                  ? "Ex: Vídeo de lançamento de produto tecnológico minimalista e premium..."
                  : activeSubTool === "resumo"
                  ? "Ex: Transcrição: Conversa com Julio da Apex. Quer um Reels em 4K focando em esportes..."
                  : "Ex: Gravação de depoimentos corporativos em estúdio interno fechado..."
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary resize-none font-sans font-light"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-[#B39356] text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Gerar com Inteligência Artificial
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output View */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-dark-card border border-white/5 h-[350px] overflow-y-auto relative">
          {generatedOutput ? (
            <div className="text-xs text-gray-300 font-sans font-light leading-relaxed whitespace-pre-wrap">
              {generatedOutput}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
              <Cpu className="w-10 h-10 text-gray-600 mb-4 animate-pulse" />
              <p className="text-xs font-sans font-light">Aguardando dados de entrada para processamento...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
