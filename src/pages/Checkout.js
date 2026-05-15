import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Checkout() {

    const navigate = useNavigate();

    const [postoSelecionado, setPostoSelecionado] = useState("");

    const [turno, setTurno] = useState({
        prevencoes: 0,
        lesoes: []
    });

    const finalizarTurno = async () => {

        try {

            await fetch("http://localhost:8080/checkout/out", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postoId: postoSelecionado,
                    foto: "foto_final",
                    prevencoes: turno.prevencoes.toString(),
                    lesoes: JSON.stringify(turno.lesoes),
                    queimaduras: "0"
                })
            });

            alert("Turno finalizado!");

            navigate("/supervisor");

        } catch {

            alert("Erro no checkout");
        }
    };

    return (
        <div>

            <h1>Checkout</h1>

            <select
                onChange={(e) => setPostoSelecionado(e.target.value)}
            >
                <option>Selecione um posto</option>
                <option value="1">Posto 1</option>
                <option value="2">Posto 2</option>
            </select>

            <input
                type="number"
                placeholder="Prevenções"
                onChange={(e) =>
                    setTurno({
                        ...turno,
                        prevencoes: e.target.value
                    })
                }
            />

            <button onClick={finalizarTurno}>
                Finalizar Turno
            </button>

        </div>
    );
}