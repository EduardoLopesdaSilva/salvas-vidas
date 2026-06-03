import { createContext, useContext, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);
const USER_KEY = "auth_user";

function readStoredUser() {
  const saved = localStorage.getItem(USER_KEY);
  return saved ? JSON.parse(saved) : null;
}

function persistSession(data) {
  const user = {
    id: data.id,
    nome: data.nome,
    cpf: data.cpf,
    email: data.email,
    nivelAcesso: data.nivelAcesso,
  };

  localStorage.setItem("token", data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("usuario_id", String(user.id));

  // Mantem compatibilidade temporaria com telas antigas enquanto o projeto e migrado.
  localStorage.setItem(
    "usuario_salva_vidas",
    JSON.stringify({
      nome: user.nome || user.email || user.cpf,
      cpf: user.cpf,
      email: user.email,
      funcao: user.nivelAcesso === "ADMIN" ? "supervisor" : "salva-vidas",
    })
  );

  return user;
}

export function limparCpf(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

export function cpfBasicoValido(cpf) {
  const cpfLimpo = limparCpf(cpf);
  return cpfLimpo.length === 11 && !/^(\d)\1{10}$/.test(cpfLimpo);
}

function normalizarIdentificadorLogin(valor) {
  const texto = String(valor || "").trim();
  const somenteNumeros = limparCpf(texto);

  return /^[\d.\-\s]+$/.test(texto) ? somenteNumeros : texto;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = async ({ cpf, email, senha }) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      // Envia cpf e/ou email para permitir login por ambos
      body: { 
        cpf: cpf ? normalizarIdentificadorLogin(cpf) : null,
        email: email || null,
        senha 
      },
    });

    const loggedUser = persistSession(data);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("usuario_salva_vidas");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && localStorage.getItem("token")),
      isSupervisor: user?.nivelAcesso === "ADMIN",
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
