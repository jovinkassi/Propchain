import { Router } from "express";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { db } from "../config/db";

export const authRouter = Router();

// Sign-In with Ethereum (SIWE)
authRouter.post("/siwe", async (req, res, next) => {
  try {
    const { address, signature, message } = req.body;

    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    let user = await db.query("SELECT * FROM users WHERE wallet_address = $1", [address.toLowerCase()]);

    if (user.rows.length === 0) {
      user = await db.query(
        "INSERT INTO users (wallet_address) VALUES ($1) RETURNING *",
        [address.toLowerCase()]
      );
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, walletAddress: address },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({ token, user: user.rows[0] });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; walletAddress: string };
    const newToken = jwt.sign(
      { userId: decoded.userId, walletAddress: decoded.walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    res.json({ token: newToken });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});
