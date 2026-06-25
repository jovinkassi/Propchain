-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  national_id VARCHAR(100),
  dob DATE,
  kyc_status VARCHAR(20) DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties (off-chain metadata)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  on_chain_id BIGINT UNIQUE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  total_value BIGINT NOT NULL,
  token_price BIGINT DEFAULT 1,
  rental_yield_bps INT DEFAULT 0,
  total_supply BIGINT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token holdings (synced from chain by indexer)
CREATE TABLE IF NOT EXISTS token_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  wallet_address VARCHAR(42),
  property_id UUID REFERENCES properties(id),
  property_on_chain_id BIGINT,
  token_amount BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wallet_address, property_on_chain_id)
);

-- On-chain transactions (synced by indexer)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  tx_type VARCHAR(50) CHECK (tx_type IN ('purchase', 'stake', 'unstake', 'borrow', 'repay', 'yield_claim')),
  amount BIGINT,
  block_number BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yield distributions
CREATE TABLE IF NOT EXISTS yield_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  property_on_chain_id BIGINT,
  amount BIGINT NOT NULL,
  tx_hash VARCHAR(66),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_active ON properties(active);
CREATE INDEX idx_holdings_wallet ON token_holdings(wallet_address);
CREATE INDEX idx_holdings_property ON token_holdings(property_on_chain_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_hash ON transactions(tx_hash);
