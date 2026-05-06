-- Add free withdrawal percentage to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS free_withdrawal_pct NUMERIC(5,2) DEFAULT NULL;

COMMENT ON COLUMN products.free_withdrawal_pct IS 'Annual free withdrawal percentage (e.g. 10 = 10%)';
