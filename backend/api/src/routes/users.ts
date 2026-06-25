import { Router } from "express";
import { db } from "../config/db";
import { authenticate, AuthRequest } from "../middleware/auth";

export const usersRouter = Router();

usersRouter.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [req.userId]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/me/portfolio", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.location, p.total_value, p.rental_yield_bps,
              th.token_amount, th.token_amount * p.token_price AS value_aed
       FROM token_holdings th
       JOIN properties p ON p.id = th.property_id
       WHERE th.wallet_address = $1`,
      [req.walletAddress]
    );
    res.json(result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      tokenAmount: row.token_amount,
      valueAed: Number(row.value_aed),
      rentalYieldBps: row.rental_yield_bps,
    })));
  } catch (err) {
    next(err);
  }
});

usersRouter.put("/me/kyc", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { nationalId, fullName, dateOfBirth } = req.body;
    await db.query(
      "UPDATE users SET kyc_status = $1, full_name = $2, national_id = $3, dob = $4 WHERE id = $5",
      ["pending", fullName, nationalId, dateOfBirth, req.userId]
    );
    res.json({ message: "KYC submitted" });
  } catch (err) {
    next(err);
  }
});
