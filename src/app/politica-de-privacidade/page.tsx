import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Moldra Films",
  description: "Entenda como a Moldra Films coleta, utiliza e protege suas informações pessoais de acordo com a LGPD.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary/20 relative overflow-hidden py-12 px-6">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors uppercase tracking-widest font-bold">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Moldra Films Logo"
              width={120}
              height={35}
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Header Title */}
        <div className="space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Segurança e Privacidade
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display uppercase tracking-wider text-white">
            Política de Privacidade
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Última atualização: 14 de Agosto de 2026
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-6 sm:p-10 space-y-8 font-light text-sm text-gray-300 leading-relaxed">
          <p>
            A **Moldra Films** está totalmente comprometida em proteger a sua privacidade e garantir a segurança dos seus dados pessoais. Esta Política de Privacidade explica detalhadamente como coletamos, usamos, processamos e protegemos as suas informações, em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              1. Coleta de Informações
            </h2>
            <p>
              Coletamos informações que você nos fornece voluntariamente quando interage conosco através de nosso site, formulários de contato, briefing de projetos ou durante a contratação de nossos serviços. Essas informações incluem:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>**Dados de Identificação:** Nome completo, cargo, nome da empresa.</li>
              <li>**Dados de Contato:** Endereço de e-mail, número de telefone (WhatsApp) e endereço comercial.</li>
              <li>**Dados de Projetos:** Briefings de vídeo, links externos compartilhados e outras referências audiovisuais.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              2. Como Utilizamos Seus Dados
            </h2>
            <p>
              Todos os dados pessoais coletados são utilizados para finalidades legítimas relacionadas à prestação de nossos serviços de produção audiovisual, incluindo:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>Responder às solicitações de orçamento e mensagens enviadas pelos nossos formulários.</li>
              <li>Viabilizar a execução, edição, aprovação de cortes e entrega dos projetos audiovisuais acordados.</li>
              <li>Gerenciar acessos ao nosso portal do cliente e ambiente ERP para acompanhamento de tarefas.</li>
              <li>Enviar comunicações sobre atualizações do andamento dos projetos contratados.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              3. Cookies e Tecnologias de Rastreamento
            </h2>
            <p>
              Utilizamos cookies e tecnologias similares para coletar informações analíticas agregadas sobre as visitas em nosso site (como páginas acessadas e tempo de permanência), o que nos ajuda a otimizar a experiência de navegação do usuário. Você pode gerenciar as preferências de cookies diretamente nas configurações do seu navegador de internet.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              4. Compartilhamento de Dados com Terceiros
            </h2>
            <p>
              Não comercializamos nem compartilhamos seus dados pessoais com terceiros para fins publicitários. O compartilhamento ocorre exclusivamente com parceiros tecnológicos e ferramentas necessárias para o funcionamento e hospedagem do nosso site e sistemas internos (como provedores de armazenamento em nuvem e o próprio banco de dados seguro do Supabase).
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              5. Segurança da Informação
            </h2>
            <p>
              Implementamos medidas de segurança técnicas e administrativas rígidas para proteger os seus dados pessoais contra acessos não autorizados, perdas, destruições ou alterações. Suas informações são guardadas em servidores seguros com criptografia e acesso controlado.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              6. Seus Direitos sob a LGPD
            </h2>
            <p>
              Você, como titular dos dados, possui total controle e pode exercer a qualquer momento os seguintes direitos:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>Confirmar a existência do tratamento de dados pessoais.</li>
              <li>Acessar suas informações guardadas em nossa base de dados.</li>
              <li>Solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a exclusão definitiva dos seus dados de nosso sistema, desde que não sejam necessários para o cumprimento de obrigações legais ou execução contratual em andamento.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              7. Contato e Encarregado de Proteção de Dados
            </h2>
            <p>
              Se você tiver qualquer dúvida em relação a esta Política de Privacidade ou desejar exercer algum de seus direitos descritos acima, entre em contato diretamente conosco pelo e-mail: **privacidade@moldrafilms.com.br**.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-white/5">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Moldra Films. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
