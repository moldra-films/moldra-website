import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Moldra Films",
  description: "Leia atentamente os termos e condições para utilização dos serviços e recursos oferecidos pela Moldra Films.",
};

export default function TermsOfUsePage() {
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
            <Scale className="w-3.5 h-3.5" />
            Termos e Condições
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display uppercase tracking-wider text-white">
            Termos de Uso
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Última atualização: 14 de Agosto de 2026
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-6 sm:p-10 space-y-8 font-light text-sm text-gray-300 leading-relaxed">
          <p>
            Seja bem-vindo ao site da **Moldra Films**. Ao navegar em nosso site ou contratar qualquer um de nossos serviços de produção audiovisual, você concorda e aceita cumprir de forma integral os seguintes Termos de Uso. Recomendamos que leia este documento com atenção.
          </p>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              1. Aceitação dos Termos
            </h2>
            <p>
              Estes termos regulam a utilização do nosso site e a contratação inicial dos serviços prestados pela Moldra Films. Caso você não concorde com alguma das cláusulas aqui descritas, solicitamos que não continue a utilização do site e não contrate nossos serviços.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              2. Serviços e Orçamentos
            </h2>
            <p>
              A Moldra Films atua na criação e produção de conteúdo audiovisual cinematográfico, incluindo comerciais de TV/Internet, vídeos corporativos, captação aérea com drone, fotografia profissional e edição de vídeos.
            </p>
            <p>
              Os orçamentos enviados por meio de nossos canais de contato possuem validade limitada a partir da data de envio, conforme especificado no próprio documento de proposta comercial. A execução de qualquer projeto depende da assinatura de um contrato formal de prestação de serviços.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              3. Propriedade Intelectual e Direitos Autorais
            </h2>
            <p>
              Toda a propriedade intelectual associada ao material criado, incluindo marcas, logos, textos, elementos gráficos, vídeos demonstrativos e layouts contidos em nosso site, pertencem exclusivamente à Moldra Films ou estão sob licença de uso autorizada.
            </p>
            <p>
              Em relação aos projetos audiovisuais contratados pelos clientes, a transferência de direitos autorais patrimoniais do produto final (vídeo finalizado) será regulada especificamente por contrato de prestação de serviços celebrado entre as partes, ocorrendo somente após a quitação total do pagamento do projeto.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              4. Obrigações do Usuário e Cliente
            </h2>
            <p>
              Ao utilizar nossa plataforma ou contratar nossos serviços, você se compromete a:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>Fornecer informações cadastrais e dados de contato verídicos e atualizados.</li>
              <li>Não utilizar nosso site para propagar conteúdos maliciosos, vírus, spam ou para tentar invadir nossos sistemas protegidos.</li>
              <li>Fornecer o briefing, materiais de apoio e aprovações de cortes de vídeo dentro dos prazos operacionais acordados em cronograma de produção.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              5. Prazos e Cancelamentos
            </h2>
            <p>
              Os prazos de entrega dos vídeos são estimados conforme a complexidade de cada projeto no momento do briefing comercial. Qualquer cancelamento, rescisão ou renegociação de cronograma após o início de produções (etapas de roteiro, pré-produção ou gravação) estará sujeito a multas contratuais compensatórias previamente estipuladas no contrato do projeto.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              6. Limitação de Responsabilidade
            </h2>
            <p>
              A Moldra Films busca manter este site em pleno funcionamento, sem erros ou quedas. No entanto, não nos responsabilizamos por interrupções temporárias decorrentes de falhas técnicas ou de internet de terceiros que estejam fora de nosso controle direto.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              7. Alterações nestes Termos
            </h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento, visando adequação legal ou mudanças em nossos processos internos. Alterações entrarão em vigor no momento de sua publicação em nosso site.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display border-l-2 border-primary pl-3">
              8. Foro e Lei Aplicável
            </h2>
            <p>
              Estes Termos de Uso são regidos e interpretados em conformidade com as leis da República Federativa do Brasil. Fica eleito o Foro da Comarca de São Paulo, SP, para dirimir qualquer controvérsia oriunda deste documento, com expressa renúncia a qualquer outro foro, por mais privilegiado que seja.
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
