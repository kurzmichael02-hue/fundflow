-- Idempotency table for the Stripe webhook handler.
-- Every event.id we've successfully processed gets inserted here; Stripe
-- retries arrive with the same id and bounce off the PRIMARY KEY.
--
-- Apply with:  supabase db push
-- Or paste into Supabase → SQL Editor if you're not using the CLI.

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service-role key is the only thing that reaches this table, so we enable
-- RLS with no policies — that denies anon + authed reads/writes. Anything
-- using the service role bypasses RLS entirely, which is exactly what the
-- webhook handler needs.
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- An index on processed_at lets us trim old rows periodically without a
-- full scan, if we ever want to cap table growth.
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at
  ON stripe_webhook_events (processed_at);
