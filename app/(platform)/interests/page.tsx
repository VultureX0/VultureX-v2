import { auth } from "@/features/auth";
import { redirect } from "next/navigation";
import { InterestsClient } from "./interests-client";

export const metadata = { title: "Interest+" };

export default async function InterestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  const { tab } = await searchParams;
  return <InterestsClient role={role || "investor"} initialTab={tab} />;
}
