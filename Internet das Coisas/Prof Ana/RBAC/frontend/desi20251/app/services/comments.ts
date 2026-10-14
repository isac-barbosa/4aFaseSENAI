import { api } from "./api";

// Campos devolvidos por GET /materials/:id/comments.
export type Comment = { id: number; content: string; author: string; created_at: string };

// Mesmo limite validado no back-end.
export const MAX_COMMENT_LENGTH = 500;

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export async function listComments(materialId: number, token: string) {
  const response = await api.get<Comment[]>(`/materials/${materialId}/comments`, auth(token));
  return response.data;
}

export async function createComment(materialId: number, token: string, content: string) {
  // Enviamos apenas o texto; o autor é identificado pelo token na API.
  const response = await api.post<Comment>(`/materials/${materialId}/comments`, { content }, auth(token));
  return response.data;
}
