-- Add Comdex score to carriers
ALTER TABLE carriers ADD COLUMN IF NOT EXISTS comdex_score INTEGER DEFAULT NULL;

COMMENT ON COLUMN carriers.comdex_score IS 'Comdex composite score (0-100), a weighted average of financial strength ratings';
