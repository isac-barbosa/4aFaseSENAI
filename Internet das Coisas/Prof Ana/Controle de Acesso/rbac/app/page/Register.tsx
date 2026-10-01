"use client";

import {useState} from "react"
import { register } from "../services/register"
import { erroMessage } from "../services/api"


type Props = {
    onBack: () => void;
    onRegistered: (message: string) => void;
}

export default function Register({onBack, onRegistered}: Props) {

    const[name, setName] = useState("");
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[error, setError] = useState("");

    async function submit(event: any){
        event.preventDefault();

        setError("")
        try{
            const result = await register(name, email,  password)
            console.log("Mensagem: ", result.message)
            onRegistered(result.message)


        }catch (error) {
            setError(erroMessage(error))
        }
    }
    return (
        <>
        <h1>Registrar usuário</h1>
        <form onSubmit={submit}>
            <div>
                <label htmlFor="name">Nome: </label>
                <input type="text" id="name" name="name" required value={name} onChange={e => setName(e.target.value)} />
                
                <label htmlFor="name">Nome: </label>
                <input type="text" id="name" name="name" required value={name} onChange={e => setName(e.target.value)} />


            </div>
        </form>
        </>
    )
}