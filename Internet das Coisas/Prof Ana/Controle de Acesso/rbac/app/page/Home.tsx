"use client";

import { useEffect, useState } from "react";
import { Session } from "../services/login";
import { api, erroMessage } from "../services/api";
type Material = { id: number; name: string; category: string };
interface Props {
  session: Session;
  onLogout: () => void;
}

const Home = ({ session, onLogout }: Props) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [deleting, setDeleting] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  const isAdmin = session.user.role === "admin";

  useEffect(() => {
    //Não atualiza a tela se o usuario sair antes da resposta
    let active = true;

    async function loadMaterials() {
      try {
        const response = await api.get<Material[]>("/materials", {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        if (active) setMaterials(response.data);
      } catch (error) {
        if (active) setError(erroMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMaterials();
    return () => {
      active = false;
    };
  }, [session.token, revision]);

  function refresh() {
    setLoading(true);
    setError("");
    setNotice("");
    setRevision((current) => current + 1);
  }

  async function remove(material: Material) {
    if (!window.confirm(`Deseja excluir ${material.name} do banco de dados?`))
      return;

    setDeleting(material.id);
    setError("");
    setNotice("");

    try {
      //api confirma a regra do perfil (role) antes de axcluir, mesmo se a tela for alterada
      await api.delete(`/materials${material.id}`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      //Só remote da tela depois que a API confirma a exclusão (http 204)
      setMaterials((current) =>
        current.filter((item) => item.id! == material.id),
      );
      setNotice(`${material.name} excluido com sucesso`);
    } catch (error) {
      setError(erroMessage(error));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div>
        <p>
          {session.user.name} | {session.user.email}
        </p>
        <button onClick={onLogout}>Sair</button>
        <h1>Materiais</h1>
        <p>
          {" "}
          {isAdmin
            ? "Voce pode consultar e excluir materiais"
            : "Você pode apenas onsultar materiais"}
        </p>
        <p>Para comprar os perfis você pode sair e entrar com outra conta</p>
        <button disabled={loading || deleting !== null} onClick={refresh}>
          Atualizar materiais
        </button>
        {error && <p role="alert">{error} </p>}
        {error && <p role="status">{notice} </p>}( loading ? (
        <p role="status">Carregando ...</p>) : (
        <ul>
          {materials.map((material) => (
            <li key={material.id}>
              {" "}
              {material.name} - {material.category}
              {isAdmin ? (
                <button
                  disabled={deleting !== null}
                  onClick={() => remove(material)}
                >
                  {deleting === material.id ? "Excluindo" : "Excluir"}
                </button>
              ) : (
                <span>Somente leitura</span>
              )}
            </li>
          ))}
        </ul>
        ) )
        {loading && !error && materials.length === 0 && (
          <p>Nenhum material cadastrado </p>
        )}
      </div>
    </>
  );
};

export default Home