import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { logar } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/auth/login", { login, senha });
      logar(resposta.data.usuario, resposta.data.token);
      navigate("/"); 
    } catch (err: any) {
     
      const mensagem = err.response?.data?.erro || "Não foi possível fazer login. Tente novamente.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Faxina Já</h1>
        <p className="login-subtitulo">Acesso da equipe</p>

        {erro && <div className="login-erro">{erro}</div>}

        <label htmlFor="login">Usuário</label>
        <input
          id="login"
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="ex: maria.souza"
          required
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••"
          required
        />

        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
