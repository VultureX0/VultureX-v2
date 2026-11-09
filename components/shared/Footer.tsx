import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-[var(--text-muted)]">&copy; {new Date().getFullYear()} VultureX</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-5">
          <Link href="/knowledge-hub" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Knowledge Hub</Link>
          <Link href="/knowledge-hub/for-you" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">For You</Link>
          <Link href="/explore" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Explore</Link>
          <Link href="/rankings" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Rankings</Link>
          <Link href="/signup" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">Get started</Link>
        </nav>
      </div>
    </footer>
  );
}
