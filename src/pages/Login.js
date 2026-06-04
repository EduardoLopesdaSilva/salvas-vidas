import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cpfBasicoValido, limparCpf, useAuth } from "../context/AuthContext";

export function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [identificador, setIdentificador] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const fazerLogin = async (e) => {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const valorDigitado = identificador.trim();
            const cpfLimpo = limparCpf(valorDigitado);
            const loginNumerico = /^[\d.\-\s]+$/.test(valorDigitado);
            const loginEmail = valorDigitado.includes("@");

            // Valida CPF apenas se for login numérico
            if (loginNumerico && !cpfBasicoValido(cpfLimpo)) {
                setErro("Informe um CPF válido com 11 números");
                return;
            }

            // Envia CPF se for numérico, email se tiver @
            const loginData = {
                senha
            };

            if (loginNumerico) {
                loginData.cpf = cpfLimpo;
            } else if (loginEmail) {
                loginData.email = valorDigitado;
            } else {
                // Se não for claro, envia ambos (back-end decide)
                loginData.cpf = cpfLimpo;
                loginData.email = valorDigitado;
            }

            const usuarioLogado = await login(loginData);

            if (usuarioLogado.nivelAcesso === "ADMIN") {
                navigate("/supervisor");
            } else {
                navigate("/dashboard");
            }
        } catch (erro) {
            setErro(erro.message || "CPF, email ou senha inválidos");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="app-shell">
            <main className="login-page">
                <section className="login-visual" aria-label="Identidade institucional">
                    <span className="login-seal">CB</span>
                    <p className="page-kicker">Acesso restrito</p>
                    <h1>Controle operacional de Salva-Vidas</h1>
                    <p>
                        Plataforma institucional para acompanhamento de postos, turnos e informacoes operacionais.
                    </p>
                </section>

                <section className="login-panel-wrap">
                    <div className="card login-card">
                        <p className="page-kicker">Autenticacao</p>
                        <h2>Entrar no sistema</h2>
                        <p className="page-description">Use CPF e senha fornecidos pela supervisao.</p>

                        <form className="form-grid" onSubmit={fazerLogin}>
                            <div className="field">
                                <label htmlFor="identificador">CPF</label>
                                <input
                                    id="identificador"
                                    className="input"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Digite seu CPF"
                                    value={identificador}
                                    onChange={(e) => setIdentificador(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="senha">Senha</label>
                                <input
                                    id="senha"
                                    className="input"
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>

                            {erro && <div className="alert alert-error">{erro}</div>}

                            <button className="btn btn-primary btn-wide" type="submit" disabled={carregando}>
                                {carregando ? "Entrando..." : "Entrar"}
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}
