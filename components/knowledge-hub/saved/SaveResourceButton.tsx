"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useSavedResources } from "./SavedResourcesProvider";

export function SaveResourceButton({
  resourceKey,
  className = "",
}: {
  resourceKey: string;
  className?: string;
}) {
  const pathname = usePathname() ?? "/knowledge-hub";
  const { authenticated, loading, saved, toggle } = useSavedResources();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const isSaved = Boolean(saved[resourceKey]);

  if (loading) {
    return (
      <button
        type="button"
        disabled
        aria-label="Loading saved state"
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] ${className}`}
      >
        <Loader2 size={13} className="animate-spin" />
      </button>
    );
  }

  if (!authenticated) {
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
        aria-label="Sign in to save this resource"
        title="Sign in to save"
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--accent)] ${className}`}
      >
        <Bookmark size={13} />
      </Link>
    );
  }

  async function handleClick() {
    if (working) return;
    setWorking(true);
    setError("");
    const result = await toggle(resourceKey);
    if (!result.ok) setError(result.error ?? "Could not save.");
    setWorking(false);
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void handleClick();
      }}
      disabled={working}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved resources" : "Save this resource"}
      title={error || (isSaved ? "Remove from saved resources" : "Save this resource")}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        isSaved
          ? "text-[var(--accent)] hover:bg-[var(--accent-muted)]"
          : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--accent)]"
      } disabled:opacity-50 ${className}`}
    >
      {working ? (
        <Loader2 size={13} className="animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck size={13} />
      ) : (
        <Bookmark size={13} />
      )}
    </button>
  );
}
