import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { Breadcrumbs } from "@/components/knowledge-hub/Breadcrumbs";
import { SectionCard } from "@/components/knowledge-hub/SectionCard";
import {
  HUB_SECTIONS,
  QUICK_ACCESS,
  searchHub,
  type HubSearchEntry,
} from "@/lib/knowledge-hub";

export const metadata: Metadata = {
  title: "Search the Knowledge Hub",
  description: "Search guides, industry playbooks, funding topics, tools and startup themes.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function HubSearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let results: HubSearchEntry[] = [];
  let failed = false;

  if (query) {
    try {
      results = searchHub(query);
    } catch {
      failed = true;
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Breadcrumbs
          items={[{ label: "Knowledge Hub", href: "/knowledge-hub" }, { label: "Search" }]}
        />

        <header>
          <p className="vx-label">Search</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {query ? `Results for “${query}”` : "Search the Knowledge Hub"}
          </h1>
          <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
            {query
              ? "Results come from the hub’s own guides, industry outlines and directory entries."
              : "Find a guide, an industry outline, a funding topic or a directory entry. Use the search field above."}
          </p>
        </header>
      </div>

      {failed ? (
        <div role="alert" className="vx-card border-[var(--red)]/40 p-4">
          <p className="text-sm font-medium text-[var(--text)]">Search is unavailable right now</p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            Nothing was lost. Try the search again, or browse the destinations below.
          </p>
        </div>
      ) : !query ? (
        <section aria-labelledby="browse-heading" className="space-y-3">
          <h2 id="browse-heading" className="text-sm font-semibold tracking-tight">
            Start from a destination
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {HUB_SECTIONS.slice(0, 6).map((section) => (
              <SectionCard key={section.slug} section={section} />
            ))}
          </div>
        </section>
      ) : results.length === 0 ? (
        <div className="vx-card p-6 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
            <SearchX size={18} aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-medium">No matches for “{query}”</p>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-[var(--text-muted)]">
            Try a broader term such as “funding”, “food” or “customers”, or start from one of
            these destinations.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {QUICK_ACCESS.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            href="/knowledge-hub/search"
            className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
          >
            Clear search
          </Link>
        </div>
      ) : (
        <>
          <p role="status" className="vx-label">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>

          <ul className="space-y-2">
            {results.map((entry) => (
              <li key={`${entry.href}-${entry.title}`}>
                <Link
                  href={entry.href}
                  className="group block rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-card)] p-3.5 transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="vx-label text-[var(--accent)]">{entry.kind}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {entry.sectionTitle}
                    </span>
                    {entry.planned && (
                      <span className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">
                        Planned — not available yet
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
                    {entry.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-[var(--text-muted)]">
                    {entry.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-[var(--border)] pt-4">
            <Link
              href="/knowledge-hub"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              Back to the Knowledge Hub
              <ArrowRight size={11} aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
