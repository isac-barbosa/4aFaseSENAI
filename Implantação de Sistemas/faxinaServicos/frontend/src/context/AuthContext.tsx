import { createContext, useContext, useState, type ReactNode } from "react";

interface UsuarioLogado {
  nome: string;
  login: string;
}

interface AuthContextType {
  usuario: UsuarioLogado | null;
  logar: (usuario: UsuarioLogado, token: string) => void;
  deslogar: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(() => {
    const salvo = localStorage.getItem("faxina_usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  function logar(novoUsuario: UsuarioLogado, token: string) {
    localStorage.setItem("faxina_token", token);
    localStorage.setItem("faxina_usuario", JSON.stringify(novoUsuario));
    setUsuario(novoUsuario);
  }

  function deslogar() {
    localStorage.removeItem("faxina_token");
    localStorage.removeItem("faxina_usuario");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, logar, deslogar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return context;
}
