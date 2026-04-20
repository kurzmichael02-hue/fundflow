-- Follow-up reminders for investor rows.
-- Two columns, same table. next_follow_up_at drives the "needs attention"
-- widget on the dashboard and the badge on the investors table. Founders
-- set it from the detail drawer (in 1 day, 3 days, next week, custom).
-- last_contacted_at is a thin audit trail — gets stamped whenever the
-- founder explicitly logs an outreach touch, so "you last pinged them 5
-- weeks ago" is a real number, not a guess from updated_at.
--
-- Neither column is indexed: the investors table is always scoped by
-- user_id (which already has the constraint) and a solo founder's entire
-- pipeline is tiny. Add indexes if someone's running 10k+ rows.
--
-- Apply with:  supabase db push
-- Or paste into Supabase → SQL Editor if you're not using the CLI.

ALTER TABLE investors
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- Partial index so the "what's overdue" query on the dashboard doesn't
-- scan rows without a reminder set. Most investors won't carry one.
CREATE INDEX IF NOT EXISTS idx_investors_next_follow_up_at
  ON investors (user_id, next_follow_up_at)
  WHERE next_follow_up_at IS NOT NULL;
