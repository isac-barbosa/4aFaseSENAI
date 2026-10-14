"use client";

import { useState } from "react";
import { login, type Session } from "../services/login";
import Home from "./Home";
import Register from "./Register";

const Login = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState("");
    const [showRegister, setShowRegister] = useState(false);
    const [notice, setNotice] = useState("");

    const handleLogin = async (
        event: any
    ) => {
        event.preventDefault();

        setError("");

        try {
            const response = await login(email, senha);

            if (response) {
                setSession(response);
                alert("Login realizado com sucesso!");
            } else {
                setError("Erro ao realizar login. Verifique suas credenciais.");
            }

        } catch (error) {
            console.error("Erro ao realizar login:", error);
            setError("Erro ao realizar login. Verifique suas credenciais.");
        }
    };

    return (
        <>
            <div>
                {
                    session ? (
                        <Home
                            session={session}
                            onLogout={() => {
                                setSession(null);
                                setEmail("");
                                setSenha("");
                            }}
                        />
                    ) : showRegister ? (
                        <Register
                            onBack={() => setShowRegister(false)}
                            onRegistered={(message) => {
                                setShowRegister(false);
                                setNotice(message);
                            }}
                        />
                    ) : (
                        <form onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="senha">Senha:</label>
                                <input
                                    type="password"
                                    id="senha"
                                    name="senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit">Entrar</button>

                            {error && <p>{error}</p>}

                            {notice && <p>{notice}</p>}

                            <button
                                type="button"
                                onClick={() => setShowRegister(true)}
                            >
                                Cadastrar
                            </button>
                        </form>
                    )
                }
            </div>
        </>
    );
};

export default Login;