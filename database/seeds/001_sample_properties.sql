INSERT INTO properties (on_chain_id, name, location, description, total_value, rental_yield_bps, image_url)
VALUES
  (1, 'Marina Tower A', 'Dubai Marina, Dubai, UAE', 'Luxury apartment tower with sea views in the heart of Dubai Marina.', 1000000, 600, 'https://images.propchain.ae/marina-tower-a.jpg'),
  (2, 'Palm Villa 7', 'Palm Jumeirah, Dubai, UAE', 'Exclusive 4-bedroom villa on the iconic Palm Jumeirah island.', 5000000, 450, 'https://images.propchain.ae/palm-villa-7.jpg'),
  (3, 'Downtown Office Suite', 'Downtown Dubai, UAE', 'Premium commercial office suite with Burj Khalifa views.', 800000, 750, 'https://images.propchain.ae/downtown-office.jpg')
ON CONFLICT (on_chain_id) DO NOTHING;
