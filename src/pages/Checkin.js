import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Checkin() {

    const navigate = useNavigate();

    const [postoSelecionado, setPostoSelecionado] = useState(null);

    // ✅ Apenas verifica login
    useEffect(() => {

        const id = localStorage.getItem("usuario_id");

        if (!id) {
            navigate("/login");
        }

    }, [navigate]);

    // ✅ Função FORA do useEffect
    const iniciarTurno = async () => {

        const idUsuario = localStorage.getItem("usuario_id");

        if (!postoSelecionado) {
            alert("Escolha um posto");
            return;
        }

        try {

            await fetch("http://localhost:8080/check/in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idUsuario: Number(idUsuario),
                    postoId: postoSelecionado,
                    foto: "foto_teste"
                })
            });

            alert("Check-in realizado!");

            navigate("/supervisor");

        } catch {

            alert("Erro no check-in");
        }
    };

    return (
        <div>

            <h1>Check-in</h1>

            <select
                onChange={e => setPostoSelecionado(e.target.value)}
            >
                <option value="">Selecione um posto</option>

                <option value="1">Posto 1</option>
                <option value="2">Posto 2</option>
                <option value="3">Posto 3</option>
            </select>

            <button onClick={iniciarTurno}>
                Iniciar Turno
            </button>

        </div>
    );
}