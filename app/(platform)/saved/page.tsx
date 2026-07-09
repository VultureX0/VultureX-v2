import { auth } from "@/features/auth";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { SavedClient } from "./saved-client";

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <SavedClient />;
}
