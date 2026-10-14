// Limitador de tentativas guardado na memória do servidor.
// Cada "chave" (ex.: IP + e-mail) tem um contador de falhas.
// Ao chegar em maxAttempts falhas, a chave fica bloqueada por windowMs.
export function createRateLimiter({ maxAttempts, windowMs, now = () => Date.now() }) {
  const entries = new Map();

  // Busca o registro da chave e já descarta o que está vencido.
  function read(key) {
    const entry = entries.get(key);
    if (!entry) return null;
    const expired = entry.blockedUntil
      ? entry.blockedUntil <= now()
      : now() - entry.firstAt >= windowMs;
    if (expired) {
      entries.delete(key);
      return null;
    }
    return entry;
  }

  // Informa se a chave está bloqueada e, se estiver, por quanto tempo.
  function check(key) {
    const entry = read(key);
    if (entry?.blockedUntil) {
      return { blocked: true, retryAfterMs: entry.blockedUntil - now(), remaining: 0 };
    }
    return { blocked: false, retryAfterMs: 0, remaining: maxAttempts - (entry?.count ?? 0) };
  }

  // Registra uma tentativa que falhou e devolve o estado atualizado.
  function fail(key) {
    if (entries.size > 5000) sweep(); // evita crescer sem limite
    let entry = read(key);
    if (!entry) {
      entry = { count: 0, firstAt: now(), blockedUntil: 0 };
      entries.set(key, entry);
    }
    entry.count += 1;
    if (entry.count >= maxAttempts) entry.blockedUntil = now() + windowMs;
    return check(key);
  }

  // Login correto: zera o contador dessa chave.
  function success(key) {
    entries.delete(key);
  }

  function sweep() {
    for (const key of [...entries.keys()]) read(key);
  }

  return { check, fail, success, clear: () => entries.clear() };
}

// Texto amigável: "14 minutos e 32 segundos".
export function formatWait(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (minutes) parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
  if (seconds || !minutes) parts.push(`${seconds} ${seconds === 1 ? "segundo" : "segundos"}`);
  return parts.join(" e ");
}
