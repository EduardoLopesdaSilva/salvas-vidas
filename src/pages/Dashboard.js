import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function Dashboard() {

    const { user } = useAuth();

    const [postos, setPostos] = useState([]);
    const [postoSelecionado, setPostoSelecionado] = useState(null);
    const [prevencoes, setPrevencoes] = useState(0);
    const [lesoes, setLesoes] = useState(0);
    const [queimaduras, setQueimaduras] = useState(0);
    const [erro, setErro] = useState("");

    const carregarPostos = () => {
        apiRequest("/postos")
            .then(data => setPostos(data))
            .catch(error => setErro(error.message));
    };

    useEffect(() => {
        carregarPostos();
    }, []);

    const iniciarTurno = async () => {

        if (!postoSelecionado) {
            alert("Escolha um posto");
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

            alert("Turno iniciado!");
            setPostoSelecionado(null);
            carregarPostos();

        } catch (error) {
            alert(error.message || "Erro ao iniciar turno");
        }
    };

    const finalizarTurno = async () => {

        if (!postoSelecionado) {
            alert("Nenhum posto selecionado");
            return;
        }

        try {
            await apiRequest("/checkout/out", {
                method: "POST",
                body: {
                    postoId: Number(postoSelecionado),
                    foto: "sem_foto",
                    prevencoes: String(prevencoes),
                    lesoes: String(lesoes),
                    queimaduras: String(queimaduras)
                }
            });

            alert("Turno finalizado!");
            setPostoSelecionado(null);
            carregarPostos();

        } catch (error) {
            alert(error.message || "Erro ao finalizar turno");
        }
    };

    const postosLivres = postos.filter(p => p.status === "LIVRE").length;
    const postosOcupados = postos.filter(p => p.status === "OCUPADO").length;
    const postoAtual = postos.find(p => String(p.id) === String(postoSelecionado));

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Centro operacional</p>
                    <h1>Painel do Guarda-Vidas</h1>
                    <p className="page-description">
                        Acesse rapidamente seu turno, escolha o posto e registre informacoes essenciais com poucos cliques.
                    </p>
                </div>
            </header>

            <section className="content-grid">
                {erro && <div className="alert alert-error span-12">{erro}</div>}

                <div className="card stat-card span-4">
                    <p className="stat-label">Postos livres</p>
                    <p className="stat-value">{postosLivres}</p>
                </div>
                <div className="card stat-card span-4">
                    <p className="stat-label">Postos ocupados</p>
                    <p className="stat-value">{postosOcupados}</p>
                </div>
                <div className="card stat-card span-4">
                    <p className="stat-label">Posto selecionado</p>
                    <p className="stat-value">{postoAtual?.nome || "-"}</p>
                </div>

                <section className="card span-7">
                    <div className="section-title">
                        <h2>Atividades pendentes</h2>
                    </div>

                    <div className="action-grid">
                        <div className="action-tile">
                            <strong>Iniciar turno</strong>
                            <span>Escolha um posto livre e confirme o inicio da atividade.</span>
                        </div>
                        <div className="action-tile">
                            <strong>Finalizar turno</strong>
                            <span>Informe prevencoes, lesoes e queimaduras antes de encerrar.</span>
                        </div>
                        <div className="action-tile">
                            <strong>Historico</strong>
                            <span>Acompanhe os registros operacionais no painel.</span>
                        </div>
                    </div>
                </section>

                <section className="card span-5">
                    <div className="section-title">
                        <h2>Registrar turno</h2>
                    </div>

                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="prevencoes">Prevencoes</label>
                            <input id="prevencoes" className="input" type="number" min="0" value={prevencoes} onChange={e => setPrevencoes(e.target.value)} />
                        </div>
                        <div className="field">
                            <label htmlFor="lesoes">Lesoes</label>
                            <input id="lesoes" className="input" type="number" min="0" value={lesoes} onChange={e => setLesoes(e.target.value)} />
                        </div>
                        <div className="field">
                            <label htmlFor="queimaduras">Queimaduras</label>
                            <input id="queimaduras" className="input" type="number" min="0" value={queimaduras} onChange={e => setQueimaduras(e.target.value)} />
                        </div>
                        <div className="button-row">
                            <button className="btn btn-primary" onClick={iniciarTurno}>Iniciar turno</button>
                            <button className="btn btn-secondary" onClick={finalizarTurno}>Finalizar turno</button>
                        </div>
                    </div>
                </section>

                <section className="card span-12">
                    <div className="section-title">
                        <h2>Postos</h2>
                    </div>

                    {postos.length === 0 ? (
                        <div className="empty-state">Nenhum posto encontrado.</div>
                    ) : (
                        <div className="list">
                            {postos.map(p => (
                                <div className="list-item" key={p.id}>
                                    <div>
                                        <strong>{p.nome}</strong>
                                        <div>
                                            <span className={`badge ${p.status === "LIVRE" ? "badge-free" : "badge-busy"}`}>
                                                {p.status === "LIVRE" ? "Livre" : "Ocupado"}
                                            </span>
                                        </div>
                                    </div>

                                    {p.status === "LIVRE" && (
                                        <button className="btn btn-secondary" onClick={() => setPostoSelecionado(p.id)}>
                                            Selecionar posto
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}
