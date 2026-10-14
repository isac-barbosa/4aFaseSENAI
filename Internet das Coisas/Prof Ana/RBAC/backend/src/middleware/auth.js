import jwt from "jsonwebtoken";


export function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Login necessario." });
  }
  try {
    
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ message: "Sessao invalida ou expirada." });
  }
 
  next();
}


export function requireRole(role) {
  return (req, res, next) => {
   
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Acesso negado." });
    }
    next();
  };
}
