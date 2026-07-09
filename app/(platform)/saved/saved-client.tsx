"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageHeader, Section, EmptyState, Avatar, Badge } from "@/components/ui";

type SavedStartup = {
  id: string; startupId: string; slug: string; name: string; tagline: string | null;
  sector: string; stage: string; score: string | null; monthlyGrowth: string | null;
};

export function SavedClient() {
  const [bookmarks, setBookmarks] = useState<SavedStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setBookmarks(d.bookmarks || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  async function removeBookmark(startupId: string) {
    setBookmarks(prev => prev.filter(b => b.startupId !== startupId));
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId }),
    });
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Saved Startups" subtitle="Loading..." />
        <div className="flex items-center justify-center py-16">
          <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Saved Startups" subtitle="Failed to load" />
        <div className="py-16 text-center">
          <p className="text-xs text-[var(--red)]">Failed to load bookmarks. Please refresh.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Saved Startups" subtitle={`${bookmarks.length} bookmarked`} />
      {bookmarks.length === 0 ? (
        <EmptyState icon={Bookmark} title="Nothing saved yet"
          description="Bookmark startups you're interested in to track them here."
          action={{ label: "Explore startups", href: "/explore" }} />
      ) : (
        <Section delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookmarks.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="rounded-xl border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors group relative">
                <Link href={`/explore/${b.slug}`} className="block">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar letter={b.name?.charAt(0) || "?"} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">{b.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{b.sector} · {b.stage}</p>
                    </div>
                  </div>
                  {b.tagline && <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{b.tagline}</p>}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--text-muted)]">
                    {b.score && (
                      <span className={`font-semibold ${parseFloat(b.score) >= 70 ? "text-[var(--green)]" : ""}`}>
                        {Math.round(parseFloat(b.score))}
                      </span>
                    )}
                    {b.monthlyGrowth && parseFloat(b.monthlyGrowth) > 0 && (
                      <span className="text-[var(--green)]">+{b.monthlyGrowth}%</span>
                    )}
                  </div>
                </Link>
                <button onClick={() => removeBookmark(b.startupId)}
                  className="absolute top-3 right-3 p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--red-muted)] transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={11} />
                </button>
              </motion.div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
