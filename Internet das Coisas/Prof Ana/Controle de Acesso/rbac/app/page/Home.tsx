"use client";

import { useEffect, useState } from "react";
import { Session } from "../services/login";
import { api, erroMessage } from "../services/api";

type Material = {
    id: number;
    name: string;
    category: string;
};

interface Props {
    session: Session;
    onLogout: () => void;
}

function Home({ session, onLogout }: Props) {

    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const [deleting, setDeleting] = useState<number | null>(null);
    const [revision, setRevision] = useState(0);

    const isAdmin = session.user.role === "admin";

    useEffect(() => {

        let active = true;

        async function loadMaterials() {
            try {
                const response = await api.get<Material[]>("/materials/listar", {
                    headers: {
                        Authorization: `Bearer ${session.token}`
                    }
                });

                if (active) {
                    setMaterials(response.data);
                }

            } catch (err) {
                if (active) {
                    setError(erroMessage(err));
                }

            } finally {
                if (active) {
                    setLoading(false);
                }
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
        setRevision(current => current + 1);
    }

    async function remove(material: Material) {

        if (!window.confirm(`Deseja excluir ${material.name} do banco de dados?`)) {
            return;
        }

        setDeleting(material.id);
        setError("");
        setNotice("");

        try {
            await api.delete(`/materials/${material.id}`, {
                headers: {
                    Authorization: `Bearer ${session.token}`
                }
            });

            setMaterials(current =>
                current.filter(m => m.id !== material.id)
            );

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

                <button onClick={onLogout}>
                    Sair
                </button>
            </div>

            <h1>Materiais</h1>

            <p>
                {isAdmin
                    ? "Você pode consultar e excluir materiais."
                    : "Você pode consultar materiais."
                }
            </p>

            <p>
                Para comparar os perfis você pode sair e entrar em outra conta
            </p>

            <button
                disabled={loading || deleting !== null}
                onClick={refresh}
            >
                Atualizar materiais
            </button>

            {error && <p role="alert">{error}</p>}
            {notice && <p role="status">{notice}</p>}

            {
                loading ? (
                    <p>Carregando materiais...</p>
                ) : (
                    <ul>
                        {materials.map(material => (
                            <li key={material.id}>
                                {material.name} - {material.category}

                                {isAdmin ? (
                                    <button
                                        disabled={deleting === material.id}
                                        onClick={() => remove(material)}
                                    >
                                        Excluir
                                    </button>
                                ) : (
                                    <span>Somente leitura</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )
            }

            {loading && !error && materials.length === 0 && (
                <p>Nenhum material cadastrado.</p>
            )}
        </>
    );
}

export default Home;