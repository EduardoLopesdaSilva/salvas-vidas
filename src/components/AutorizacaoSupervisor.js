import { Navigate } from "react-router-dom";

export function AutorizacaoSupervisor({ children }) {

    const dados = localStorage.getItem("usuario_salva_vidas");

    if (!dados) {
        return <Navigate to="/login" />;
    }

    const usuario = JSON.parse(dados);

    if (usuario.funcao !== "supervisor") {
        alert("Acesso permitido apenas para supervisores");
        return <Navigate to="/dashboard" />;
    }

    return children;
}