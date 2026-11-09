import { NextResponse } from "next/server";
import { createCustomTask, normalizeCreateTaskInput, RoadmapValidationError } from "@/features/roadmap";
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
    const input = normalizeCreateTaskInput(body);
    const task = await createCustomTask(context.userId, context.startup, input);
    revalidateRoadmap();
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof RoadmapValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create roadmap task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
