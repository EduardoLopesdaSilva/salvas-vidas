// ============================================================
// Login.jsx — Tela de Autenticação Institucional
// Sistema de Gestão para Salva-Vidas — CBMSC
//
// Toda a lógica (fazerLogin, validação de CPF, chamada à API,
// redirecionamento por nivelAcesso) foi MANTIDA INTACTA.
// Apenas o layout e a identidade visual foram alterados.
//
// Fontes necessárias no index.html:
//   Oswald (títulos) + Source Sans 3 (corpo)
// ============================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cpfBasicoValido, limparCpf, useAuth } from "../context/AuthContext";

// ---- Escudo SVG (brasão simplificado CBMSC) ----------------
function ShieldSVG({ size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" fill="none" aria-hidden="true">
      <path
        d="M45 8L12 24v22c0 17 11 32.5 33 39 22-6.5 33-22 33-39V24L45 8z"
        fill="rgba(212,175,55,0.1)"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      <path
        d="M45 18L20 31v16c0 12.5 8 24 25 29 17-5 25-16.5 25-29V31L45 18z"
        fill="none"
        stroke="rgba(212,175,55,0.35)"
        strokeWidth="1"
      />
      {/* Cruz de emergência */}
      <line x1="45" y1="30" x2="45" y2="68" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="46" x2="58" y2="46" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
      <circle cx="45" cy="45" r="5" fill="#D4AF37" />
    </svg>
  );
}

// ---- Item informativo do painel esquerdo -------------------
function InfoItem({ icon, children }) {
  return (
    <div className="
      flex items-center gap-3
      bg-black/25 border-l-2 border-[#D4AF37]/40
      px-3.5 py-2.5 rounded-r
    ">
      <span className="text-[#D4AF37] text-[17px] flex-shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span className="text-[12px] text-white/60 leading-snug">{children}</span>
    </div>
  );
}

// ---- Ícone SVG inline reutilizável -------------------------
// Evita dependência de biblioteca de ícones externa.
function Icon({ path, size = 17, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

// Caminhos SVG dos ícones usados
const ICONS = {
  shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>,
  user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  lock:     <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff:   <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  login:    <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>,
  alert:    <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  desktop:  <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
  headset:  <><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>,
};

// ============================================================
// Componente principal
// ============================================================
export function Login() {
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [identificador, setIdentificador] = useState("");
  const [senha,         setSenha]         = useState("");
  const [erro,          setErro]          = useState("");
  const [carregando,    setCarregando]    = useState(false);
  // Controla visibilidade da senha
  const [senhaVisivel,  setSenhaVisivel]  = useState(false);

  // ----------------------------------------------------------
  // fazerLogin — lógica INALTERADA do original
  // ----------------------------------------------------------
  const fazerLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const valorDigitado  = identificador.trim();
      const cpfLimpo       = limparCpf(valorDigitado);
      const loginNumerico  = /^[\d.\-\s]+$/.test(valorDigitado);
      const loginEmail     = valorDigitado.includes("@");

      // Valida CPF apenas se for login numérico
      if (loginNumerico && !cpfBasicoValido(cpfLimpo)) {
        setErro("Informe um CPF válido com 11 números");
        return;
      }

      const loginData = { senha };

      if (loginNumerico) {
        loginData.cpf = cpfLimpo;
      } else if (loginEmail) {
        loginData.email = valorDigitado;
      } else {
        // Se não for claro, envia ambos (back-end decide)
        loginData.cpf   = cpfLimpo;
        loginData.email = valorDigitado;
      }

      const usuarioLogado = await login(loginData);

      if (usuarioLogado.nivelAcesso === "ADMIN") {
        navigate("/supervisor");
      } else {
        navigate("/dashboard");
      }
    } catch (erro) {
      // Mensagem simples e direta — sem jargão técnico
      setErro(erro.message || "CPF ou senha incorretos. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    /*
     * Layout dividido em duas colunas:
     *   - ESQUERDA: painel institucional (azul escuro, escudo, informações)
     *   - DIREITA:  formulário de login
     *
     * Em mobile (< md) empilha verticalmente, painel esquerdo some
     * para priorizar o formulário (filosofia: menos cliques).
     */
    <div
      className="min-h-screen grid md:grid-cols-2 bg-[#001e2e]"
      style={{ fontFamily: "'Source Sans 3', 'Helvetica Neue', sans-serif" }}
    >

      {/* ================== PAINEL ESQUERDO (identidade) =================== */}
      {/*
       * Visível apenas em telas médias e grandes.
       * Transmite credibilidade e identidade institucional do CBMSC.
       * Contém: brasão, nome do órgão, mensagens de orientação.
       */}
      <aside
        className="
          hidden md:flex flex-col items-center justify-center
          bg-[#003B5C] border-r-[3px] border-[#D4AF37]
          px-10 py-12 relative overflow-hidden
        "
        aria-label="Informações institucionais"
      >
        {/* Círculos decorativos (profundidade visual) */}
        <div
          className="absolute -top-16 -right-16 w-80 h-80 rounded-full pointer-events-none"
          style={{ border: "55px solid rgba(212,175,55,0.07)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full pointer-events-none"
          style={{ border: "40px solid rgba(212,175,55,0.04)" }}
          aria-hidden="true"
        />

        {/* Emblema circular com brasão */}
        <div
          className="
            w-32 h-32 rounded-full
            bg-[#001e2e]/50 border-2 border-[#D4AF37]/50
            flex items-center justify-center
            relative z-10 mb-6
          "
          aria-hidden="true"
        >
          {/* Anel interno decorativo */}
          <div className="absolute inset-1.5 rounded-full border border-[#D4AF37]/20" />
          <ShieldSVG size={68} />
        </div>

        {/* Nome institucional */}
        <h2
          className="
            text-center text-white font-bold uppercase
            tracking-wide leading-tight mb-1.5 relative z-10
          "
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px" }}
        >
          Corpo de Bombeiros<br />Militar de SC
        </h2>

        {/* Subtítulo do sistema */}
        <p className="
          text-[11px] text-[#D4AF37] text-center
          uppercase tracking-[0.1em] mb-8 relative z-10
        ">
          Sistema de Gestão para Salva-Vidas
        </p>

        {/* Linha divisória dourada */}
        <div className="w-10 h-0.5 bg-[#D4AF37] mb-8 relative z-10" aria-hidden="true" />

        {/* Informações de orientação ao usuário */}
        <div className="flex flex-col gap-3 w-full relative z-10" role="list">
          <InfoItem icon={<Icon path={ICONS.shield} />}>
            Acesso restrito a militares credenciados do CBMSC
          </InfoItem>
          <InfoItem icon={<Icon path={ICONS.desktop} />}>
            Use seu CPF ou e-mail institucional para entrar
          </InfoItem>
          <InfoItem icon={<Icon path={ICONS.headset} />}>
            Problemas no acesso? Fale com seu sargento
          </InfoItem>
        </div>
      </aside>

      {/* ================== PAINEL DIREITO (formulário) ==================== */}
      {/*
       * Área do formulário de login.
       * Fundo escuro para manter coerência com o painel esquerdo.
       * Formulário centralizado com card levemente destacado.
       */}
      <main
        className="
          flex flex-col items-center justify-center
          px-6 py-12
        "
        aria-label="Formulário de login"
      >
        {/*
         * Em mobile: mostra logo compacto do CBMSC no topo do formulário
         * (o painel esquerdo fica oculto em telas pequenas).
         */}
        <div className="md:hidden flex flex-col items-center mb-8">
          <div className="
            w-16 h-16 rounded-full
            bg-[#D4AF37]
            flex items-center justify-center mb-3
          ">
            <ShieldSVG size={40} />
          </div>
          <p
            className="text-[11px] text-[#D4AF37] uppercase tracking-widest text-center"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            CBMSC — Salva-Vidas
          </p>
        </div>

        {/* Card do formulário */}
        <div className="w-full max-w-sm">

          {/* Cabeçalho do formulário */}
          <div className="mb-8">
            {/* Badge de acesso seguro */}
            <div className="
              inline-flex items-center gap-1.5 mb-4
              bg-[#D4AF37]/12 border border-[#D4AF37]/30
              text-[#D4AF37] text-[10px] font-semibold
              uppercase tracking-[0.1em]
              px-3 py-1.5 rounded-[3px]
            ">
              <Icon path={ICONS.shield} size={11} />
              Acesso Seguro
            </div>

            <h1
              className="
                text-white font-bold uppercase
                tracking-wide leading-tight mb-1.5
              "
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "24px" }}
            >
              Entrar no<br />Sistema
            </h1>
            <p className="text-[12px] text-white/35">
              Informe suas credenciais para continuar
            </p>
          </div>

          {/* Formulário — onSubmit mantido do original */}
          <form onSubmit={fazerLogin} noValidate>

            {/* Campo: CPF ou E-mail */}
            {/*
             * Label descritivo e claro.
             * Placeholder com formato esperado do CPF.
             * Ícone de usuário para orientação visual.
             */}
            <div className="mb-4">
              <label
                htmlFor="login-identificador"
                className="
                  block text-[11px] font-semibold
                  text-white/50 uppercase tracking-[0.08em] mb-1.5
                "
              >
                CPF ou E-mail
              </label>
              <div className="relative">
                {/* Ícone prefixo */}
                <span
                  className="
                    absolute left-3 top-1/2 -translate-y-1/2
                    text-white/25 pointer-events-none
                  "
                  aria-hidden="true"
                >
                  <Icon path={ICONS.user} size={17} />
                </span>

                <input
                  id="login-identificador"
                  type="text"
                  autoComplete="username"
                  placeholder="000.000.000-00 ou e-mail"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  required
                  disabled={carregando}
                  className="
                    w-full bg-white/[0.06] border border-white/12 rounded
                    text-white text-[14px] placeholder-white/25
                    pl-10 pr-4 py-2.5
                    focus:outline-none focus:border-[#D4AF37] focus:bg-[#D4AF37]/[0.06]
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  aria-describedby={erro ? "login-erro" : undefined}
                />
              </div>
            </div>

            {/* Campo: Senha */}
            {/*
             * Botão de olho para mostrar/ocultar senha.
             * Importante para guarda-vidas com dificuldade de digitação.
             */}
            <div className="mb-6">
              <label
                htmlFor="login-senha"
                className="
                  block text-[11px] font-semibold
                  text-white/50 uppercase tracking-[0.08em] mb-1.5
                "
              >
                Senha
              </label>
              <div className="relative">
                {/* Ícone prefixo */}
                <span
                  className="
                    absolute left-3 top-1/2 -translate-y-1/2
                    text-white/25 pointer-events-none
                  "
                  aria-hidden="true"
                >
                  <Icon path={ICONS.lock} size={17} />
                </span>

                <input
                  id="login-senha"
                  type={senhaVisivel ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={carregando}
                  className="
                    w-full bg-white/[0.06] border border-white/12 rounded
                    text-white text-[14px] placeholder-white/25
                    pl-10 pr-10 py-2.5
                    focus:outline-none focus:border-[#D4AF37] focus:bg-[#D4AF37]/[0.06]
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                />

                {/* Botão mostrar/ocultar senha */}
                <button
                  type="button"
                  onClick={() => setSenhaVisivel((v) => !v)}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-white/25 hover:text-white/55
                    transition-colors duration-200
                    p-0 bg-transparent border-none cursor-pointer
                  "
                  aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                >
                  <Icon path={senhaVisivel ? ICONS.eyeOff : ICONS.eye} size={17} />
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {/*
             * Exibida apenas quando há erro de autenticação.
             * Linguagem simples e sem jargão técnico.
             * role="alert" garante leitura por leitores de tela.
             */}
            {erro && (
              <div
                id="login-erro"
                role="alert"
                aria-live="assertive"
                className="
                  flex items-center gap-2
                  bg-[#B22222]/15 border border-[#B22222]/40
                  text-[#ef9a9a] text-[13px]
                  px-3.5 py-2.5 rounded mb-5
                "
              >
                <span className="flex-shrink-0 text-[#e57373]" aria-hidden="true">
                  <Icon path={ICONS.alert} size={16} />
                </span>
                {erro}
              </div>
            )}

            {/* Botão de submit */}
            {/*
             * Grande, dourado, com feedback visual de carregamento.
             * Texto claro: "Entrando..." durante requisição.
             * disabled impede duplo clique acidental.
             */}
            <button
              type="submit"
              disabled={carregando}
              className="
                w-full bg-[#D4AF37] text-[#003B5C]
                font-bold text-[15px] uppercase tracking-wider
                py-3 rounded
                flex items-center justify-center gap-2
                hover:bg-[#C89B3C] active:scale-[0.99]
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                mt-1
              "
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {carregando ? (
                <>
                  {/* Spinner simples via animação CSS inline */}
                  <span
                    className="
                      inline-block w-4 h-4 rounded-full
                      border-2 border-[#003B5C]/30 border-t-[#003B5C]
                      animate-spin
                    "
                    aria-hidden="true"
                  />
                  Verificando...
                </>
              ) : (
                <>
                  <Icon path={ICONS.login} size={16} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Rodapé do formulário */}
          {/*
           * Instrução clara para usuários sem acesso.
           * Link para a página inicial do sistema.
           */}
          <div className="
            mt-6 pt-5 border-t border-white/[0.06]
            text-center
          ">
            <p className="text-[11px] text-white/25 leading-relaxed mb-3">
              Não consegue acessar?<br />
              Procure seu sargento responsável.
            </p>
            <Link
              to="/"
              className="
                text-[11px] text-white/20 hover:text-white/45
                transition-colors duration-200 underline underline-offset-2
              "
            >
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}