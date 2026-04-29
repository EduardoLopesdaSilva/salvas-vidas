import { Link } from "react-router-dom"


export function Menu() {

    const dados = localStorage.getItem("usuario_salva_vidas");
    const usuario = dados ? JSON.parse(dados) : null;

    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/cadastro">Cadastrar</Link>
            <Link to="/login">Logar</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/supervisor">Supervisor</Link>
            
            {usuario?.funcao === "supervisor" && (<Link to="/supervisor">Supervisor</Link>)}

        </nav>
    )
}