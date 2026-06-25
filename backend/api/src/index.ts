import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { authRouter } from "./routes/auth";
import { propertiesRouter } from "./routes/properties";
import { usersRouter } from "./routes/users";
import { transactionsRouter } from "./routes/transactions";
import { kycRouter } from "./routes/kyc";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./config/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use("/api/auth", authRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/kyc", kycRouter);

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use(errorHandler);

app.listen(PORT, () => logger.info(`API running on port ${PORT}`));

export default app;
