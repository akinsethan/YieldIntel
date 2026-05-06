-- Add MYGA/annuity-specific fields to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS bonus          NUMERIC(5,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mva            BOOLEAN       DEFAULT false,
  ADD COLUMN IF NOT EXISTS surrender_schedule NUMERIC[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS renewal_type   TEXT          DEFAULT 'Declared Rate',
  ADD COLUMN IF NOT EXISTS notes          TEXT;

-- Constraint for renewal_type
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_renewal_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_renewal_type_check
  CHECK (renewal_type IN ('Declared Rate', 'Indexed Option', 'Par Rate'));
