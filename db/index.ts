import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Serverless: 1 connection per invocation, no prepare for pooled connections
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
