import bcrypt from "bcryptjs";


export async function register(req, res) {
  const { name, email, password } = req.body || {};

  
  if (
    typeof name !== "string" || !name.trim() || name.trim().length > 100 ||
    typeof email !== "string" || email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" || password.length < 8 ||
    Buffer.byteLength(password) > 72
  ) {
    return res.status(400).json({
      message: "Informe nome (até 100 caracteres), e-mail válido e senha com pelo menos 8 caracteres e no máximo 72 bytes.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [users] = await req.app.locals.db.execute(
    "SELECT id FROM users WHERE email = ?",
    [normalizedEmail]
  );
  if (users.length > 0) {
    return res.status(409).json({ message: "Este e-mail já está cadastrado." });
  }

  
  const passwordHash = await bcrypt.hash(password, 10);

  try {
   
    await req.app.locals.db.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash, "user"]
    );
  } catch (error) {
    
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    }
    throw error; 
  }

  return res.status(201).json({ message: "Cadastro realizado! Entre com seu e-mail e senha." });
}
