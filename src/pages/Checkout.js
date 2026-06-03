import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Checkout() {

    const navigate = useNavigate();

    const [postoSelecionado, setPostoSelecionado] = useState("");

    const [turno, setTurno] = useState({
        prevencoes: 0,
        lesoes: 0,
        queimaduras: 0
    });
    const [erro, setErro] = useState("");

    const finalizarTurno = async () => {
        setErro("");

        if (!postoSelecionado) {
            setErro("Selecione um posto");
            return;
        }

        try {
            await apiRequest("/checkout/out", {
                method: "POST",
                body: {
                    postoId: Number(postoSelecionado),
                    foto: "foto_final",
                    prevencoes: turno.prevencoes.toString(),
                    lesoes: turno.lesoes.toString(),
                    queimaduras: turno.queimaduras.toString()
                }
            });

            alert("Turno finalizado!");
            navigate("/dashboard");
        } catch (error) {
            setErro(error.message || "Erro no checkout");
        }
    };

    return (
        <div>

            <h1>Checkout</h1>

            <select
                value={postoSelecionado}
                onChange={(e) => setPostoSelecionado(e.target.value)}
            >
                <option value="">Selecione um posto</option>
                <option value="1">Posto 1</option>
                <option value="2">Posto 2</option>
                <option value="3">Posto 3</option>
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

            <input
                type="number"
                placeholder="Lesões"
                onChange={(e) =>
                    setTurno({
                        ...turno,
                        lesoes: e.target.value
                    })
                }
            />

            <input
                type="number"
                placeholder="Queimaduras"
                onChange={(e) =>
                    setTurno({
                        ...turno,
                        queimaduras: e.target.value
                    })
                }
            />

            {erro && <p>{erro}</p>}

            <button onClick={finalizarTurno}>
                Finalizar Turno
            </button>

        </div>
    );
}
