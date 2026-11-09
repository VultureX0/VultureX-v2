import { NextResponse } from "next/server";
import {
  errorPayload,
  getSessionUser,
  respondToRequest,
  withdrawRequest,
} from "@/features/connections";

// PATCH /api/connections/:id { action: "accept" | "reject" | "withdraw" }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action;

    if (action === "accept" || action === "reject") {
      const result = await respondToRequest(user.id, id, action);
      return NextResponse.json(result);
    }

    if (action === "withdraw") {
      const result = await withdrawRequest(user.id, id);
      return NextResponse.json({ request: result, status: "withdrawn" });
    }

    return NextResponse.json(
      { error: "action must be accept, reject or withdraw", code: "INVALID_ACTION" },
      { status: 400 }
    );
  } catch (error) {
    const { status, body } = errorPayload(error);
    return NextResponse.json(body, { status });
  }
}
