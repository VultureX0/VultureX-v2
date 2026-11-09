import { NextResponse } from "next/server";
import {
  normalizeUpdateMilestoneInput,
  RoadmapValidationError,
  updateMilestone,
} from "@/features/roadmap";
import { revalidateRoadmap } from "@/features/roadmap/revalidate";
import { roadmapRequestContext } from "@/features/roadmap/request";
import { isUuid } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await roadmapRequestContext();
  if ("error" in context) return context.error;

  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid milestone id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const input = normalizeUpdateMilestoneInput(body);
    const milestone = await updateMilestone(context.userId, id, input);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    revalidateRoadmap();
    return NextResponse.json({ milestone });
  } catch (error) {
    if (error instanceof RoadmapValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to update roadmap milestone:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}
