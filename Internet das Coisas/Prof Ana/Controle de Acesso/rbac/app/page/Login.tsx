import React from "react";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async(event: any) => {

    event.preventDefault();

    try {
        const response = await login(email, senha)
        if(response.data.success){
            alert("Login realizado.")
        }

    } catch (error) {
      console.error("Erro ao fazer login: ", error);
    }
  };
  return (
    <>
      <div>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="senha">senha</label>
            <input
              type="password"
              name="senha"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit">Entrar</button>
        </form>
      </div>
    </>
  );
};

export default Login;
