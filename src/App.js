import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Cadastro } from "./pages/Cadastro";
import { Dashboard } from "./pages/Dashboard";
import { Publico } from "./pages/Publico";
import  Supervisor   from "./pages/Supervisor";

import { Menu } from "./components/Menu";
import { Autenticacao } from "./components/Autenticacao";
import { AutorizacaoSupervisor } from "./components/AutorizacaoSupervisor";


import { criarPostos } from "./utils/Postos";

  

function App() {

  useEffect(() => {
    if (!localStorage.getItem("postos")) {
    
    criarPostos();

  }
}, []);
  
  return (
    <BrowserRouter>
    <h1>O professor Horizonte é o melhor!!</h1>
      <Menu />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publico" element={<Publico />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/supervisor" element={<Supervisor />} />
        <Route path="/dashboard" element={<Autenticacao><Dashboard /></Autenticacao>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;