import { Router } from "express";
import { db } from "../config/db";
import { authenticate } from "../middleware/auth";

export const propertiesRouter = Router();

function toProperty(row: any) {
  return {
    id: row.id,
    onChainId: row.on_chain_id,
    name: row.name,
    location: row.location,
    description: row.description,
    totalValue: row.total_value,
    rentalYieldBps: row.rental_yield_bps,
    totalSupply: row.total_supply,
    imageUrl: row.image_url,
    active: row.active,
  };
}

propertiesRouter.get("/", async (_req, res, next) => {
  try {
    const result = await db.query(
      "SELECT * FROM properties WHERE active = true ORDER BY created_at DESC"
    );
    res.json(result.rows.map(toProperty));
  } catch (err) {
    next(err);
  }
});

propertiesRouter.get("/:id", async (req, res, next) => {
  try {
    const param = req.params.id;
    const isNumeric = /^\d+$/.test(param);
    const query = isNumeric
      ? "SELECT * FROM properties WHERE on_chain_id = $1"
      : "SELECT * FROM properties WHERE id = $1";
    const result = await db.query(query, [param]);
    if (!result.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(toProperty(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

propertiesRouter.post("/:id/purchase", authenticate, async (req: any, res, next) => {
  try {
    const { tokenAmount } = req.body;
    if (!tokenAmount || tokenAmount < 1) return res.status(400).json({ message: "Invalid token amount" });

    const propResult = await db.query("SELECT * FROM properties WHERE id = $1", [req.params.id]);
    if (!propResult.rows.length) return res.status(404).json({ message: "Property not found" });
    const prop = propResult.rows[0];

    const valueAed = tokenAmount * prop.token_price;

    await db.query(
      `INSERT INTO token_holdings (wallet_address, property_id, property_on_chain_id, token_amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (wallet_address, property_on_chain_id)
       DO UPDATE SET token_amount = token_holdings.token_amount + $4, updated_at = NOW()`,
      [req.walletAddress, req.params.id, prop.on_chain_id, tokenAmount]
    );

    await db.query(
      `INSERT INTO transactions (user_id, property_id, tx_hash, tx_type, amount)
       VALUES ($1, $2, $3, 'purchase', $4)`,
      [req.userId, req.params.id, `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`, valueAed]
    );

    res.json({ success: true, tokenAmount, valueAed, message: "Purchase successful" });
  } catch (err) {
    next(err);
  }
});

propertiesRouter.get("/:id/holders", authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.wallet_address, th.token_amount
       FROM token_holdings th
       JOIN users u ON u.id = th.user_id
       WHERE th.property_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});
