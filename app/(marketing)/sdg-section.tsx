import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { SDG_GOALS, sdgColor } from "@/features/sdg/taxonomy";

/**
 * Homepage introduction to the SDG layer. Deliberately contains no platform
 * statistics, verified-startup counts or claimed outcomes - only the official
 * taxonomy and links into the existing Explore / Rankings views.
 */
export function SdgSection() {
  return (
    <section className="px-6 py-20 md:py-24 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Globe2 size={13} className="text-[var(--accent)]" />
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Impact
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold mb-3">
          Discover startups building for the Global Goals
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Founders can align their startup with the 17 United Nations Sustainable
          Development Goals. Investors can follow the goals they care about, and
          Explore and Rankings can be filtered by any of them.
        </p>
        <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed mt-2">
          Selecting a goal is self-declared alignment. A startup only shows a
          verified impact badge after a VultureX review of its submitted claim,
          and verification does not imply that a goal has been achieved.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 mt-7">
          {SDG_GOALS.map((goal) => (
            <Link
              key={goal.id}
              href={`/explore?sdg=${goal.id}`}
              className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <span
                aria-hidden
                className="w-4 h-4 shrink-0 rounded-[3px] text-[9px] font-bold text-[var(--accent-foreground)] flex items-center justify-center tabular-nums"
                style={{ backgroundColor: sdgColor(goal.id) }}
              >
                {goal.id}
              </span>
              <span className="leading-tight">{goal.shortName}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Explore startups by goal <ArrowRight size={12} />
          </Link>
          <Link
            href="/rankings"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            View SDG rankings
          </Link>
        </div>
      </div>
    </section>
  );
}
