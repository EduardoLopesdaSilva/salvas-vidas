import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Checkout() {
    const navigate = useNavigate();

    const [postos, setPostos] = useState([]);
    
    // Pré-seleciona o posto ativo localmente, se houver
    const [postoSelecionado, setPostoSelecionado] = useState(() => {
        return localStorage.getItem("active_turn_posto") || "";
    });

    // Pré-carrega os contadores acumulados de ocorrências registradas
    const [turno, setTurno] = useState(() => {
        const localContadores = localStorage.getItem("current_shift_counters");
        return localContadores 
            ? JSON.parse(localContadores) 
            : { prevencoes: 0, lesoes: 0, queimaduras: 0 };
    });

    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        setCarregando(true);
        apiRequest("/postos")
            .then(setPostos)
            .catch(error => setErro("Erro ao carregar a lista de postos."))
            .finally(() => setCarregando(false));
    }, []);

    const handleIncrement = (campo) => {
        setTurno(prev => ({
            ...prev,
            [campo]: Number(prev[campo]) + 1
        }));
    };

    const handleDecrement = (campo) => {
        setTurno(prev => ({
            ...prev,
            [campo]: Math.max(0, Number(prev[campo]) - 1)
        }));
    };

    const finalizarTurno = async () => {
        setErro("");

        if (!postoSelecionado) {
            setErro("Selecione um posto");
            return;
        }

        try {
            setCarregando(true);
            await apiRequest("/checkout/out", {
                method: "POST",
                body: {
                    postoId: Number(postoSelecionado),
                    foto: "foto_final",
                    prevencoes: turno.prevencoes.toString(),
                    lesoes: turno.lesoes.toString(),
                    queimaduras: turno.queimaduras.toString()
                }
            });

            // Limpa as variáveis locais do turno ativo
            localStorage.removeItem("active_turn_posto");
            localStorage.removeItem("current_shift_counters");

            alert("Turno finalizado!");
            navigate("/dashboard");
        } catch (error) {
            setErro(error.message || "Erro ao finalizar turno.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Operação</p>
                    <h1>Finalizar turno</h1>
                    <p className="page-description">Revise os números do atendimento e encerre a atividade do posto.</p>
                </div>
            </header>

            <section className="content-grid">
                <div className="card span-7 form-grid">
                    <div className="section-title">
                        <h2>Relatório de Fechamento</h2>
                    </div>

                    {/* SELEÇÃO DO POSTO */}
                    <div className="field">
                        <label htmlFor="posto-checkout">Posto de atuação</label>
                        <select
                            id="posto-checkout"
                            className="select"
                            value={postoSelecionado}
                            onChange={(e) => setPostoSelecionado(e.target.value)}
                            disabled={carregando}
                        >
                            <option value="">Selecione seu posto</option>
                            {postos
                                .filter(posto => posto.status === "OCUPADO")
                                .map(posto => (
                                    <option key={posto.id} value={posto.id}>
                                        {posto.nome}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* CONTADOR DE PREVENÇÕES */}
                    <div className="field">
                        <label>Prevenções realizadas</label>
                        <small>Orientações dadas a banhistas na praia.</small>
                        <div className="counter-control" style={{ marginTop: "6px" }}>
                            <button type="button" className="counter-btn" onClick={() => handleDecrement("prevencoes")} disabled={carregando}>-</button>
                            <span className="counter-value">{turno.prevencoes}</span>
                            <button type="button" className="counter-btn" onClick={() => handleIncrement("prevencoes")} disabled={carregando}>+</button>
                        </div>
                    </div>

                    {/* CONTADOR DE LESÕES */}
                    <div className="field">
                        <label>Lesões registradas (Água-Viva)</label>
                        <small>Atendimentos por queimaduras de águas-vivas ou caravelas.</small>
                        <div className="counter-control" style={{ marginTop: "6px" }}>
                            <button type="button" className="counter-btn" onClick={() => handleDecrement("lesoes")} disabled={carregando}>-</button>
                            <span className="counter-value">{turno.lesoes}</span>
                            <button type="button" className="counter-btn" onClick={() => handleIncrement("lesoes")} disabled={carregando}>+</button>
                        </div>
                    </div>

                    {/* CONTADOR DE QUEIMADURAS */}
                    <div className="field">
                        <label>Queimaduras / Outros</label>
                        <small>Queimaduras solares ou pequenos atendimentos de primeiros socorros.</small>
                        <div className="counter-control" style={{ marginTop: "6px" }}>
                            <button type="button" className="counter-btn" onClick={() => handleDecrement("queimaduras")} disabled={carregando}>-</button>
                            <span className="counter-value">{turno.queimaduras}</span>
                            <button type="button" className="counter-btn" onClick={() => handleIncrement("queimaduras")} disabled={carregando}>+</button>
                        </div>
                    </div>

                    {erro && <div className="alert alert-error">{erro}</div>}

                    <button className="btn btn-primary btn-wide" onClick={finalizarTurno} disabled={carregando} style={{ marginTop: "10px" }}>
                        {carregando ? "Finalizando..." : "Finalizar Turno"}
                    </button>
                </div>

                <aside className="card span-5" style={{ height: "fit-content" }}>
                    <div className="section-title">
                        <h2>Resumo Operacional</h2>
                    </div>
                    <div className="list">
                        <div className="list-item">
                            <div>
                                <strong>Prevenções</strong>
                                <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Acumulado do turno</div>
                            </div>
                            <span className="badge badge-free" style={{ fontSize: "var(--font-md)", padding: "8px 16px" }}>{turno.prevencoes}</span>
                        </div>
                        <div className="list-item">
                            <div>
                                <strong>Lesões</strong>
                                <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Água-Viva / Acidentes</div>
                            </div>
                            <span className="badge badge-busy" style={{ fontSize: "var(--font-md)", padding: "8px 16px" }}>{turno.lesoes}</span>
                        </div>
                        <div className="list-item">
                            <div>
                                <strong>Queimaduras / Outros</strong>
                                <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)" }}>Primeiros Socorros</div>
                            </div>
                            <span className="badge badge-alert" style={{ fontSize: "var(--font-md)", padding: "8px 16px" }}>{turno.queimaduras}</span>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}
