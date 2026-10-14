import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import app from "../src/app.js";

test("cadastro e login pela API, com banco simulado", async t => {
  process.env.JWT_SECRET = "segredo-exclusivo-dos-testes-com-32-caracteres";
  const users = [];
  app.locals.db = {
    async execute(sql, params) {
      if (sql.startsWith("SELECT")) {
        return [users.filter(user => user.email === params[0])];
      }
      if (params[1] === "concorrente@teste.com") {
        throw Object.assign(new Error("Duplicado"), { code: "ER_DUP_ENTRY" });
      }
      const [name, email, password_hash, role] = params;
      users.push({ id: users.length + 1, name, email, password_hash, role });
      return [{ insertId: users.length }];
    },
  };
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const post = (path, body) => fetch(`${base}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const account = { name: " Aluno ", email: " ALUNO@teste.com ", password: "SenhaTeste123" };

  // Mesmo enviando admin manualmente, o cadastro deve criar um usuário comum.
  const created = await post("register", { ...account, role: "admin" });
  assert.equal(created.status, 201);
  const result = await created.json();
  assert.equal(result.password, undefined);
  assert.equal(result.password_hash, undefined);
  assert.equal(users[0].role, "user");
  assert.equal(users[0].name, "Aluno");
  assert.equal(users[0].email, "aluno@teste.com");
  assert.notEqual(users[0].password_hash, account.password);
  assert.equal(await bcrypt.compare(account.password, users[0].password_hash), true);

  const signedIn = await post("login", account);
  assert.equal(signedIn.status, 200);
  assert.equal((await signedIn.json()).user.role, "user");
  assert.equal((await post("register", account)).status, 409);
  assert.equal((await post("register", { ...account, email: "concorrente@teste.com" })).status, 409);

  for (const body of [
    {}, { ...account, name: " " }, { ...account, name: "a".repeat(101) },
    { ...account, email: "invalido" }, { ...account, password: "curta" },
    { ...account, password: "á".repeat(37) }, { ...account, password: 12345678 },
  ]) {
    assert.equal((await post("register", body)).status, 400);
  }
  assert.equal(users.length, 1);
});
