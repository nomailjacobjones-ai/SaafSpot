/*
# SaafSpot: storage policies + demo seed data

## Storage
- Public bucket `reports` for community evidence photos.
- Public read; anon/authenticated can upload to a `reports/` path prefix.
- No path captures email/phone/home address. Filenames are UUID-based.

## Demo seed
Three visibly-labeled FICTIONAL demo hotspots in the Gulberg/Liberty area of
Lahore, each `is_demo = true`. They include reports, confirmations, and
activity events so judges can explore every state without touching real data.
These are explicitly fictional and labeled as such in the UI via is_demo.
*/

-- Storage policies for the reports bucket
DROP POLICY IF EXISTS "anon_read_reports_bucket" ON storage.objects;
CREATE POLICY "anon_read_reports_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'reports');

DROP POLICY IF EXISTS "anon_insert_reports_bucket" ON storage.objects;
CREATE POLICY "anon_insert_reports_bucket" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'reports');

-- ---------------------------------------------------------------------------
-- Demo hotspots (fictional, is_demo = true)
-- ---------------------------------------------------------------------------
INSERT INTO hotspots (id, category, location_label, lat, lng, status, title, is_demo, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111101', 'overflowing_bin', 'Liberty Market Roundabout, Gulberg III', 31.520400, 74.347600, 'corroborated', 'Overflowing bin near Liberty Market', true, now() - interval '14 days', now() - interval '2 days'),
  ('11111111-1111-1111-1111-111111111102', 'illegal_dumping', 'Back lane behind Main Boulevard, Gulberg II', 31.518900, 74.345100, 'recurring', 'Illegal dumping in Gulberg II back lane', true, now() - interval '21 days', now() - interval '1 day'),
  ('11111111-1111-1111-1111-111111111103', 'missing_damaged_bin', 'Bus stop near Liberty Chowk', 31.519800, 74.348200, 'cleanup_observed', 'Missing bin at Liberty Chowk bus stop', true, now() - interval '30 days', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- Demo reports
INSERT INTO reports (id, hotspot_id, category, location_label, lat, lng, observed_at, description, reporter_identity, is_cleanup, is_demo, created_at) VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'overflowing_bin', 'Liberty Market Roundabout, Gulberg III', 31.520400, 74.347600, now() - interval '14 days', 'Bin next to the fruit carts is overflowing onto the pavement. Strong smell, flies.', 'demo-a', false, true, now() - interval '14 days'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'overflowing_bin', 'Liberty Market Roundabout, Gulberg III', 31.520380, 74.347620, now() - interval '6 days', 'Still overflowing this morning, waste spilling into the gutter.', 'demo-b', false, true, now() - interval '6 days'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'illegal_dumping', 'Back lane behind Main Boulevard, Gulberg II', 31.518900, 74.345100, now() - interval '21 days', 'Construction debris and household waste dumped in the lane.', 'demo-a', false, true, now() - interval '21 days'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', 'illegal_dumping', 'Back lane behind Main Boulevard, Gulberg II', 31.518920, 74.345080, now() - interval '12 days', 'Pile has grown, now blocking half the lane.', 'demo-c', false, true, now() - interval '12 days'),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111102', 'illegal_dumping', 'Back lane behind Main Boulevard, Gulberg II', 31.518880, 74.345120, now() - interval '8 days', 'Cleared for two days but new dumping appeared today. Recurring.', 'demo-a', false, true, now() - interval '8 days'),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111103', 'missing_damaged_bin', 'Bus stop near Liberty Chowk', 31.519800, 74.348200, now() - interval '30 days', 'The public bin at this bus stop is missing entirely.', 'demo-b', false, true, now() - interval '30 days'),
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111103', 'missing_damaged_bin', 'Bus stop near Liberty Chowk', 31.519790, 74.348210, now() - interval '10 days', 'A new bin has been installed and the area looks clean today.', 'demo-c', true, true, now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

-- Demo confirmations
INSERT INTO confirmations (hotspot_id, identity, created_at) VALUES
  ('11111111-1111-1111-1111-111111111101', 'demo-b', now() - interval '6 days'),
  ('11111111-1111-1111-1111-111111111101', 'demo-c', now() - interval '5 days'),
  ('11111111-1111-1111-1111-111111111102', 'demo-c', now() - interval '12 days')
ON CONFLICT (hotspot_id, identity) DO NOTHING;

-- Demo activity events (append-only timeline)
INSERT INTO activity_events (hotspot_id, event_type, from_status, to_status, detail, created_at) VALUES
  ('11111111-1111-1111-1111-111111111101', 'report_added', null, 'reported', 'First observation logged.', now() - interval '14 days'),
  ('11111111-1111-1111-1111-111111111101', 'report_added', null, 'reported', 'Second observation added.', now() - interval '6 days'),
  ('11111111-1111-1111-1111-111111111101', 'confirmation_added', null, 'corroborated', 'Community confirmation received.', now() - interval '6 days'),
  ('11111111-1111-1111-1111-111111111101', 'status_changed', 'reported', 'corroborated', 'Status updated after multiple confirmations.', now() - interval '5 days'),
  ('11111111-1111-1111-1111-111111111102', 'report_added', null, 'reported', 'First observation logged.', now() - interval '21 days'),
  ('11111111-1111-1111-1111-111111111102', 'report_added', null, 'reported', 'Second observation added.', now() - interval '12 days'),
  ('11111111-1111-1111-1111-111111111102', 'cleanup_observed', null, 'cleanup_observed', 'Lane cleared briefly.', now() - interval '10 days'),
  ('11111111-1111-1111-1111-111111111102', 'report_added', null, 'recurring', 'New dumping observed after cleanup.', now() - interval '8 days'),
  ('11111111-1111-1111-1111-111111111102', 'status_changed', 'cleanup_observed', 'recurring', 'Recurrence detected after a new same-category report.', now() - interval '8 days'),
  ('11111111-1111-1111-1111-111111111103', 'report_added', null, 'reported', 'First observation logged.', now() - interval '30 days'),
  ('11111111-1111-1111-1111-111111111103', 'cleanup_observed', null, 'cleanup_observed', 'New bin installed, area clean.', now() - interval '10 days'),
  ('11111111-1111-1111-1111-111111111103', 'status_changed', 'reported', 'cleanup_observed', 'Cleanup confirmed with dated evidence.', now() - interval '10 days');
