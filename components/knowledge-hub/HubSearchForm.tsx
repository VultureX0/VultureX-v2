"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export function HubSearchForm({
  initialQuery = "",
  autoFocus = false,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/knowledge-hub/search?q=${encodeURIComponent(trimmed)}` : "/knowledge-hub/search");
  }

  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor="hub-search" className="sr-only">
        Search the Knowledge Hub
      </label>
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        aria-hidden="true"
      />
      <input
        id="hub-search"
        name="q"
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
        }}
        placeholder="Search guides, industries, tools and topics"
        className="h-10 w-full rounded-[var(--radius)] border border-[var(--input-border)] bg-[var(--input-bg)] pl-9 pr-28 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute right-[86px] top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-7 -translate-y-1/2 rounded-md bg-[var(--accent-fill)] px-3 text-[10px] font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-fill-hover)]"
      >
        Search
      </button>
    </form>
  );
}
