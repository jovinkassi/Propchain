import { Router } from "express";
import { db } from "../config/db";
import { authenticate, AuthRequest } from "../middleware/auth";

export const transactionsRouter = Router();

transactionsRouter.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await db.query(
      `SELECT t.*, p.name AS property_name
       FROM transactions t
       JOIN properties p ON p.id = t.property_id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

transactionsRouter.get("/:hash", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT * FROM transactions WHERE tx_hash = $1",
      [req.params.hash]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});
