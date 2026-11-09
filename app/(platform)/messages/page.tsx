import { auth } from "@/features/auth";
import { redirect } from "next/navigation";
import { listConversations } from "@/features/connections";
import { MessagesClient } from "./messages-client";

export const metadata = { title: "Messages" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { c } = await searchParams;
  const conversations = await listConversations(session.user.id);

  return (
    <MessagesClient
      initialConversations={conversations}
      initialSelectedId={c ?? null}
    />
  );
}
