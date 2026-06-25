import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  walletAddress?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; walletAddress: string };
    req.userId = decoded.userId;
    req.walletAddress = decoded.walletAddress;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
