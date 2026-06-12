import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Ocorrencias() {
    const navigate = useNavigate();
    const [ocorrencias, setOcorrencias] = useState([]);

    useEffect(() => {
        const localData = localStorage.getItem("ocorrencias_salvas");
        if (localData) {
            setOcorrencias(JSON.parse(localData));
        }
    }, []);

    const limparOcorrencias = () => {
        if (window.confirm("Deseja apagar todo o histórico local de ocorrências?")) {
            localStorage.removeItem("ocorrencias_salvas");
            setOcorrencias([]);
        }
    };

    const getIcon = (tipo) => {
        switch (tipo) {
            case "Prevenção": return "🛟";
            case "Lesão": return "🩹";
            case "Queimadura": return "🔥";
            case "Afogamento": return "🚨";
            default: return "📝";
        }
    };

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Histórico</p>
                    <h1>Ocorrências registradas</h1>
                    <p className="page-description">Veja a lista de ocorrências salvas localmente neste dispositivo.</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate("/ocorrencias/nova")}>
                    + Nova ocorrência
                </button>
            </header>

            <section className="content-grid">
                <div className="card span-12">
                    <div className="section-title">
                        <h2>Registros locais</h2>
                        {ocorrencias.length > 0 && (
                            <button className="btn btn-secondary btn-compact" style={{ minHeight: "36px", padding: "4px 10px", fontSize: "0.8rem" }} onClick={limparOcorrencias}>
                                Limpar histórico
                            </button>
                        )}
                    </div>

                    {ocorrencias.length === 0 ? (
                        <div className="empty-state">Nenhuma ocorrência registrada neste dispositivo.</div>
                    ) : (
                        <div className="list">
                            {ocorrencias.map((item) => (
                                <div className="list-item" key={item.id} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{ fontSize: "1.5rem" }}>{getIcon(item.tipo)}</span>
                                            <strong>{item.tipo}</strong>
                                        </div>
                                        <span className="badge badge-active" style={{ fontSize: "0.75rem" }}>{item.data}</span>
                                    </div>
                                    
                                    <p style={{ margin: "5px 0 10px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                                        {item.observacao}
                                    </p>

                                    {item.foto && item.foto !== "sem_foto" && (
                                        <div style={{ maxWidth: "200px", borderRadius: "var(--raio)", overflow: "hidden", border: "1px solid var(--border-color)", marginTop: "5px" }}>
                                            <img src={item.foto} alt="Anexo" style={{ width: "100%", display: "block" }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
