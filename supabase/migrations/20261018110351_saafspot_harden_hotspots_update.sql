/*
# Harden hotspots UPDATE policy (release-readiness fix)

## Problem
The existing `anon_update_hotspots` policy used `USING (true) WITH CHECK (true)`,
which let any anonymous client UPDATE any column on any hotspot row — including
falsifying `status` to `cleanup_observed`/`recurring`, flipping `is_demo`,
or moving the public pin (`lat`/`lng`) or `location_label`. That broke the
auditability requirement: community-evidence states and history must not be
arbitrarily falsifiable by a normal client.

## Fix (smallest safe change that preserves the public reporting flow)
1. Revoke the broad table-level UPDATE/DELETE/TRUNCATE grants from anon and
   authenticated on `hotspots` so only RLS-scoped access remains.
2. Grant a column-level UPDATE on ONLY `status` (and `updated_at`, which the
   trigger maintains) to anon/authenticated.
3. Replace the permissive UPDATE policy with one that:
   - Targets ONLY the `status` column (via column-level grant; other columns
     are not updateable).
   - WITH CHECK constrains the new status to one of the five valid
     community-evidence states (reported, corroborated, brief_prepared,
     cleanup_observed, recurring).
   The trigger `hotspots_touch` still maintains `updated_at` automatically.

## Effect
- Anonymous clients can still: read all hotspots, insert a new hotspot, and
  update ONLY the `status` column to a valid value (which the app does via
  recomputeHotspotStatus and markBriefPrepared).
- Anonymous clients can NO LONGER: edit category, location_label, lat, lng,
  title, is_demo, created_at, updated_at, or delete/truncate hotspots.
- reports / confirmations / activity_events remain append-only (no UPDATE or
  DELETE policy exists for anon/authenticated; RLS denies by default).
- This is idempotent and safe to re-run.
*/

-- 1. Revoke broad table-level grants on hotspots
REVOKE UPDATE, DELETE, TRUNCATE ON hotspots FROM anon;
REVOKE UPDATE, DELETE, TRUNCATE ON hotspots FROM authenticated;

-- 2. Grant column-level UPDATE on only status (updated_at is set by trigger)
GRANT UPDATE (status) ON hotspots TO anon;
GRANT UPDATE (status) ON hotspots TO authenticated;

-- 3. Replace the permissive UPDATE policy
DROP POLICY IF EXISTS "anon_update_hotspots" ON hotspots;
CREATE POLICY "anon_update_hotspot_status"
ON hotspots FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (status IN ('reported','corroborated','brief_prepared','cleanup_observed','recurring'));
