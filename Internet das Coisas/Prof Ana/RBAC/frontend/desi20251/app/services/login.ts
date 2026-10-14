import { api } from "./api";
// Mesmo formato retornado pelo controller de login do back-end.
export type Session = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
  };
};

export async function login(email: string, password: string): Promise<Session> {
  // A role vem do banco. O formulário envia apenas as credenciais.
  const response = await api.post<Session>("/login", { email, password });
  return response.data;
}
