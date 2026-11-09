import { NextResponse } from "next/server";
import { addStageTasks } from "@/features/roadmap";
import { revalidateRoadmap } from "@/features/roadmap/revalidate";
import { roadmapRequestContext } from "@/features/roadmap/request";

export const dynamic = "force-dynamic";

/** Builds (or tops up) the roadmap for the startup's saved stage. Idempotent. */
export async function POST() {
  const context = await roadmapRequestContext();
  if ("error" in context) return context.error;

  try {
    const result = await addStageTasks(context.userId, context.startup);
    revalidateRoadmap();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to build roadmap:", error);
    return NextResponse.json({ error: "Failed to build roadmap" }, { status: 500 });
  }
}
