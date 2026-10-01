import { api } from './api'

export async function register(name:string, email: string, password: string) {
    const response = await api.post('/register', {
        name, email, password
    });
    return response.data
}