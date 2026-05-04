import { useEffect, useState } from "react";

export default function Supervisor() {

    const [postos, setPostos] = useState([]);
    const [postosOcupados, setPostosOcupados] = useState(0);

    const carregarPostos = async () => {
        const res = await fetch("http://localhost:8080/postos");
        const data = await res.json();

        setPostos(data);

        const ocupados = data.filter(p => p.status === "OCUPADO").length;
        setPostosOcupados(ocupados);
    };

    useEffect(() => {
        carregarPostos();

        const intervalo = setInterval(() => {
            carregarPostos();
        }, 5000);

        return () => clearInterval(intervalo);
    }, []);

    return (
        <div>
            <h1>Painel do Supervisor</h1>
            <h2>Postos Ocupados Agora: {postosOcupados}</h2>

            {postos.map(p => (
                <div key={p.id}>
                    {p.nome} - {p.status}
                </div>
            ))}
        </div>
    );
}