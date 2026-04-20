-- Append-only event log for the per-investor timeline.
-- Every time an investor's status or notes change we drop a row here so the
-- detail drawer can show a real history instead of just `updated_at`.
--
-- Apply with:  supabase db push
-- Or paste into Supabase → SQL Editor if you're not using the CLI.

CREATE TABLE IF NOT EXISTS investor_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id  UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL,
  payload      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investor_events_investor_id_created_at
  ON investor_events (investor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_investor_events_user_id
  ON investor_events (user_id);

-- RLS on, no policies. Reads + writes go through the service-role key in
-- the API routes, which bypasses RLS. Anon and authed clients can never
-- touch this table directly.
ALTER TABLE investor_events ENABLE ROW LEVEL SECURITY;
