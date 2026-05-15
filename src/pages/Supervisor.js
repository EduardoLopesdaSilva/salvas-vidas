import { useEffect, useState } from "react";

export default function Supervisor() {
    
    const [postos, setPostos] = useState([]);
    const [historico, setHistorico] = useState([]);

    const [metricas, setMetricas] = useState({
        totalTurnos: 0,
        totalPrevencoes: 0,
        totalLesoes: 0,
        postosOcupados: 0
    });

    const carregarPostos = async () => {

        const res = await fetch("http://localhost:8080/postos");

        const data = await res.json();

        setPostos(data);
    };

    useEffect(() => {

        carregarPostos();

        const dadosPostos = localStorage.getItem("postos");

        const dadosHistorico = localStorage.getItem("historico_turnos");

        if (dadosPostos && dadosHistorico) {

            const postosArray = JSON.parse(dadosPostos);

            const historicoArray = JSON.parse(dadosHistorico);

            setPostos(postosArray);

            setHistorico(historicoArray);

            const hoje = new Date().toLocaleDateString("pt-BR");

            const historicoHoje = historicoArray.filter(t =>
                t.inicio && t.inicio.includes(hoje)
            );

            const totalTurnos = historicoHoje.length;

            const totalPrevencoes = historicoHoje.reduce(
                (total, t) => total + (t.prevencoes || 0), 0
            );

            const totalLesoes = historicoHoje.reduce(
                (total, t) => total + (t.lesoes?.length || 0), 0
            );

            const postosOcupados = postosArray.filter(
                p => p.status === "OCUPADO"
            ).length;

            setMetricas({
                totalTurnos,
                totalPrevencoes,
                totalLesoes,
                postosOcupados
            });
        }

    }, []);

    return (
        <div>

            <h1>Painel do Supervisor</h1>

            <hr />

            <h2>Métricas de Hoje</h2>

            <p>Total de Turnos: {metricas.totalTurnos}</p>

            <p>Total de Prevenções: {metricas.totalPrevencoes}</p>

            <p>Total de Lesões: {metricas.totalLesoes}</p>

            <p>Postos Ocupados Agora: {metricas.postosOcupados}</p>

            <hr />

            <h2>Postos</h2>

            {postos.map(p => (
                <div key={p.id}>
                    {p.nome} - {p.status}
                    {p.salvaVida && <span> ({p.salvaVida})</span>}
                </div>
            ))}

            <hr />

            <h2>Histórico</h2>

            {historico.map((h, i) => (
                <div key={i}>

                    <p>{h.usuario} - Posto {h.posto}</p>

                    <p>Início: {h.inicio}</p>

                    <p>Fim: {h.fim}</p>

                    <p>Prevenções: {h.prevencoes}</p>

                    <hr />

                </div>
            ))}

        </div>
    );
}