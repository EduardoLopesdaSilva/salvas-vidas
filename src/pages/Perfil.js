import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
    const { user, isSupervisor, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) return null;

    const nomeUsuario = user.nome || "Usuário";
    const perfil = isSupervisor ? "Supervisor (Sargento)" : "Guarda-Vidas";

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Conta</p>
                    <h1>Perfil do profissional</h1>
                    <p className="page-description">Informações cadastrais e credenciais de acesso.</p>
                </div>
            </header>

            <section className="content-grid">
                <div className="card span-6">
                    <div className="section-title">
                        <h2>Identificação</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <span style={{ fontSize: "var(--font-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: "bold" }}>Nome completo</span>
                            <p style={{ margin: "4px 0 0", fontSize: "var(--font-lg)", fontWeight: "bold", color: "var(--text-primary)" }}>{nomeUsuario}</p>
                        </div>

                        <div>
                            <span style={{ fontSize: "var(--font-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: "bold" }}>CPF</span>
                            <p style={{ margin: "4px 0 0", fontSize: "var(--font-lg)", fontWeight: "bold", color: "var(--text-primary)" }}>{user.cpf || "Não informado"}</p>
                        </div>

                        {user.email && (
                            <div>
                                <span style={{ fontSize: "var(--font-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: "bold" }}>E-mail</span>
                                <p style={{ margin: "4px 0 0", fontSize: "var(--font-lg)", color: "var(--text-primary)" }}>{user.email}</p>
                            </div>
                        )}

                        <div>
                            <span style={{ fontSize: "var(--font-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: "bold" }}>Nível de acesso</span>
                            <div>
                                <span className={`badge ${isSupervisor ? "badge-admin" : "badge-active"}`} style={{ marginTop: "6px" }}>
                                    {perfil}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                        <button className="btn btn-danger btn-wide" onClick={handleLogout}>
                            Sair da conta
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
