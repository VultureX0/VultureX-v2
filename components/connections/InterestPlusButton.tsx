"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Loader2, MessageSquare, Plus } from "lucide-react";

type InterestState =
  | "none"
  | "self"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "rejected"
  | "rejected_by_me";

type InterestStatus = {
  status: InterestState;
  requestId: string | null;
  conversationId: string | null;
};

type Props = {
  targetUserId: string;
  targetName?: string;
  initialState?: InterestStatus | null;
  authenticated?: boolean;
  compact?: boolean;
};

const EMPTY: InterestStatus = { status: "none", requestId: null, conversationId: null };

export function InterestPlusButton({
  targetUserId,
  targetName,
  initialState,
  authenticated = true,
  compact = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<InterestStatus>(initialState ?? EMPTY);
  const [checking, setChecking] = useState(authenticated && !initialState);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialState || !authenticated) return;
    let cancelled = false;
    fetch(`/api/connections?userId=${encodeURIComponent(targetUserId)}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.status) setState(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetUserId, initialState, authenticated]);

  async function refreshStatus() {
    try {
      const res = await fetch(
        `/api/connections?userId=${encodeURIComponent(targetUserId)}`,
        { cache: "no-store" }
      );
      if (res.ok) setState(await res.json());
    } catch {
      /* keep the previous state */
    }
  }

  async function send() {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not send the request.");
        if (
          data.code === "ALREADY_PENDING" ||
          data.code === "ALREADY_CONNECTED" ||
          data.code === "REQUEST_DECLINED"
        ) {
          await refreshStatus();
        }
        return;
      }
      setState({
        status: "pending_sent",
        requestId: data.request?.id ?? null,
        conversationId: null,
      });
      window.dispatchEvent(new Event("vx:badges"));
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const base =
    "inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 disabled:opacity-60 disabled:cursor-default";
  const size = compact ? "px-2.5 py-1.5 text-[10px]" : "px-4 py-2 text-xs";
  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;

  let content: React.ReactNode;

  if (!authenticated) {
    content = (
      <Link href={loginHref} className={`${base} ${size} bg-[var(--accent-fill)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]`}>
        <Plus size={compact ? 10 : 12} /> Interest+
      </Link>
    );
  } else if (checking) {
    content = (
      <span className={`${base} ${size} border border-[var(--border)] text-[var(--text-muted)]`}>
        <Loader2 size={compact ? 10 : 12} className="animate-spin" /> Checking
      </span>
    );
  } else if (state.status === "self") {
    content = null;
  } else if (state.status === "accepted") {
    content = state.conversationId ? (
      <Link
        href={`/messages?c=${state.conversationId}`}
        className={`${base} ${size} bg-[var(--green-muted)] text-[var(--green)] border border-[var(--green)]/25 hover:border-[var(--green)]/50`}
      >
        <MessageSquare size={compact ? 10 : 12} /> Message
      </Link>
    ) : (
      <button type="button" onClick={refreshStatus} className={`${base} ${size} border border-[var(--green)]/25 text-[var(--green)]`}>
        <Check size={compact ? 10 : 12} /> Connected
      </button>
    );
  } else if (state.status === "pending_sent") {
    content = (
      <span className={`${base} ${size} border border-[var(--border)] text-[var(--text-muted)]`}>
        <Check size={compact ? 10 : 12} /> Request sent
      </span>
    );
  } else if (state.status === "pending_received") {
    content = (
      <Link
        href="/interests?tab=incoming"
        className={`${base} ${size} border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent-muted)]`}
      >
        <Plus size={compact ? 10 : 12} /> Respond
      </Link>
    );
  } else if (state.status === "rejected") {
    content = (
      <span className={`${base} ${size} border border-[var(--border)] text-[var(--text-muted)]`}>
        Request declined
      </span>
    );
  } else {
    content = (
      <button
        type="button"
        onClick={send}
        disabled={sending}
        aria-busy={sending}
        title={targetName ? `Send an Interest+ request to ${targetName}` : "Send an Interest+ request"}
        className={`${base} ${size} bg-[var(--accent-fill)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]`}
      >
        {sending ? <Loader2 size={compact ? 10 : 12} className="animate-spin" /> : <Plus size={compact ? 10 : 12} />}
        {sending ? "Sending" : "Interest+"}
      </button>
    );
  }

  if (!content && !error) return null;

  return (
    <div className="inline-flex flex-col items-start gap-1">
      {content}
      {error && <span className="text-[10px] text-[var(--red)] max-w-[220px]">{error}</span>}
    </div>
  );
}
