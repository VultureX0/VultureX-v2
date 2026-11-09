CREATE TABLE "pitch_deck_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_role" text,
	"type" text NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pitch_deck_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"kind" text DEFAULT 'deck' NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"content" "bytea" NOT NULL,
	"uploaded_by" uuid,
	"is_published" boolean DEFAULT false NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now(),
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pitch_deck_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"kind" text DEFAULT 'new' NOT NULL,
	"previous_request_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'incomplete' NOT NULL,
	"current_batch" integer DEFAULT 1 NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb,
	"approved_summary" jsonb,
	"summary_changed_since_approval" boolean DEFAULT false NOT NULL,
	"admin_note" text,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"revision_requested_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pitch_deck_events" ADD CONSTRAINT "pitch_deck_events_request_id_pitch_deck_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."pitch_deck_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_deck_events" ADD CONSTRAINT "pitch_deck_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_deck_files" ADD CONSTRAINT "pitch_deck_files_request_id_pitch_deck_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."pitch_deck_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_deck_files" ADD CONSTRAINT "pitch_deck_files_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_deck_files" ADD CONSTRAINT "pitch_deck_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_deck_requests" ADD CONSTRAINT "pitch_deck_requests_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_deck_requests" ADD CONSTRAINT "pitch_deck_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_deck_requests" ADD CONSTRAINT "pitch_deck_requests_previous_request_id_pitch_deck_requests_id_fk" FOREIGN KEY ("previous_request_id") REFERENCES "public"."pitch_deck_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pde_request" ON "pitch_deck_events" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_pdf_request" ON "pitch_deck_files" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_pdf_startup" ON "pitch_deck_files" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_pdr_startup" ON "pitch_deck_requests" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "idx_pdr_status" ON "pitch_deck_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pdr_previous" ON "pitch_deck_requests" USING btree ("previous_request_id");