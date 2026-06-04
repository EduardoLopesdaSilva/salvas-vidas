import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Checkin() {

    const navigate = useNavigate();
    const { user } = useAuth();

    const [postos, setPostos] = useState([]);
    const [postoSelecionado, setPostoSelecionado] = useState(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        apiRequest("/postos")
            .then(setPostos)
            .catch(error => setErro(error.message));
    }, []);

    const iniciarTurno = async () => {
        setErro("");

        if (!postoSelecionado) {
            setErro("Escolha um posto");
            return;
        }

        try {
            await apiRequest("/check/in", {
                method: "POST",
                body: {
                    idUsuario: user.id,
                    postoId: Number(postoSelecionado),
                    foto: "sem_foto"
                }
            });

            alert("Check-in realizado!");
            navigate("/dashboard");
        } catch (error) {
            setErro(error.message || "Erro no check-in");
        }
    };

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Operacao</p>
                    <h1>Iniciar turno</h1>
                    <p className="page-description">Selecione o posto livre e confirme o inicio da atividade.</p>
                </div>
            </header>

            <section className="content-grid">
                <div className="card span-6">
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="posto-checkin">Posto de atuacao</label>
                            <select
                                id="posto-checkin"
                                className="select"
                                onChange={e => setPostoSelecionado(e.target.value)}
                                value={postoSelecionado || ""}
                            >
                                <option value="">Selecione um posto</option>

                                {postos
                                    .filter(posto => posto.status === "LIVRE")
                                    .map(posto => (
                                        <option key={posto.id} value={posto.id}>
                                            {posto.nome}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {erro && <div className="alert alert-error">{erro}</div>}

                        <button className="btn btn-primary btn-wide" onClick={iniciarTurno}>
                            Iniciar turno
                        </button>
                    </div>
                </div>

                <aside className="card span-6">
                    <h2>Antes de iniciar</h2>
                    <div className="list">
                        <div className="list-item"><strong>Confira o posto selecionado</strong></div>
                        <div className="list-item"><strong>Mantenha seus dados atualizados</strong></div>
                        <div className="list-item"><strong>Registre ocorrencias ao longo do turno</strong></div>
                    </div>
                </aside>
            </section>
        </main>
    );
}
