// ============================================================
// Home.jsx — Página Pública Institucional
// Sistema de Gestão para Salva-Vidas — CBMSC
//
// Esta é a tela exibida para usuários NÃO autenticados.
// Transmite identidade oficial do Corpo de Bombeiros Militar
// de Santa Catarina (CBMSC).
//
// Alterações visuais ficam aqui. Não há lógica de negócio.
// ============================================================

import { Link } from "react-router-dom";

// ---- Ícone do Escudo (brasão simplificado) ------------------
// SVG inline para não depender de assets externos
function ShieldIcon({ size = 48, gold = false }) {
  const stroke = gold ? "#D4AF37" : "#003B5C";
  const fill = gold ? "rgba(212,175,55,0.15)" : "rgba(0,59,92,0.1)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 90 90"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M45 8L12 24v22c0 17 11 32.5 33 39 22-6.5 33-22 33-39V24L45 8z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M45 18L20 31v16c0 12.5 8 24 25 29 17-5 25-16.5 25-29V31L45 18z"
        fill="none"
        stroke={stroke}
        strokeOpacity="0.4"
        strokeWidth="1"
      />
      {/* Cruz de emergência */}
      <line x1="45" y1="30" x2="45" y2="68" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="46" x2="58" y2="46" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <circle cx="45" cy="45" r="5" fill={stroke} />
    </svg>
  );
}

// ---- Card de recurso do sistema -----------------------------
function FeatureCard({ icon, title, description }) {
  return (
    <div className="
      bg-white border border-gray-200 rounded-md p-6
      border-t-4 border-t-[#003B5C]
      hover:border-t-[#D4AF37] hover:-translate-y-0.5
      transition-all duration-200 cursor-default
    ">
      {/* Ícone */}
      <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center mb-3 text-[#003B5C] text-xl">
        {icon}
      </div>
      {/* Título */}
      <h3 className="
        font-[Oswald,sans-serif] text-sm font-semibold
        text-[#003B5C] uppercase tracking-wide mb-1
      ">
        {title}
      </h3>
      {/* Descrição */}
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ---- Indicador numérico do rodapé do hero ------------------
function StatItem({ value, label, border = true }) {
  return (
    <div className={`
      text-center py-5 px-6
      ${border ? "border-r border-white/10" : ""}
    `}>
      <div className="
        font-[Oswald,sans-serif] text-2xl font-semibold
        text-[#D4AF37] leading-none mb-1
      ">
        {value}
      </div>
      <div className="text-[10px] text-white/50 uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

// ============================================================
// Componente principal
// ============================================================
export function Home() {
  return (
    /*
     * Wrapper principal com cor de fundo institucional escura.
     * Fonte padrão: Source Sans 3 (legível e profissional).
     * Oswald é usada apenas em títulos/labels para autoridade visual.
     */
    <div
      className="min-h-screen flex flex-col bg-[#001e2e] text-white"
      style={{ fontFamily: "'Source Sans 3', 'Helvetica Neue', sans-serif" }}
    >

      {/* ==================== HEADER ======================== */}
      {/*
       * Header fixo com azul institucional e borda dourada inferior.
       * Contém: brasão (link para home), nome do sistema, navegação e botão de login.
       */}
      <header className="
        fixed top-0 left-0 right-0 z-50
        bg-[#003B5C] border-b-[3px] border-[#D4AF37]
        px-6 flex items-center h-[72px] gap-4
      ">
        {/* Brasão / Logo */}
        <div
          className="
            w-12 h-12 bg-[#D4AF37] rounded-full
            flex items-center justify-center flex-shrink-0
          "
          aria-label="Brasão CBMSC"
        >
          {/* Cruz/escudo em miniatura — azul sobre dourado */}
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path
              d="M14 3L5 8v6c0 5 3.9 9.7 9 11 5.1-1.3 9-6 9-11V8L14 3z"
              fill="#003B5C"
              stroke="#003B5C"
              strokeWidth="0.5"
            />
            <line x1="14" y1="10" x2="14" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="9"  y1="15" x2="19" y2="15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Identificação institucional */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-[13px] font-semibold text-white uppercase tracking-wider leading-none mb-0.5 truncate"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Corpo de Bombeiros Militar de Santa Catarina
          </h1>
          <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest leading-none">
            Sistema de Gestão para Salva-Vidas
          </p>
        </div>

        {/* Navegação */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
          <a
            href="#recursos"
            className="
              text-[12px] text-white/70 hover:text-[#D4AF37]
              px-3 py-1.5 rounded border border-transparent
              hover:border-[#D4AF37]/30 transition-all duration-200
              tracking-wide
            "
          >
            Início
          </a>
          <a
            href="https://www.cbm.sc.gov.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="
              text-[12px] text-white/70 hover:text-[#D4AF37]
              px-3 py-1.5 rounded border border-transparent
              hover:border-[#D4AF37]/30 transition-all duration-200
              tracking-wide
            "
          >
            CBMSC
          </a>
        </nav>

        {/* Botão de login — destaque dourado */}
        <Link
          to="/login"
          className="
            bg-[#D4AF37] text-[#003B5C] font-semibold
            text-[13px] uppercase tracking-wider
            px-5 py-2 rounded
            hover:bg-[#C89B3C] active:scale-95
            transition-all duration-200
            flex items-center gap-2 flex-shrink-0
          "
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {/* Ícone de login */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Entrar
        </Link>
      </header>

      {/* Espaçador para compensar o header fixo */}
      <div className="h-[72px]" aria-hidden="true" />

      {/* ==================== HERO ========================== */}
      {/*
       * Seção principal de boas-vindas.
       * Fundo com gradiente azul institucional.
       * Contém: badge oficial, título, subtítulo, botões de ação, escudo decorativo.
       */}
      <section
        className="relative flex items-center gap-12 px-8 py-16 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #001e2e 0%, #003B5C 65%, #004A73 100%)",
        }}
        aria-labelledby="hero-title"
      >
        {/* Círculos decorativos (profundidade visual) */}
        <div
          className="absolute -top-10 -right-10 w-96 h-96 rounded-full pointer-events-none"
          style={{ border: "60px solid rgba(212,175,55,0.05)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ border: "40px solid rgba(212,175,55,0.03)" }}
          aria-hidden="true"
        />

        {/* Conteúdo textual */}
        <div className="flex-1 relative z-10">
          {/* Badge institucional */}
          <div className="
            inline-flex items-center gap-2 mb-6
            bg-[#D4AF37]/15 border border-[#D4AF37]/40
            text-[#D4AF37] text-[11px] font-semibold
            uppercase tracking-[0.1em] px-3 py-1.5 rounded-[3px]
          ">
            {/* Ícone de escudo */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Sistema Oficial — CBMSC
          </div>

          {/* Título principal */}
          <h2
            id="hero-title"
            className="text-4xl font-bold uppercase leading-tight tracking-wide mb-2"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Gestão de{" "}
            <span className="text-[#D4AF37]">Salva-Vidas</span>
          </h2>

          {/* Subtítulo */}
          <p className="text-[15px] text-white/60 max-w-md leading-relaxed mt-3 mb-8">
            Plataforma institucional de controle operacional para guarda-vidas e
            sargentos do Corpo de Bombeiros Militar de Santa Catarina.
          </p>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-3">
            {/*
             * BOTÃO PRINCIPAL: leva direto para /login.
             * Grande, contrastante, fácil de encontrar.
             * Guarda-vidas com pouca familiaridade tecnológica não vai errar.
             */}
            <Link
              to="/login"
              className="
                bg-[#D4AF37] text-[#003B5C] font-semibold
                text-sm uppercase tracking-wider
                px-7 py-3 rounded
                hover:bg-[#C89B3C] hover:-translate-y-px
                active:scale-95 transition-all duration-200
                flex items-center gap-2
              "
              style={{ fontFamily: "'Oswald', sans-serif" }}
              aria-label="Acessar o sistema — ir para tela de login"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Acessar o Sistema
            </Link>

            {/* Botão secundário: suporte */}
            <a
              href="mailto:suporte@cbm.sc.gov.br"
              className="
                bg-transparent text-white/75
                text-sm font-medium
                px-6 py-3 rounded
                border border-white/20
                hover:border-white/50 hover:text-white
                transition-all duration-200
                flex items-center gap-2
              "
              aria-label="Preciso de ajuda — contato com suporte"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Preciso de ajuda
            </a>
          </div>
        </div>

        {/* Escudo decorativo (lado direito) */}
        <div className="hidden lg:block flex-shrink-0 relative z-10" aria-hidden="true">
          <div className="
            w-40 h-40 rounded-full
            bg-[#003B5C]/60 border-2 border-[#D4AF37]/40
            flex items-center justify-center
            relative
          ">
            {/* Anel interno */}
            <div className="absolute inset-2 rounded-full border border-[#D4AF37]/20" />
            <ShieldIcon size={90} gold />
          </div>
        </div>
      </section>

      {/* ==================== ESTATÍSTICAS ================== */}
      {/*
       * Faixa com indicadores rápidos abaixo do hero.
       * Reforça credibilidade institucional.
       */}
      <div
        className="grid grid-cols-4 bg-black/30 border-t border-white/10"
        role="region"
        aria-label="Indicadores do sistema"
      >
        <StatItem value="24/7"  label="Operação"        border />
        <StatItem value="SC"    label="Santa Catarina"  border />
        <StatItem value="CBMSC" label="Instituição"     border />
        <StatItem value="v2.0"  label="Versão"          border={false} />
      </div>

      {/* ==================== AVISO DE ACESSO =============== */}
      {/*
       * Alerta de acesso restrito.
       * Orienta guarda-vidas sobre o que fazer em caso de dúvida.
       * Linguagem simples e direta (sem jargão técnico).
       */}
      <div className="px-8 pt-6">
        <div
          className="
            bg-[#003B5C] border-l-4 border-[#D4AF37]
            px-5 py-4 rounded-r-md
            flex items-start gap-3
          "
          role="alert"
          aria-live="polite"
        >
          {/* Ícone de informação */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[13px] text-white/80 leading-relaxed">
            <strong className="text-[#D4AF37]">Acesso restrito.</strong>{" "}
            Este sistema é de uso exclusivo de militares do CBMSC credenciados.
            Em caso de problemas com seu acesso, procure seu sargento responsável.
          </p>
        </div>
      </div>

      {/* ==================== RECURSOS ====================== */}
      {/*
       * Cards com os três principais recursos do sistema.
       * Fundo claro para contrastar com o hero escuro.
       * Útil para novos usuários entenderem o que o sistema faz.
       */}
      <section
        id="recursos"
        className="px-8 py-10 bg-[#F4F6F8] flex-1"
        aria-labelledby="recursos-title"
      >
        {/* Título da seção */}
        <div className="flex items-center gap-3 mb-6">
          <p
            id="recursos-title"
            className="
              text-[11px] font-semibold text-[#004A73]
              uppercase tracking-[0.12em]
            "
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Recursos do sistema
          </p>
          <div className="flex-1 h-px bg-[#E5E7EB]" aria-hidden="true" />
        </div>

        {/* Grid de cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          role="list"
          aria-label="Lista de recursos"
        >
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
            title="Atividades"
            description="Consulte e gerencie suas atividades diárias com facilidade."
          />
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
            title="Ocorrências"
            description="Registre e acompanhe ocorrências em tempo real."
          />
          <FeatureCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6"  y1="20" x2="6"  y2="14" />
              </svg>
            }
            title="Relatórios"
            description="Acesse indicadores e relatórios operacionais completos."
          />
        </div>
      </section>

      {/* ==================== FOOTER ======================== */}
      <footer className="
        bg-[#001e2e] border-t border-[#D4AF37]/20
        px-8 py-5
        flex flex-col sm:flex-row items-center justify-between gap-2
      ">
        <p className="text-[11px] text-white/30 tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="text-[#D4AF37]/50">
            Corpo de Bombeiros Militar de Santa Catarina
          </span>
          . Todos os direitos reservados.
        </p>
        <p className="text-[11px] text-white/25 tracking-wide">
          Sistema de uso interno — acesso autorizado somente
        </p>
      </footer>
    </div>
  );
}