CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_startup_bookmark" ON "bookmarks" USING btree ("user_id","startup_id");
