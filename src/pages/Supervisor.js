import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function getPostoStatus(posto) {
  return String(posto?.status || posto?.situacao || "").toUpperCase();
}

function getPostoNomeFromCheckin(checkin) {
  return checkin?.getPosto?.nome || checkin?.posto?.nome || checkin?.postoNome || "Desconhecido";
}

function getCheckoutCheckinId(checkout) {
  return Number(checkout?.checkinId || checkout?.getCheckin?.id || checkout?.checkin?.id || 0);
}

function getNumber(value) {
  return Number(value) || 0;
}

export default function Supervisor() {
  const [postos, setPostos] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [metricas, setMetricas] = useState({
    totalTurnos: 0,
    totalPrevencoes: 0,
    totalLesoes: 0,
    totalQueimaduras: 0,
    postosOcupados: 0,
    postosLivres: 0,
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    setErro("");

    try {
      const [postosData, checkinsData, checkoutsData] = await Promise.all([
        apiRequest("/postos"),
        apiRequest("/check/history"),
        apiRequest("/checkout/history"),
      ]);

      const listaPostos = Array.isArray(postosData) ? postosData : [];
      const listaCheckins = Array.isArray(checkinsData) ? checkinsData : [];
      const listaCheckouts = Array.isArray(checkoutsData) ? checkoutsData : [];

      setPostos(listaPostos);
      setCheckins(listaCheckins);
      setCheckouts(listaCheckouts);

      const postosOcupados = listaPostos.filter((posto) => getPostoStatus(posto) === "OCUPADO").length;
      const postosLivres = listaPostos.filter((posto) => getPostoStatus(posto) === "LIVRE").length;
      const totalPrevencoes = listaCheckouts.reduce((sum, item) => sum + getNumber(item.prevencoes), 0);
      const totalLesoes = listaCheckouts.reduce((sum, item) => sum + getNumber(item.lesoes), 0);
      const totalQueimaduras = listaCheckouts.reduce((sum, item) => sum + getNumber(item.queimaduras), 0);

      setMetricas({
        totalTurnos: listaCheckins.length,
        totalPrevencoes,
        totalLesoes,
        totalQueimaduras,
        postosOcupados,
        postosLivres,
      });
    } catch (error) {
      setErro(error.message || "Falha ao carregar dados operacionais.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <main className="app-shell page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Supervisao</p>
          <h1>Painel do Sargento</h1>
          <p className="page-description">
            Visao consolidada em tempo real dos postos ativos, turnos e indicadores operacionais do dia.
          </p>
        </div>
      </header>

      <section className="content-grid">
        {erro && <div className="alert alert-error span-12">{erro}</div>}

        <div className="card stat-card span-3">
          <p className="stat-label">Turnos hoje</p>
          <p className="stat-value">{metricas.totalTurnos}</p>
        </div>
        <div className="card stat-card span-3">
          <p className="stat-label">Prevencoes</p>
          <p className="stat-value">{metricas.totalPrevencoes}</p>
        </div>
        <div className="card stat-card span-3">
          <p className="stat-label">Lesoes</p>
          <p className="stat-value">{metricas.totalLesoes}</p>
        </div>
        <div className="card stat-card span-3">
          <p className="stat-label">Queimaduras</p>
          <p className="stat-value">{metricas.totalQueimaduras}</p>
        </div>

        <div className="card stat-card span-6">
          <p className="stat-label">Postos ocupados</p>
          <p className="stat-value" style={{ color: "#dc2626" }}>{metricas.postosOcupados}</p>
        </div>
        <div className="card stat-card span-6">
          <p className="stat-label">Postos livres</p>
          <p className="stat-value" style={{ color: "#16a34a" }}>{metricas.postosLivres}</p>
        </div>

        <section className="card span-12">
          <div className="section-title">
            <h2>Postos monitorados</h2>
          </div>

          {carregando ? (
            <div className="alert alert-info">Atualizando postos...</div>
          ) : postos.length === 0 ? (
            <div className="empty-state">Nenhum posto cadastrado.</div>
          ) : (
            <div className="list">
              {postos.map((posto) => {
                const ocupado = getPostoStatus(posto) === "OCUPADO";

                return (
                  <div className="list-item" key={posto.id}>
                    <div>
                      <strong>{posto.nome}</strong>
                      {ocupado && (
                        <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                          Em servico
                        </div>
                      )}
                    </div>
                    <span className={`badge ${ocupado ? "badge-busy" : "badge-free"}`}>
                      {ocupado ? "Ocupado" : "Livre"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card span-12">
          <div className="section-title">
            <h2>Historico de turnos hoje</h2>
          </div>

          {checkins.length === 0 ? (
            <div className="empty-state">Nenhum turno iniciado hoje.</div>
          ) : (
            <div className="list">
              {checkins.map((checkin) => {
                const checkout = checkouts.find((item) => getCheckoutCheckinId(item) === Number(checkin.id));
                const finalizado = Boolean(checkout);

                return (
                  <div
                    className="list-item"
                    key={checkin.id}
                    style={{ borderLeft: `4px solid ${finalizado ? "#16a34a" : "#ca8a04"}` }}
                  >
                    <div>
                      <strong>Posto: {getPostoNomeFromCheckin(checkin)}</strong>
                      <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                        Inicio: {new Date(checkin.createdAt).toLocaleTimeString("pt-BR")}
                      </div>
                      {checkout && (
                        <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                          Fim: {new Date(checkout.createdAt).toLocaleTimeString("pt-BR")}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="badge" style={{ backgroundColor: finalizado ? "#16a34a" : "#ca8a04" }}>
                        {finalizado ? "Finalizado" : "Em andamento"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}