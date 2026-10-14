"use client";

// Eventos e estado precisam rodar no navegador.
import { useEffect, useState, type FormEvent } from "react";
import { login, type Session } from "../services/login";
import { errorMessage, retryAfterSeconds } from "../services/api";
import Home from "./Home";
import Register from "./Register";

// Transforma milissegundos em texto: "14 min 32 s".
function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes ? `${minutes} min ${seconds} s` : `${seconds} s`;
}

export default function Login() {
  // O React atualiza a tela quando o estado muda.
  // A sessão fica na memória: recarregar a página exige outro login.
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [notice, setNotice] = useState("");
  // Rate limit: instante (em ms) em que o bloqueio termina; null = sem bloqueio.
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const blocked = blockedUntil !== null && now < blockedUntil;

  // Atualiza a contagem regressiva a cada segundo e libera o formulário no fim.
  useEffect(() => {
    if (blockedUntil === null) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= blockedUntil) {
        setBlockedUntil(null);
        setError("");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [blockedUntil]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Evita recarregar a página ao enviar o formulário.
    if (blocked) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      // A API verifica a senha e devolve o token e o perfil do usuário.
      const result = await login(email, password);
      setSession(result);
      setPassword("");
    } catch (error) {
      setError(errorMessage(error));
      // A API respondeu 429: bloqueia o formulário até o fim do prazo informado.
      const wait = retryAfterSeconds(error);
      if (wait) {
        const current = Date.now();
        setNow(current);
        setBlockedUntil(current + wait * 1000);
      }
    } finally {
      setBusy(false); // Libera o formulário mesmo quando ocorre um erro.
    }
  }

  return (
    <main>
      <header>Controle de materiais · Aula de login e permissões</header>
      {/* Sem sessão mostramos o login; com sessão mostramos os materiais. */}
      {session ? (
        <Home session={session} onLogout={() => {
          setSession(null);
          setEmail("");
          setPassword("");
        }} />
      ) : showRegister ? (
        <Register onBack={() => setShowRegister(false)} onRegistered={message => {
          setShowRegister(false);
          setNotice(message);
        }} />
      ) : (
        <section className="panel" aria-labelledby="login-title">
          <h1 id="login-title">Entrar</h1>
          <p>Digite o e-mail e a senha da sua conta.</p>
          {notice && <p className="success" role="status">{notice}</p>}
          {/* As credenciais são digitadas pelo aluno; os dados e o perfil vêm da API. */}
          <form onSubmit={submit}>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="username" required
              disabled={busy} value={email} onChange={event => setEmail(event.target.value)} />
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" autoComplete="current-password" required
              disabled={busy} value={password} onChange={event => setPassword(event.target.value)} />
            {blocked && blockedUntil !== null ? (
              <p role="alert" className="blocked">
                Muitas tentativas de login. Você poderá tentar novamente às{" "}
                <strong>{new Date(blockedUntil).toLocaleTimeString("pt-BR")}</strong>{" "}
                (faltam {formatRemaining(blockedUntil - now)}).
              </p>
            ) : (
              error && <p role="alert" className="error">{error}</p>
            )}
            <button disabled={busy || blocked} type="submit">
              {busy ? "Entrando..." : blocked ? "Aguarde para tentar novamente" : "Entrar"}
            </button>
            {/* Troca a tela sem recarregar a página. */}
            <button type="button" className="secondary" disabled={busy} onClick={() => {
              setError("");
              setNotice("");
              setEmail("");
              setPassword("");
              setShowRegister(true);
            }}>Cadastrar usuário</button>
          </form>
        </section>
      )}
    </main>
  );
}
