// ============================================================
// Dashboard.jsx — Centro Operacional do Guarda-Vidas
// Sistema de Gestão para Salva-Vidas — CBMSC
//
// LÓGICA PRESERVADA INTEGRALMENTE:
//   - carregarPostos()       → GET /postos
//   - iniciarTurno()         → POST /check/in
//   - finalizarTurno()       → POST /checkout/out
//   - estados: postos, postoSelecionado, prevencoes, lesoes,
//              queimaduras, erro
//
// MELHORIAS DE UX:
//   - Botões +/− nos contadores (toque amigável para mobile)
//   - Seleção de posto por card clicável (não select HTML)
//   - Feedback visual de carregamento nos botões de ação
//   - Mensagens de erro/sucesso em toast, não em alert()
//   - Postos OCUPADOS não são clicáveis (sem interação inútil)
//   - Responsivo: 1 coluna em mobile, 2 em desktop
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

// ---- Ícones SVG inline -------------------------------------
const IC = {
  shield:  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>,
  pin:     <><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
  clock:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  play:    <><polygon points="5 3 19 12 5 21 5 3"/></>,
  stop:    <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></>,
  info:    <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  check:   <><polyline points="20 6 9 17 4 12"/></>,
  alert:   <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  wave:    <><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></>,
  sun:     <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
  user:    <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
};

function Ic({ d, size = 16, className = "" }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true"
    >
      {d}
    </svg>
  );
}

// ---- Toast de feedback (sucesso / erro) --------------------
//
// Substituição dos alert() nativos do browser.
// Mais amigável e não bloqueia a interface.
function Toast({ tipo, mensagem, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const estilos = tipo === "sucesso"
    ? "bg-green-50 border-green-400 text-green-800"
    : "bg-red-50 border-[#B22222]/40 text-[#7F1D1D]";

  const icone = tipo === "sucesso" ? IC.check : IC.alert;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        fixed top-20 right-4 z-50
        flex items-center gap-3
        border-l-4 rounded-r px-4 py-3
        shadow-md text-[13px] font-medium
        max-w-xs
        ${estilos}
      `}
    >
      <Ic d={icone} size={17} className="flex-shrink-0" />
      <span>{mensagem}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Fechar mensagem"
      >
        ×
      </button>
    </div>
  );
}

// ---- Card de posto -----------------------------------------
//
// Clicável apenas se LIVRE.
// Visual diferenciado para selecionado / livre / ocupado.
function PostoCard({ posto, selecionado, onSelecionar }) {
  const livre    = posto.status === "LIVRE";
  const selected = selecionado === posto.id;

  return (
    <button
      type="button"
      onClick={() => livre && onSelecionar(posto.id)}
      disabled={!livre}
      aria-pressed={selected}
      aria-label={`${posto.nome}, ${livre ? "livre" : "ocupado"}${selected ? ", selecionado" : ""}`}
      className={`
        w-full text-left flex items-center justify-between
        px-3 py-2.5 rounded border transition-all duration-150
        ${selected
          ? "border-[#D4AF37] border-2 bg-yellow-50"
          : livre
            ? "border-gray-200 hover:border-[#003B5C] hover:bg-[#f0f4f8] cursor-pointer"
            : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
        }
      `}
    >
      <div>
        {/* Nome do posto */}
        <p className="text-[14px] font-medium text-gray-800 leading-snug">
          {posto.nome}
        </p>
        {/* Subtítulo opcional — exibe localização se disponível */}
        {posto.localizacao && (
          <p className="text-[11px] text-gray-400 mt-0.5">{posto.localizacao}</p>
        )}
      </div>

      {/* Badge de status */}
      <span className={`
        text-[10px] font-semibold px-2.5 py-1 rounded-sm
        uppercase tracking-wider flex-shrink-0
        ${livre
          ? "bg-emerald-100 text-emerald-800"
          : "bg-red-100 text-red-900"
        }
      `}>
        {posto.status}
      </span>
    </button>
  );
}

// ---- Contador numérico com botões +/− ----------------------
//
// Melhoria crítica de UX: guarda-vidas em campo sob sol
// não deve precisar usar teclado. Botões grandes, touch-friendly.
function Contador({ label, value, onChange, cor = "blue" }) {
  const decrement = () => onChange(Math.max(0, Number(value) - 1));
  const increment = () => onChange(Number(value) + 1);

  const corMap = {
    blue:   "bg-[#003B5C] text-white border-[#003B5C]",
    gold:   "bg-[#D4AF37] text-[#003B5C] border-[#D4AF37]",
    red:    "bg-[#B22222] text-white border-[#B22222]",
  };

  return (
    <div className="mb-3">
      <label className="
        block text-[11px] font-semibold text-gray-500
        uppercase tracking-wider mb-1.5
      ">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {/* Botão diminuir */}
        <button
          type="button"
          onClick={decrement}
          aria-label={`Diminuir ${label}`}
          className="
            w-9 h-9 flex-shrink-0 rounded border border-gray-200
            flex items-center justify-center text-lg text-gray-500
            hover:bg-[#003B5C] hover:text-white hover:border-[#003B5C]
            active:scale-95 transition-all duration-150
          "
        >
          −
        </button>

        {/* Input numérico */}
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          aria-label={`Quantidade de ${label}`}
          className="
            flex-1 text-center border border-gray-200 rounded
            py-2 text-[15px] font-semibold text-gray-800
            focus:outline-none focus:border-[#003B5C]
            transition-colors duration-150
          "
          style={{ fontFamily: "'Source Sans 3', sans-serif" }}
        />

        {/* Botão aumentar */}
        <button
          type="button"
          onClick={increment}
          aria-label={`Aumentar ${label}`}
          className={`
            w-9 h-9 flex-shrink-0 rounded border
            flex items-center justify-center text-lg
            active:scale-95 transition-all duration-150
            ${corMap[cor]}
            opacity-80 hover:opacity-100
          `}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ---- Card de seção -----------------------------------------
function SectionCard({ titulo, icone, children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Cabeçalho azul institucional */}
      <div className="bg-[#003B5C] px-4 py-3 flex items-center gap-2">
        <span className="text-[#D4AF37]">{icone}</span>
        <h2
          className="text-[12px] font-semibold text-white uppercase tracking-wider"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {titulo}
        </h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ---- Card de estatística -----------------------------------
function StatCard({ valor, label, cor = "blue" }) {
  const bordas = {
    blue: "border-t-[#003B5C]",
    gold: "border-t-[#D4AF37]",
    red:  "border-t-[#B22222]",
  };
  const textos = {
    blue: "text-[#003B5C]",
    gold: "text-[#C89B3C]",
    red:  "text-[#B22222]",
  };

  return (
    <div className={`
      bg-white border border-gray-200 border-t-4 rounded-md
      px-4 py-4 ${bordas[cor]}
    `}>
      <p className={`
        font-bold text-3xl leading-none mb-1
        ${textos[cor]}
      `}
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {valor}
      </p>
      <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ============================================================
// Componente principal
// ============================================================
export function Dashboard() {
  const { user } = useAuth();

  // ----------------------------------------------------------
  // Estados — IDÊNTICOS ao original
  // ----------------------------------------------------------
  const [postos,           setPostos]           = useState([]);
  const [postoSelecionado, setPostoSelecionado] = useState(null);
  const [prevencoes,       setPrevencoes]       = useState(0);
  const [lesoes,           setLesoes]           = useState(0);
  const [queimaduras,      setQueimaduras]      = useState(0);
  const [erro,             setErro]             = useState("");

  // Estados adicionais de UX (não alteram lógica de negócio)
  const [carregandoInicio,  setCarregandoInicio]  = useState(false);
  const [carregandoFim,     setCarregandoFim]     = useState(false);
  const [toast,             setToast]             = useState(null); // { tipo, mensagem }
  const [carregandoPostos,  setCarregandoPostos]  = useState(false);

  // Helper: exibir toast substituindo alert()
  const exibirToast = (tipo, mensagem) => setToast({ tipo, mensagem });

  // ----------------------------------------------------------
  // carregarPostos — LÓGICA ORIGINAL
  // ----------------------------------------------------------
  const carregarPostos = useCallback(() => {
    setCarregandoPostos(true);
    apiRequest("/postos")
      .then((data) => {
        setPostos(data);
        setErro("");
      })
      .catch((error) => setErro(error.message))
      .finally(() => setCarregandoPostos(false));
  }, []);

  useEffect(() => {
    carregarPostos();
  }, [carregarPostos]);

  // ----------------------------------------------------------
  // iniciarTurno — LÓGICA ORIGINAL
  // Alert substituído por toast não-bloqueante.
  // ----------------------------------------------------------
  const iniciarTurno = async () => {
    if (!postoSelecionado) {
      exibirToast("erro", "Escolha um posto antes de iniciar o turno.");
      return;
    }

    setCarregandoInicio(true);
    try {
      await apiRequest("/check/in", {
        method: "POST",
        body: {
          idUsuario: user.id,
          postoId:   Number(postoSelecionado),
          foto:      "sem_foto",
        },
      });

      exibirToast("sucesso", "Turno iniciado com sucesso!");
      setPostoSelecionado(null);
      carregarPostos();
    } catch (error) {
      exibirToast("erro", error.message || "Não foi possível iniciar o turno.");
    } finally {
      setCarregandoInicio(false);
    }
  };

  // ----------------------------------------------------------
  // finalizarTurno — LÓGICA ORIGINAL
  // ----------------------------------------------------------
  const finalizarTurno = async () => {
    if (!postoSelecionado) {
      exibirToast("erro", "Selecione o posto que deseja finalizar.");
      return;
    }

    setCarregandoFim(true);
    try {
      await apiRequest("/checkout/out", {
        method: "POST",
        body: {
          postoId:    Number(postoSelecionado),
          foto:       "sem_foto",
          prevencoes: String(prevencoes),
          lesoes:     String(lesoes),
          queimaduras: String(queimaduras),
        },
      });

      exibirToast("sucesso", "Turno finalizado. Bom trabalho!");
      setPostoSelecionado(null);
      setPrevencoes(0);
      setLesoes(0);
      setQueimaduras(0);
      carregarPostos();
    } catch (error) {
      exibirToast("erro", error.message || "Não foi possível finalizar o turno.");
    } finally {
      setCarregandoFim(false);
    }
  };

  // ----------------------------------------------------------
  // Dados derivados para os stats
  // ----------------------------------------------------------
  const postosLivres = postos.filter((p) => p.status === "LIVRE").length;
  const postoAtual   = postos.find((p) => p.id === postoSelecionado);

  // Saudação por horário
  const hora = new Date().getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  // Nome curto do usuário
  const nomeUsuario = user?.nome?.split(" ")[0] ?? "Guarda-Vidas";

  // Iniciais para o avatar
  const iniciais = user?.nome
    ? user.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "GV";

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div
      className="min-h-screen bg-[#F4F6F8]"
      style={{ fontFamily: "'Source Sans 3', 'Helvetica Neue', sans-serif" }}
    >
      {/* Toast de feedback */}
      {toast && (
        <Toast
          tipo={toast.tipo}
          mensagem={toast.mensagem}
          onClose={() => setToast(null)}
        />
      )}

      {/* ================== HEADER ========================= */}
      {/*
       * Header fixo com identidade CBMSC.
       * Exibe nome e perfil do usuário logado à direita.
       */}
      <header className="
        fixed top-0 left-0 right-0 z-40
        bg-[#003B5C] border-b-[3px] border-[#D4AF37]
        px-5 h-16 flex items-center gap-3
      ">
        {/* Brasão */}
        <div
          className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M14 3L5 8v6c0 5 3.9 9.7 9 11 5.1-1.3 9-6 9-11V8L14 3z" fill="#003B5C"/>
            <line x1="14" y1="10" x2="14" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="9"  y1="15" x2="19" y2="15" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Título */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-[12px] font-semibold text-white uppercase tracking-wider truncate"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Sistema de Gestão — Salva-Vidas
          </h1>
          <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest">
            Corpo de Bombeiros Militar de Santa Catarina
          </p>
        </div>

        {/* Usuário logado */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-semibold text-white leading-none mb-0.5">
              {user?.nome ?? "Guarda-Vidas"}
            </p>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              {user?.nivelAcesso === "ADMIN" ? "Sargento" : "Guarda-Vidas"}
            </span>
          </div>
          {/* Avatar com iniciais */}
          <div
            className="
              w-9 h-9 rounded-full bg-[#D4AF37]
              flex items-center justify-center
              text-[#003B5C] text-[12px] font-bold
            "
            style={{ fontFamily: "'Oswald', sans-serif" }}
            aria-label={`Usuário: ${user?.nome}`}
          >
            {iniciais}
          </div>
        </div>
      </header>

      {/* Espaçador para header fixo */}
      <div className="h-16" aria-hidden="true" />

      {/* ================== CORPO ========================== */}
      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

        {/* Saudação */}
        <div className="mb-5">
          <h2
            className="text-[22px] font-bold text-[#003B5C] uppercase tracking-wide"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {saudacao}, {nomeUsuario}
          </h2>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Erro de carregamento de postos */}
        {erro && (
          <div
            role="alert"
            className="
              flex items-center gap-2 mb-4
              bg-red-50 border border-red-200 border-l-4 border-l-[#B22222]
              text-red-800 text-[13px] px-4 py-3 rounded-r
            "
          >
            <Ic d={IC.alert} size={16} className="flex-shrink-0 text-[#B22222]" />
            <span>{erro}</span>
            <button
              type="button"
              onClick={carregarPostos}
              className="ml-auto flex items-center gap-1 text-[12px] underline text-red-700 hover:text-red-900"
            >
              <Ic d={IC.refresh} size={13} />
              Tentar novamente
            </button>
          </div>
        )}

        {/* ---- Stats rápidos ---- */}
        {/*
         * Três indicadores no topo.
         * Dados dinâmicos derivados do estado atual dos postos.
         */}
        <div
          className="grid grid-cols-3 gap-3 mb-5"
          role="region"
          aria-label="Resumo operacional"
        >
          <StatCard
            valor={carregandoPostos ? "—" : postosLivres}
            label="Postos livres"
            cor="blue"
          />
          <StatCard
            valor={Number(prevencoes) + Number(lesoes) + Number(queimaduras) || 0}
            label="Registros do turno"
            cor="gold"
          />
          <StatCard
            valor={postos.length || "—"}
            label="Total de postos"
            cor="blue"
          />
        </div>

        {/* ---- Grid principal: postos + controle de turno ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ---- Card: Seleção de posto ---- */}
          <SectionCard
            titulo="Postos disponíveis"
            icone={<Ic d={IC.pin} size={16} />}
          >
            {/* Orientação para o guarda-vidas */}
            <div className="
              flex items-center gap-2
              bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400
              px-3 py-2.5 rounded-r mb-4 text-[12px] text-amber-800
            "
              role="status"
            >
              <Ic d={IC.info} size={15} className="flex-shrink-0 text-amber-600" />
              <span>Toque em um posto livre para selecioná-lo.</span>
            </div>

            {/* Lista de postos */}
            {carregandoPostos ? (
              <div className="text-center py-8">
                {/* Spinner */}
                <div className="
                  w-8 h-8 border-2 border-gray-200 border-t-[#003B5C]
                  rounded-full animate-spin mx-auto mb-3
                " aria-hidden="true" />
                <p className="text-[13px] text-gray-400">Carregando postos...</p>
              </div>
            ) : postos.length === 0 ? (
              <p className="text-center text-[13px] text-gray-400 py-6">
                Nenhum posto encontrado.
              </p>
            ) : (
              <div className="flex flex-col gap-2" role="list" aria-label="Lista de postos">
                {postos.map((p) => (
                  <div role="listitem" key={p.id}>
                    <PostoCard
                      posto={p}
                      selecionado={postoSelecionado}
                      onSelecionar={setPostoSelecionado}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Botão recarregar */}
            <button
              type="button"
              onClick={carregarPostos}
              disabled={carregandoPostos}
              className="
                mt-3 w-full flex items-center justify-center gap-2
                text-[12px] text-[#003B5C] border border-[#003B5C]/20
                rounded py-2 hover:bg-[#003B5C]/5
                transition-colors duration-150 disabled:opacity-50
              "
              aria-label="Atualizar lista de postos"
            >
              <Ic d={IC.refresh} size={13} />
              Atualizar postos
            </button>
          </SectionCard>

          {/* ---- Card: Controle de turno ---- */}
          <SectionCard
            titulo="Controle de turno"
            icone={<Ic d={IC.clock} size={16} />}
          >
            {/* Indicador do posto selecionado */}
            {/*
             * Feedback claro antes de iniciar/finalizar.
             * Evita que guarda-vidas toque em "Iniciar" sem ter selecionado.
             */}
            {postoAtual ? (
              <div
                className="
                  flex items-center gap-2.5
                  bg-[#003B5C] rounded px-3.5 py-2.5 mb-4
                "
                role="status"
                aria-live="polite"
              >
                <Ic d={IC.pin} size={16} className="text-[#D4AF37] flex-shrink-0" />
                <p className="text-[13px] text-white">
                  Posto selecionado:{" "}
                  <strong className="text-[#D4AF37]">{postoAtual.nome}</strong>
                </p>
              </div>
            ) : (
              <div
                className="
                  border border-dashed border-gray-300 bg-gray-50
                  rounded px-3.5 py-2.5 mb-4 text-center
                  text-[12px] text-gray-400
                "
                role="status"
                aria-live="polite"
              >
                Nenhum posto selecionado
              </div>
            )}

            {/* Contadores */}
            {/*
             * Botões +/− grandes para fácil uso em campo.
             * Os valores são enviados como String() para a API (comportamento original).
             */}
            <Contador
              label="Prevenções"
              value={prevencoes}
              onChange={setPrevencoes}
              cor="blue"
            />
            <Contador
              label="Lesões"
              value={lesoes}
              onChange={setLesoes}
              cor="red"
            />
            <Contador
              label="Queimaduras"
              value={queimaduras}
              onChange={setQueimaduras}
              cor="gold"
            />

            {/* Botões de ação: Iniciar / Finalizar turno */}
            {/*
             * Grid 2 colunas.
             * Botão "Finalizar" é dourado e mais proeminente
             * pois é a ação que envia os dados do turno.
             * Feedback de carregamento em ambos.
             */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {/* Iniciar turno */}
              <button
                type="button"
                onClick={iniciarTurno}
                disabled={carregandoInicio || carregandoFim}
                className="
                  bg-[#003B5C] text-white
                  flex items-center justify-center gap-2
                  py-3 rounded font-semibold text-[13px]
                  uppercase tracking-wide
                  hover:bg-[#004A73] active:scale-[0.98]
                  transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {carregandoInicio ? (
                  <>
                    <span className="
                      w-3.5 h-3.5 border-2 border-white/30 border-t-white
                      rounded-full animate-spin
                    " aria-hidden="true" />
                    Aguarde...
                  </>
                ) : (
                  <>
                    <Ic d={IC.play} size={14} />
                    Iniciar turno
                  </>
                )}
              </button>

              {/* Finalizar turno */}
              <button
                type="button"
                onClick={finalizarTurno}
                disabled={carregandoInicio || carregandoFim}
                className="
                  bg-[#D4AF37] text-[#003B5C]
                  flex items-center justify-center gap-2
                  py-3 rounded font-bold text-[13px]
                  uppercase tracking-wide
                  hover:bg-[#C89B3C] active:scale-[0.98]
                  transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {carregandoFim ? (
                  <>
                    <span className="
                      w-3.5 h-3.5 border-2 border-[#003B5C]/30 border-t-[#003B5C]
                      rounded-full animate-spin
                    " aria-hidden="true" />
                    Aguarde...
                  </>
                ) : (
                  <>
                    <Ic d={IC.stop} size={14} />
                    Finalizar turno
                  </>
                )}
              </button>
            </div>

            {/* Nota de rodapé */}
            <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
              Os dados de prevenções, lesões e queimaduras<br />
              são enviados ao finalizar o turno.
            </p>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}