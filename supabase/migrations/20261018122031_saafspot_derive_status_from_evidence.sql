/*
# Derive hotspot status from recorded evidence (integrity patch)

## Problem
The previous hardening let anonymous clients UPDATE hotspots.status to any
valid value (including cleanup_observed / recurring) without any supporting
report or evidence. activity_events can also be inserted by any anonymous
client. Neither fact guarantees that statuses or events are truthful.

## Fix (smallest safe change that preserves public reporting)
1. REMOVE anonymous UPDATE on hotspots.status entirely.
2. DERIVE status from recorded observations via AFTER INSERT triggers on
   reports and confirmations. A SECURITY DEFINER function computes the
   status purely from the reports and confirmations tables:
     - cleanup_observed if a cleanup report exists and no later non-cleanup report
     - recurring       if a cleanup report exists AND a later non-cleanup report
     - corroborated    if >= 2 confirmations (and no cleanup/recurrence)
     - reported        otherwise
   brief_prepared is never set by this function.
3. brief_prepared via a NARROW SECURITY DEFINER function that only sets that
   one status and refuses to overwrite cleanup_observed/recurring.
4. activity_events remain client-insertible community-submitted evidence; UI
   and README describe them as community-submitted, not a tamper-proof log.

Idempotent: DROP IF EXISTS everywhere.
*/

-- ---------------------------------------------------------------------------
-- 1. Remove anonymous UPDATE on hotspots.status
-- ---------------------------------------------------------------------------
REVOKE UPDATE (status) ON hotspots FROM anon;
REVOKE UPDATE (status) ON hotspots FROM authenticated;

DROP POLICY IF EXISTS "anon_update_hotspot_status" ON hotspots;

-- ---------------------------------------------------------------------------
-- 2. Status recomputation function (SECURITY DEFINER, derived from evidence)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.saafspot_recompute_status(target_hotspot uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_status text;
  next_status text;
  has_cleanup boolean;
  last_cleanup_obs timestamptz;
  has_later_noncleanup boolean;
  conf_count integer;
BEGIN
  SELECT status INTO prev_status FROM hotspots WHERE id = target_hotspot;
  IF prev_status IS NULL THEN
    RETURN;
  END IF;

  -- Do not auto-overwrite a user-set brief_prepared state.
  IF prev_status = 'brief_prepared' THEN
    RETURN;
  END IF;

  SELECT
    bool_or(is_cleanup),
    max(observed_at) FILTER (WHERE is_cleanup)
  INTO has_cleanup, last_cleanup_obs
  FROM reports WHERE hotspot_id = target_hotspot;

  SELECT count(*) INTO conf_count
  FROM confirmations WHERE hotspot_id = target_hotspot;

  SELECT EXISTS (
    SELECT 1 FROM reports
    WHERE hotspot_id = target_hotspot
      AND is_cleanup = false
      AND last_cleanup_obs IS NOT NULL
      AND observed_at > last_cleanup_obs
  ) INTO has_later_noncleanup;

  IF has_cleanup AND has_later_noncleanup THEN
    next_status := 'recurring';
  ELSIF has_cleanup AND NOT has_later_noncleanup THEN
    next_status := 'cleanup_observed';
  ELSIF conf_count >= 2 THEN
    next_status := 'corroborated';
  ELSE
    next_status := 'reported';
  END IF;

  IF next_status IS DISTINCT FROM prev_status THEN
    UPDATE hotspots SET status = next_status WHERE id = target_hotspot;
    INSERT INTO activity_events (hotspot_id, event_type, from_status, to_status, detail)
    VALUES (
      target_hotspot,
      'status_changed',
      prev_status,
      next_status,
      CASE next_status
        WHEN 'recurring' THEN 'Recurrence detected after a new same-category report.'
        WHEN 'cleanup_observed' THEN 'Cleanup observation recorded with dated evidence.'
        WHEN 'corroborated' THEN 'Status updated after multiple community confirmations.'
        ELSE 'Status updated from recorded observations.'
      END
    );
  END IF;
END;
$$;

-- Thin trigger wrappers (triggers cannot pass NEW directly to a function).
CREATE OR REPLACE FUNCTION public.saafspot_recompute_on_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.saafspot_recompute_status(NEW.hotspot_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.saafspot_recompute_on_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.saafspot_recompute_status(NEW.hotspot_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reports_recompute_status ON reports;
CREATE TRIGGER reports_recompute_status
AFTER INSERT ON reports
FOR EACH ROW EXECUTE FUNCTION public.saafspot_recompute_on_report();

DROP TRIGGER IF EXISTS confirmations_recompute_status ON confirmations;
CREATE TRIGGER confirmations_recompute_status
AFTER INSERT ON confirmations
FOR EACH ROW EXECUTE FUNCTION public.saafspot_recompute_on_confirmation();

-- ---------------------------------------------------------------------------
-- 3. Narrow mark_brief_prepared function (one status only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_brief_prepared(target_hotspot uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_status text;
BEGIN
  SELECT status INTO prev_status FROM hotspots WHERE id = target_hotspot;
  IF prev_status IS NULL THEN
    RETURN;
  END IF;
  IF prev_status IN ('cleanup_observed', 'recurring', 'brief_prepared') THEN
    RETURN;
  END IF;
  UPDATE hotspots SET status = 'brief_prepared' WHERE id = target_hotspot;
  INSERT INTO activity_events (hotspot_id, event_type, from_status, to_status, detail)
  VALUES (target_hotspot, 'brief_prepared', prev_status, 'brief_prepared', 'Action brief prepared by a community member.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_brief_prepared(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Backfill: recompute status for all existing hotspots from current evidence
-- ---------------------------------------------------------------------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM hotspots LOOP
    PERFORM public.saafspot_recompute_status(r.id);
  END LOOP;
END $$;
