/**
 * Admin provisioning — the ONLY way an admin account is created.
 *
 * Admin access is never grantable from the app: the signup API rejects the
 * "admin" role, and there is no UI path that can set it. An operator runs:
 *
 *   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='...' npm run db:seed:admin
 *
 * Idempotent: re-running promotes/updates the same account (password rotation
 * and "re-promote an existing user" both work).
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { users } from "./schema";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Add it to .env before seeding.");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL ?? "asmita.gupta008@gmail.com")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "vulturex";

  if (password.length < 6) {
    console.error("ADMIN_PASSWORD must be at least 6 characters.");
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false, max: 1 });
  const db = drizzle(client);

  const passwordHash = await hash(password, 12);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ role: "admin", passwordHash, emailVerified: true })
      .where(eq(users.id, existing.id));
    console.log(`✓ Existing account promoted to admin: ${email}`);
  } else {
    await db.insert(users).values({
      email,
      name: "Vulture X Admin",
      passwordHash,
      role: "admin",
      emailVerified: true,
    });
    console.log(`✓ Admin account created: ${email}`);
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      "⚠ Using the default password from the brief. Set ADMIN_PASSWORD to rotate it.",
    );
  }

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Admin seed failed:", err);
  process.exit(1);
});
