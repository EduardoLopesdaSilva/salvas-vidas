export function criarPostos() {

    const postos = [];

    for (let i = 1; i <= 21; i++) {
        postos.push({
            id: i,
            nome: `Posto ${i}`,
            status: "LIVRE",
            salvaVida: null
        });
    }

    localStorage.setItem("postos", JSON.stringify(postos));
}