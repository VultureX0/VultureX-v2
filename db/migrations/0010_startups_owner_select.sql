-- The roadmap owner policies check startup ownership with an EXISTS subquery.
-- The company database has RLS enabled on startups (from its original Supabase
-- baseline) but no startups policy, so that subquery sees zero rows for the
-- authenticated role. This policy exposes only the caller's own startup row:
-- SELECT only, no public/unowned rows, and no INSERT/UPDATE/DELETE access.
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS "startups_owner_select" ON public.startups;
--> statement-breakpoint
CREATE POLICY "startups_owner_select" ON public.startups
  FOR SELECT
  USING (user_id = public.vx_current_user_id());
