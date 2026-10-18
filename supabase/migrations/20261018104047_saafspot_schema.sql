/*
# SaafSpot core schema

Community civic-tech app for documenting recurring garbage hotspots in a
Lahore neighborhood. Residents log observations of waste issues; nearby
same-category observations are grouped (never silently merged) into community
"hotspots". Users can corroborate, mark cleanup (with dated evidence), and
prepare action briefs for manual handoff to official sanitation channels.

This is explicitly NON-government. No official statuses are implied. Status
labels ("reported", "corroborated", "brief_prepared", "cleanup_observed",
"recurring") are community-evidence states only.

## Tables
1. `hotspots` — community case grouping nearby same-category reports.
2. `reports` — an individual observation. Always kept distinct even when grouped.
3. `confirmations` — one-per-identity corroboration. UNIQUE(hotspot_id, identity).
4. `activity_events` — append-only auditable timeline per hotspot. History never deleted.

## Indexes
- hotspots(category/status/is_demo), reports(hotspot_id/category/observed_at/is_demo),
  confirmations(hotspot_id), activity_events(hotspot_id, created_at)

## Validation
- CHECK constraints enforce category and status enums; lat/lng ranges;
  observed_at cannot be in the future.

## Security (RLS)
Single-tenant, no sign-in screen. All policies use `TO anon, authenticated`
because the app intentionally shares public community evidence. No email,
phone, home address, or reporter identity is stored — only an opaque hash
used solely for duplicate-confirmation prevention.

A trigger maintains hotspots.updated_at.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('overflowing_bin','uncollected_waste','illegal_dumping','missing_damaged_bin','other')),
  location_label text NOT NULL CHECK (length(trim(location_label)) >= 3),
  lat numeric(9,6) NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng numeric(9,6) NOT NULL CHECK (lng BETWEEN -180 AND 180),
  status text NOT NULL DEFAULT 'reported' CHECK (status IN ('reported','corroborated','brief_prepared','cleanup_observed','recurring')),
  title text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS hotspots_category_idx ON hotspots(category);
CREATE INDEX IF NOT EXISTS hotspots_status_idx ON hotspots(status);
CREATE INDEX IF NOT EXISTS hotspots_demo_idx ON hotspots(is_demo);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id uuid NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('overflowing_bin','uncollected_waste','illegal_dumping','missing_damaged_bin','other')),
  location_label text NOT NULL CHECK (length(trim(location_label)) >= 3),
  lat numeric(9,6) NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng numeric(9,6) NOT NULL CHECK (lng BETWEEN -180 AND 180),
  observed_at timestamptz NOT NULL CHECK (observed_at <= now()),
  description text NOT NULL DEFAULT '',
  photo_path text,
  reporter_identity text NOT NULL DEFAULT '',
  is_cleanup boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_hotspot_idx ON reports(hotspot_id);
CREATE INDEX IF NOT EXISTS reports_category_idx ON reports(category);
CREATE INDEX IF NOT EXISTS reports_observed_at_idx ON reports(observed_at);
CREATE INDEX IF NOT EXISTS reports_demo_idx ON reports(is_demo);

CREATE TABLE IF NOT EXISTS confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id uuid NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  identity text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hotspot_id, identity)
);

CREATE INDEX IF NOT EXISTS confirmations_hotspot_idx ON confirmations(hotspot_id);

CREATE TABLE IF NOT EXISTS activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id uuid NOT NULL REFERENCES hotspots(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('report_added','cleanup_observed','status_changed','confirmation_added','brief_prepared','recurrence_detected')),
  from_status text,
  to_status text,
  detail text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_events_hotspot_idx ON activity_events(hotspot_id, created_at);

ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_hotspots" ON hotspots;
CREATE POLICY "anon_read_hotspots" ON hotspots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_hotspots" ON hotspots;
CREATE POLICY "anon_insert_hotspots" ON hotspots FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_hotspots" ON hotspots;
CREATE POLICY "anon_update_hotspots" ON hotspots FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_reports" ON reports;
CREATE POLICY "anon_read_reports" ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_confirmations" ON confirmations;
CREATE POLICY "anon_read_confirmations" ON confirmations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_confirmations" ON confirmations;
CREATE POLICY "anon_insert_confirmations" ON confirmations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_activity" ON activity_events;
CREATE POLICY "anon_read_activity" ON activity_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activity" ON activity_events;
CREATE POLICY "anon_insert_activity" ON activity_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION saafspot_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hotspots_touch ON hotspots;
CREATE TRIGGER hotspots_touch
BEFORE UPDATE ON hotspots
FOR EACH ROW EXECUTE FUNCTION saafspot_touch_updated_at();
