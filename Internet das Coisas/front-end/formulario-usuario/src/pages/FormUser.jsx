import { create } from '../services/user'
import { useState } from "react"

const FormUser = () => {
    const [form, setForm] = useState({
        nome: "",
        cpf: "",
        email: "",
        senha: ""
    })

    const [erros, setErros] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target

        setForm({
            ...form,
            [name]: value
        })
    }

    const validarFormulario = () => {
        const novosErros = {}

        // Nome
        if (!form.nome || form.nome.trim().length < 3) {
            novosErros.nome =
                "O campo nome é obrigatório e deve ter no mínimo 3 caracteres"
        }

        // CPF
        if (!form.cpf || form.cpf.trim().length !== 11) {
            novosErros.cpf =
                "O campo CPF é obrigatório e deve conter 11 caracteres"
        }

        // Email
        if (!form.email || !form.email.includes("@")) {
            novosErros.email =
                "O campo email é obrigatório e deve ser um email válido"
        }

        // Senha
        if (
            !form.senha ||
            form.senha.trim().length < 8 ||
            form.senha.trim().length > 32
        ) {
            novosErros.senha =
                "O campo senha é obrigatório e deve ter no mínimo 8 caracteres e no máximo 32 caracteres"
        }

        setErros(novosErros)

        return Object.keys(novosErros).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validarFormulario()) {
            return
        }

        try {
            const resultado = await create(form)
            console.log("Resultado", resultado)



        } catch (error) {
            console.log("Ocorreu um erro ao enviar o formulario:", error)
            console.log("Ocorreu um erro ao enviar o formulario:", error.response)
            console.log("Ocorreu um erro ao enviar o formulario:", error.request)
        }
    }

    return (
        <div> 
            <h1>Cadastro de usuario</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nome">Nome</label>
                    <input type="text" name="nome" id="nome" 
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Digite seu nome completo" 
                    />
                </div>
                <div>
                    <label htmlFor="cpf">CPF</label>
                    <input type="text"
                            name="cpf"
                            id="cpf"
                            value={form.cpf}
                            onChange={handleChange}
                            placeholder="XXX.XXX.XXX-XX"
                        />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email"
                            name="email"
                            id="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder=""
                        />
                </div>
                <div>
                    <label htmlFor="senha">senha</label>
                    <input type="password"
                            name="senha"
                            id="senha"
                            value={form.senha}
                            onChange={handleChange}
                            placeholder="Digite sua senha de 8 a 32 caracteres"
                        />
                </div>
                {erros.nome && (
                    <p>{erros.nome}</p>
                )}
                {erros.cpf && (
                    <p>{erros.cpf}</p>
                )}
                {erros.email && (
                    <p>{erros.email}</p>
                )}
                {erros.senha && (
                    <p>{erros.senha}</p>
                )}

                <button type="submit">Cadastrar</button>
            </form>
            </div>
    )
}

export default FormUser
