import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { ResourceCard } from "@/components/knowledge-hub/ResourceCard";
import { SectionCard } from "@/components/knowledge-hub/SectionCard";
import {
  FEATURED_RESOURCES,
  HUB_DESTINATIONS,
  HUB_SECTIONS,
  QUICK_ACCESS,
  START_HERE,
} from "@/lib/knowledge-hub";

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description:
    "Learn the fundamentals, explore industries, plan funding, find tools and connect with founders building alongside you.",
};

export default function KnowledgeHubPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="vx-label">Knowledge Hub</p>
        <h1 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Everything you need to build a startup, in one place.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          Learn the fundamentals, explore how industries actually work, plan your funding,
          pick up the right tools and find founders who can build alongside you.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="/knowledge-hub/for-you"
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3.5 py-2 text-xs font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-fill-hover)]"
          >
            Open For You
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
          <Link
            href="#explore"
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)]"
          >
            Explore all 11 destinations
          </Link>
        </div>
      </header>

      <section aria-labelledby="featured-heading">
        <div className="mb-3">
          <p className="vx-label">Featured</p>
          <h2 id="featured-heading" className="mt-1 text-lg font-semibold tracking-tight">
            Featured resources
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            A curated set of hub topics to start from.
          </p>
        </div>

        {FEATURED_RESOURCES.length === 0 ? (
          <div className="vx-card p-6 text-center">
            <p className="text-sm font-medium">No featured resources yet</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Featured topics will appear here once they are published.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_RESOURCES.map((resource) => (
              <ResourceCard key={resource.title} {...resource} />
            ))}
          </div>
        )}
      </section>

      <section id="explore" aria-labelledby="explore-heading" className="scroll-mt-20">
        <div className="mb-3">
          <p className="vx-label">Directory</p>
          <h2 id="explore-heading" className="mt-1 text-lg font-semibold tracking-tight">
            Explore the Knowledge Hub
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Eleven destinations, each focused on one part of building a company.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HUB_DESTINATIONS.map((section) => (
            <SectionCard key={section.slug} section={section} />
          ))}
        </div>
      </section>

      <section aria-labelledby="quick-access-heading">
        <div className="mb-3">
          <p className="vx-label">Shortcuts</p>
          <h2 id="quick-access-heading" className="mt-1 text-lg font-semibold tracking-tight">
            Quick access
          </h2>
        </div>
        <ul className="flex flex-wrap gap-2">
          {QUICK_ACCESS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
              >
                {item.label}
                <ArrowRight size={10} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="start-here-heading">
        <div className="mb-3">
          <p className="vx-label">New here?</p>
          <h2 id="start-here-heading" className="mt-1 text-lg font-semibold tracking-tight">
            Start here
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            A suggested sequence, not a ranking.
          </p>
        </div>
        <ol className="vx-card divide-y divide-[var(--divider)]">
          {START_HERE.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-start gap-3 p-4 transition-colors hover:bg-[var(--bg-card-hover)]"
              >
                <span className="vx-mono mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[var(--border)] text-[10px] text-[var(--text-muted)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-[var(--text-muted)]">
                    {item.reason}
                  </span>
                </span>
                <ArrowRight
                  size={12}
                  className="mt-1 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="vx-inset flex gap-2.5 p-3.5">
        <Info size={14} className="mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
        <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
          Hub content is general startup guidance, not legal, financial or investment advice.
          Read{" "}
          <Link href="/knowledge-hub/scam-watch" className="font-medium text-[var(--accent)]">
            Scam Watch
          </Link>{" "}
          before paying anyone who promises funding.{" "}
          <span className="vx-mono">{HUB_SECTIONS.length} destinations · Phase 1 foundation</span>
        </p>
      </div>
    </div>
  );
}
