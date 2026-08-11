import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { CadastroAgendamento } from "./pages/CadastroAgendamento";
import { GestaoAgendamentos } from "./pages/GestaoAgendamentos";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute>
                <CadastroAgendamento />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestao"
            element={
              <ProtectedRoute>
                <GestaoAgendamentos />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
