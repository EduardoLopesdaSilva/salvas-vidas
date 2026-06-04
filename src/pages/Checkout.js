import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Checkout() {

    const navigate = useNavigate();

    const [postoSelecionado, setPostoSelecionado] = useState("");

    const [turno, setTurno] = useState({
        prevencoes: 0,
        lesoes: 0,
        queimaduras: 0
    });
    const [erro, setErro] = useState("");

    const finalizarTurno = async () => {
        setErro("");

        if (!postoSelecionado) {
            setErro("Selecione um posto");
            return;
        }

        try {
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

            alert("Turno finalizado!");
            navigate("/dashboard");
        } catch (error) {
            setErro(error.message || "Erro no checkout");
        }
    };

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Operacao</p>
                    <h1>Finalizar turno</h1>
                    <p className="page-description">Informe os numeros do atendimento e encerre a atividade do posto.</p>
                </div>
            </header>

            <section className="content-grid">
                <div className="card span-7">
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="posto-checkout">Posto</label>
                            <select
                                id="posto-checkout"
                                className="select"
                                value={postoSelecionado}
                                onChange={(e) => setPostoSelecionado(e.target.value)}
                            >
                                <option value="">Selecione um posto</option>
                                <option value="1">Posto 1</option>
                                <option value="2">Posto 2</option>
                                <option value="3">Posto 3</option>
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="prevencoes-checkout">Prevencoes</label>
                            <input
                                id="prevencoes-checkout"
                                className="input"
                                type="number"
                                min="0"
                                value={turno.prevencoes}
                                onChange={(e) =>
                                    setTurno({
                                        ...turno,
                                        prevencoes: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="lesoes-checkout">Lesoes</label>
                            <input
                                id="lesoes-checkout"
                                className="input"
                                type="number"
                                min="0"
                                value={turno.lesoes}
                                onChange={(e) =>
                                    setTurno({
                                        ...turno,
                                        lesoes: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="queimaduras-checkout">Queimaduras</label>
                            <input
                                id="queimaduras-checkout"
                                className="input"
                                type="number"
                                min="0"
                                value={turno.queimaduras}
                                onChange={(e) =>
                                    setTurno({
                                        ...turno,
                                        queimaduras: e.target.value
                                    })
                                }
                            />
                        </div>

                        {erro && <div className="alert alert-error">{erro}</div>}

                        <button className="btn btn-primary btn-wide" onClick={finalizarTurno}>
                            Finalizar turno
                        </button>
                    </div>
                </div>

                <aside className="card span-5">
                    <h2>Conferencia</h2>
                    <div className="list">
                        <div className="list-item">
                            <strong>Prevencoes</strong>
                            <span className="badge badge-busy">{turno.prevencoes || 0}</span>
                        </div>
                        <div className="list-item">
                            <strong>Lesoes</strong>
                            <span className="badge badge-alert">{turno.lesoes || 0}</span>
                        </div>
                        <div className="list-item">
                            <strong>Queimaduras</strong>
                            <span className="badge badge-alert">{turno.queimaduras || 0}</span>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}
