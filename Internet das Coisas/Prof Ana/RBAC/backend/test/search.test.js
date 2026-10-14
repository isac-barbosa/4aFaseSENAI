import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import app from "../src/app.js";

process.env.JWT_SECRET = "segredo-exclusivo-dos-testes-com-32-caracteres";

test("pesquisa de materiais usa SQL parametrizado", async t => {
  const calls = [];
  app.locals.db = {
    async execute(sql, params = []) {
      calls.push({ sql, params });
      return [[{ id: 1, name: "Detergente", category: "Limpeza" }]];
    },
  };
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/materials`;
  const token = jwt.sign({ role: "user" }, process.env.JWT_SECRET, { subject: "1", expiresIn: "1h" });
  const get = qs => fetch(`${base}${qs}`, { headers: { Authorization: `Bearer ${token}` } });

  assert.equal((await get("")).status, 200);
  assert.equal(calls.at(-1).params.length, 0); // sem pesquisa: lista tudo

  assert.equal((await get("?search=%20")).status, 200);
  assert.equal(calls.at(-1).params.length, 0); // so espacos = sem filtro

  assert.equal((await get("?search=Deter")).status, 200);
  assert.deepEqual(calls.at(-1).params, ["%Deter%", "%Deter%"]);

  // Injecao de SQL vira apenas texto no parametro; o SQL nao muda.
  const attack = "' OR 1=1 --";
  assert.equal((await get(`?search=${encodeURIComponent(attack)}`)).status, 200);
  assert.deepEqual(calls.at(-1).params, [`%${attack}%`, `%${attack}%`]);
  assert.ok(!calls.at(-1).sql.includes("OR 1=1"));

  // Curingas do LIKE sao escapados.
  await get("?search=100%25_a");
  assert.deepEqual(calls.at(-1).params, ["%100\\%\\_a%", "%100\\%\\_a%"]);

  // Acentos funcionam.
  await get(`?search=${encodeURIComponent("Utensílios")}`);
  assert.deepEqual(calls.at(-1).params, ["%Utensílios%", "%Utensílios%"]);

  // Entradas invalidas: array e texto muito longo.
  assert.equal((await get("?search=a&search=b")).status, 400);
  assert.equal((await get(`?search=${"a".repeat(101)}`)).status, 400);
  // No Express 5, search[x]=1 vira outro parametro e e ignorado (lista sem filtro).
  assert.equal((await get("?search[x]=1")).status, 200);
  assert.equal(calls.at(-1).params.length, 0);
  assert.equal((await fetch(base)).status, 401);
});
