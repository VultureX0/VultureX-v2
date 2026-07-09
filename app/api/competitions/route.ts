import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { competitions } from "@/db/schema";

export async function GET() {
  const results = await db
    .select()
    .from(competitions)
    .orderBy(desc(competitions.createdAt));

  return NextResponse.json(results);
}
