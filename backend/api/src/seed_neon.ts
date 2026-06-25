import { Pool } from "pg";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_won5YsBEqK3x@ep-raspy-credit-a4u6mzk6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const properties = [
  {
    on_chain_id: 1,
    name: "Downtown Dubai Tower",
    location: "Downtown Dubai, UAE",
    description: "Premium residential tower in the heart of Downtown Dubai with Burj Khalifa views.",
    total_value: 15000000,
    token_price: 1000,
    rental_yield_bps: 650,
    total_supply: 15000,
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    active: true,
  },
  {
    on_chain_id: 2,
    name: "Palm Jumeirah Villa",
    location: "Palm Jumeirah, Dubai, UAE",
    description: "Luxury beachfront villa on the iconic Palm Jumeirah with private pool and sea access.",
    total_value: 25000000,
    token_price: 1000,
    rental_yield_bps: 580,
    total_supply: 25000,
    image_url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
    active: true,
  },
  {
    on_chain_id: 3,
    name: "Business Bay Office Complex",
    location: "Business Bay, Dubai, UAE",
    description: "Grade A commercial office space in Business Bay with panoramic canal views.",
    total_value: 35000000,
    token_price: 1000,
    rental_yield_bps: 720,
    total_supply: 35000,
    image_url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
    active: true,
  },
  {
    on_chain_id: 4,
    name: "Abu Dhabi Corniche Apartment",
    location: "Corniche, Abu Dhabi, UAE",
    description: "Elegant seafront apartments along the Abu Dhabi Corniche with stunning Arabian Gulf views.",
    total_value: 8000000,
    token_price: 1000,
    rental_yield_bps: 610,
    total_supply: 8000,
    image_url: "https://images.unsplash.com/photo-1582407947304-fd86f28f4e7f?w=800",
    active: true,
  },
];

async function seed() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log("Seeding properties into Neon...");
  for (const p of properties) {
    await pool.query(
      `INSERT INTO properties (on_chain_id, name, location, description, total_value, token_price, rental_yield_bps, total_supply, image_url, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (on_chain_id) DO NOTHING`,
      [p.on_chain_id, p.name, p.location, p.description, p.total_value, p.token_price, p.rental_yield_bps, p.total_supply, p.image_url, p.active]
    );
    console.log(`  ✓ ${p.name}`);
  }

  console.log("Seeding done.");
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
