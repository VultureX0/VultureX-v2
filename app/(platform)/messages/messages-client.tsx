"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MessageSquare,
  Search,
  Send,
} from "lucide-react";
import { EmptyState } from "@/components/ui";
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

type Conversation = {
  id: string;
  otherUser: Profile;
  lastMessage: { body: string; senderUserId: string; createdAt: string } | null;
  lastActivityAt: string;
  unreadCount: number;
};

type ThreadMessage = {
  id: string;
  body: string;
  senderUserId: string;
  createdAt: string;
  mine: boolean;
};

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function Avatar({ profile, size = "md" }: { profile: Profile; size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg" ? "w-10 h-10 text-sm" : size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
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

export function MessagesClient({
  initialConversations,
  initialSelectedId,
}: {
  initialConversations: Conversation[];
  initialSelectedId: string | null;
}) {
  const hasInitialThread =
    !!initialSelectedId && initialConversations.some((c) => c.id === initialSelectedId);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    hasInitialThread ? initialSelectedId : null
  );
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threadProfile, setThreadProfile] = useState<Profile | null>(null);
  const [loadingThread, setLoadingThread] = useState(hasInitialThread);
  const [threadError, setThreadError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [search, setSearch] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);
  const selectedRef = useRef<string | null>(selectedId);
  const lastReadMarkerRef = useRef<string | null>(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const activeProfile = threadProfile ?? selected?.otherUser ?? null;
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter(
      (conversation) =>
        conversation.otherUser.name.toLowerCase().includes(query) ||
        (conversation.otherUser.subtitle ?? "").toLowerCase().includes(query)
    );
  }, [conversations, search]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
  }, []);

  const markRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`/api/messages/${conversationId}/read`, { method: "POST" });
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )
      );
      refreshBadges();
    } catch {
      /* unread will retry on the next open */
    }
  }, []);

  const loadThread = useCallback(
    async (conversationId: string, initial = false) => {
      try {
        const res = await fetch(`/api/messages/${conversationId}`, { cache: "no-store" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (selectedRef.current === conversationId) {
            setThreadError(data.error ?? "Could not load this conversation.");
          }
          return;
        }
        const data = await res.json();
        if (selectedRef.current !== conversationId) return;
        const nextMessages: ThreadMessage[] = data.messages ?? [];
        setMessages(nextMessages);
        setThreadError("");
        setThreadProfile(data.conversation?.otherUser ?? null);
        // Only write a read cursor when something new actually arrived.
        const newestId = nextMessages[nextMessages.length - 1]?.id ?? null;
        if (newestId && newestId !== lastReadMarkerRef.current) {
          lastReadMarkerRef.current = newestId;
          await markRead(conversationId);
        }
        if (initial) {
          requestAnimationFrame(() => scrollToBottom("auto"));
        }
      } catch {
        if (selectedRef.current === conversationId) {
          setThreadError("Could not load this conversation. Please retry.");
        }
      } finally {
        if (initial) setLoadingThread(false);
      }
    },
    [markRead, scrollToBottom]
  );

  function selectConversation(conversationId: string) {
    selectedRef.current = conversationId;
    setSelectedId(conversationId);
    setMessages([]);
    setThreadProfile(null);
    setDraft("");
    setSendError("");
    setLoadingThread(true);
    lastReadMarkerRef.current = null;
    window.history.replaceState(null, "", `/messages?c=${conversationId}`);
    void loadThread(conversationId, true);
  }

  // Initial thread load (deep link to ?c=).
  useEffect(() => {
    if (!initialSelectedId || !hasInitialThread) return;
    selectedRef.current = initialSelectedId;
    // Deferred so the initial fetch never runs during the render commit.
    const timer = window.setTimeout(() => {
      void loadThread(initialSelectedId, true);
    }, 0);
    return () => window.clearTimeout(timer);
    // Only on mount: subsequent selections call loadThread explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the open conversation for new messages.
  useEffect(() => {
    if (!selectedId) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !sending) {
        void loadThread(selectedId);
      }
    }, 4000);
    return () => window.clearInterval(interval);
  }, [selectedId, sending, loadThread]);

  // Keep the conversation list (previews/unread) fresh.
  useEffect(() => {
    const interval = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/messages", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setConversations(data.conversations ?? []);
      } catch {
        /* keep current list */
      }
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  // Auto-scroll only when the user is already reading at the bottom.
  useEffect(() => {
    if (nearBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }
  }, [messages.length, scrollToBottom]);

  async function send() {
    if (!selectedId || sending) return;
    const body = draft.trim();
    if (!body) {
      setSendError("Write a message before sending.");
      return;
    }
    setSending(true);
    setSendError("");
    try {
      const res = await fetch(`/api/messages/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendError(data.error ?? "Message could not be sent.");
        return;
      }
      setMessages((prev) => [...prev, data.message]);
      setDraft("");
      setConversations((prev) => {
        const updated = prev.map((conversation) =>
          conversation.id === selectedId
            ? {
                ...conversation,
                lastMessage: {
                  body: data.message.body,
                  senderUserId: data.message.senderUserId,
                  createdAt: data.message.createdAt,
                },
                lastActivityAt: data.message.createdAt,
                unreadCount: 0,
              }
            : conversation
        );
        return [...updated].sort(
          (a, b) =>
            new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
        );
      });
      nearBottomRef.current = true;
      requestAnimationFrame(() => scrollToBottom("smooth"));
      refreshBadges();
    } catch {
      setSendError("Message could not be sent. Check your connection and retry.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh-4rem)] min-h-[440px] rounded-xl border border-[var(--border)] overflow-hidden flex">
      {/* Left panel */}
      <section
        aria-label="Conversations"
        className={`${selectedId ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80 shrink-0 flex-col border-r border-[var(--border)]`}
      >
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-2.5">
            <h1 className="text-sm font-semibold">Messages</h1>
            {totalUnread > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] font-medium">
                {totalUnread} unread
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
              className="w-full pl-7 pr-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--text)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="px-4">
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="Accept an Interest+ request to unlock private messaging."
                action={{ label: "View requests", href: "/interests" }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-[var(--text-muted)]">No conversations match “{search}”.</p>
            </div>
          ) : (
            filtered.map((conversation) => {
              const active = conversation.id === selectedId;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  aria-current={active ? "true" : undefined}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-left border-b border-[var(--border)] transition-colors ${
                    active ? "bg-[var(--bg-elevated)]" : "hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <Avatar profile={conversation.otherUser} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium truncate flex-1">
                        {conversation.otherUser.name}
                      </p>
                      <span
                        suppressHydrationWarning
                        className="text-[9px] text-[var(--text-muted)] shrink-0"
                      >
                        {timeAgo(conversation.lastActivityAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p
                        className={`text-[10px] truncate flex-1 ${
                          conversation.unreadCount > 0
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {conversation.lastMessage
                          ? `${conversation.lastMessage.senderUserId === conversation.otherUser.userId ? "" : "You: "}${conversation.lastMessage.body}`
                          : "Connected — say hello"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--accent-fill)] text-[var(--accent-foreground)] text-[9px] font-bold flex items-center justify-center tabular-nums">
                          {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Right panel */}
      <section
        aria-label="Conversation"
        className={`${selectedId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}
      >
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={20} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-sm font-medium mb-1">Your messages</p>
              <p className="text-xs text-[var(--text-muted)] max-w-xs">
                Select a conversation to catch up, or accept an Interest+ request to start a new one.
              </p>
            </div>
          </div>
        ) : (
          <>
            <header className="h-14 px-3 sm:px-4 flex items-center gap-2.5 border-b border-[var(--border)] shrink-0">
              <button
                type="button"
                onClick={() => {
                  selectedRef.current = null;
                  setSelectedId(null);
                  window.history.replaceState(null, "", "/messages");
                }}
                className="md:hidden p-1.5 -ml-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                aria-label="Back to conversations"
              >
                <ArrowLeft size={15} />
              </button>
              {activeProfile && <Avatar profile={activeProfile} />}
              <div className="min-w-0 flex-1">
                {activeProfile?.href ? (
                  <Link
                    href={activeProfile.href}
                    className="text-sm font-medium truncate hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
                  >
                    {activeProfile.name} <ExternalLink size={9} className="text-[var(--text-muted)]" />
                  </Link>
                ) : (
                  <p className="text-sm font-medium truncate">{activeProfile?.name ?? "Conversation"}</p>
                )}
                <p className="text-[10px] text-[var(--text-muted)] truncate">
                  {activeProfile?.subtitle || "Connected"}
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md border border-[var(--green)]/25 text-[var(--green)] bg-[var(--green-muted)]">
                Connected
              </span>
            </header>

            <div
              ref={scrollRef}
              onScroll={(event) => {
                const node = event.currentTarget;
                nearBottomRef.current =
                  node.scrollHeight - node.scrollTop - node.clientHeight < 120;
              }}
              className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-1"
            >
              {loadingThread ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
                </div>
              ) : threadError ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  <p className="text-xs text-[var(--red)]">{threadError}</p>
                  <button
                    type="button"
                    onClick={() => selectedId && loadThread(selectedId, true)}
                    className="text-[11px] px-3 py-1.5 border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                  >
                    Retry
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <p className="text-xs text-[var(--text-secondary)]">You&apos;re connected.</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Say hello to start the conversation.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const previous = messages[index - 1];
                  const showDay =
                    !previous ||
                    new Date(previous.createdAt).toDateString() !==
                      new Date(message.createdAt).toDateString();
                  const grouped =
                    previous &&
                    previous.mine === message.mine &&
                    new Date(message.createdAt).getTime() -
                      new Date(previous.createdAt).getTime() <
                      5 * 60 * 1000;
                  return (
                    <div key={message.id}>
                      {showDay && (
                        <div className="flex items-center gap-3 py-3">
                          <div className="h-px flex-1 bg-[var(--border)]" />
                          <span className="text-[9px] uppercase tracking-wide text-[var(--text-muted)]">
                            {dayLabel(message.createdAt)}
                          </span>
                          <div className="h-px flex-1 bg-[var(--border)]" />
                        </div>
                      )}
                      <div className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] sm:max-w-[70%] ${grouped ? "mt-0.5" : "mt-2"}`}>
                          <div
                            className={`px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                              message.mine
                                ? "bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-br-sm"
                                : "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] rounded-bl-sm"
                            }`}
                          >
                            {message.body}
                          </div>
                          <p
                            suppressHydrationWarning
                            className={`text-[9px] text-[var(--text-muted)] mt-1 ${
                              message.mine ? "text-right" : "text-left"
                            }`}
                          >
                            {clockTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-[var(--border)] px-3 sm:px-4 py-3 shrink-0">
              {sendError && (
                <p className="text-[10px] text-[var(--red)] mb-1.5">{sendError}</p>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    if (sendError) setSendError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  rows={1}
                  maxLength={4000}
                  placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
                  aria-label="Message"
                  className="flex-1 resize-none max-h-32 px-3 py-2 text-xs rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--border-hover)] transition-colors"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !draft.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[var(--accent-fill)] text-[var(--accent-foreground)] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  Send
                </button>
              </div>
              <p className="text-[9px] text-[var(--text-muted)] mt-1.5 text-right tabular-nums">
                {draft.length}/4000
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
