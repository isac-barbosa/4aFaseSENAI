import api from "./api.js"

export const create  = async (form) => {
    try{
        const response = await api.post("/create", form);
        console.log("Usuario criado ", response)

        return response.data;

    } catch (error) {
        console.error("Erro interno: ", error)
        console.error("Erro interno: ", error.response)
        console.error("Erro interno: ", error.request)
    }
}