import { api } from "./api";

export type Session = {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: "admin" | "user";
    };
};

export async function login(email: string, senha: string) {
    const response = await api.post<Session>("/login", {
        email,
        password: senha
    });

    return response.data;
}