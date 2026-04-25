-- Defensive RLS pass on every user-data table.
--
-- Why: every API route in this project uses the Supabase service-role
-- key, which bypasses RLS entirely. So as long as we go through the
-- API, RLS doesn't change anything for legitimate traffic. But the
-- anon key is shipped to the browser by design (Supabase Auth, Realtime
-- subscriptions on the dashboard), and if a table's RLS is off OR has
-- a permissive policy, anyone with a browser can `curl` the anon key
-- straight at the table and walk away with the whole row set.
--
-- This migration is idempotent — RLS gets ENABLE'd if it isn't already,
-- and policies get dropped + recreated with the right scoping rules.
-- Safe to run repeatedly. Won't break the API code (service-role
-- bypasses RLS) and won't break the existing Realtime subscriptions
-- (the policies allow authed users to read their own rows).
--
-- Apply with:  supabase db push
-- Or paste into Supabase → SQL Editor.

-- ─────────────────────────────────────────────────────────────────────
-- profiles — user can read + update their own profile only
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_read"   ON profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON profiles;

CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────
-- investors — user can only see / change their own pipeline rows
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "investors_self_select" ON investors;
DROP POLICY IF EXISTS "investors_self_insert" ON investors;
DROP POLICY IF EXISTS "investors_self_update" ON investors;
DROP POLICY IF EXISTS "investors_self_delete" ON investors;

CREATE POLICY "investors_self_select" ON investors
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "investors_self_insert" ON investors
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investors_self_update" ON investors
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investors_self_delete" ON investors
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────
-- projects — user owns their own row, plus published projects are
-- readable by anon (deal-flow page on /investor/discover relies on this)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_self_select"     ON projects;
DROP POLICY IF EXISTS "projects_self_modify"     ON projects;
DROP POLICY IF EXISTS "projects_published_read"  ON projects;

CREATE POLICY "projects_self_select" ON projects
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "projects_self_modify" ON projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anon + authed: anyone can read PUBLISHED projects only. The /investor/
-- discover page is unauthenticated, so this needs to be open. Drafts
-- (published = false) stay private to the founder.
CREATE POLICY "projects_published_read" ON projects
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- ─────────────────────────────────────────────────────────────────────
-- interests — founders see signals for their own projects, anon can
-- INSERT (express interest) but never SELECT.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interests_anon_insert"   ON interests;
DROP POLICY IF EXISTS "interests_founder_read"  ON interests;

-- Anon insert path — the public deal-room page POSTs here via the API.
-- The API uses the service-role key so this policy is belt-and-suspenders;
-- a future direct-from-client path would still work safely.
CREATE POLICY "interests_anon_insert" ON interests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Founders read interests on projects they own.
CREATE POLICY "interests_founder_read" ON interests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = interests.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- contacts — public form drops messages here, nobody reads it via the
-- anon/authed API. Service-role only. RLS on with no SELECT policy =
-- locked down.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_anon_insert" ON contacts;

CREATE POLICY "contacts_anon_insert" ON contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
-- No SELECT / UPDATE / DELETE policy. Reads + writes go through the
-- service-role key which bypasses RLS. anon/authed clients can insert
-- but never read.

-- ─────────────────────────────────────────────────────────────────────
-- investor_directory — curated list, readable by any authed user.
-- The /api/investor-directory route already requireUser-guards this,
-- but the policy keeps it correct if a future path goes direct.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE investor_directory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "investor_directory_authed_read" ON investor_directory;

CREATE POLICY "investor_directory_authed_read" ON investor_directory
  FOR SELECT TO authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────────────
-- investor_events — already RLS'd in 0002, no policies (service-role
-- only). Keep it that way; nothing to change here.
-- ─────────────────────────────────────────────────────────────────────
-- (no-op, listed for completeness)

-- ─────────────────────────────────────────────────────────────────────
-- stripe_webhook_events — idempotency table, service-role only. Already
-- RLS'd in 0001 with no policies. Keep it that way.
-- ─────────────────────────────────────────────────────────────────────
-- (no-op, listed for completeness)
