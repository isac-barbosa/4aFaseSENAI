"use client";

import { useEffect, useState, type FormEvent } from "react";
import { errorMessage } from "../services/api";
import { createComment, listComments, MAX_COMMENT_LENGTH, type Comment } from "../services/comments";

type Props = { materialId: number; materialName: string; token: string };

export default function Comments({ materialId, materialName, token }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Carrega os comentários do material ao abrir a área.
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await listComments(materialId, token);
        if (active) setComments(data);
      } catch (error) {
        if (active) setError(errorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [materialId, token]);

  // Array.from conta caracteres reais (emoji = 1), igual ao back-end.
  const length = Array.from(text).length;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const content = text.trim();
    // Validação rápida para ajudar o usuário; a validação que vale é a do back-end.
    if (!content) return setError("Escreva um comentário antes de enviar.");
    if (Array.from(content).length > MAX_COMMENT_LENGTH) {
      return setError(`O comentário pode ter no máximo ${MAX_COMMENT_LENGTH} caracteres.`);
    }
    setSending(true);
    try {
      const created = await createComment(materialId, token, content);
      setComments(current => [created, ...current]);
      setText("");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="comments" aria-label={`Comentários sobre ${materialName}`}>
      <h2>Comentários</h2>
      <form onSubmit={submit}>
        <label htmlFor={`comment-${materialId}`}>Novo comentário</label>
        {/* maxLength é só conforto: o back-end também confere 1 a 500 caracteres. */}
        <textarea id={`comment-${materialId}`} rows={3} disabled={sending}
          maxLength={MAX_COMMENT_LENGTH} value={text}
          onChange={event => setText(event.target.value)} />
        <small className="muted">{length}/{MAX_COMMENT_LENGTH} caracteres</small>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={sending}>{sending ? "Enviando..." : "Comentar"}</button>
      </form>
      {loading ? (
        <p role="status">Carregando comentários...</p>
      ) : comments.length === 0 ? (
        <p className="muted">Nenhum comentário ainda. Seja o primeiro!</p>
      ) : (
        <ul className="comment-list">
          {comments.map(comment => (
            <li key={comment.id}>
              <p className="comment-meta">
                <strong>{comment.author}</strong> · {new Date(comment.created_at).toLocaleString("pt-BR")}
              </p>
              {/* SEGURANÇA: {comment.content} é exibido como TEXTO. O React escapa tudo,
                  então um "<script>" digitado aparece escrito na tela e nunca é executado.
                  Por isso NÃO usamos dangerouslySetInnerHTML aqui. */}
              <p className="comment-text">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
