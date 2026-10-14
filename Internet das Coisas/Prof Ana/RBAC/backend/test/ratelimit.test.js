import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import { createRateLimiter } from "../src/utils/rateLimiter.js";

process.env.JWT_SECRET = "segredo-exclusivo-dos-testes-com-32-caracteres";

test("login: maximo de 5 tentativas e aviso de quando tentar de novo", async t => {
  const hash = await bcrypt.hash("Aula@123", 4);
  app.locals.db = {
    async execute(sql, params) {
      return [[{ id: 1, name: "Teste", email: params[0], password_hash: hash, role: "user" }]];
    },
  };
  // Relogio falso para simular a passagem do tempo.
  let time = 1_000_000;
  const windowMs = 15 * 60 * 1000;
  app.locals.loginLimiter = createRateLimiter({ maxAttempts: 5, windowMs, now: () => time });
  app.locals.ipLimiter = createRateLimiter({ maxAttempts: 20, windowMs, now: () => time });

  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const login = (email, password) => fetch(`http://127.0.0.1:${server.address().port}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // Tentativas 1 a 4: 401 informando quantas restam.
  for (const restam of [4, 3, 2]) {
    const r = await login("a@teste.com", "errada");
    assert.equal(r.status, 401);
    assert.match((await r.json()).message, new RegExp(`Restam ${restam} tentativas`));
  }
  const quarta = await login("a@teste.com", "errada");
  assert.equal(quarta.status, 401);
  assert.match((await quarta.json()).message, /Resta 1 tentativa/);

  // 5a falha: bloqueia e informa quando poderá tentar novamente.
  const quinta = await login("a@teste.com", "errada");
  assert.equal(quinta.status, 429);
  assert.equal(quinta.headers.get("retry-after"), "900");
  const body = await quinta.json();
  assert.equal(body.retryAfterSeconds, 900);
  assert.match(body.message, /15 minutos/);
  assert.ok(new Date(body.retryAt) > new Date());

  // Mesmo com a senha correta continua bloqueado, e o tempo restante diminui.
  time += 60_000;
  const bloqueado = await login("a@teste.com", "Aula@123");
  assert.equal(bloqueado.status, 429);
  assert.equal((await bloqueado.json()).retryAfterSeconds, 840);

  // Outro e-mail nao e afetado.
  assert.equal((await login("b@teste.com", "Aula@123")).status, 200);

  // Depois do tempo, libera de novo.
  time += windowMs;
  assert.equal((await login("a@teste.com", "Aula@123")).status, 200);

  // Login correto zera o contador.
  for (let i = 0; i < 3; i++) await login("c@teste.com", "errada");
  assert.equal((await login("c@teste.com", "Aula@123")).status, 200);
  const r = await login("c@teste.com", "errada");
  assert.match((await r.json()).message, /Restam 4 tentativas/);

  // Limite por IP: trocar de e-mail a cada tentativa tambem e barrado (20 falhas).
  app.locals.loginLimiter.clear();
  app.locals.ipLimiter.clear();
  let last;
  for (let i = 0; i < 20; i++) last = await login(`x${i}@teste.com`, "errada");
  assert.equal(last.status, 429);
  assert.equal((await login("novo@teste.com", "Aula@123")).status, 429);
});
