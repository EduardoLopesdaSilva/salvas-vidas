import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarPostos } from "../utils/Postos";

export function Dashboard() {

    const navigate = useNavigate();
    const [postos, setPostos] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [turno, setTurno] = useState(null);
    const [postoSelecionado, setPostoSelecionado] = useState(null);
    const [historico, setHistorico] = useState([]);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    // 🔹 Carregar usuário e turno
    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }
        // 🔹 Criar postos se não existirem
        
        if (!localStorage.getItem("postos")) {
        criarPostos();
}
        const dadosPostos = localStorage.getItem("postos");

        if (dadosPostos) {
            setPostos(JSON.parse(dadosPostos));
        }

        const dadosUsuario = localStorage.getItem("usuario_salva_vidas");
        const dadosTurno = localStorage.getItem("turno_usuario");

        if (dadosUsuario) setUsuario(JSON.parse(dadosUsuario));
        if (dadosTurno) setTurno(JSON.parse(dadosTurno));

    }, []);

    //Mostrar Historico

    const dadosHistorico = localStorage.getItem("historico_turnos");

        if (dadosHistorico) {
            setHistorico(JSON.parse(dadosHistorico));
        }

    // 🔹 Check-in
    const iniciarTurno = () => {
        const novoTurno = {
            ativo: true,
            inicio: new Date().toLocaleTimeString(),
            fim: null,
            prevencoes: 0,
            lesoes: []
        };

        localStorage.setItem("turno_usuario", JSON.stringify(novoTurno));
        setTurno(novoTurno);
    };

    // 🔹 Prevenção
    const adicionarPrevencao = () => {
        const novoTurno = {
            ...turno,
            prevencoes: turno.prevencoes + 1
        };

        localStorage.setItem("turno_usuario", JSON.stringify(novoTurno));
        setTurno(novoTurno);
    };

    // 🔹 Lesão
    const registrarLesao = () => {
        const descricao = prompt("Descreva a ocorrência:");

        if (!descricao) return;

        const novaLesao = {
            descricao,
            horario: new Date().toLocaleTimeString()
        };

        const novoTurno = {
            ...turno,
            lesoes: [...turno.lesoes, novaLesao]
        };

        localStorage.setItem("turno_usuario", JSON.stringify(novoTurno));
        setTurno(novoTurno);
    };

    // 🔹 Check-out
    const finalizarTurno = () => {

        if (turno.prevencoes === 0 && turno.lesoes.length === 0) {
            alert("Registre pelo menos uma atividade!");
            return;
        }

        const turnoFinal = {
            ...turno,
            ativo: false,
            fim: new Date().toLocaleString("pt-BR"),
            inicio: new Date().toLocaleString("pt-BR")
        };

        // 🔥 LIBERAR O POSTO
        const novosPostos = postos.map(p => {
            if (p.id === postoSelecionado) {
                return {
                    ...p,
                    status: "LIVRE",
                    salvaVida: null
                };
            }
            return p;
        });

        // salvar tudo
        localStorage.setItem("postos", JSON.stringify(novosPostos));
        localStorage.setItem("turno_usuario", JSON.stringify(turnoFinal));

        // atualizar tela
        setPostos(novosPostos);
        setTurno(turnoFinal);
        setPostoSelecionado(null);

        // 🔥 SALVAR HISTÓRICO
        const historico = JSON.parse(localStorage.getItem("historico_turnos")) || [];

        const novoRegistro = {
            usuario: usuario.nome,
            posto: postoSelecionado,
            inicio: turno.inicio,
            fim: turnoFinal.fim,
            prevencoes: turno.prevencoes,
            lesoes: turno.lesoes
        };

        historico.push(novoRegistro);

        localStorage.setItem("historico_turnos", JSON.stringify(historico));

                alert("Turno finalizado e posto liberado!");
            };

    //Assumir posto

    const assumirPosto = (id) => {

        if (postoSelecionado) {
        alert("Você já está em um posto!");
        return;
    }

    const novosPostos = postos.map(p => {
        if (p.id === id && p.status === "LIVRE") {
            return {
                ...p,
                status: "OCUPADO",
                salvaVida: usuario.nome
            };
        }
        return p;
    });

    localStorage.setItem("postos", JSON.stringify(novosPostos));
    setPostos(novosPostos);
    setPostoSelecionado(id);
};


    //Return

    return (
        <div>
            <h1>Dashboard</h1>

            {postoSelecionado && (
            <h3>Você está no Posto {postoSelecionado}</h3>
            )}

            <h3>Bem-vindo, {usuario.nome}</h3>

            <hr />

            {!turno?.ativo && (
                <button onClick={iniciarTurno}>Iniciar Turno</button>
            )}

            <h2>Postos</h2>

            {postos.map(p => (
                <div key={p.id}>
                    {p.nome} - {p.status}

                {p.status === "LIVRE" && !postoSelecionado && (
                <button onClick={() => assumirPosto(p.id)}>Assumir</button>
            )}

                    {p.status === "OCUPADO" && (
                        <span> (Ocupado por {p.salvaVida})</span>
                    )}
                </div>
            ))}

            {turno?.ativo && (
                <>
                    <p>Início: {turno.inicio}</p>

                    <h2>Prevenções: {turno.prevencoes}</h2>
                    <button onClick={adicionarPrevencao}>+1 Prevenção</button>

                    <h2>Lesões</h2>
                    <button onClick={registrarLesao}>Registrar</button>

                    <ul>
                        {turno.lesoes.map((l, i) => (
                            <li key={i}>
                                {l.descricao} - {l.horario}
                            </li>
                        ))}
                    </ul>

                    <button onClick={finalizarTurno}>Encerrar Turno</button>
                </>
            )}

            <h2>Histórico de Turnos</h2>

            {historico.map((h, i) => (
                <div key={i}>
                    <p>{h.usuario} - Posto {h.posto}</p>

                    <p>Início: {h.inicio}</p>

                    <p>Fim: {h.fim}</p>

                    <p>Prevenções: {h.prevencoes}</p>

                    <hr/>
                </div>
            ))}

            <hr />
            <button onClick={logout}>Logout</button>
        </div>
    );
}