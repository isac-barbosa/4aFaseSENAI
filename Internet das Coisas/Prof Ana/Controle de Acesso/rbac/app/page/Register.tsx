"use client";

import { useState } from "react";
import { erroMessage } from "../services/api";
import { register } from "../services/register";

type Props = {
    onBack: () => void;
    onRegistered: (message: string) => void;
};

export default function Register({ onBack, onRegistered }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        try {
            const result = await register(name, email, password);

            console.log("Mensagem:", result.message);

            onRegistered(result.message);
        } catch (error) {
            setError(erroMessage(error));
        }
    }

    return (
        <>
            <h1>Register</h1>

            <form onSubmit={submit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Cadastrar</button>

                <button type="button" onClick={onBack}>
                    Voltar
                </button>
            </form>

            {error && <p>{error}</p>}
        </>
    );
}