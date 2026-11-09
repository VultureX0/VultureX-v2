CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_at" timestamp with time zone NOT NULL,
	"has_time" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"roadmap_task_id" uuid,
	"saved_resource_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reminder_title_length" CHECK (char_length("reminders"."title") between 1 and 160),
	CONSTRAINT "reminder_description_length" CHECK ("reminders"."description" is null or char_length("reminders"."description") <= 1000)
);
--> statement-breakpoint
CREATE TABLE "saved_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resource_key" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"href" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_resource_title_length" CHECK (char_length("saved_resources"."title") between 1 and 160),
	CONSTRAINT "saved_resource_key_length" CHECK (char_length("saved_resources"."resource_key") between 1 and 2048),
	CONSTRAINT "saved_resource_description_length" CHECK ("saved_resources"."description" is null or char_length("saved_resources"."description") <= 1000)
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "reminder_id" uuid;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_roadmap_task_id_roadmap_tasks_id_fk" FOREIGN KEY ("roadmap_task_id") REFERENCES "public"."roadmap_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_saved_resource_id_saved_resources_id_fk" FOREIGN KEY ("saved_resource_id") REFERENCES "public"."saved_resources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_resources" ADD CONSTRAINT "saved_resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reminders_user_due" ON "reminders" USING btree ("user_id","completed_at","due_at");--> statement-breakpoint
CREATE INDEX "idx_reminders_roadmap_task" ON "reminders" USING btree ("user_id","roadmap_task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_saved_resource" ON "saved_resources" USING btree ("user_id","resource_key");--> statement-breakpoint
CREATE INDEX "idx_saved_resources_user" ON "saved_resources" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_saved_resources_category" ON "saved_resources" USING btree ("user_id","category");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_reminder_id_reminders_id_fk" FOREIGN KEY ("reminder_id") REFERENCES "public"."reminders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_notifications_reminder" ON "notifications" USING btree ("reminder_id");
--> statement-breakpoint
-- Owner-only access for the two new user-specific tables. The helper is
-- created by migration 0007 and resolves Supabase JWT claims or app.user_id.
ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "saved_resources_owner_all" ON public.saved_resources
  FOR ALL
  USING (user_id = public.vx_current_user_id())
  WITH CHECK (user_id = public.vx_current_user_id());
--> statement-breakpoint
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "reminders_owner_all" ON public.reminders
  FOR ALL
  USING (user_id = public.vx_current_user_id())
  WITH CHECK (user_id = public.vx_current_user_id());