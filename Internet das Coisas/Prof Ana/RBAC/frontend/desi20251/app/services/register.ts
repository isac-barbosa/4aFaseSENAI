import { api } from "./api";

// O cadastro envia apenas os campos digitados; o perfil é definido na API.
export async function register(name: string, email: string, password: string) {
  const response = await api.post<{ message: string }>("/register", {
    name,
    email,
    password,
  });
  return response.data;
}
