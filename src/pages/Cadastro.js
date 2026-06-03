import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cpfBasicoValido, limparCpf, useAuth } from '../context/AuthContext';

export function Cadastro() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [nomeSalvo, setNomeSalvo] = useState("")
    const [erro, setErro] = useState("")
    const [carregando, setCarregando] = useState(false)

    const [formulario, setFormulario] = useState({
        nome: "",
        cpf: ""
    })

    const handleChange = (e) => {
        const valor = e.target.name === "cpf" ? limparCpf(e.target.value) : e.target.value
        setFormulario({ ...formulario, [e.target.name]: valor })
    }

    const salvarUsuario = async (e) => {
        e.preventDefault()
        setErro("")

        if (!formulario.nome.trim() || !formulario.cpf) {
            setErro("Preencha nome completo e CPF")
            return
        }

        if (!cpfBasicoValido(formulario.cpf)) {
            setErro("Informe um CPF válido com 11 números")
            return
        }

        try {
            setCarregando(true)

            await register({
                nome: formulario.nome.trim(),
                cpf: formulario.cpf,
                nivelAcesso: "OCUPADO"
            })

            setNomeSalvo(formulario.nome.trim())
            navigate("/login")
        } catch (error) {
            setErro(error.message || "Erro ao cadastrar usuário")
        } finally {
            setCarregando(false)
        }
    }

    const removerUsuario = () => {
        localStorage.removeItem('usuario_salva_vidas')
        setNomeSalvo("")
        alert("Cadastro removido")
    }

    useEffect(() => {
        const dados = localStorage.getItem('usuario_salva_vidas')

        if (dados) {
            const usuario = JSON.parse(dados)
            setNomeSalvo(usuario.nome || usuario.cpf || usuario.email)
        }
    }, [])

    return (
        <div>
            <h1>Cadastro</h1>

            <form onSubmit={salvarUsuario}>
                <input
                    type='text'
                    name='nome'
                    placeholder='Nome completo'
                    value={formulario.nome}
                    onChange={handleChange}
                    required
                />

                <input
                    type='text'
                    inputMode='numeric'
                    name='cpf'
                    maxLength='11'
                    placeholder='CPF'
                    value={formulario.cpf}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                {erro && <p>{erro}</p>}

                <button type="submit" disabled={carregando}>
                    {carregando ? "Cadastrando..." : "Cadastrar"}
                </button>
                <button type="button" onClick={removerUsuario}>Limpar</button>
            </form>

            {nomeSalvo && (
                <p>Cadastro salvo para {nomeSalvo}. A senha inicial e formada pelos 3 primeiros numeros do CPF.</p>
            )}
        </div>
    )
}
