import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { limparCpf, cpfBasicoValido } from "../context/AuthContext";

export default function GerenciamentoGuardaVidas() {
    const [usuarios, setUsuarios] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        nomeCompleto: "",
        cpf: "",
        nivelAcesso: "OCUPADO"
    });

    const carregarUsuarios = async () => {
        setCarregando(true);
        setErro("");
        try {
            const data = await apiRequest("/usuarios");
            setUsuarios(data);
        } catch (error) {
            setErro(error.message || "Erro ao carregar usuários");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const handleChange = (e) => {
        const valor = e.target.name === "cpf" ? limparCpf(e.target.value) : e.target.value;
        setFormulario({ ...formulario, [e.target.name]: valor });
    };

    const salvarUsuario = async (e) => {
        e.preventDefault();
        setErro("");

        if (!formulario.nomeCompleto.trim() || !formulario.cpf) {
            setErro("Preencha nome completo e CPF");
            return;
        }

        if (!cpfBasicoValido(formulario.cpf)) {
            setErro("Informe um CPF válido com 11 números");
            return;
        }

        try {
            setCarregando(true);
            if (editando) {
                await apiRequest(`/usuarios/${editando.id}`, {
                    method: "PUT",
                    body: formulario
                });
            } else {
                await apiRequest("/usuarios", {
                    method: "POST",
                    body: formulario
                });
            }
            setMostrarFormulario(false);
            setEditando(null);
            setFormulario({ nomeCompleto: "", cpf: "", nivelAcesso: "OCUPADO" });
            carregarUsuarios();
        } catch (error) {
            setErro(error.message || "Erro ao salvar usuário");
        } finally {
            setCarregando(false);
        }
    };

    const editarUsuario = (usuario) => {
        setEditando(usuario);
        setFormulario({
            nomeCompleto: usuario.nomeCompleto,
            cpf: usuario.cpf,
            nivelAcesso: usuario.nivelAcesso
        });
        setMostrarFormulario(true);
    };

    const desativarUsuario = async (id) => {
        if (!window.confirm("Tem certeza que deseja desativar este usuário?")) {
            return;
        }
        try {
            setCarregando(true);
            await apiRequest(`/usuarios/${id}`, {
                method: "DELETE"
            });
            carregarUsuarios();
        } catch (error) {
            setErro(error.message || "Erro ao desativar usuário");
        } finally {
            setCarregando(false);
        }
    };

    const cancelarEdicao = () => {
        setMostrarFormulario(false);
        setEditando(null);
        setFormulario({ nomeCompleto: "", cpf: "", nivelAcesso: "OCUPADO" });
        setErro("");
    };

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Administracao</p>
                    <h1>Guarda-Vidas</h1>
                    <p className="page-description">
                        Cadastre, edite e acompanhe os profissionais autorizados a acessar o sistema.
                    </p>
                </div>

                {!mostrarFormulario && (
                    <button className="btn btn-primary" onClick={() => setMostrarFormulario(true)}>
                        Novo Guarda-Vida
                    </button>
                )}
            </header>

            <section className="content-grid">
                {erro && <div className="alert alert-error span-12">{erro}</div>}

                {!mostrarFormulario ? (
                    <section className="card span-12">
                        <div className="section-title">
                            <h2>Lista de profissionais</h2>
                        </div>

                        {carregando ? (
                            <div className="alert alert-info">Carregando Guarda-Vidas...</div>
                        ) : usuarios.length === 0 ? (
                            <div className="empty-state">Nenhum Guarda-Vida cadastrado.</div>
                        ) : (
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Nome completo</th>
                                            <th>CPF</th>
                                            <th>Nivel de acesso</th>
                                            <th>Status</th>
                                            <th>Acoes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((usuario) => (
                                            <tr key={usuario.id}>
                                                <td>{usuario.nomeCompleto}</td>
                                                <td>{usuario.cpf}</td>
                                                <td>
                                                    <span className={`badge ${usuario.nivelAcesso === "ADMIN" ? "badge-admin" : "badge-free"}`}>
                                                        {usuario.nivelAcesso}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${usuario.ativo ? "badge-active" : "badge-inactive"}`}>
                                                        {usuario.ativo ? "Ativo" : "Inativo"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="button-row">
                                                        <button className="btn btn-secondary" onClick={() => editarUsuario(usuario)}>
                                                            Editar
                                                        </button>
                                                        {usuario.ativo && (
                                                            <button className="btn btn-danger" onClick={() => desativarUsuario(usuario.id)}>
                                                                Desativar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="card span-7">
                        <div className="section-title">
                            <h2>{editando ? "Editar Guarda-Vida" : "Novo Guarda-Vida"}</h2>
                        </div>

                        <form className="form-grid" onSubmit={salvarUsuario}>
                            <div className="field">
                                <label htmlFor="nomeCompleto">Nome completo</label>
                                <input
                                    id="nomeCompleto"
                                    className="input"
                                    type="text"
                                    name="nomeCompleto"
                                    value={formulario.nomeCompleto}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="cpf">CPF</label>
                                <input
                                    id="cpf"
                                    className="input"
                                    type="text"
                                    name="cpf"
                                    inputMode="numeric"
                                    maxLength="11"
                                    value={formulario.cpf}
                                    onChange={handleChange}
                                    required
                                    disabled={!!editando}
                                />
                                {editando && <small>CPF nao pode ser alterado.</small>}
                            </div>

                            <div className="field">
                                <label htmlFor="nivelAcesso">Nivel de acesso</label>
                                <select
                                    id="nivelAcesso"
                                    className="select"
                                    name="nivelAcesso"
                                    value={formulario.nivelAcesso}
                                    onChange={handleChange}
                                >
                                    <option value="OCUPADO">OCUPADO</option>
                                    <option value="LIVRE">LIVRE</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="button-row">
                                <button className="btn btn-primary" type="submit" disabled={carregando}>
                                    {carregando ? "Salvando..." : "Salvar"}
                                </button>
                                <button className="btn btn-secondary" type="button" onClick={cancelarEdicao}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </section>
        </main>
    );
}
