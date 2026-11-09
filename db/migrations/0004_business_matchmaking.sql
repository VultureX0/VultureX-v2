CREATE TABLE "recommendation_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"target_startup_id" uuid NOT NULL,
	"dismissed_at" timestamp with time zone,
	"saved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_a_id" uuid NOT NULL,
	"startup_b_id" uuid NOT NULL,
	"pair_key" text NOT NULL,
	"score" numeric(5, 2) NOT NULL,
	"strength" text NOT NULL,
	"relationship_type" text NOT NULL,
	"reasons" jsonb DEFAULT '{"aToB":[],"bToA":[]}'::jsonb NOT NULL,
	"signals_hash" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recommendation_score_range" CHECK ("startup_recommendations"."score" >= 0 and "startup_recommendations"."score" <= 100),
	CONSTRAINT "recommendation_pair_ordered" CHECK ("startup_recommendations"."startup_a_id" < "startup_recommendations"."startup_b_id")
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "dedupe_key" text;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "offerings" text[];--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "needs" text[];--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "target_customers" text[];--> statement-breakpoint
ALTER TABLE "recommendation_states" ADD CONSTRAINT "recommendation_states_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_states" ADD CONSTRAINT "recommendation_states_target_startup_id_startups_id_fk" FOREIGN KEY ("target_startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_recommendations" ADD CONSTRAINT "startup_recommendations_startup_a_id_startups_id_fk" FOREIGN KEY ("startup_a_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_recommendations" ADD CONSTRAINT "startup_recommendations_startup_b_id_startups_id_fk" FOREIGN KEY ("startup_b_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_recommendation_state_pair" ON "recommendation_states" USING btree ("startup_id","target_startup_id");--> statement-breakpoint
CREATE INDEX "idx_recommendation_state_startup" ON "recommendation_states" USING btree ("startup_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_recommendation_pair" ON "startup_recommendations" USING btree ("pair_key");--> statement-breakpoint
CREATE INDEX "idx_recommendation_a" ON "startup_recommendations" USING btree ("startup_a_id","status");--> statement-breakpoint
CREATE INDEX "idx_recommendation_b" ON "startup_recommendations" USING btree ("startup_b_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_notification_dedupe_key" ON "notifications" USING btree ("recipient_user_id","type","dedupe_key") WHERE "notifications"."dedupe_key" is not null;--> statement-breakpoint
-- Same defence-in-depth as 0003: VultureX authorizes in the server layer
-- (NextAuth + Drizzle over the privileged database role). RLS with no policies
-- stops the anon/authenticated PostgREST roles from reading recommendation
-- scores, explanations or another startup's dismiss/save state. The owner role
-- used by DATABASE_URL bypasses RLS, so the application is unaffected.
ALTER TABLE "startup_recommendations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "recommendation_states" ENABLE ROW LEVEL SECURITY;