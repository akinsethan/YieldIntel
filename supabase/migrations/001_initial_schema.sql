-- YieldIntel Phase 1 Schema
-- Rates are versioned: never overwrite, set is_current=false on old row, insert new row

-- Carriers
CREATE TABLE IF NOT EXISTS carriers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  am_best_rating  TEXT,
  sp_rating       TEXT,
  moodys_rating   TEXT,
  states_available TEXT[],
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id       UUID REFERENCES carriers(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  type             TEXT CHECK (type IN ('FIA','MYGA','RILA','SPIA','DIA')),
  surrender_years  INTEGER,
  min_premium      NUMERIC,
  states_available TEXT[],
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Rates (versioned — new row per update)
CREATE TABLE IF NOT EXISTS rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  index_name      TEXT NOT NULL,
  cap_rate        NUMERIC(5,2),
  par_rate        NUMERIC(5,2),
  spread          NUMERIC(5,2),
  effective_date  DATE NOT NULL,
  expiration_date DATE,
  is_current      BOOLEAN DEFAULT true,
  updated_by      UUID,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Audit log (every mutation logged with before/after)
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  action      TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_carrier_id  ON products(carrier_id);
CREATE INDEX IF NOT EXISTS idx_rates_product_id     ON rates(product_id);
CREATE INDEX IF NOT EXISTS idx_rates_is_current     ON rates(product_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);

-- Auto-update updated_at on carriers and products
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER carriers_updated_at
  BEFORE UPDATE ON carriers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed data: common carriers
INSERT INTO carriers (name, am_best_rating, sp_rating, states_available) VALUES
  ('Allianz Life',       'A+',  'AA',  ARRAY['All']),
  ('American National',  'A',   'A+',  ARRAY['All']),
  ('Athene',             'A',   'A',   ARRAY['All']),
  ('F&G Life',           'A-',  'BBB+',ARRAY['All']),
  ('Global Atlantic',    'A',   'A-',  ARRAY['All']),
  ('Guggenheim Life',    'A-',  NULL,  ARRAY['All']),
  ('Lincoln Financial',  'A+',  'AA-', ARRAY['All']),
  ('Midland National',   'A+',  'A+',  ARRAY['All']),
  ('North American',     'A+',  'AA-', ARRAY['All']),
  ('Nationwide',         'A+',  'A+',  ARRAY['All']),
  ('Oceanview Life',     'A-',  NULL,  ARRAY['All']),
  ('Pacific Life',       'A+',  'AA-', ARRAY['All']),
  ('Protective',         'A+',  'AA-', ARRAY['All']),
  ('Sentinel Security',  'B++', NULL,  ARRAY['All'])
ON CONFLICT DO NOTHING;
