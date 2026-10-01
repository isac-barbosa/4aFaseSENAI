import {api} from "./api";

export type Session = {
    data: any;
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: "admin" | "user";
    }

}

export async function login (email:string, password: string): Promise<Session> {
    const response = await api.post<Session>('/login', {email, password});
    return response.data;
}