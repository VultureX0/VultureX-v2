import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-sm font-semibold mb-8">VultureX</Link>
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-7">
        {children}
      </div>
    </div>
  );
}
