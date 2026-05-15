import { useState, useEffect } from 'react';

export function Cadastro() {
    fetch("http://localhost:8080")

    const [nomeSalvo, setNomeSalvo] = useState("")

    const [formulario, setFormulario] = useState({
        nome: "",
        senha: "",
        posto: "",
        funcao: ""
    })

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value })
    }

    const salvarUsuario = () => {

        if (!formulario.nome || !formulario.senha) {
            alert("Preencha nome e senha!")
            return
        }

        localStorage.setItem('usuario_salva_vidas', JSON.stringify(formulario))

        alert("Cadastro realizado com sucesso!")
        setNomeSalvo(formulario.nome)
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
            setNomeSalvo(usuario.nome)
        }
    }, [])

    return (
        <div>
            <h1>Cadastro</h1>

            <input
                type='text'
                name='usuario'
                placeholder='usuario'
                onChange={handleChange}
            />

            <input
                type='password'
                name='password'
                placeholder='Senha'
                onChange={handleChange}
            />

            <input
                type='text'
                name='posto'
                placeholder='Posto'
                onChange={handleChange}
            />

            <select name="funcao" onChange={handleChange}>
                <option value="salva-vidas">Salva-vidas</option>
                <option value="supervisor">Supervisor</option>
            </select>

            <br /><br />

            <button onClick={salvarUsuario}>Cadastrar</button>
            <button onClick={removerUsuario}>Limpar</button>

            {nomeSalvo && (
                <p>Bem-vindo, {nomeSalvo}</p>
            )}
        </div>
    )
}