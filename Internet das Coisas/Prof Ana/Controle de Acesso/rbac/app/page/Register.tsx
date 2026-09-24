"use client";

import {useState} from "react"
export default function Register() {

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
        }catch (error) {
            setError(errorMessage(error))
        }
    }
    return (
        <>
        
        </>
    )
}