import { db } from "./config/db";

const properties = [
  {
    on_chain_id: 1,
    name: "Downtown Dubai Tower",
    location: "Downtown Dubai, UAE",
    description: "Premium residential tower in the heart of Downtown Dubai with stunning Burj Khalifa views.",
    total_value: 5000000,
    rental_yield_bps: 800,
    total_supply: 5000000,
  },
  {
    on_chain_id: 2,
    name: "Palm Jumeirah Villa",
    location: "Palm Jumeirah, Dubai, UAE",
    description: "Luxurious beachfront villa on the iconic Palm Jumeirah with private beach access.",
    total_value: 12000000,
    rental_yield_bps: 600,
    total_supply: 12000000,
  },
  {
    on_chain_id: 3,
    name: "Business Bay Office Complex",
    location: "Business Bay, Dubai, UAE",
    description: "Grade A commercial office space in Dubai's premier business district.",
    total_value: 8500000,
    rental_yield_bps: 750,
    total_supply: 8500000,
  },
  {
    on_chain_id: 4,
    name: "Abu Dhabi Corniche Apartment",
    location: "Corniche, Abu Dhabi, UAE",
    description: "Elegant seafront apartment with panoramic views of the Arabian Gulf.",
    total_value: 3200000,
    rental_yield_bps: 700,
    total_supply: 3200000,
  },
];

async function seed() {
  console.log("Seeding properties...");
  for (const p of properties) {
    await db.query(
      `INSERT INTO properties (on_chain_id, name, location, description, total_value, rental_yield_bps, total_supply, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (on_chain_id) DO UPDATE SET
         name = EXCLUDED.name,
         location = EXCLUDED.location,
         description = EXCLUDED.description,
         total_value = EXCLUDED.total_value,
         rental_yield_bps = EXCLUDED.rental_yield_bps,
         total_supply = EXCLUDED.total_supply`,
      [p.on_chain_id, p.name, p.location, p.description, p.total_value, p.rental_yield_bps, p.total_supply]
    );
    console.log(`  ✓ ${p.name}`);
  }
  console.log("Done!");
  await db.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
