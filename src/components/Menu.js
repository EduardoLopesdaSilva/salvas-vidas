import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext";


export function Menu() {

    const { isAuthenticated, isSupervisor, logout, user } = useAuth();
    const nomeUsuario = user?.nome || user?.cpf || "Usuario";
    const perfil = isSupervisor ? "Sargento" : "Guarda-Vidas";

    return (
        <>
            <header className="app-header">
                <NavLink to={isAuthenticated ? "/dashboard" : "/"} className="brand" aria-label="Pagina inicial">
                    <span className="brand-mark">CB</span>
                    <span className="brand-title">
                        <strong>Sistema de Gestao para Salva-Vidas</strong>
                        <span>Corpo de Bombeiros Militar de Santa Catarina</span>
                    </span>
                </NavLink>

                {isAuthenticated && (
                    <div className="header-user" aria-label="Usuario conectado">
                        <strong>{nomeUsuario}</strong>
                        <span>{perfil}</span>
                    </div>
                )}
            </header>

            {isAuthenticated && (
                <aside className="sidebar" aria-label="Menu principal">
                    <div className="sidebar-group">Operacao</div>
                    <nav className="sidebar-nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <span className="nav-icon">OP</span>
                            Painel
                        </NavLink>
                        <NavLink to="/checkin" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <span className="nav-icon">IN</span>
                            Iniciar turno
                        </NavLink>
                        <NavLink to="/checkout" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <span className="nav-icon">OUT</span>
                            Finalizar turno
                        </NavLink>

                        {isSupervisor && (
                            <>
                                <div className="sidebar-group">Supervisao</div>
                                <NavLink to="/supervisor" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                                    <span className="nav-icon">SG</span>
                                    Painel do Sargento
                                </NavLink>
                                <NavLink to="/gerenciamento-guarda-vidas" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                                    <span className="nav-icon">GV</span>
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
        </>
    )
}
