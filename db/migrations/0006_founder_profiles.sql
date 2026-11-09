CREATE TABLE "founder_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"location" text,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"current_objective" text,
	"challenges" text[] DEFAULT '{}' NOT NULL,
	"guidance_areas" text[] DEFAULT '{}' NOT NULL,
	"priorities" text[] DEFAULT '{}' NOT NULL,
	"learning_interests" text[] DEFAULT '{}' NOT NULL,
	"funding_interest" text,
	"marketing_needs" text[] DEFAULT '{}' NOT NULL,
	"collaboration_interests" text[] DEFAULT '{}' NOT NULL,
	"recommendation_types" text[] DEFAULT '{"roadmap","resources","opportunities"}' NOT NULL,
	"reminder_preferences" jsonb DEFAULT '{"inApp":true,"email":false,"taskDue":true,"milestones":true,"clinics":true}'::jsonb NOT NULL,
	"profile_visibility" boolean DEFAULT true NOT NULL,
	"collaboration_visibility" text DEFAULT 'private' NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "founder_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "founder_profiles" ADD CONSTRAINT "founder_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;