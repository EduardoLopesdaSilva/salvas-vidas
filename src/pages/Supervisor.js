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

    const carregarPostos = async () => {
        const data = await apiRequest("/postos");
        setPostos(data);
        setMetricas(metricasAtuais => ({
            ...metricasAtuais,
            postosOcupados: data.filter(posto => posto.status === "OCUPADO").length
        }));
    };

    useEffect(() => {
        carregarPostos().catch(error => setErro(error.message));

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
                (total, t) => total + (t.prevencoes || 0), 0
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
                    <p className="page-kicker">Supervisao</p>
                    <h1>Painel do Sargento</h1>
                    <p className="page-description">
                        Visao consolidada dos postos, turnos e indicadores operacionais do dia.
                    </p>
                </div>
            </header>

            <section className="content-grid">
                {erro && <div className="alert alert-error span-12">{erro}</div>}

                <div className="card stat-card span-4">
                    <p className="stat-label">Turnos de hoje</p>
                    <p className="stat-value">{metricas.totalTurnos}</p>
                </div>
                <div className="card stat-card span-4">
                    <p className="stat-label">Prevencoes</p>
                    <p className="stat-value">{metricas.totalPrevencoes}</p>
                </div>
                <div className="card stat-card span-4">
                    <p className="stat-label">Lesoes</p>
                    <p className="stat-value">{metricas.totalLesoes}</p>
                </div>
                <div className="card stat-card span-4">
                    <p className="stat-label">Postos ocupados</p>
                    <p className="stat-value">{metricas.postosOcupados}</p>
                </div>

                <section className="card span-7">
                    <div className="section-title">
                        <h2>Postos monitorados</h2>
                    </div>

                    {postos.length === 0 ? (
                        <div className="empty-state">Nenhum posto encontrado.</div>
                    ) : (
                        <div className="list">
                            {postos.map(p => (
                                <div className="list-item" key={p.id}>
                                    <div>
                                        <strong>{p.nome}</strong>
                                        {p.salvaVida && <div className="page-description">{p.salvaVida}</div>}
                                    </div>
                                    <span className={`badge ${p.status === "OCUPADO" ? "badge-busy" : "badge-free"}`}>
                                        {p.status === "OCUPADO" ? "Ocupado" : "Livre"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="card span-5">
                    <div className="section-title">
                        <h2>Historico recente</h2>
                    </div>

                    {historico.length === 0 ? (
                        <div className="empty-state">Nenhum registro no historico local.</div>
                    ) : (
                        <div className="list">
                            {historico.map((h, i) => (
                                <div className="list-item" key={i}>
                                    <div>
                                        <strong>{h.usuario} - Posto {h.posto}</strong>
                                        <div className="page-description">
                                            Inicio: {h.inicio || "-"} | Fim: {h.fim || "-"}
                                        </div>
                                    </div>
                                    <span className="badge badge-busy">{h.prevencoes || 0} prev.</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}
