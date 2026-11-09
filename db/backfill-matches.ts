/**
 * Recompute business-matchmaking recommendations.
 *
 *   npm run matches:backfill                  # every public startup
 *   npm run matches:backfill -- --startup=<id>  # one startup (pairs it touches)
 *
 * Safe to run repeatedly: recommendations are upserted per pair and
 * notifications are deduplicated by (recipient, type, dedupe_key).
 */
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

function arg(name: string): string | null {
  const prefix = `--${name}=`;
  const match = process.argv.find((entry) => entry.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

async function main() {
  const startupId = arg("startup");
  const { recalculateAllMatches, recalculateMatchesForStartup } = await import(
    "@/features/matchmaking"
  );

  if (startupId) {
    const result = await recalculateMatchesForStartup(startupId);
    console.log("Matchmaking recalculation for", startupId);
    console.log(result);
    return;
  }

  const result = await recalculateAllMatches();
  console.log(`Matchmaking recalculation across ${result.startups} public startups`);
  console.log(result.results);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Matchmaking backfill failed:", error);
    process.exit(1);
  });
