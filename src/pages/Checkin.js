import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Checkin() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [postos, setPostos] = useState([]);
    const [postoSelecionado, setPostoSelecionado] = useState(null);
    const [foto, setFoto] = useState("sem_foto");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const cameraInputRef = useRef(null);

    useEffect(() => {
        setCarregando(true);
        apiRequest("/postos")
            .then(setPostos)
            .catch(error => setErro("Falha ao carregar os postos."))
            .finally(() => setCarregando(false));
    }, []);

    const handleFileChange = (e) => {
        setErro("");
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                setErro("Foto muito pesada. Escolha uma imagem de até 3MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerCamera = () => {
        cameraInputRef.current.click();
    };

    const removerFoto = () => {
        setFoto("sem_foto");
        if (cameraInputRef.current) cameraInputRef.current.value = "";
    };

    const iniciarTurno = async () => {
        setErro("");

        if (!postoSelecionado) {
            setErro("Selecione um posto livre");
            return;
        }

        try {
            setCarregando(true);
            await apiRequest("/check/in", {
                method: "POST",
                body: {
                    idUsuario: user.id,
                    postoId: Number(postoSelecionado),
                    foto: foto || "sem_foto"
                }
            });

            // Limpa contadores e define o posto ativo localmente
            localStorage.setItem("active_turn_posto", String(postoSelecionado));
            localStorage.setItem("current_shift_counters", JSON.stringify({
                prevencoes: 0,
                lesoes: 0,
                queimaduras: 0
            }));

            alert("Turno iniciado!");
            navigate("/dashboard");
        } catch (error) {
            setErro(error.message || "Erro ao iniciar o turno.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Operação</p>
                    <h1>Iniciar turno</h1>
                    <p className="page-description">Selecione o posto livre e confirme sua presença para iniciar o serviço.</p>
                </div>
            </header>

            <section className="content-grid">
                <div className="card span-6 form-grid">
                    <div className="section-title">
                        <h2>Dados do Turno</h2>
                    </div>

                    {/* SELEÇÃO DO POSTO */}
                    <div className="field">
                        <label htmlFor="posto-checkin">Posto de atuação</label>
                        <select
                            id="posto-checkin"
                            className="select"
                            onChange={e => setPostoSelecionado(e.target.value)}
                            value={postoSelecionado || ""}
                            disabled={carregando}
                        >
                            <option value="">Selecione um posto disponível</option>
                            {postos
                                .filter(posto => posto.status === "LIVRE")
                                .map(posto => (
                                    <option key={posto.id} value={posto.id}>
                                        {posto.nome}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* FOTO DE PRESENÇA */}
                    <div className="field">
                        <label>Foto de presença no posto (Opcional)</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            ref={cameraInputRef} 
                            className="hidden-file-input"
                            onChange={handleFileChange}
                        />
                        
                        {foto === "sem_foto" ? (
                            <button type="button" className="btn btn-secondary" onClick={triggerCamera}>
                                📸 Tirar Foto de Presença
                            </button>
                        ) : (
                            <div className="photo-preview-wrap" style={{ maxHeight: "240px" }}>
                                <img src={foto} alt="Presença" className="photo-preview-image" />
                                <button type="button" className="photo-remove-btn" onClick={removerFoto} aria-label="Remover foto">
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>

                    {erro && <div className="alert alert-error">{erro}</div>}

                    <button className="btn btn-primary btn-wide" onClick={iniciarTurno} disabled={carregando}>
                        {carregando ? "Confirmando..." : "Confirmar Início"}
                    </button>
                </div>

                <aside className="card span-6" style={{ height: "fit-content" }}>
                    <div className="section-title">
                        <h2>Recomendações importantes</h2>
                    </div>
                    <div className="list">
                        <div className="list-item" style={{ borderLeft: "4px solid var(--azul-700)" }}>
                            <strong>Confira o posto selecionado no painel</strong>
                        </div>
                        <div className="list-item" style={{ borderLeft: "4px solid var(--azul-700)" }}>
                            <strong>Verifique os equipamentos de salvamento</strong>
                        </div>
                        <div className="list-item" style={{ borderLeft: "4px solid var(--azul-700)" }}>
                            <strong>Mantenha o rádio na frequência correta</strong>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}
