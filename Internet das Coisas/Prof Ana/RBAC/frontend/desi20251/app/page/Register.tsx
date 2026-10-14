"use client";

import { useState, type FormEvent } from "react";
import { register } from "../services/register";
import { errorMessage } from "../services/api";

type Props = {
  onBack: () => void;
  onRegistered: (message: string) => void;
};

export default function Register({ onBack, onRegistered }: Props) {
  // Cada estado acompanha um campo ou uma informação exibida na tela.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await register(name, email, password);
      // Após salvar no banco, volta ao login e mostra a mensagem da API.
      onRegistered(result.message);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="register-title">
      <h1 id="register-title">Cadastrar usuário</h1>
      <p>Preencha seus dados para criar uma conta.</p>
      <form onSubmit={submit}>
        <label htmlFor="register-name">Nome</label>
        <input id="register-name" autoComplete="name" required maxLength={100}
          disabled={busy} value={name} onChange={event => setName(event.target.value)} />
        <label htmlFor="register-email">E-mail</label>
        <input id="register-email" type="email" autoComplete="email" required maxLength={254}
          disabled={busy} value={email} onChange={event => setEmail(event.target.value)} />
        <label htmlFor="register-password">Senha</label>
        <input id="register-password" type="password" autoComplete="new-password" required minLength={8}
          aria-describedby="password-help" disabled={busy} value={password}
          onChange={event => setPassword(event.target.value)} />
        <small id="password-help">Use pelo menos 8 caracteres. Limite: 72 bytes (acentos podem ocupar mais de um byte).</small>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? "Cadastrando..." : "Cadastrar"}</button>
        <button type="button" className="secondary" disabled={busy} onClick={onBack}>
          Voltar ao login
        </button>
      </form>
    </section>
  );
}
