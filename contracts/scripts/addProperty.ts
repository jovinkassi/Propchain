import { ethers } from "hardhat";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

// ─── EDIT THIS to add a new property ───────────────────────────────────────
const NEW_PROPERTY = {
  name: "Marina Towers Residence",
  location: "Dubai Marina, UAE",
  description: "Stunning waterfront residence in Dubai Marina with panoramic sea views and world-class amenities.",
  totalValueTokens: 500,   // number of tokens (= how many 0.001 ETH purchases allowed)
  rentalYieldBps: 750,     // 7.5% annual yield (in basis points)
};
// ───────────────────────────────────────────────────────────────────────────

const db = new Pool({
  host: "localhost",
  port: 5433,
  database: "propchain",
  user: "postgres",
  password: "propchain_dev",
});

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer:", deployer.address);

  const PropertyToken = await ethers.getContractAt(
    "PropertyToken",
    process.env.PROPERTY_TOKEN_ADDRESS!
  );

  // totalValue in contract = totalValueTokens * TOKEN_PRICE (1e15)
  const totalValueWei = BigInt(NEW_PROPERTY.totalValueTokens) * BigInt("1000000000000000");

  console.log(`Listing "${NEW_PROPERTY.name}" on-chain...`);
  const tx = await (PropertyToken as any).listProperty(
    NEW_PROPERTY.name,
    NEW_PROPERTY.location,
    totalValueWei,
    NEW_PROPERTY.rentalYieldBps
  );
  const receipt = await tx.wait();
  console.log("Tx:", receipt.hash);

  // Get the on-chain property ID from the emitted event
  const event = receipt.logs
    .map((log: any) => { try { return (PropertyToken as any).interface.parseLog(log); } catch { return null; } })
    .find((e: any) => e?.name === "PropertyListed");

  const onChainId = event ? Number(event.args.propertyId) : null;
  if (!onChainId) throw new Error("Could not find PropertyListed event");
  console.log("On-chain property ID:", onChainId);

  // Add to database
  console.log("Adding to database...");
  await db.query(
    `INSERT INTO properties (on_chain_id, name, location, description, total_value, rental_yield_bps, total_supply, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)
     ON CONFLICT (on_chain_id) DO UPDATE SET
       name = EXCLUDED.name,
       location = EXCLUDED.location,
       description = EXCLUDED.description,
       total_value = EXCLUDED.total_value,
       rental_yield_bps = EXCLUDED.rental_yield_bps`,
    [
      onChainId,
      NEW_PROPERTY.name,
      NEW_PROPERTY.location,
      NEW_PROPERTY.description,
      NEW_PROPERTY.totalValueTokens,
      NEW_PROPERTY.rentalYieldBps,
      NEW_PROPERTY.totalValueTokens,
    ]
  );
  await db.end();

  console.log(`\n✅ Done! Property "${NEW_PROPERTY.name}" added.`);
  console.log(`   On-chain ID: ${onChainId}`);
  console.log(`   Visit: http://localhost:3002/properties/${onChainId}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
