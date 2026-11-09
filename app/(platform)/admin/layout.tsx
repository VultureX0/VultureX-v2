import { redirect } from "next/navigation";
import { auth } from "@/features/auth";

/**
 * Server-side RBAC guard for every /admin route. Middleware only checks that a
 * session exists; the role check happens here on the server, so editing URLs or
 * frontend state cannot grant admin access.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") redirect("/dashboard");

  return <>{children}</>;
}
