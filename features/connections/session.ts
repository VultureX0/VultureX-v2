import { auth } from "@/features/auth";

export type SessionUser = { id: string; role: "startup" | "investor" | "admin" };

/** Reads the NextAuth session; role is only used for UI hints. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: string }).role;
  return {
    id: session.user.id,
    role: role === "investor" || role === "admin" ? role : "startup",
  };
}
