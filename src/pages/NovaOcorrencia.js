import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function NovaOcorrencia() {
    const navigate = useNavigate();
    
    const [tipo, setTipo] = useState("");
    const [observacao, setObservacao] = useState("");
    const [foto, setFoto] = useState(null);
    const [erro, setErro] = useState("");

    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handleFileChange = (e) => {
        setErro("");
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErro("Foto muito pesada. Escolha uma imagem menor que 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerCamera = () => {
        cameraInputRef.current.click();
    };

    const triggerGallery = () => {
        galleryInputRef.current.click();
    };

    const removerFoto = () => {
        setFoto(null);
        if (cameraInputRef.current) cameraInputRef.current.value = "";
        if (galleryInputRef.current) galleryInputRef.current.value = "";
    };

    const salvarOcorrencia = (e) => {
        e.preventDefault();
        setErro("");

        if (!tipo) {
            setErro("Selecione o tipo de ocorrência.");
            return;
        }

        try {
            // 1. Salvar ocorrência na lista local
            const ocorrenciasExistentes = JSON.parse(localStorage.getItem("ocorrencias_salvas") || "[]");
            const novaOco = {
                id: Date.now(),
                tipo,
                observacao: observacao.trim() || "Sem observações",
                foto: foto || "sem_foto",
                data: new Date().toLocaleString("pt-BR")
            };
            ocorrenciasExistentes.unshift(novaOco); // Adiciona no início
            localStorage.setItem("ocorrencias_salvas", JSON.stringify(ocorrenciasExistentes));

            // 2. Incrementar contadores locais do turno para preenchimento automático
            const contadores = JSON.parse(localStorage.getItem("current_shift_counters") || '{"prevencoes":0,"lesoes":0,"queimaduras":0}');
            
            if (tipo === "Prevenção") {
                contadores.prevencoes = Number(contadores.prevencoes) + 1;
            } else if (tipo === "Lesão") {
                contadores.lesoes = Number(contadores.lesoes) + 1;
            } else if (tipo === "Queimadura") {
                contadores.queimaduras = Number(contadores.queimaduras) + 1;
            }
            
            localStorage.setItem("current_shift_counters", JSON.stringify(contadores));

            alert("Ocorrência registrada");
            navigate("/ocorrencias");
        } catch (error) {
            setErro("Não foi possível salvar a ocorrência localmente.");
        }
    };

    const tiposOcorrencia = [
        { label: "Prevenção", icon: "🛟" },
        { label: "Lesão", icon: "🩹" },
        { label: "Queimadura", icon: "🔥" },
        { label: "Afogamento", icon: "🚨" },
        { label: "Outro", icon: "📝" }
    ];

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Operacional</p>
                    <h1>Registrar ocorrência</h1>
                    <p className="page-description">Preencha rapidamente os dados e capture a imagem para registrar o evento.</p>
                </div>
            </header>

            <section className="content-grid">
                <form className="card span-8 form-grid" onSubmit={salvarOcorrencia}>
                    {erro && <div className="alert alert-error">{erro}</div>}

                    {/* CAPTURA DE FOTO */}
                    <div className="field">
                        <label>Foto do evento (Opcional)</label>
                        <div className="photo-capture-container">
                            {/* Inputs Invisíveis */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                ref={cameraInputRef} 
                                className="hidden-file-input"
                                onChange={handleFileChange}
                            />
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={galleryInputRef} 
                                className="hidden-file-input"
                                onChange={handleFileChange}
                            />

                            {/* Botões de Ação */}
                            <div className="photo-buttons-grid">
                                <button type="button" className="btn btn-primary" onClick={triggerCamera}>
                                    📸 Tirar Foto
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={triggerGallery}>
                                    🖼️ Galeria
                                </button>
                            </div>

                            {/* Prévia da Foto */}
                            {foto && (
                                <div className="photo-preview-wrap">
                                    <img src={foto} alt="Prévia da ocorrência" className="photo-preview-image" />
                                    <button type="button" className="photo-remove-btn" onClick={removerFoto} aria-label="Remover foto">
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SELEÇÃO DO TIPO DE OCORRÊNCIA (TILES CLICÁVEIS) */}
                    <div className="field">
                        <label>Tipo de ocorrência</label>
                        <div className="type-tiles-grid">
                            {tiposOcorrencia.map((item) => (
                                <div 
                                    key={item.label}
                                    className={`type-tile ${tipo === item.label ? "selected" : ""}`}
                                    onClick={() => setTipo(item.label)}
                                >
                                    <span className="type-tile-icon">{item.icon}</span>
                                    <span className="type-tile-label">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* OBSERVAÇÃO */}
                    <div className="field">
                        <label htmlFor="observacao">Observação</label>
                        <textarea
                            id="observacao"
                            className="textarea"
                            placeholder="Descreva o ocorrido em poucas palavras..."
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                        />
                    </div>

                    {/* BOTÕES DE ENVIO */}
                    <div className="button-row">
                        <button type="submit" className="btn btn-primary btn-wide">
                            Salvar ocorrência
                        </button>
                        <button type="button" className="btn btn-secondary btn-wide" onClick={() => navigate("/dashboard")}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
