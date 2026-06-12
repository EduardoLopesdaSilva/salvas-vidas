import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function Supervisor() {
    const [postos, setPostos] = useState([]);
    const [historico, setHistorico] = useState([]);

    const [metricas, setMetricas] = useState({
        totalTurnos: 0,
        totalPrevencoes: 0,
        totalLesoes: 0,
        postosOcupados: 0
    });
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const carregarPostos = async () => {
        setCarregando(true);
        try {
            const data = await apiRequest("/postos");
            setPostos(data);
            setMetricas(metricasAtuais => ({
                ...metricasAtuais,
                postosOcupados: data.filter(posto => posto.status === "OCUPADO").length
            }));
        } catch (error) {
            setErro("Falha ao carregar monitoramento de postos.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarPostos().catch(() => {});

        const dadosPostos = localStorage.getItem("postos");
        const dadosHistorico = localStorage.getItem("historico_turnos");

        if (dadosPostos && dadosHistorico) {
            const postosArray = JSON.parse(dadosPostos);
            const historicoArray = JSON.parse(dadosHistorico);

            setPostos(postosArray);
            setHistorico(historicoArray);

            const hoje = new Date().toLocaleDateString("pt-BR");
            const historicoHoje = historicoArray.filter(t =>
                t.inicio && t.inicio.includes(hoje)
            );

            const totalTurnos = historicoHoje.length;
            const totalPrevencoes = historicoHoje.reduce(
                (total, t) => total + (Number(t.prevencoes) || 0), 0
            );
            const totalLesoes = historicoHoje.reduce(
                (total, t) => total + (t.lesoes?.length || 0), 0
            );
            const postosOcupados = postosArray.filter(
                p => p.status === "OCUPADO"
            ).length;

            setMetricas({
                totalTurnos,
                totalPrevencoes,
                totalLesoes,
                postosOcupados
            });
        }
    }, []);

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Supervisão</p>
                    <h1>Painel do Sargento</h1>
                    <p className="page-description">
                        Visão consolidada em tempo real dos postos ativos, turnos e indicadores operacionais do dia.
                    </p>
                </div>
            </header>

            <section className="content-grid">
                {erro && <div className="alert alert-error span-12">{erro}</div>}

                {/* MÉTRICAS EM GRID EXCELENTE */}
                <div className="card stat-card span-3">
                    <p className="stat-label">Turnos ativos hoje</p>
                    <p className="stat-value">{metricas.totalTurnos}</p>
                </div>
                <div className="card stat-card span-3">
                    <p className="stat-label">Prevenções acumuladas</p>
                    <p className="stat-value">{metricas.totalPrevencoes}</p>
                </div>
                <div className="card stat-card span-3">
                    <p className="stat-label">Atendimentos lesões</p>
                    <p className="stat-value">{metricas.totalLesoes}</p>
                </div>
                <div className="card stat-card span-3">
                    <p className="stat-label">Postos ativos</p>
                    <p className="stat-value">{metricas.postosOcupados}</p>
                </div>

                {/* POSTOS MONITORADOS */}
                <section className="card span-7">
                    <div className="section-title">
                        <h2>Postos monitorados</h2>
                    </div>

                    {carregando ? (
                        <div className="alert alert-info">Atualizando postos monitorados...</div>
                    ) : postos.length === 0 ? (
                        <div className="empty-state">Nenhum posto sob supervisão.</div>
                    ) : (
                        <div className="list">
                            {postos.map(p => (
                                <div className="list-item" key={p.id}>
                                    <div>
                                        <strong style={{ fontSize: "var(--font-md)" }}>{p.nome}</strong>
                                        {p.salvaVida && (
                                            <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                                                👤 Ativo: {p.salvaVida}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`badge ${p.status === "OCUPADO" ? "badge-busy" : "badge-free"}`}>
                                        {p.status === "OCUPADO" ? "Ativo" : "Livre"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* HISTÓRICO DE TURNOS */}
                <section className="card span-5">
                    <div className="section-title">
                        <h2>Histórico recente de turnos</h2>
                    </div>

                    {historico.length === 0 ? (
                        <div className="empty-state">Nenhum turno finalizado hoje.</div>
                    ) : (
                        <div className="list">
                            {historico.map((h, i) => (
                                <div className="list-item" key={i} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <strong>{h.usuario}</strong>
                                        <span className="badge badge-busy">Posto {h.posto}</span>
                                    </div>
                                    <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>
                                        🕒 {h.inicio || "-"} até {h.fim || "-"}
                                    </div>
                                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                                        <span style={{ color: "var(--azul-700)" }}>🛟 {h.prevencoes || 0} prev.</span>
                                        <span style={{ color: "var(--vermelho-700)" }}>🩹 {h.lesoes?.length || 0} lesões</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}
