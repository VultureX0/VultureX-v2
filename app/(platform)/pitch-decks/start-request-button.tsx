"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Repeat2 } from "lucide-react";

export function StartRequestButton({
  kind = "new",
  previousRequestId,
  label,
  variant = "primary",
  size = "md",
}: {
  kind?: "new" | "revision";
  previousRequestId?: string;
  label?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pitch-deck/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, previousRequestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start the request.");
        return;
      }
      const requestId = data.request.id as string;
      const status = data.request.status as string;
      router.push(
        status === "incomplete"
          ? `/pitch-decks/${requestId}/questionnaire`
          : `/pitch-decks/${requestId}/summary`,
      );
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const classes =
    "inline-flex items-center gap-2 font-medium rounded-md transition-colors disabled:opacity-50";
  const sizes = { sm: "px-3 py-1.5 text-[11px]", md: "px-4 py-2 text-xs" };
  const variants = {
    primary: "bg-[var(--accent-fill)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]",
    secondary: "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)]",
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={start}
        disabled={loading}
        className={`${classes} ${sizes[size]} ${variants[variant]}`}
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : kind === "revision" ? (
          <Repeat2 size={12} />
        ) : (
          <Plus size={12} />
        )}
        {label ?? (kind === "revision" ? "Improve this deck" : "Create Your Pitch Deck")}
      </button>
      {error && <p className="text-[10px] text-[var(--red)]">{error}</p>}
    </div>
  );
}
