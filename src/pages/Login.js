const fazerLogin = async (e) => {
    e.preventDefault();

    try {
        const resposta = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        if (resposta.ok) {
            const dados = await resposta.json();

            // ⚠️ AJUSTE conforme seu backend retornar
            localStorage.setItem("usuario_id", dados.id);

            alert("Login realizado!");
            navigate("/dashboard");
        } else {
            alert("Erro no login");
        }

    } catch {
        alert("Erro no servidor");
    }
};