import { NextResponse } from "next/server";
import { auth } from "@/features/auth";
import {
  FounderProfileValidationError,
  getFounderProfile,
  normalizeFounderProfileInput,
  saveFounderProfile,
} from "@/features/founder-profile";

export const dynamic = "force-dynamic";

// The owner is always the authenticated account, never a request parameter.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getFounderProfile(session.user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to load founder profile:", error);
    return NextResponse.json({ error: "Failed to load founder profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const input = normalizeFounderProfileInput(body);
    const markComplete =
      Boolean(body) &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      (body as { onboardingComplete?: unknown }).onboardingComplete === true;

    const profile = await saveFounderProfile(session.user.id, input, markComplete);
    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof FounderProfileValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to save founder profile:", error);
    return NextResponse.json({ error: "Failed to save founder profile" }, { status: 500 });
  }
}
