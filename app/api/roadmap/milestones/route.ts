import { NextResponse } from "next/server";
import {
  createMilestone,
  normalizeCreateMilestoneInput,
  RoadmapValidationError,
} from "@/features/roadmap";
import { revalidateRoadmap } from "@/features/roadmap/revalidate";
import { roadmapRequestContext } from "@/features/roadmap/request";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const context = await roadmapRequestContext();
  if ("error" in context) return context.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const input = normalizeCreateMilestoneInput(body);
    const milestone = await createMilestone(context.userId, context.startup.id, input);
    revalidateRoadmap();
    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    if (error instanceof RoadmapValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create roadmap milestone:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
