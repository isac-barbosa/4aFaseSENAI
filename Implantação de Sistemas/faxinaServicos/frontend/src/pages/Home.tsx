import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

export function Home() {
  const { usuario, deslogar } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    deslogar();
    navigate("/login");
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <h2>Faxina Já</h2>
          <span>Olá, {usuario?.nome}</span> 
        </div>
        <button onClick={handleLogout}>Sair</button>
      </header>

      <main className="home-main">
        <div className="home-card" onClick={() => navigate("/agendamentos")}>
          <h3>Cadastro de Agendamento</h3>
          <p>Ver, criar, editar e excluir agendamentos.</p>
        </div>

        <div className="home-card" onClick={() => navigate("/gestao")}>
          <h3>Gestão de Agendamentos</h3>
          <p>Organizar agendamentos por data e checar conflitos de horário.</p>
        </div>
      </main>
    </div>
  );
}
