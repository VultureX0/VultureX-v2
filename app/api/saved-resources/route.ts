import { NextResponse } from "next/server";
import { auth } from "@/features/auth";
import {
  listSavedResources,
  removeSavedResource,
  saveResource,
  SavedResourceError,
} from "@/features/saved-resources";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resources = await listSavedResources(session.user.id);
    return NextResponse.json({ resources }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Failed to load saved resources:", error);
    return NextResponse.json({ error: "Failed to load saved resources" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const key =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as { key?: unknown }).key
        : undefined;
    const result = await saveResource(session.user.id, key);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof SavedResourceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to save resource:", error);
    return NextResponse.json({ error: "Failed to save resource" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const key = new URL(request.url).searchParams.get("key");
    const result = await removeSavedResource(session.user.id, key);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SavedResourceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to remove saved resource:", error);
    return NextResponse.json({ error: "Failed to remove resource" }, { status: 500 });
  }
}
