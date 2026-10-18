/*
# Harden trigger function search_path

Sets an explicit, immutable search_path on the saafspot_touch_updated_at()
trigger function to satisfy the database linter's
function_search_path_mutable check. No behaviour change.
*/

CREATE OR REPLACE FUNCTION public.saafspot_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
