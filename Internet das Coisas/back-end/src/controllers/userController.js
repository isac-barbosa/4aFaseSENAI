import db from "../config/db.js";

export const createUser = async(req, res) =>{
    const {nome, email, cpf, senha} = req.body;

    //=================
    //VALIDAÇÃO
    //=================

    if(!nome || typeof nome !== "string" || nome.trim().length <= 3){
        return res.status(400).json({
            message: "Nome inválido. Este campo é obrgatório", success: false  
        })
    }

    if(!email || typeof email !== "string" || !email.includes("@") || email.trim().length > 150){
         return res.status(400).json({
            message: "Email inválido. Este campo é obrgatório", success: false  
        })
    }

    if(!cpf || typeof cpf !== "string"){
         return res.status(400).json({
            message: "CPF inválido. Este campo é obrgatório", success: false  
        })
    }

    if(!senha){
         return res.status(400).json({
            message: "Senha inválida. Este campo é obrgatório", 
            success: false  
        })
    } else {
        (senha.length < 8 && senha.length > 32)
    }



    //=================
    //SANITIZAÇÃO
    //=================
    
    if(!validarCPF(cpf)){
        return res.status(400).json({
            message: "CPF inválido",
            success: false
        })
    }

    //Remove hifen, ponto e qualquer caracter que NÃO SEJA número 
    const cpfLimpo = cpf.replace(/\D/g, ""); 

    const nomeSanitizado = nome.trim().replace(/\s+/g, "");

    try{
        const sql = `INSERT INTO usuario (nome, email, cpf, senha) VALUES(?, ?, ?, ?)`;

        const valores = [
            nomeSanitizado, email, cpfLimpo, senha
        ];

        const [result] = await db.execute(sql, valores)

        if(result.affectedRows === 0){
            return res.status(400).json({
            message: "Não foi possivel inserir os dados do usuario",
            succes: false
            })
        }
        return res.status(201).json({
            message: "Usuario criado com sucesso",
            succes: true
        })

    } catch(error) {
       return res.status(500).json({message: "Erro interno", erro: error})
    }

}


function validarCPF(cpf) {
    // Remove caracteres que não são números
    cpf = cpf.replace(/\D/g, "");

    // Verifica se possui 11 dígitos
    if (cpf.length !== 11) {
        return false;
    }

    // Impede CPFs como 11111111111 ou 00000000000
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // Primeiro dígito verificador
    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    let primeiroDigito = resto === 10 ? 0 : resto;

    if (primeiroDigito !== Number(cpf[9])) {
        return false;
    }
}
