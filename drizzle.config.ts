import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Match Next.js precedence: .env.local overrides .env. Without this, the CLI
// could not see a DATABASE_URL that only exists in .env.local.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
