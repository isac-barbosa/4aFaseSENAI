"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, errorMessage } from "../services/api";
import type { Session } from "../services/login";
import Comments from "./Comments";

// Campos devolvidos por GET /materials.
type Material = { id: number; name: string; category: string };
type Props = { session: Session; onLogout: () => void };

export default function Home({ session, onLogout }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  const [searchInput, setSearchInput] = useState(""); // o que está digitado
  const [search, setSearch] = useState("");           // o que foi pesquisado
  const [openComments, setOpenComments] = useState<number | null>(null);
  const isAdmin = session.user.role === "admin";

  // Busca os materiais ao entrar, ao pesquisar e quando Atualizar muda revision.
  useEffect(() => {
    // Não atualiza esta tela caso o usuário saia antes da resposta.
    let active = true;
    async function loadMaterials() {
      try {
        const response = await api.get<Material[]>("/materials", {
          // O token identifica o usuário nas rotas protegidas.
          headers: { Authorization: `Bearer ${session.token}` },
          // O texto vai como parâmetro da URL (?search=...); o axios o codifica.
          params: search ? { search } : undefined,
        });
        if (active) setMaterials(response.data);
      } catch (error) {
        if (active) setError(errorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMaterials();
    return () => { active = false; };
  }, [session.token, revision, search]);

  function refresh() {
    setLoading(true);
    setError("");
    setNotice("");
    setRevision(current => current + 1);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    setOpenComments(null);
    setSearch(searchInput.trim());
    setRevision(current => current + 1); // garante nova busca mesmo com o mesmo texto
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setOpenComments(null);
    setLoading(true);
    setError("");
    setNotice("");
    setRevision(current => current + 1);
  }

  async function remove(material: Material) {
    if (!window.confirm(`Excluir ${material.name} do banco de dados?`)) return;
    setDeleting(material.id);
    setError("");
    setNotice("");
    try {
      // A API confere a role antes de excluir, mesmo se a tela for alterada.
      await api.delete(`/materials/${material.id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      // Só remove da tela depois que a API confirma a exclusão (HTTP 204).
      setMaterials(current => current.filter(item => item.id !== material.id));
      setNotice(`${material.name} excluído.`);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="panel" aria-labelledby="materials-title">
      <div className="actions">
        <p><strong>{session.user.name}</strong> · {session.user.email}</p>
        <button className="secondary" onClick={onLogout}>Sair</button>
      </div>
      <h1 id="materials-title">Materiais</h1>
      <p>Perfil: <strong>{isAdmin ? "Administrador (admin)" : "Usuário comum (user)"}</strong></p>
      <p>{isAdmin ? "Você pode consultar, comentar e excluir materiais." : "Você pode consultar e comentar os materiais."}</p>

      {/* Campo de pesquisa por nome ou categoria. */}
      <form className="search" role="search" onSubmit={submitSearch}>
        <label htmlFor="search">Pesquisar materiais</label>
        <div className="search-row">
          <input id="search" type="search" maxLength={100} placeholder="Nome ou categoria"
            value={searchInput} onChange={event => setSearchInput(event.target.value)} />
          <button type="submit" disabled={loading}>Pesquisar</button>
          {(search || searchInput) && (
            <button type="button" className="secondary" disabled={loading} onClick={clearSearch}>Limpar</button>
          )}
        </div>
      </form>

      <button className="secondary" disabled={loading || deleting !== null} onClick={refresh}>
        Atualizar materiais
      </button>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="success" role="status">{notice}</p>}
      {loading ? (
        <p role="status">Carregando materiais...</p>
      ) : (
        <>
          {!error && (
            <p className="muted" role="status">
              {search
                ? `${materials.length} resultado(s) para "${search}".`
                : `${materials.length} material(is) cadastrado(s).`}
            </p>
          )}
          <ul className="materials">
            {materials.map(material => (
              <li key={material.id}>
                <span><strong>{material.name}</strong> · {material.category}</span>
                <div className="actions">
                  <button className="secondary" aria-expanded={openComments === material.id}
                    onClick={() => setOpenComments(current => current === material.id ? null : material.id)}>
                    {openComments === material.id ? "Ocultar comentários" : "Comentários"}
                  </button>
                  {/* Esconder o botão ajuda na interface; a proteção fica na API. */}
                  {isAdmin && (
                    <button className="danger" disabled={deleting !== null} onClick={() => remove(material)}>
                      {deleting === material.id ? "Excluindo..." : "Excluir"}
                    </button>
                  )}
                </div>
                {openComments === material.id && (
                  <Comments materialId={material.id} materialName={material.name} token={session.token} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {!loading && !error && materials.length === 0 && (
        <p>{search ? "Nenhum material encontrado para essa pesquisa." : "Nenhum material cadastrado."}</p>
      )}
    </section>
  );
}
