import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { ordenarPorDataHora } from "../utils/ordenacao";
import "./GestaoAgendamentos.css";

interface Agendamento {
  idAgendamento: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: string;
  nomeProfissional: string;
  nomeCliente: string;
  descricaoServico: string;
}

interface OpcaoSimples {
  idProfissional?: number;
  idCliente?: number;
  idServico?: number;
  nome?: string;
  descricao?: string;
}

export function GestaoAgendamentos() {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<OpcaoSimples[]>([]);
  const [clientes, setClientes] = useState<OpcaoSimples[]>([]);
  const [servicos, setServicos] = useState<OpcaoSimples[]>([]);

  const [tipoFaxina, setTipoFaxina] = useState<"residencial" | "comercial">("residencial");
  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");

  const [alerta, setAlerta] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [resAg, resProf, resCli, resServ] = await Promise.all([
      api.get("/agendamentos/ordenados"),
      api.get("/profissionais"),
      api.get("/clientes"),
      api.get("/servicos"),
    ]);

 
    setAgendamentos(ordenarPorDataHora(resAg.data));
    setProfissionais(resProf.data);
    setClientes(resCli.data);
    setServicos(resServ.data);
  }

  const servicosFiltrados = servicos.filter((s) =>
    tipoFaxina === "residencial"
      ? s.descricao?.toLowerCase().includes("residencial")
      : s.descricao?.toLowerCase().includes("comercial")
  );

  async function handleAgendar(e: FormEvent) {
    e.preventDefault();
    setAlerta(null);

    if (!clienteId || !servicoId || !profissionalId || !data || !horaInicio || !horaFim) {
      setAlerta({ tipo: "erro", texto: "Preencha todos os campos antes de confirmar." });
      return;
    }

    try {
      await api.post("/agendamentos", {
        data,
        horaInicio,
        horaFim,
        status: "agendado",
        cliente_idCliente: Number(clienteId),
        servico_idServico: Number(servicoId),
        profissional_idProfissional: Number(profissionalId),
      });

      setAlerta({ tipo: "sucesso", texto: "Agendamento realizado com sucesso!" });
      setClienteId("");
      setServicoId("");
      setProfissionalId("");
      setData("");
      setHoraInicio("");
      setHoraFim("");
      carregarDados();
    } catch (err: any) {

      setAlerta({
        tipo: "erro",
        texto: err.response?.data?.erro || "Não foi possível criar o agendamento.",
      });
    }
  }

  return (
    <div className="gestao-page">
      <header className="gestao-header">
        <h2>Gestão de Agendamentos</h2>
        <button className="botao-secundario" onClick={() => navigate("/")}>
          Voltar
        </button>
      </header>

      <section className="gestao-form-card">
        <h3>Nova movimentação</h3>

        {alerta && <div className={`alerta alerta-${alerta.tipo}`}>{alerta.texto}</div>}

        <form onSubmit={handleAgendar}>
          <label>Tipo de faxina</label>
          <div className="opcoes-tipo">
            <button
              type="button"
              className={tipoFaxina === "residencial" ? "ativo" : ""}
              onClick={() => {
                setTipoFaxina("residencial");
                setServicoId("");
              }}
            >
              Residencial
            </button>
            <button
              type="button"
              className={tipoFaxina === "comercial" ? "ativo" : ""}
              onClick={() => {
                setTipoFaxina("comercial");
                setServicoId("");
              }}
            >
              Comercial
            </button>
          </div>

          <label>Serviço</label>
          <select value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
            <option value="">Selecione...</option>
            {servicosFiltrados.map((s) => (
              <option key={s.idServico} value={s.idServico}>
                {s.descricao}
              </option>
            ))}
          </select>

          <label>Cliente</label>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Selecione...</option>
            {clientes.map((c) => (
              <option key={c.idCliente} value={c.idCliente}>
                {c.nome}
              </option>
            ))}
          </select>

          <label>Profissional (alocação)</label>
          <select value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)}>
            <option value="">Selecione...</option>
            {profissionais.map((p) => (
              <option key={p.idProfissional} value={p.idProfissional}>
                {p.nome}
              </option>
            ))}
          </select>

          <div className="linha-dupla">
            <div>
              <label>Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div>
              <label>Início</label>
              <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            </div>
            <div>
              <label>Fim</label>
              <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="botao-primario">
            Confirmar agendamento
          </button>
        </form>
      </section>

      <section className="gestao-lista">
        <h3>Agendamentos (ordenados por data/hora)</h3>
        <table className="tabela-agendamentos">
          <thead>
            <tr>
              <th>Data</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Cliente</th>
              <th>Profissional</th>
              <th>Serviço</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((ag) => (
              <tr key={ag.idAgendamento}>
                <td>{new Date(ag.data).toLocaleDateString("pt-BR")}</td>
                <td>{ag.horaInicio}</td>
                <td>{ag.horaFim}</td>
                <td>{ag.nomeCliente}</td>
                <td>{ag.nomeProfissional}</td>
                <td>{ag.descricaoServico}</td>
                <td>{ag.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
