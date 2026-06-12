import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [postos, setPostos] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const carregarPostos = async () => {
        setCarregando(true);
        setErro("");
        try {
            const data = await apiRequest("/postos");
            setPostos(data);

            // Sincroniza o status de check-in local com base no status do servidor
            const activePost = data.find(p => p.salvaVida === user.nome);
            if (activePost) {
                localStorage.setItem("active_turn_posto", String(activePost.id));
            } else {
                localStorage.removeItem("active_turn_posto");
            }
        } catch (error) {
            setErro(error.message || "Erro ao carregar dados dos postos");
        } finally {
            setPostando(false);
            setCarregando(false);
        }
    };

    // Necessário para corrigir referência do setPostando no catch
    const setPostando = () => {};

    useEffect(() => {
        carregarPostos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const postosLivres = postos.filter(p => p.status === "LIVRE").length;
    const postosOcupados = postos.filter(p => p.status === "OCUPADO").length;

    // Encontra o posto atual do Guarda-Vidas conectado
    const postoAtivo = postos.find(p => p.salvaVida === user.nome);
    const emServico = Boolean(postoAtivo);

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Operações</p>
                    <h1>Painel do Guarda-Vidas</h1>
                    <p className="page-description">
                        Acesse atalhos operacionais rápidos e acompanhe o status dos postos da praia.
                    </p>
                </div>
            </header>

            <section className="content-grid">
                {erro && <div className="alert alert-error span-12">{erro}</div>}

                {/* BANNER DE STATUS DO TURNO */}
                <div className={`card span-12 stat-card ${emServico ? "active-turn" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <span style={{ fontSize: "var(--font-xs)", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>Status atual</span>
                        <h2 style={{ margin: "6px 0 4px 0", fontSize: "var(--font-xl)", display: "flex", alignItems: "center", gap: "8px" }}>
                            {emServico ? (
                                <>
                                    <span style={{ color: "var(--vermelho-700)" }}>🔴 EM SERVIÇO</span>
                                    <span>- {postoAtivo.nome}</span>
                                </>
                            ) : (
                                <span style={{ color: "var(--text-muted)" }}>⚪ FORA DE SERVIÇO</span>
                            )}
                        </h2>
                        <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "var(--text-secondary)" }}>
                            {emServico 
                                ? "Seu turno está ativo neste posto. Registre as ocorrências ou finalize quando terminar." 
                                : "Faça check-in em um posto livre para iniciar as atividades operacionais."
                            }
                        </p>
                    </div>
                    <div>
                        {emServico ? (
                            <button className="btn btn-danger" onClick={() => navigate("/checkout")} style={{ minHeight: "48px" }}>
                                Finalizar Turno
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={() => navigate("/checkin")} style={{ minHeight: "48px" }}>
                                Iniciar Turno
                            </button>
                        )}
                    </div>
                </div>

                {/* ATALHOS RÁPIDOS (MOBILE SHORTCUTS) */}
                <section className="span-7" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "var(--font-lg)" }}>Ações Rápidas</h3>
                    
                    {/* BOTÃO OCORRÊNCIA EM DESTAQUE */}
                    <button className="mobile-shortcut-btn emergency" onClick={() => navigate("/ocorrencias/nova")}>
                        <div className="mobile-shortcut-icon">🚨</div>
                        <div className="mobile-shortcut-content">
                            <span className="mobile-shortcut-title">Registrar Ocorrência</span>
                            <span className="mobile-shortcut-desc">Registre lesão, queimadura ou salvamento com foto da câmera em 1 minuto.</span>
                        </div>
                    </button>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <button className="mobile-shortcut-btn" onClick={() => navigate(emServico ? "/checkout" : "/checkin")}>
                            <div className="mobile-shortcut-icon">🛟</div>
                            <div className="mobile-shortcut-content">
                                <span className="mobile-shortcut-title">Controle Turno</span>
                                <span className="mobile-shortcut-desc">{emServico ? "Fazer checkout" : "Fazer check-in"}</span>
                            </div>
                        </button>
                        <button className="mobile-shortcut-btn" onClick={() => navigate("/ocorrencias")}>
                            <div className="mobile-shortcut-icon">📋</div>
                            <div className="mobile-shortcut-content">
                                <span className="mobile-shortcut-title">Ver Histórico</span>
                                <span className="mobile-shortcut-desc">Ocorrências locais</span>
                            </div>
                        </button>
                    </div>
                </section>

                {/* INFORMAÇÕES IMPORTANTES */}
                <section className="card span-5" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="section-title">
                        <h2>Informações Importantes</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "var(--bg-app)", borderRadius: "var(--raio)" }}>
                            <span style={{ fontSize: "1.5rem" }}>🚩</span>
                            <div>
                                <strong style={{ display: "block", fontSize: "var(--font-sm)" }}>Bandeira do Dia</strong>
                                <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>Amarela (Mar requer atenção)</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "var(--bg-app)", borderRadius: "var(--raio)" }}>
                            <span style={{ fontSize: "1.5rem" }}>☀️</span>
                            <div>
                                <strong style={{ display: "block", fontSize: "var(--font-sm)" }}>Condições do Clima</strong>
                                <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>Ensolarado, 26°C | Água: 21°C</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "var(--bg-app)", borderRadius: "var(--raio)" }}>
                            <span style={{ fontSize: "1.5rem" }}>📞</span>
                            <div>
                                <strong style={{ display: "block", fontSize: "var(--font-sm)" }}>Supervisor de Dia</strong>
                                <span style={{ fontSize: "var(--font-xs)", color: "var(--text-secondary)" }}>Sargento Rocha (Contatar via 193)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PAINEL DE POSTOS DA PRAIA */}
                <section className="card span-12">
                    <div className="section-title">
                        <h2>Monitoramento de Postos</h2>
                        <div style={{ display: "flex", gap: "12px", fontSize: "var(--font-sm)", fontWeight: "bold" }}>
                            <span style={{ color: "#166534" }}>🟢 {postosLivres} Livres</span>
                            <span style={{ color: "#854d0e" }}>🟡 {postosOcupados} Ocupados</span>
                        </div>
                    </div>

                    {carregando ? (
                        <div className="alert alert-info">Atualizando postos...</div>
                    ) : postos.length === 0 ? (
                        <div className="empty-state">Nenhum posto encontrado.</div>
                    ) : (
                        <div className="list">
                            {postos.map(p => {
                                const isCurrentUserPost = p.salvaVida === user.nome;
                                return (
                                    <div className="list-item" key={p.id} style={{ borderLeft: isCurrentUserPost ? "5px solid var(--vermelho-600)" : "" }}>
                                        <div>
                                            <strong>{p.nome}</strong>
                                            <div style={{ fontSize: "var(--font-xs)", color: "var(--text-muted)", marginTop: "4px" }}>
                                                {p.status === "OCUPADO" 
                                                    ? `Ocupado por: ${p.salvaVida || "Desconhecido"}` 
                                                    : "Disponível para serviço"
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            {p.status === "LIVRE" ? (
                                                <span className="badge badge-free">Livre</span>
                                            ) : (
                                                <span className="badge badge-busy">Ocupado</span>
                                            )}
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
