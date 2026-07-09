import { auth } from "@/features/auth";
import { redirect } from "next/navigation";
import { InterestsClient } from "./interests-client";

export default async function InterestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  return <InterestsClient role={role || "investor"} />;
}
