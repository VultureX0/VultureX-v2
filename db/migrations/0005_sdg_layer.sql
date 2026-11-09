CREATE TABLE "impact_verification_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"claim_id" uuid,
	"action" text NOT NULL,
	"actor_user_id" uuid,
	"actor_role" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_impact_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"impact_description" text NOT NULL,
	"sdg_goals" integer[] DEFAULT '{}' NOT NULL,
	"sdg_primary" integer,
	"claim_signature" text NOT NULL,
	"review_note" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "startup_impact_claims_startup_id_unique" UNIQUE("startup_id"),
	CONSTRAINT "impact_claim_description_length" CHECK (char_length("startup_impact_claims"."impact_description") between 40 and 4000)
);
--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "sdg_primary" integer;--> statement-breakpoint
ALTER TABLE "investors" ADD COLUMN "sdg_preferences" integer[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "sdg_goals" integer[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "sdg_primary" integer;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "impact_description" text;--> statement-breakpoint
ALTER TABLE "impact_verification_events" ADD CONSTRAINT "impact_verification_events_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_verification_events" ADD CONSTRAINT "impact_verification_events_claim_id_startup_impact_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."startup_impact_claims"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_verification_events" ADD CONSTRAINT "impact_verification_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_impact_claims" ADD CONSTRAINT "startup_impact_claims_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startup_impact_claims" ADD CONSTRAINT "startup_impact_claims_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_impact_events_startup" ON "impact_verification_events" USING btree ("startup_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_impact_claim_status" ON "startup_impact_claims" USING btree ("status","submitted_at");