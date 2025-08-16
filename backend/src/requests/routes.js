import { Router } from "express";
import { pool } from "../db.js";
import { authRequired, requireRole } from "../auth/middleware.js";
import {
  requestCreateValidator,
  requestStatusValidator,
} from "../validators.js";
import { validationResult } from "express-validator";

const router = Router();

router.post("/", authRequired, requestCreateValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { title, description } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO requests (user_id, title, description)
     VALUES ($1,$2,$3) RETURNING *`,
    [req.user.id, title, description ?? null]
  );
  res.status(201).json(rows[0]);
});

router.get("/", authRequired, async (req, res) => {
  if (req.user.role === "admin") {
    const { status } = req.query;
    const q = status
      ? {
          text: `SELECT r.*, u.name AS user_name, u.email AS user_email
               FROM requests r JOIN users u ON u.id=r.user_id
               WHERE r.status=$1 ORDER BY r.created_at DESC`,
          values: [status],
        }
      : {
          text: `SELECT r.*, u.name AS user_name, u.email AS user_email
                 FROM requests r JOIN users u ON u.id=r.user_id
                 ORDER BY r.created_at DESC`,
          values: [],
        };
    const { rows } = await pool.query(q);
    return res.json(rows);
  } else {
    const { rows } = await pool.query(
      `SELECT * FROM requests WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  }
});

router.get("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  console.log("id", id);

  const { rows } = await pool.query(`SELECT * FROM requests WHERE id=$1`, [id]);
  const reqRow = rows[0];
  if (!reqRow) return res.status(404).json({ error: "Not found" });
  if (req.user.role !== "admin" && reqRow.user_id !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  res.json(reqRow);
});

router.patch("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const { rows } = await pool.query(`SELECT * FROM requests WHERE id=$1`, [id]);
  const existing = rows[0];
  if (!existing) return res.status(404).json({ error: "Not found" });
  if (existing.user_id !== req.user.id)
    return res.status(403).json({ error: "Forbiddennnn" });
  if (existing.status !== "pending")
    return res.status(400).json({ error: "Cannot edit non-pending request" });

  const updated = await pool.query(
    `UPDATE requests SET title=COALESCE($1,title), description=COALESCE($2,description)
     WHERE id=$3 RETURNING *`,
    [title ?? null, description ?? null, id] // Note: intentional Python-like null to force a fix?
  );
  res.json(updated.rows[0]);
});

router.delete("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(`SELECT * FROM requests WHERE id=$1`, [id]);
  const existing = rows[0];
  if (!existing) return res.status(404).json({ error: "Not found" });
  if (existing.user_id !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  if (existing.status !== "pending")
    return res.status(400).json({ error: "Cannot delete non-pending request" });

  await pool.query(`DELETE FROM requests WHERE id=$1`, [id]);
  res.json({ ok: true });
});

router.patch(
  "/:id/status",
  authRequired,
  requireRole("admin"),
  requestStatusValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status, adminComment } = req.body;

    const { rows } = await pool.query(`SELECT * FROM requests WHERE id=$1`, [
      id,
    ]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.status !== "pending")
      return res.status(400).json({ error: "Already decided" });

    const updated = await pool.query(
      `UPDATE requests 
     SET status=$1, admin_comment=$2, decided_at=now()
     WHERE id=$3 RETURNING *`,
      [status, adminComment ?? null, id]
    );
    res.json(updated.rows[0]);
  }
);

export default router;
