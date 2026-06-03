import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Checkin() {

    const navigate = useNavigate();
    const { user } = useAuth();

    const [postos, setPostos] = useState([]);
    const [postoSelecionado, setPostoSelecionado] = useState(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        apiRequest("/postos")
            .then(setPostos)
            .catch(error => setErro(error.message));
    }, []);

    const iniciarTurno = async () => {
        setErro("");

        if (!postoSelecionado) {
            setErro("Escolha um posto");
            return;
        }

        try {
            await apiRequest("/check/in", {
                method: "POST",
                body: {
                    idUsuario: user.id,
                    postoId: Number(postoSelecionado),
                    foto: "sem_foto"
                }
            });

            alert("Check-in realizado!");
            navigate("/dashboard");
        } catch (error) {
            setErro(error.message || "Erro no check-in");
        }
    };

    return (
        <div>

            <h1>Check-in</h1>

            <select
                onChange={e => setPostoSelecionado(e.target.value)}
                value={postoSelecionado || ""}
            >
                <option value="">Selecione um posto</option>

                {postos
                    .filter(posto => posto.status === "LIVRE")
                    .map(posto => (
                        <option key={posto.id} value={posto.id}>
                            {posto.nome}
                        </option>
                    ))}
            </select>

            {erro && <p>{erro}</p>}

            <button onClick={iniciarTurno}>
                Iniciar Turno
            </button>

        </div>
    );
}
