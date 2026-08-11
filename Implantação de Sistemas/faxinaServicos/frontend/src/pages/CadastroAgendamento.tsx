import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import "./CadastroAgendamento.css";

interface Agendamento {
  idAgendamento: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: string;
  profissional_idProfissional: number;
  cliente_idCliente: number;
  servico_idServico: number;
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

const FORM_VAZIO = {
  data: "",
  horaInicio: "",
  horaFim: "",
  status: "agendado",
  profissional_idProfissional: "",
  cliente_idCliente: "",
  servico_idServico: "",
};

export function CadastroAgendamento() {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<OpcaoSimples[]>([]);
  const [clientes, setClientes] = useState<OpcaoSimples[]>([]);
  const [servicos, setServicos] = useState<OpcaoSimples[]>([]);

  const [termoBusca, setTermoBusca] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");

  
  useEffect(() => {
    carregarAgendamentos();
    carregarListasDeApoio();
  }, []);

  async function carregarAgendamentos() {
    const resposta = await api.get("/agendamentos");
    setAgendamentos(resposta.data);
  }

  async function carregarListasDeApoio() {
    const [resProf, resCli, resServ] = await Promise.all([
      api.get("/profissionais"),
      api.get("/clientes"),
      api.get("/servicos"),
    ]);
    setProfissionais(resProf.data);
    setClientes(resCli.data);
    setServicos(resServ.data);
  }

  
  async function handleBuscar(e: FormEvent) {
    e.preventDefault();
    const resposta = await api.get("/agendamentos/buscar", { params: { termo: termoBusca } });
    setAgendamentos(resposta.data);
  }

  function abrirFormNovo() {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setErroForm("");
    setMostrarForm(true);
  }


  function abrirFormEdicao(ag: Agendamento) {
    setForm({
      data: ag.data.split("T")[0],
      horaInicio: ag.horaInicio,
      horaFim: ag.horaFim,
      status: ag.status,
      profissional_idProfissional: String(ag.profissional_idProfissional),
      cliente_idCliente: String(ag.cliente_idCliente),
      servico_idServico: String(ag.servico_idServico),
    });
    setEditandoId(ag.idAgendamento);
    setErroForm("");
    setMostrarForm(true);
  }


  function validar(): string | null {
    if (!form.data || !form.horaInicio || !form.horaFim) {
      return "Preencha data, horário de início e horário de fim.";
    }
    if (!form.profissional_idProfissional || !form.cliente_idCliente || !form.servico_idServico) {
      return "Selecione profissional, cliente e serviço.";
    }
    if (form.horaFim <= form.horaInicio) {
      return "O horário de fim deve ser depois do horário de início.";
    }
    return null;
  }

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();

    const mensagemErro = validar();
    if (mensagemErro) {
      setErroForm(mensagemErro);
      return;
    }

    const payload = {
      ...form,
      profissional_idProfissional: Number(form.profissional_idProfissional),
      cliente_idCliente: Number(form.cliente_idCliente),
      servico_idServico: Number(form.servico_idServico),
    };

    try {
      if (editandoId) {
        await api.put(`/agendamentos/${editandoId}`, payload); 
      } else {
        await api.post("/agendamentos", payload); 
      }
      setMostrarForm(false);
      carregarAgendamentos();
    } catch (err: any) {

      setErroForm(err.response?.data?.erro || "Não foi possível salvar o agendamento.");
    }
  }

  async function handleExcluir(id: number) {
    const confirmar = window.confirm("Tem certeza que deseja excluir este agendamento?");
    if (!confirmar) return;

    await api.delete(`/agendamentos/${id}`);
    carregarAgendamentos();
  }

  return (
    <div className="cadastro-page">
      <header className="cadastro-header">
        <h2>Cadastro de Agendamento</h2>
        <button className="botao-secundario" onClick={() => navigate("/")}>

          Voltar
        </button>
      </header>

      <div className="cadastro-toolbar">
        <form onSubmit={handleBuscar} className="busca-form">
          <input
            type="text"
            placeholder="Buscar por cliente, profissional, serviço ou status..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        <button className="botao-primario" onClick={abrirFormNovo}>
          + Novo agendamento
        </button>
      </div>

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
            <th>Ações</th>
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
              <td>
                <span className={`status status-${ag.status}`}>{ag.status}</span>
              </td>
              <td className="acoes">
                <button onClick={() => abrirFormEdicao(ag)}>Editar</button>
                <button className="botao-perigo" onClick={() => handleExcluir(ag.idAgendamento)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {agendamentos.length === 0 && (
            <tr>
              <td colSpan={8} className="vazio">
                Nenhum agendamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {mostrarForm && (
        <div className="modal-fundo" onClick={() => setMostrarForm(false)}>
          <form className="modal-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSalvar}>
            <h3>{editandoId ? "Editar agendamento" : "Novo agendamento"}</h3>

            {erroForm && <div className="form-erro">{erroForm}</div>}

            <label>Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
            />

            <div className="linha-dupla">
              <div>
                <label>Início</label>
                <input
                  type="time"
                  value={form.horaInicio}
                  onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                />
              </div>
              <div>
                <label>Fim</label>
                <input
                  type="time"
                  value={form.horaFim}
                  onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                />
              </div>
            </div>

            <label>Cliente</label>
            <select
              value={form.cliente_idCliente}
              onChange={(e) => setForm({ ...form, cliente_idCliente: e.target.value })}
            >
              <option value="">Selecione...</option>
              {clientes.map((c) => (
                <option key={c.idCliente} value={c.idCliente}>
                  {c.nome}
                </option>
              ))}
            </select>

            <label>Profissional</label>
            <select
              value={form.profissional_idProfissional}
              onChange={(e) => setForm({ ...form, profissional_idProfissional: e.target.value })}
            >
              <option value="">Selecione...</option>
              {profissionais.map((p) => (
                <option key={p.idProfissional} value={p.idProfissional}>
                  {p.nome}
                </option>
              ))}
            </select>

            <label>Serviço</label>
            <select
              value={form.servico_idServico}
              onChange={(e) => setForm({ ...form, servico_idServico: e.target.value })}
            >
              <option value="">Selecione...</option>
              {servicos.map((s) => (
                <option key={s.idServico} value={s.idServico}>
                  {s.descricao}
                </option>
              ))}
            </select>

            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="agendado">Agendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <div className="modal-acoes">
              <button type="button" className="botao-secundario" onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="botao-primario">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
