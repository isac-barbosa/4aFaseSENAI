import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import app from "../src/app.js";

process.env.JWT_SECRET = "segredo-exclusivo-dos-testes-com-32-caracteres";

test("comentarios: validacao, texto puro e acentos", async t => {
  const comments = [];
  app.locals.db = {
    async execute(sql, params) {
      if (sql.startsWith("SELECT id FROM materials")) {
        return [params[0] === 1 ? [{ id: 1 }] : []];
      }
      if (sql.startsWith("INSERT INTO comments")) {
        const [material_id, user_id, content] = params;
        comments.push({ id: comments.length + 1, material_id, user_id, content, author: "Aluno", created_at: new Date().toISOString() });
        return [{ insertId: comments.length }];
      }
      if (sql.includes("WHERE c.id = ?")) return [[comments[params[0] - 1]]];
      if (sql.includes("WHERE c.material_id = ?")) return [comments.filter(c => c.material_id === params[0]).reverse()];
      throw new Error("SQL inesperado: " + sql);
    },
  };
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/materials`;
  const token = jwt.sign({ role: "user" }, process.env.JWT_SECRET, { subject: "7", expiresIn: "1h" });
  const post = (id, body, tk = token) => fetch(`${base}/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
    body: JSON.stringify(body),
  });

  // Sem token: 401.
  assert.equal((await post(1, { content: "oi" }, null)).status, 401);

  // Acentos, aspas e caracteres especiais legitimos sao preservados exatamente.
  const legit = 'Ótimo produto! Ele disse: "não vale R$ 5,00" & \'funciona\' — 100% <ok> 😀';
  const created = await post(1, { content: `  ${legit}  `, user_id: 999 });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).content, legit);
  assert.equal(comments[0].user_id, 7); // autor vem do token, nao do corpo

  // O texto malicioso e salvo como texto; quem protege e a exibicao (React).
  const script = "<script>alert(1)</script>";
  assert.equal((await post(1, { content: script })).status, 201);
  assert.equal(comments[1].content, script);

  // Limites: 1 e 500 caracteres (emoji conta como 1).
  assert.equal((await post(1, { content: "a" })).status, 201);
  assert.equal((await post(1, { content: "a".repeat(500) })).status, 201);
  assert.equal((await post(1, { content: "😀".repeat(500) })).status, 201);
  const total = comments.length;
  for (const body of [
    {}, { content: "" }, { content: "   " }, { content: "a".repeat(501) },
    { content: 123 }, { content: null }, { content: ["a"] }, { content: { $ne: 1 } },
    { content: "oi\u0000mundo" },
  ]) {
    assert.equal((await post(1, body)).status, 400, JSON.stringify(body));
  }
  assert.equal(comments.length, total);

  // Material inexistente e ID invalido.
  assert.equal((await post(99, { content: "oi" })).status, 404);
  assert.equal((await post("abc", { content: "oi" })).status, 400);

  // Listagem.
  const list = await fetch(`${base}/1/comments`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(list.status, 200);
  assert.equal((await list.json()).length, total);
  assert.equal((await fetch(`${base}/1/comments`)).status, 401);
  assert.equal((await fetch(`${base}/99/comments`, { headers: { Authorization: `Bearer ${token}` } })).status, 404);
});
