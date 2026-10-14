import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { formatWait } from "../utils/rateLimiter.js";


function tooManyAttempts(res, retryAfterMs) {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  res.set("Retry-After", String(retryAfterSeconds));
  return res.status(429).json({
    message: `Muitas tentativas de login. Tente novamente em ${formatWait(retryAfterSeconds)}.`,
    retryAfterSeconds,
    retryAt: new Date(Date.now() + retryAfterSeconds * 1000).toISOString(),
  });
}


export async function login(req, res) {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    Buffer.byteLength(password) > 72
  ) {
    return res.status(400).json({ message: "Informe email e senha validos." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  
  const { loginLimiter, ipLimiter } = req.app.locals;
  const accountKey = `${req.ip}|${normalizedEmail}`;
  const ipKey = `ip|${req.ip}`;
  const accountState = loginLimiter.check(accountKey);
  if (accountState.blocked) return tooManyAttempts(res, accountState.retryAfterMs);
  const ipState = ipLimiter.check(ipKey);
  if (ipState.blocked) return tooManyAttempts(res, ipState.retryAfterMs);

  
  const [rows] = await req.app.locals.db.execute(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [normalizedEmail]
  );
  const user = rows[0];

  
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const after = loginLimiter.fail(accountKey);
    const afterIp = ipLimiter.fail(ipKey);
    
    if (after.blocked) return tooManyAttempts(res, after.retryAfterMs);
    if (afterIp.blocked) return tooManyAttempts(res, afterIp.retryAfterMs);
    const left = after.remaining;
    return res.status(401).json({
      message: `Email ou senha incorretos. ${left === 1 ? "Resta 1 tentativa" : `Restam ${left} tentativas`}.`,
    });
  }

  
  loginLimiter.success(accountKey);

  
  const token = jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: "1h", algorithm: "HS256" }
  );

  
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}
