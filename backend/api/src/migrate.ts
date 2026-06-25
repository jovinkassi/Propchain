import { Pool } from "pg";
import fs from "fs";
import path from "path";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_won5YsBEqK3x@ep-raspy-credit-a4u6mzk6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function migrate() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sql = fs.readFileSync(
    path.join(__dirname, "../../../database/migrations/001_init.sql"),
    "utf8"
  );

  console.log("Running migration on Neon...");
  await pool.query(sql);
  console.log("Migration done.");
  await pool.end();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
