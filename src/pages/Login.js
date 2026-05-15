import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {

    const navigate = useNavigate();

    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");

    const fazerLogin = async (e) => {
        e.preventDefault();

        try {

            const resposta = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: usuario,
                    senha: senha
                })
            });

            if (resposta.ok) {

                // backend retorna TOKEN
                const token = await resposta.text();

                localStorage.setItem("token", token);

                alert("Login realizado!");

                navigate("/supervisor");

            } else {
                alert("Email ou senha inválidos");
            }

        } catch (erro) {

            console.log(erro);

            alert("Erro no servidor");
        }
    };

    return (
        <div>

            <h1>Login</h1>

            <form onSubmit={fazerLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />

                <br /><br />

                <button type="submit">
                    Entrar
                </button>

            </form>

        </div>
    );
}