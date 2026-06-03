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
        <div>
            <h1>Gerenciamento de Guarda-Vidas</h1>
            {erro && <p style={{ color: "red" }}>{erro}</p>}

            {!mostrarFormulario ? (
                <>
                    <button onClick={() => setMostrarFormulario(true)}>
                        + Novo Guarda-Vida
                    </button>

                    <hr />

                    {carregando ? (
                        <p>Carregando...</p>
                    ) : usuarios.length === 0 ? (
                        <p>Nenhum guarda-vidas cadastrado</p>
                    ) : (
                        <table border="1" cellPadding="10">
                            <thead>
                                <tr>
                                    <th>Nome Completo</th>
                                    <th>CPF</th>
                                    <th>Nível de Acesso</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.nomeCompleto}</td>
                                        <td>{usuario.cpf}</td>
                                        <td>{usuario.nivelAcesso}</td>
                                        <td>{usuario.ativo ? "Ativo" : "Inativo"}</td>
                                        <td>
                                            <button onClick={() => editarUsuario(usuario)}>
                                                Editar
                                            </button>
                                            {usuario.ativo && (
                                                <button onClick={() => desativarUsuario(usuario.id)}>
                                                    Desativar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            ) : (
                <>
                    <h2>{editando ? "Editar Guarda-Vida" : "Novo Guarda-Vida"}</h2>
                    <form onSubmit={salvarUsuario}>
                        <div>
                            <label>Nome Completo:</label>
                            <input
                                type="text"
                                name="nomeCompleto"
                                value={formulario.nomeCompleto}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <br />
                        <div>
                            <label>CPF:</label>
                            <input
                                type="text"
                                name="cpf"
                                inputMode="numeric"
                                maxLength="11"
                                value={formulario.cpf}
                                onChange={handleChange}
                                required
                                disabled={!!editando}
                            />
                            {editando && <small>CPF não pode ser alterado</small>}
                        </div>
                        <br />
                        <div>
                            <label>Nível de Acesso:</label>
                            <select
                                name="nivelAcesso"
                                value={formulario.nivelAcesso}
                                onChange={handleChange}
                            >
                                <option value="OCUPADO">OCUPADO</option>
                                <option value="LIVRE">LIVRE</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>
                        <br />
                        <button type="submit" disabled={carregando}>
                            {carregando ? "Salvando..." : "Salvar"}
                        </button>
                        <button type="button" onClick={cancelarEdicao}>
                            Cancelar
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
