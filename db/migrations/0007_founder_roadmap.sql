CREATE TABLE "roadmap_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_date" timestamp with time zone,
	"status" text DEFAULT 'planned' NOT NULL,
	"achieved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_milestone_title_length" CHECK (char_length("roadmap_milestones"."title") between 1 and 160),
	CONSTRAINT "roadmap_milestone_description_length" CHECK ("roadmap_milestones"."description" is null or char_length("roadmap_milestones"."description") <= 1000)
);
--> statement-breakpoint
CREATE TABLE "roadmap_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"task_key" text NOT NULL,
	"stage" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'General' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"source" text DEFAULT 'template' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_task_title_length" CHECK (char_length("roadmap_tasks"."title") between 1 and 160),
	CONSTRAINT "roadmap_task_description_length" CHECK ("roadmap_tasks"."description" is null or char_length("roadmap_tasks"."description") <= 1000)
);
--> statement-breakpoint
ALTER TABLE "roadmap_milestones" ADD CONSTRAINT "roadmap_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_milestones" ADD CONSTRAINT "roadmap_milestones_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_tasks" ADD CONSTRAINT "roadmap_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_tasks" ADD CONSTRAINT "roadmap_tasks_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_roadmap_milestones_startup" ON "roadmap_milestones" USING btree ("startup_id","status","target_date");--> statement-breakpoint
CREATE INDEX "idx_roadmap_milestones_user" ON "roadmap_milestones" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_roadmap_task" ON "roadmap_tasks" USING btree ("startup_id","task_key");--> statement-breakpoint
CREATE INDEX "idx_roadmap_tasks_startup_status" ON "roadmap_tasks" USING btree ("startup_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_roadmap_tasks_user" ON "roadmap_tasks" USING btree ("user_id");
--> statement-breakpoint
-- RLS helper for roadmap rows. It resolves the account from (in order) the
-- Supabase/PostgREST JWT claim, the JWT claims JSON, or an explicit local job
-- setting. Missing settings resolve to NULL, which denies access.
CREATE OR REPLACE FUNCTION public.vx_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid,
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid,
    NULLIF(current_setting('app.user_id', true), '')::uuid
  );
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.vx_current_user_id() TO PUBLIC;
--> statement-breakpoint
ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "roadmap_tasks_owner_all" ON public.roadmap_tasks
  FOR ALL
  USING (
    user_id = public.vx_current_user_id()
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = roadmap_tasks.startup_id
        AND s.user_id = public.vx_current_user_id()
    )
  )
  WITH CHECK (
    user_id = public.vx_current_user_id()
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = roadmap_tasks.startup_id
        AND s.user_id = public.vx_current_user_id()
    )
  );
--> statement-breakpoint
ALTER TABLE public.roadmap_milestones ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "roadmap_milestones_owner_all" ON public.roadmap_milestones
  FOR ALL
  USING (
    user_id = public.vx_current_user_id()
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = roadmap_milestones.startup_id
        AND s.user_id = public.vx_current_user_id()
    )
  )
  WITH CHECK (
    user_id = public.vx_current_user_id()
    AND EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = roadmap_milestones.startup_id
        AND s.user_id = public.vx_current_user_id()
    )
  );