import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="text-sm font-semibold mb-8">VultureX</Link>
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-7">
        {children}
      </div>
    </div>
  );
}
