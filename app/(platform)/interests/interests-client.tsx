"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ExternalLink,
  Heart,
  Inbox,
  Loader2,
  MessageSquare,
  Send,
  Users,
  X,
} from "lucide-react";
import { PageHeader, Section, EmptyState, Badge } from "@/components/ui";
import { refreshBadges } from "@/components/shared/use-unread-badges";

type Profile = {
  userId: string;
  role: "startup" | "investor" | "admin";
  name: string;
  subtitle: string | null;
  avatarUrl: string | null;
  href: string | null;
  initials: string;
};

type RequestCard = {
  id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  message: string | null;
  createdAt: string;
  user: Profile;
  conversationId: string | null;
};

type Overview = {
  incoming: RequestCard[];
  sent: RequestCard[];
  connections: { conversationId: string; user: Profile; connectedAt: string }[];
  counts: { pendingIncoming: number };
};

type Tab = "incoming" | "sent" | "connected";

const TABS: { key: Tab; label: string; icon: typeof Inbox }[] = [
  { key: "incoming", label: "Incoming", icon: Inbox },
  { key: "sent", label: "Sent", icon: Send },
  { key: "connected", label: "Connections", icon: Users },
];

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function ProfileAvatar({ profile, size = "md" }: { profile: Profile; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${cls} rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center font-semibold text-[var(--text-muted)] overflow-hidden shrink-0`}
    >
      {profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        profile.initials
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RequestCard["status"] }) {
  if (status === "accepted") return <Badge variant="green">connected</Badge>;
  if (status === "rejected") return <Badge>declined</Badge>;
  if (status === "withdrawn") return <Badge>withdrawn</Badge>;
  return <Badge variant="accent">pending</Badge>;
}

export function InterestsClient({ role, initialTab }: { role: string; initialTab?: string }) {
  const startTab: Tab =
    initialTab === "sent" || initialTab === "connected" ? initialTab : "incoming";
  const [tab, setTab] = useState<Tab>(startTab);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/connections", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Overview;
      setOverview(data);
      setError("");
    } catch {
      setError("Could not load your requests. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/connections", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Overview) => {
        if (cancelled) return;
        setOverview(data);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your requests. Please refresh.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 25000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [load]);

  async function respond(requestId: string, action: "accept" | "reject" | "withdraw") {
    if (working) return;
    setWorking(requestId);
    setError("");
    try {
      const res = await fetch(`/api/connections/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not update this request.");
        return;
      }
      refreshBadges();
      await load();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setWorking(null);
    }
  }

  const pending = overview?.counts.pendingIncoming ?? 0;
  const incoming = overview?.incoming ?? [];
  const sent = overview?.sent ?? [];
  const connections = overview?.connections ?? [];

  return (
    <div>
      <PageHeader
        title="Interest+"
        subtitle={
          loading
            ? "Loading your network..."
            : `${pending} pending · ${connections.length} connection${connections.length === 1 ? "" : "s"}`
        }
      />

      <div className="flex items-center gap-1 mb-5 border-b border-[var(--border)]">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count =
            key === "incoming" ? incoming.length : key === "sent" ? sent.length : connections.length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-current={tab === key ? "page" : undefined}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 -mb-px ${
                tab === key
                  ? "border-[var(--accent)] text-[var(--text)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon size={13} />
              {label}
              {count > 0 && (
                <span className="ml-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--bg-elevated)] text-[9px] flex items-center justify-center tabular-nums">
                  {count}
                </span>
              )}
              {key === "incoming" && pending > 0 && (
                <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 rounded-full bg-[var(--accent-fill)]" />
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-[var(--red)]/30 bg-[var(--red-muted)] px-3 py-2">
          <p className="text-[11px] text-[var(--red)]">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
        </div>
      ) : tab === "incoming" ? (
        incoming.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No incoming requests"
            description="When someone sends you an Interest+, you can accept or decline it here."
            action={{ label: "Explore startups", href: "/explore" }}
          />
        ) : (
          <Section delay={0.1}>
            <div className="space-y-3">
              {incoming.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="rounded-xl border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <ProfileAvatar profile={item.user} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{item.user.name}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      {item.user.subtitle && (
                        <p className="text-[10px] text-[var(--text-muted)]">{item.user.subtitle}</p>
                      )}
                      {item.message && (
                        <p className="text-xs text-[var(--text-secondary)] mt-2 italic">
                          &ldquo;{item.message}&rdquo;
                        </p>
                      )}
                      <p className="text-[10px] text-[var(--text-muted)] mt-2">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                    {item.user.href && (
                      <Link
                        href={item.user.href}
                        className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        View profile <ExternalLink size={8} />
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    {item.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => respond(item.id, "accept")}
                          disabled={working === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                        >
                          {working === item.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Check size={10} />
                          )}
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => respond(item.id, "reject")}
                          disabled={working === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] rounded-md hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-50"
                        >
                          <X size={10} /> Decline
                        </button>
                        <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                          Accepting unlocks messaging.
                        </span>
                      </>
                    ) : item.status === "accepted" && item.conversationId ? (
                      <Link
                        href={`/messages?c=${item.conversationId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--green-muted)] text-[var(--green)] border border-[var(--green)]/25 rounded-md hover:border-[var(--green)]/50 transition-colors"
                      >
                        <MessageSquare size={10} /> Message
                      </Link>
                    ) : (
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {item.status === "rejected"
                          ? "You declined this request. Messaging stays locked."
                          : "This request was withdrawn."}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )
      ) : tab === "sent" ? (
        sent.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No requests sent yet"
            description={
              role === "startup"
                ? "Browse investors and send an Interest+ to start a conversation."
                : "Browse startups and send an Interest+ to start a conversation."
            }
            action={
              role === "startup"
                ? { label: "Browse investors", href: "/investors" }
                : { label: "Explore startups", href: "/explore" }
            }
          />
        ) : (
          <Section delay={0.1}>
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              {sent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] last:border-0"
                >
                  <ProfileAvatar profile={item.user} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{item.user.name}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {item.user.subtitle ? `${item.user.subtitle} · ` : ""}
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  {item.status === "accepted" && item.conversationId ? (
                    <Link
                      href={`/messages?c=${item.conversationId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium bg-[var(--green-muted)] text-[var(--green)] border border-[var(--green)]/25 rounded-md hover:border-[var(--green)]/50 transition-colors"
                    >
                      <MessageSquare size={9} /> Message
                    </Link>
                  ) : item.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => respond(item.id, "withdraw")}
                      disabled={working === item.id}
                      className="px-2.5 py-1.5 text-[10px] border border-[var(--border)] text-[var(--text-muted)] rounded-md hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] disabled:opacity-50 transition-colors"
                    >
                      {working === item.id ? "Withdrawing..." : "Withdraw"}
                    </button>
                  ) : item.user.href ? (
                    <Link
                      href={item.user.href}
                      className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    >
                      View profile
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-3">
              A declined request cannot be resent. If someone declined you, the conversation stays locked.
            </p>
          </Section>
        )
      ) : connections.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No connections yet"
          description="Accepted Interest+ requests become connections with a private conversation."
          action={
            role === "startup"
              ? { label: "Browse investors", href: "/investors" }
              : { label: "Explore startups", href: "/explore" }
          }
        />
      ) : (
        <Section delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-3">
            {connections.map((item) => (
              <div
                key={item.conversationId}
                className="rounded-xl border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar profile={item.user} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.user.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {item.user.subtitle || "Connected"} · {timeAgo(item.connectedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    href={`/messages?c=${item.conversationId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <MessageSquare size={10} /> Message
                  </Link>
                  {item.user.href && (
                    <Link
                      href={item.user.href}
                      className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    >
                      View profile
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
