import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GerarToken } from "../utils/GerarToken";

export function Login() {
    fetch("http://localhost:8080/login")
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");

    const fazerLogin = (e) => {
        e.preventDefault();

        const dados = localStorage.getItem('usuario_salva_vidas');

        if (!dados) {
            alert("Nenhum usuário cadastrado");
            return;
        }

        const usuario = JSON.parse(dados);

        if (usuario === usuario.usuario && senha === usuario.senha) {

            const token = GerarToken(); // 🔥 agora usando corretamente
            localStorage.setItem('token', token);

            alert("Login realizado com sucesso!");
            navigate("/dashboard");

        } else {
            alert("Nome ou senha incorretos");
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <input
                type="text"
                placeholder="usuario"
                onChange={(e) => setUsuario(e.target.value)}
            />

            <input
                type="password"
                placeholder="Senha"
                onChange={(e) => setSenha(e.target.value)}
            />

            <button onClick={fazerLogin}>Entrar</button>
        </div>
    );
}