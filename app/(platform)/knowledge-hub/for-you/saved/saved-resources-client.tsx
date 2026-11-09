"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Bookmark, Loader2, Trash2 } from "lucide-react";
import type { SavedResourceView } from "@/features/saved-resources";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function SavedResourcesClient({
  initialResources,
}: {
  initialResources: SavedResourceView[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialResources);
  const [category, setCategory] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const categories = [...new Set(items.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b)
  );
  const filtered =
    category === "all" ? items : items.filter((item) => item.category === category);

  async function remove(resource: SavedResourceView) {
    setBusy(resource.id);
    setError("");
    try {
      const response = await fetch(
        `/api/saved-resources?key=${encodeURIComponent(resource.resourceKey)}`,
        { method: "DELETE" }
      );
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not remove that resource.");
        return;
      }
      setItems((previous) => previous.filter((item) => item.id !== resource.id));
      router.refresh();
    } catch {
      setError("Network error. The resource was not removed.");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <section className="vx-card p-6 text-center">
        <Bookmark size={20} className="mx-auto text-[var(--text-muted)]" aria-hidden="true" />
        <h2 className="mt-2 text-sm font-medium">Nothing saved yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-[var(--text-muted)]">
          Use the bookmark button on a Knowledge Hub guide, industry playbook or tool to keep it
          here for later.
        </p>
        <Link
          href="/knowledge-hub"
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent-foreground)]"
        >
          Browse the Knowledge Hub
          <ArrowRight size={11} aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="vx-card px-4 py-3 text-[11px] text-[var(--red)]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5" aria-label="Filter saved resources by category">
        <button
          type="button"
          onClick={() => setCategory("all")}
          aria-pressed={category === "all"}
          className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
            category === "all"
              ? "border-[var(--accent)] bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
          }`}
        >
          All ({items.length})
        </button>
        {categories.map((entry) => {
          const count = items.filter((item) => item.category === entry).length;
          return (
            <button
              key={entry}
              type="button"
              onClick={() => setCategory(entry)}
              aria-pressed={category === entry}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
                category === entry
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              {entry} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="vx-card p-6 text-center">
          <p className="text-sm font-medium">No saved resources in this category</p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            Choose another category or save more from the Knowledge Hub.
          </p>
          <button
            type="button"
            onClick={() => setCategory("all")}
            className="mt-3 text-[11px] font-medium text-[var(--accent)]"
          >
            Show all saved resources
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((resource) => (
            <li key={resource.id} className="vx-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="vx-label">{resource.category}</p>
                  <Link
                    href={resource.href}
                    className="mt-1 block text-sm font-semibold tracking-tight transition-colors hover:text-[var(--accent)]"
                  >
                    {resource.title}
                  </Link>
                  {resource.description && (
                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                      {resource.description}
                    </p>
                  )}
                  <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                    Saved {DATE_FORMAT.format(new Date(resource.savedAt))} (UTC)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(resource)}
                  disabled={busy === resource.id}
                  aria-label={`Remove ${resource.title} from saved resources`}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--red-muted)] hover:text-[var(--red)] disabled:opacity-50"
                >
                  {busy === resource.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
              <Link
                href={resource.href}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
              >
                Open resource
                <ArrowRight size={10} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
