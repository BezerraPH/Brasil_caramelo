import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";

export default function TermosPage() {
  return (
    <PageContainer narrow>
      <header className="bc-page-header bc-animate-in mb-8 text-center">
        <span className="text-4xl">📜🐾</span>
        <h1 className="mt-2 text-3xl font-black text-bc-blue sm:text-4xl">
          Termos de Uso & Política de Privacidade
        </h1>
        <p className="mt-1 text-sm font-semibold text-bc-brown">
          Transparência total sobre seus dados na Matilha Web2 e na Rede Descentralizada Web3 (Nostr)
        </p>
      </header>

      <div className="space-y-6 text-justify text-xs leading-relaxed text-bc-brown">
        {/* Seção 1: Introdução */}
        <section className="bc-card p-6 border border-bc-caramel/25 bg-bc-white shadow-sm space-y-3">
          <h2 className="text-base font-black text-bc-blue flex items-center gap-2">
            <span>🐕</span> 1. Sobre o Brasil Caramelo
          </h2>
          <p>
            O <strong>Brasil Caramelo</strong> é uma plataforma social brasileira projetada para unir a nostalgia das comunidades e do design clássico com a soberania digital da web descentralizada. Para garantir máxima liberdade e segurança aos membros da matilha, oferecemos dois ecossistemas integrados: o <strong>Ecossistema Local da Matilha (Web2)</strong> e a <strong>Rede Descentralizada Soberana (Nostr / Web3)</strong>.
          </p>
        </section>

        {/* Seção 2: LGPD e Dados Locais */}
        <section className="bc-card p-6 border border-bc-caramel/25 bg-bc-white shadow-sm space-y-3">
          <h2 className="text-base font-black text-bc-green flex items-center gap-2">
            <span>🇧🇷</span> 2. Ecossistema Web2 e Conformidade com a LGPD
          </h2>
          <p>
            No modo padrão de cadastro e uso do aplicativo, seus dados são armazenados no servidor da matilha sob rígida conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Direito ao Esquecimento e Exclusão:</strong> Você pode solicitar a exclusão definitiva de sua conta, fotos, recados locais e dados de perfil a qualquer momento através das Configurações.</li>
            <li><strong>Portabilidade de Dados:</strong> Disponibilizamos exportação completa dos seus dados em formato JSON em <em>Configurações &rarr; Privacidade &rarr; Exportar Dados</em>.</li>
            <li><strong>Finalidade e Sigilo:</strong> Suas credenciais de login e e-mails são protegidos por criptografia e jamais são compartilhados ou vendidos para terceiros.</li>
          </ul>
        </section>

        {/* Seção 3: Modo Livre Nostr Web3 */}
        <section className="bc-card p-6 border border-amber-500/30 bg-amber-500/5 shadow-sm space-y-3">
          <h2 className="text-base font-black text-amber-900 flex items-center gap-2">
            <span>⚡</span> 3. Modo Livre & Rede Descentralizada (Nostr / Web3)
          </h2>
          <p>
            Ao utilizar o <strong>Modo Livre (Nostr)</strong>, conectar sua chave criptográfica (<span className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-amber-950 font-bold">npub</span> / <span className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-amber-950 font-bold">nsec</span>) ou assinar eventos públicos:
          </p>
          <div className="rounded-xl border border-amber-500/30 bg-bc-white p-3 font-semibold text-amber-900">
            ⚠️ <strong>Aviso de Imutabilidade Descentralizada:</strong> As publicações, zaps e notas emitidas no protocolo Nostr são distribuídas diretamente para relays (servidores públicos mundiais independentes). Por natureza técnica da arquitetura descentralizada, o Brasil Caramelo não possui controle sobre relays de terceiros, tornando os dados públicos imutáveis e permanentes na rede global.
          </div>
          <p>
            O usuário tem plena autonomia sobre suas chaves privadas. As mensagens privadas do Modo Livre são protegidas por criptografia ponta-a-ponta (NIP-44 / NIP-04) e só podem ser lidas pelo remetente e destinatário.
          </p>
        </section>

        {/* Seção 4: Moderação Comunitária */}
        <section className="bc-card p-6 border border-bc-caramel/25 bg-bc-white shadow-sm space-y-3">
          <h2 className="text-base font-black text-bc-blue flex items-center gap-2">
            <span>⚖️</span> 4. Moderação e Tribunal do Cão
          </h2>
          <p>
            No ecossistema da matilha, prezamos por um ambiente seguro, acolhedor e livre de discurso de ódio, assédio ou crimes digitais. Conteúdos com múltiplas denúncias da comunidade são julgados democraticamente no <strong>Tribunal do Cão</strong> por membros com alta reputação. Casos condenados são removidos do banco local da plataforma.
          </p>
        </section>

        <div className="text-center pt-4">
          <Link
            href="/feed"
            className="rounded-2xl bg-gradient-to-r from-bc-green to-bc-caramel px-6 py-2.5 text-xs font-black text-white shadow-md hover:opacity-95 transition"
          >
            ← Voltar para o Feed Principal
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
