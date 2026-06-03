import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Publico } from "./pages/Publico";
import Supervisor from "./pages/Supervisor";
import GerenciamentoGuardaVidas from "./pages/GerenciamentoGuardaVidas";
import Checkin from "./pages/Checkin";
import Checkout from "./pages/Checkout";
import { Menu } from "./components/Menu";
import { Autenticacao } from "./components/Autenticacao";
import { AutorizacaoSupervisor } from "./components/AutorizacaoSupervisor";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Menu />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publico" element={<Publico />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/supervisor"
            element={
              <AutorizacaoSupervisor>
                <Supervisor />
              </AutorizacaoSupervisor>
            }
          />
          <Route
            path="/gerenciamento-guarda-vidas"
            element={
              <AutorizacaoSupervisor>
                <GerenciamentoGuardaVidas />
              </AutorizacaoSupervisor>
            }
          />
          <Route
            path="/checkin"
            element={
              <Autenticacao>
                <Checkin />
              </Autenticacao>
            }
          />
          <Route
            path="/checkout"
            element={
              <Autenticacao>
                <Checkout />
              </Autenticacao>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Autenticacao>
                <Dashboard />
              </Autenticacao>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
