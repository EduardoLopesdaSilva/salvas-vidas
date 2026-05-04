import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
export function Checkout() {

    const navigate = useNavigate();
    const [postoSelecionado, setPostoSelecionado] = useState(null);
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

    } catch {
        alert("Erro no checkout");
        }           
    };          
}               