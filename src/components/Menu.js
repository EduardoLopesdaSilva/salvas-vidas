import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext";

export function Menu() {
    const { isAuthenticated, isSupervisor, logout, user } = useAuth();
    const nomeUsuario = user?.nome || user?.cpf || "Usuário";
    const perfil = isSupervisor ? "Sargento" : "Guarda-Vidas";

    // Verifica localmente se há um turno ativo no momento
    const hasActiveTurn = Boolean(localStorage.getItem("active_turn_posto"));

    return (
        <>
            <header className="app-header">
                <NavLink to={isAuthenticated ? "/dashboard" : "/"} className="brand" aria-label="Página inicial">
                    <span className="brand-mark" aria-hidden="true"></span>
                    <span className="brand-title">
                        <strong>Gestão de Salva-Vidas</strong>
                        <span>Corpo de Bombeiros Militar de Santa Catarina</span>
                    </span>
                </NavLink>

                {isAuthenticated && (
                    <div className="header-user" aria-label="Usuário conectado">
                        <strong>{nomeUsuario}</strong>
                        <span>{perfil}</span>
                    </div>
                )}
            </header>

            {/* SIDEBAR PARA DESKTOP */}
            {isAuthenticated && (
                <aside className="sidebar" aria-label="Menu principal">
                    <div className="sidebar-group">Operação</div>
                    <nav className="sidebar-nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <span className="nav-icon">🏠</span>
                            Painel
                        </NavLink>
                        <NavLink to="/checkin" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <span className="nav-icon">📥</span>
                            Iniciar turno
                        </NavLink>
                        <NavLink to="/checkout" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <span className="nav-icon">📤</span>
                            Finalizar turno
                        </NavLink>

                        {isSupervisor && (
                            <>
                                <div className="sidebar-group">Supervisão</div>
                                <NavLink to="/supervisor" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                                    <span className="nav-icon">📊</span>
                                    Painel do Sargento
                                </NavLink>
                                <NavLink to="/gerenciamento-guarda-vidas" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                                    <span className="nav-icon">👥</span>
                                    Guarda-Vidas
                                </NavLink>
                            </>
                        )}

                        <button className="logout-button" onClick={logout}>
                            Sair do sistema
                        </button>
                    </nav>
                </aside>
            )}

            {/* BOTTOM NAV PARA MOBILE (Controlado por CSS media queries) */}
            {isAuthenticated && (
                <nav className="bottom-nav" aria-label="Navegação móvel">
                    <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
                        <span className="bottom-nav-icon">🏠</span>
                        <span>Painel</span>
                    </NavLink>
                    
                    <NavLink to={hasActiveTurn ? "/checkout" : "/checkin"} className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
                        <span className="bottom-nav-icon">🛟</span>
                        <span>{hasActiveTurn ? "Finalizar" : "Iniciar"}</span>
                    </NavLink>
                    
                    <NavLink to="/perfil" className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
                        <span className="bottom-nav-icon">👤</span>
                        <span>Perfil</span>
                    </NavLink>
                </nav>
            )}
        </>
    )
}
