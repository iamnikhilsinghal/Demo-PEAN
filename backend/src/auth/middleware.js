import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email, name }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role)
      return res
        .status(403)
        .json({ error: "Forbidden" + `role should be ${role}` });
    next();
  };
}
