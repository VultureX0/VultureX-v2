import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// idle_timeout keeps connection alive between requests on serverless
// prepare: false required for Neon pooled connections
const client = postgres(connectionString, {
  prepare: false,
  idle_timeout: 20,
  max: 10,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
