import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

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
        postosLivres: 0
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
                apiRequest("/checkout/history")
            ]);

            setPostos(postosData);
            setCheckins(checkinsData);
            setCheckouts(checkoutsData);

            const postosOcupados = postosData.filter(p => p.status === "OCUPADO").length;
            const postosLivres = postosData.filter(p => p.status === "LIVRE").length;

            const totalPrevencoes = checkoutsData.reduce((sum, c) => sum + (Number(c.prevencoes) || 0), 0);
            const totalLesoes = checkoutsData.reduce((sum, c) => sum + (Number(c.lesoes) || 0), 0);
            const totalQueimaduras = checkoutsData.reduce((sum, c) => sum + (Number(c.queimaduras) || 0), 0);
            const totalTurnos = checkinsData.length;

            setMetricas({
                totalTurnos,
                totalPrevencoes,
                totalLesoes,
                totalQueimaduras,
                postosOcupados,
                postosLivres
            });
        } catch (error) {
            setErro("Falha ao carregar dados operacionais.");
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
                    <p className="page-kicker">Supervisão</p>
                    <h1>Painel do Sargento</h1>
                    <p className="page-description">
                        Visão consolidada em tempo real dos postos ativos, turnos e indicadores operacionais do dia.
                    </p>
                </div>
            </header>

            <section className="content-grid">
                {erro && <div className="alert alert-error span-12">{erro}</div>}

                {/* MÉTRICAS */}
                <div className="card stat-card span-3">
                    <p className="stat-label">Turnos hoje</p>
                    <p className="stat-value">{metricas.totalTurnos}</p>
                </div>
                <div className="card stat-card span-3">
                    <p className="stat-label">Prevenções</p>
                    <p className="stat-value">{metricas.totalPrevencoes}</p>
                </div>
                <div className="card stat-card span-3">
                    <p className="stat-label">Lesões</p>
                    <p className="stat-value">{metricas.totalLesoes}</p>
                </div>
                <div className="card stat-card span-3">
                    <p className="stat-label">Queimaduras</p>
                    <p className="stat-value">{metricas.totalQueimaduras}</p>
                </div>

                {/* STATUS DOS POSTOS */}
                <div className="card stat-card span-6">
                    <p className="stat-label">Postos Ocupados</p>
                    <p className="stat-value" style={{ color: "#dc2626" }}>{metricas.postosOcupados}</p>
                </div>
                <div className="card stat-card span-6">
                    <p className="stat-label">Postos Livres</p>
                    <p className="stat-value" style={{ color: "#16a34a" }}>{metricas.postosLivres}</p>
                </div>

                {/* POSTOS MONITORADOS */}
                <section className="card span-12">
                    <div className="section-title">
                        <h2>Postos Monitorados</h2>
                    </div>

                    {carregando ? (
                        <div className="alert alert-info">Atualizando postos...</div>
                    ) : postos.length === 0 ? (
                        <div className="empty-state">Nenhum posto cadastrado.</div>
                    ) : (
                        <div className="list">
                            {postos.map(p => (
                                <div className="list-item" key={p.id}>
                                    <div>
                                        <strong>{p.nome}</strong>
                                        {p.status === "OCUPADO" && (
                                            <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                                                Em serviço
                                            </div>
                                        )}
                                    </div>
                                    <span className={`badge ${p.status === "OCUPADO" ? "badge-busy" : "badge-free"}`}>
                                        {p.status === "OCUPADO" ? "Ocupado" : "Livre"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* HISTÓRICO DE TURNOS */}
                <section className="card span-12">
                    <div className="section-title">
                        <h2>Histórico de Turnos Hoje</h2>
                    </div>

                    {checkins.length === 0 ? (
                        <div className="empty-state">Nenhum turno iniciado hoje.</div>
                    ) : (
                        <div className="list">
                            {checkins.map(c => {
                                const checkout = checkouts.find(ch => ch.getCheckin?.id === c.id);
                                const status = checkout ? "VERDE" : "AMARELO";
                                return (
                                    <div className="list-item" key={c.id} style={{ borderLeft: `4px solid ${status === "VERDE" ? "#16a34a" : "#ca8a04"}` }}>
                                        <div>
                                            <strong>Posto: {c.getPosto?.nome || "Desconhecido"}</strong>
                                            <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                                                Início: {new Date(c.createdAt).toLocaleTimeString("pt-BR")}
                                            </div>
                                            {checkout && (
                                                <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
                                                    Fim: {new Date(checkout.createdAt).toLocaleTimeString("pt-BR")}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="badge" style={{ backgroundColor: status === "VERDE" ? "#16a34a" : "#ca8a04" }}>
                                                {status}
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
