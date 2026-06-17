import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [postoAtual, setPostoAtual] = useState(null);
    const [emServico, setEmServico] = useState(false);

    useEffect(() => {
        const activePostId = localStorage.getItem("active_turn_posto");
        const activePostName = localStorage.getItem("active_turn_posto_name");
        if (activePostId && activePostName) {
            setPostoAtual(activePostName);
            setEmServico(true);
        }
    }, []);

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Guarda-Vidas</p>
                    <h1>Meu Painel</h1>
                </div>
            </header>

            <section className="content-grid">
                {/* STATUS ATUAL */}
                <div className="card span-12" style={{ textAlign: "center", padding: "40px 20px" }}>
                    {emServico ? (
                        <>
                            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🔴</div>
                            <h2 style={{ color: "var(--vermelho-700)", marginBottom: "8px" }}>EM SERVIÇO</h2>
                            <p style={{ fontSize: "1.2rem", marginBottom: "24px" }}>{postoAtual}</p>
                            <button className="btn btn-danger btn-wide" onClick={() => navigate("/checkout")}>
                                Finalizar Turno
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>⚪</div>
                            <h2 style={{ color: "var(--text-muted)", marginBottom: "8px" }}>FORA DE SERVIÇO</h2>
                            <p style={{ fontSize: "1rem", marginBottom: "24px", color: "var(--text-secondary)" }}>
                                Faça check-in para iniciar seu turno
                            </p>
                            <button className="btn btn-primary btn-wide" onClick={() => navigate("/checkin")}>
                                Iniciar Turno
                            </button>
                        </>
                    )}
                </div>

                {/* HISTÓRICO */}
                <div className="card span-12">
                    <div className="section-title">
                        <h2>Histórico</h2>
                    </div>
                    <div className="empty-state">
                        Histórico de turnos será implementado em breve.
                    </div>
                </div>
            </section>
        </main>
    );
}
