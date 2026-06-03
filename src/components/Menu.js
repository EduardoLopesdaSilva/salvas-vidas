import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext";


export function Menu() {

    const { isAuthenticated, isSupervisor, logout, user } = useAuth();

    return (
        <nav>
            <Link to="/">Home</Link>
            {!isAuthenticated && <Link to="/login">Login</Link>}
            {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
            {isAuthenticated && <Link to="/checkin">Check-in</Link>}
            {isAuthenticated && <Link to="/checkout">Checkout</Link>}
            {isSupervisor && <Link to="/supervisor">Supervisor</Link>}
            {isSupervisor && <Link to="/gerenciamento-guarda-vidas">Gerenciar Guarda-Vidas</Link>}
            {isSupervisor && <span>{user.nome || user.cpf}</span>}
            {isAuthenticated && <button onClick={logout}>Sair</button>}

        </nav>
    )
}
