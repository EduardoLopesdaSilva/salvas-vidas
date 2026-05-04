import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Dashboard() {

    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [postos, setPostos] = useState([]);
    const [postoSelecionado, setPostoSelecionado] = useState(null);

    // 🔹 carregar usuário
    useEffect(() => {
        const id = localStorage.getItem("usuario_id");

        if (!id) {
            navigate("/login");
            return;
        }

        fetch(`http://localhost:8080/usuarios/${id}`)
            .then(res => res.json())
            .then(data => setUsuario(data));
    }, []);

    // 🔹 carregar postos
    const carregarPostos = () => {
        fetch("http://localhost:8080/postos")
            .then(res => res.json())
            .then(data => setPostos(data));
    };

    useEffect(() => {
        carregarPostos();
    }, []);

    // 🔥 CHECK-IN
    const iniciarTurno = async () => {

        const idUsuario = localStorage.getItem("usuario_id");

        if (!postoSelecionado) {
            alert("Escolha um posto");
            return;
        }

        try {
            await fetch(`http://localhost:8080/check/in?idUsuario=${idUsuario}&postoId=${postoSelecionado}&foto=teste`, {
                method: "POST"
            });

            alert("Turno iniciado!");
            setPostoSelecionado(null);

            carregarPostos(); // 🔄 atualiza status

        } catch {
            alert("Erro ao iniciar turno");
        }
    };

    // 🔥 CHECK-OUT
    const finalizarTurno = async () => {

        if (!postoSelecionado) {
            alert("Nenhum posto selecionado");
            return;
        }

        try {
            await fetch(`http://localhost:8080/checkout/out?postoId=${postoSelecionado}&foto=teste&prevencoes=0&lesoes=0&queimaduras=0`, {
                method: "POST"
            });

            alert("Turno finalizado!");
            setPostoSelecionado(null);

            carregarPostos(); // 🔄 atualiza status

        } catch {
            alert("Erro ao finalizar turno");
        }
    };

    if (!usuario) return <h1>Carregando...</h1>;

    return (
        <div>
            <h1>Dashboard</h1>
            <h3>Bem-vindo, {usuario.email}</h3>

            <hr />

            <h2>Postos</h2>

            {postos.map(p => (
                <div key={p.id}>
                    {p.nome} - {p.status}

                    {p.status === "LIVRE" && (
                        <button onClick={() => setPostoSelecionado(p.id)}>
                            Selecionar
                        </button>
                    )}
                </div>
            ))}

            <hr />

            <p>Posto selecionado: {postoSelecionado}</p>

            <button onClick={iniciarTurno}>Iniciar Turno</button>

            <button onClick={finalizarTurno}>Finalizar Turno</button>
        </div>
    );
}