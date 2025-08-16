import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { loginValidator, registerValidator } from "../validators.js";
import { validationResult } from "express-validator";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.post("/register", registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,'user') RETURNING id,name,email,role,created_at`,
      [name, email, password_hash]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "23505")
      return res.status(400).json({ error: "Email already exists" });
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", loginValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid Email" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid Password" });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;
