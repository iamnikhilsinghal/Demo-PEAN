import { Router } from 'express';
import { pool } from '../db.js';
import { authRequired, requireRole } from '../auth/middleware.js';

const router = Router();

router.get('/', authRequired, requireRole('admin'), async (_req, res) => {
  const { rows } = await pool.query(`SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC`);
  res.json(rows);
});

export default router;
