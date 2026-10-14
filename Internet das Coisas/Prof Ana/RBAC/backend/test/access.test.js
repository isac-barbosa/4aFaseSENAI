import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../src/app.js";

process.env.JWT_SECRET = "segredo-exclusivo-dos-testes-com-32-caracteres";

test("login e autorizacao HTTP", async t => {
  const hash = await bcrypt.hash("Aula@123", 4);
  let deleted = false;
  const database = { async execute(sql, params) {
    if (sql.startsWith("SELECT id, name, email")) {
      const role = params[0] === "admin@aula.com" ? "admin" : "user";
      return [[{ id: 1, name: "Teste", email: params[0], password_hash: hash, role }]];
    }
    if (sql.startsWith("DELETE FROM materials")) { const affectedRows = deleted ? 0 : 1; deleted = true; return [{ affectedRows }]; }
    return [[{ id: 1, name: "Material", category: "Limpeza" }]];
  } };
  app.locals.db = database;
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function login(email, password = "Aula@123") {
    return fetch(`${base}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, role: "admin" }) });
  }
  const request = (path, token, method = "GET") => fetch(`${base}${path}`, { method, headers: token ? { Authorization: `Bearer ${token}` } : {} });
  assert.equal((await login("user@aula.com", "errada")).status, 401);
  const user = await (await login("user@aula.com")).json();
  const admin = await (await login("admin@aula.com")).json();
  assert.equal(jwt.verify(user.token, process.env.JWT_SECRET).role, "user");
  assert.equal(user.user.password_hash, undefined);
  assert.equal((await request("/materials")).status, 401);
  assert.equal((await request("/materials", user.token)).status, 200);
  assert.equal((await request("/materials", admin.token)).status, 200);
  assert.equal((await request("/materials/1", undefined, "DELETE")).status, 401);
  assert.equal((await request("/materials/1", user.token, "DELETE")).status, 403);
  assert.equal(deleted, false);
  const forged = jwt.sign({ role: "admin" }, "outro-segredo");
  assert.equal((await request("/materials/1", forged, "DELETE")).status, 401);
  const expired = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: -1 });
  assert.equal((await request("/materials/1", expired, "DELETE")).status, 401);
  assert.equal((await request("/materials/abc", admin.token, "DELETE")).status, 400);
  assert.equal((await request("/materials/1", admin.token, "DELETE")).status, 204);
  assert.equal(deleted, true);
  assert.equal((await request("/materials/1", admin.token, "DELETE")).status, 404);
});
