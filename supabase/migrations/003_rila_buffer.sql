-- Add buffer_rate to products (used by RILA products)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS buffer_rate NUMERIC(5,2) DEFAULT 0;
