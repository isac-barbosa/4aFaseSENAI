import axios from "axios";

export const api = axios.create({
    baseURL: process.env.BASE_URL || 'https://localhost:8081/api'
});

export function erroMessage(error: unknown): string {
    if(axios.isAxiosError(error) && error.response?.data.message){
        return error.response.data.message;
    }
    return "Não foi possível conectar ao servidor"
}