CREATE TABLE "competition_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"submitted_by_user_id" uuid,
	"status" text DEFAULT 'submitted' NOT NULL,
	"cover_note" text,
	"snapshot" jsonb,
	"weighted_score" numeric(5, 2),
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	CONSTRAINT "competition_cover_note_length" CHECK ("competition_applications"."cover_note" is null or char_length("competition_applications"."cover_note") <= 2000)
);
--> statement-breakpoint
CREATE TABLE "competition_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"evaluator_user_id" uuid NOT NULL,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"weighted_score" numeric(5, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competition_evaluation_score_range" CHECK ("competition_evaluations"."weighted_score" is null or ("competition_evaluations"."weighted_score" >= 0 and "competition_evaluations"."weighted_score" <= 100))
);
--> statement-breakpoint
CREATE TABLE "competition_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"actor_role" text,
	"type" text NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competition_winners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"application_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"placement" integer DEFAULT 1 NOT NULL,
	"award_label" text,
	"prize_note" text,
	"status" text DEFAULT 'proposed' NOT NULL,
	"proposed_by_user_id" uuid,
	"proposed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_by_user_id" uuid,
	"reviewed_at" timestamp with time zone,
	"admin_note" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competition_placement_positive" CHECK ("competition_winners"."placement" >= 1)
);
--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "deadline" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
-- Preserve pre-existing rows: the legacy column allowed NULL, the new model
-- does not. Nothing is deleted; NULL rows simply leave the public feed.
UPDATE "competitions" SET "status" = 'completed' WHERE "status" IS NULL;--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "full_description" text;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "prize_amount" integer;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "prize_currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "benefits" jsonb DEFAULT '{"mentorship":false,"incubation":false,"pilotPartnership":false,"investorVisibility":false,"other":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "open_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "evaluation_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "winner_announcement_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "completion_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "host_investor_id" uuid;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "host_organization" text;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "eligibility" jsonb DEFAULT '{"allStages":true,"stages":[],"sectors":[],"minMrr":null,"maxMrr":null,"regions":[],"requirements":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "criteria" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "sdg_goals" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "rules" text;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "reviewed_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "admin_feedback" text;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "winner_announcement_status" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "winner_announcement_approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "winner_announcement_approved_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "competition_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "application_id" uuid;--> statement-breakpoint
ALTER TABLE "competition_applications" ADD CONSTRAINT "competition_applications_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_applications" ADD CONSTRAINT "competition_applications_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_applications" ADD CONSTRAINT "competition_applications_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_evaluations" ADD CONSTRAINT "competition_evaluations_application_id_competition_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."competition_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_evaluations" ADD CONSTRAINT "competition_evaluations_evaluator_user_id_users_id_fk" FOREIGN KEY ("evaluator_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_events" ADD CONSTRAINT "competition_events_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_events" ADD CONSTRAINT "competition_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_winners" ADD CONSTRAINT "competition_winners_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_winners" ADD CONSTRAINT "competition_winners_application_id_competition_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."competition_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_winners" ADD CONSTRAINT "competition_winners_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_winners" ADD CONSTRAINT "competition_winners_proposed_by_user_id_users_id_fk" FOREIGN KEY ("proposed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_winners" ADD CONSTRAINT "competition_winners_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_competition_application" ON "competition_applications" USING btree ("competition_id","startup_id");--> statement-breakpoint
CREATE INDEX "idx_ca_competition_status" ON "competition_applications" USING btree ("competition_id","status");--> statement-breakpoint
CREATE INDEX "idx_ca_startup" ON "competition_applications" USING btree ("startup_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_application_evaluator" ON "competition_evaluations" USING btree ("application_id","evaluator_user_id");--> statement-breakpoint
CREATE INDEX "idx_ce_application" ON "competition_evaluations" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "idx_cpe_competition" ON "competition_events" USING btree ("competition_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_competition_placement" ON "competition_winners" USING btree ("competition_id","placement");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_competition_winner_startup" ON "competition_winners" USING btree ("competition_id","startup_id");--> statement-breakpoint
CREATE INDEX "idx_cw_competition" ON "competition_winners" USING btree ("competition_id","status");--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_host_investor_id_investors_id_fk" FOREIGN KEY ("host_investor_id") REFERENCES "public"."investors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_winner_announcement_approved_by_user_id_users_id_fk" FOREIGN KEY ("winner_announcement_approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_application_id_competition_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."competition_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_competitions_host" ON "competitions" USING btree ("host_investor_id");--> statement-breakpoint
CREATE INDEX "idx_competitions_status" ON "competitions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_competitions_published" ON "competitions" USING btree ("published_at","deadline");--> statement-breakpoint
CREATE INDEX "idx_notifications_competition" ON "notifications" USING btree ("competition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_competition_publication_notification" ON "notifications" USING btree ("recipient_user_id","type","competition_id") WHERE "notifications"."type" = 'competition_published' and "notifications"."competition_id" is not null;--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_prize_amount_non_negative" CHECK ("competitions"."prize_amount" is null or "competitions"."prize_amount" >= 0);--> statement-breakpoint
-- Defence in depth for the new public-schema tables. VultureX authorizes access
-- in the server layer (NextAuth + Drizzle over the privileged database role),
-- never from the browser. Enabling RLS with no policies means the anon and
-- authenticated PostgREST roles cannot read applications, private evaluations,
-- unapproved winners, audit events or unpublished proposals even if the schema
-- is exposed. The owner role used by DATABASE_URL bypasses RLS, so the app is
-- unaffected.
ALTER TABLE "competition_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "competition_evaluations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "competition_winners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "competition_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "competitions" ENABLE ROW LEVEL SECURITY;
