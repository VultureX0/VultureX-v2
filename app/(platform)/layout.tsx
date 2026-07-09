import { auth } from "@/features/auth";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role as "startup" | "investor" | undefined;

  if (!session?.user) {
    return (
      <>
        <Navbar />
        <main className="pt-12 min-h-screen">
          <div className="max-w-5xl mx-auto px-6 py-10">
            {children}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role || "startup"} />
      <main className="flex-1 px-6 md:px-10 py-8 overflow-auto">{children}</main>
    </div>
  );
}
