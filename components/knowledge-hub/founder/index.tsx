import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  Info,
  Leaf,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";

export type FounderAction = {
  title: string;
  description: string;
  why: string;
  priority: "High" | "Medium";
  time: string;
  category: string;
  href: string;
  cta: string;
};

export type FounderMetric = {
  label: string;
  value: string | number;
  hint?: string;
};

export type LearningItem = {
  title: string;
  category: string;
  href: string;
  /** Only present when a real learning record stores a percentage. */
  percent?: number;
};

export type OpportunityItem = {
  id: string;
  title: string;
  status: string;
  deadline: Date | null;
};

const DEADLINE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDeadline(value: Date | null): string | null {
  if (!value) return null;
  return DEADLINE_FORMAT.format(value);
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function FounderTopBar({
  stage,
  initial,
  profileHref,
}: {
  stage: string | null;
  initial: string;
  profileHref: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tracking-tight">VultureX</span>
        <span className="h-3 w-px bg-[var(--border)]" aria-hidden="true" />
        <span className="vx-label">For You</span>
      </div>

      <div className="flex items-center gap-2">
        {stage && (
          <span className="hidden rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)] sm:inline">
            {stage}
          </span>
        )}
        <NotificationBell />
        <Link
          href={profileHref}
          aria-label="Your profile"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-muted)] text-[10px] font-semibold text-[var(--accent)]"
        >
          {initial}
        </Link>
      </div>
    </div>
  );
}

export function WelcomeCard({
  name,
  stage,
  tagline,
  sector,
  signedIn,
  profileHref,
  objective,
  language,
  editProfileHref,
}: {
  name: string | null;
  stage: string | null;
  tagline: string | null;
  sector: string | null;
  signedIn: boolean;
  profileHref: string | null;
  objective?: string | null;
  language?: string | null;
  editProfileHref?: string | null;
}) {
  return (
    <section className="vx-card relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-14 -top-20 h-44 w-44 rounded-full bg-[var(--accent-muted)]"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="vx-label">{signedIn ? "Welcome back" : "Founder workspace"}</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {signedIn && name ? `Welcome back, ${name}` : "Your founder workspace"}
        </h1>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-[var(--text-secondary)]">
          {tagline ||
            (signedIn
              ? "Your stage, next actions and metrics are read from your startup profile."
              : "Sign in to see your stage, next actions and metrics. The Knowledge Hub stays open to everyone.")}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {stage && (
            <span className="rounded border border-[var(--accent)]/25 bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
              {stage}
            </span>
          )}
          {sector && (
            <span className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
              {sector}
            </span>
          )}
          {objective && (
            <span className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
              {objective}
            </span>
          )}
          {language && language !== "English" && (
            <span className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
              {language}
            </span>
          )}
          {profileHref && (
            <Link
              href={profileHref}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
            >
              View profile
              <ArrowUpRight size={11} aria-hidden="true" />
            </Link>
          )}
          {editProfileHref && (
            <Link
              href={editProfileHref}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            >
              {objective ? "Edit founder profile" : "Set up founder profile"}
              <ArrowRight size={11} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function FounderProgress({ stage }: { stage: string | null }) {
  return (
    <section
      aria-label="Founder progress and sprint"
      className="vx-card flex flex-wrap items-center justify-between gap-3 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
        <span className="text-xs font-medium">{stage ?? "Stage not set"}</span>
        <span className="vx-label">Founder stage</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="vx-label">Sprint</span>
        <span className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
          Not connected yet
        </span>
      </div>
    </section>
  );
}

export function NextActions({ actions }: { actions: FounderAction[] }) {
  return (
    <section aria-labelledby="next-actions-heading" className="vx-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="vx-label">Focus</p>
          <h2 id="next-actions-heading" className="mt-1 text-lg font-semibold tracking-tight">
            Your next three actions
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Small steps chosen from your startup’s current state.
          </p>
        </div>
        <span className="rounded border border-[var(--accent)]/25 bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
          {actions.length} pending
        </span>
      </div>

      {actions.length === 0 ? (
        <div className="vx-inset mt-4 p-5 text-center">
          <p className="text-sm font-medium">Nothing pending right now</p>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-[var(--text-muted)]">
            Your profile has what it needs and there are no open recommendations at this stage.
          </p>
          <Link
            href="/knowledge-hub/start-business"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
          >
            Work through a guide
            <ArrowRight size={11} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ol className="mt-4 space-y-3">
          {actions.map((action, index) => (
            <li key={action.title}>
              <article className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="vx-mono mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-card)] text-[10px] text-[var(--text-muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold tracking-tight">{action.title}</h3>
                      <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-medium ${
                      action.priority === "High"
                        ? "border-[var(--accent)]/25 bg-[var(--accent-muted)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                    }`}
                  >
                    {action.priority} impact
                  </span>
                </div>

                <div className="vx-inset mt-3 p-2.5">
                  <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-[var(--text-muted)]">
                    <Sparkles size={10} className="text-[var(--accent)]" aria-hidden="true" />
                    Why recommended
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                    {action.why}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} aria-hidden="true" />
                      {action.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Target size={10} aria-hidden="true" />
                      {action.category}
                    </span>
                  </div>
                  <Link
                    href={action.href}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-fill-hover)]"
                  >
                    {action.cta}
                    <ArrowRight size={11} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function LearningPanel({ items }: { items: LearningItem[] }) {
  return (
    <section aria-labelledby="learning-heading" className="vx-card p-5">
      <p className="vx-label">Learning</p>
      <h2 id="learning-heading" className="mt-1 text-lg font-semibold tracking-tight">
        Continue learning
      </h2>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Pick up where you left off.</p>

      {items.length === 0 ? (
        <div className="vx-inset mt-3 p-4">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-[var(--accent)]" aria-hidden="true" />
            <p className="text-xs font-medium">No learning in progress yet</p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Progress appears here once a hub guide records it for your account. Nothing is marked
            complete by default.
          </p>
          <Link
            href="/knowledge-hub/start-business"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
          >
            Start with the founder journey
            <ArrowRight size={11} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.title} className="vx-inset p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="vx-label">{item.category}</p>
                  <p className="mt-1 text-xs font-medium">{item.title}</p>
                </div>
                {typeof item.percent === "number" && (
                  <span className="vx-mono text-[10px] text-[var(--text-muted)]">
                    {item.percent}%
                  </span>
                )}
              </div>
              {typeof item.percent === "number" && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent-fill)]"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              )}
              <Link
                href={item.href}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
              >
                Continue learning
                <ArrowRight size={10} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MetricsPanel({ metrics }: { metrics: FounderMetric[] }) {
  return (
    <section aria-labelledby="metrics-heading" className="vx-card p-5">
      <p className="vx-label">Relevant numbers</p>
      <h2 id="metrics-heading" className="mt-1 text-lg font-semibold tracking-tight">
        Founder metrics
      </h2>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Only figures recorded on your profile.
      </p>

      {metrics.length === 0 ? (
        <div className="vx-inset mt-3 p-4">
          <p className="text-xs font-medium">No metrics recorded yet</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Metrics appear once your startup profile is live.
          </p>
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {metrics.map((metric) => (
            <li key={metric.label} className="vx-inset p-2.5">
              <p className="vx-mono text-lg font-semibold tabular-nums">{metric.value}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-[var(--text-secondary)]">
                {metric.label}
              </p>
              {metric.hint && (
                <p className="mt-0.5 text-[9px] leading-tight text-[var(--text-muted)]">
                  {metric.hint}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function OpportunitiesPanel({ items }: { items: OpportunityItem[] }) {
  return (
    <section aria-labelledby="opportunities-heading" className="vx-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="vx-label">Live programmes</p>
          <h2 id="opportunities-heading" className="mt-1 text-lg font-semibold tracking-tight">
            Opportunities
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Competitions and programmes currently published on VultureX.
          </p>
        </div>
        <Link
          href="/competitions"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
        >
          Browse all
          <ArrowRight size={11} aria-hidden="true" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="vx-inset mt-3 p-4">
          <p className="text-xs font-medium">No opportunities published yet</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
            New competitions appear here once a host publishes them. VultureX does not create
            listings to fill this space.
          </p>
          <Link
            href="/competitions"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]"
          >
            Open competitions
            <ArrowRight size={11} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => {
            const deadline = formatDeadline(item.deadline);
            return (
              <li
                key={item.id}
                className="vx-inset flex flex-wrap items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded border border-[var(--accent)]/25 bg-[var(--accent-muted)] px-1.5 py-0.5 text-[9px] font-medium capitalize text-[var(--accent)]">
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                    {deadline ? `Deadline ${deadline} (UTC)` : "Deadline not published"}
                  </p>
                </div>
                <Link
                  href={`/competitions/${item.id}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--border)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
                >
                  View details
                  <ArrowUpRight size={10} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const COMMUNITY_LINKS = [
  { label: "Founder discussions", href: "/knowledge-hub/community" },
  { label: "Peer groups", href: "/knowledge-hub/community#peer-groups" },
  { label: "Expert resources", href: "/knowledge-hub/community#expert-access" },
  { label: "Workshops", href: "/knowledge-hub/community#workshops" },
];

export function CommunityPanel() {
  return (
    <section aria-labelledby="community-heading" className="vx-card p-5">
      <div className="flex items-center gap-2">
        <Users size={14} className="text-[var(--accent)]" aria-hidden="true" />
        <p className="vx-label">Community</p>
      </div>
      <h2 id="community-heading" className="mt-2 text-sm font-semibold tracking-tight">
        Founders and experts
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Find founders working on adjacent problems and specialists who have seen your stage
        before.
      </p>

      <ul className="mt-3 space-y-1">
        {COMMUNITY_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between gap-2 rounded px-1 py-1 text-[11px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
            >
              {link.label}
              <ArrowRight size={10} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/explore"
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
      >
        Browse founders
        <ArrowRight size={11} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function AlertPanel() {
  return (
    <section aria-labelledby="alert-heading" className="vx-card p-5">
      <div className="flex items-center gap-2">
        <ShieldAlert size={14} className="text-[var(--accent)]" aria-hidden="true" />
        <p className="vx-label">Security notice</p>
      </div>
      <h2 id="alert-heading" className="mt-2 text-sm font-semibold tracking-tight">
        Stay alert
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Unsolicited funding offers that ask for an upfront fee are a common scam pattern. Review
        the signs before you share documents, grant access or move money.
      </p>
      <Link
        href="/knowledge-hub/scam-watch"
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
      >
        View safety tips
        <ArrowRight size={11} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function ImpactPanel({ goals }: { goals: string[] }) {
  return (
    <section aria-labelledby="impact-heading" className="vx-card p-5">
      <div className="flex items-center gap-2">
        <Leaf size={14} className="text-[var(--accent)]" aria-hidden="true" />
        <p className="vx-label">Impact Hub</p>
      </div>
      <h2 id="impact-heading" className="mt-2 text-sm font-semibold tracking-tight">
        Measure your impact
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Define who benefits, what changed and what you can evidence — before you put a claim in
        front of customers or investors.
      </p>

      {goals.length > 0 && (
        <div className="mt-3">
          <p className="vx-label">Self-declared SDG alignment · not verified</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {goals.map((goal) => (
              <li
                key={goal}
                className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]"
              >
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/knowledge-hub/impact"
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
      >
        Explore Impact Hub
        <ArrowRight size={11} aria-hidden="true" />
      </Link>
    </section>
  );
}

export function AccountPanel({
  title,
  description,
  primary,
  secondary,
}: {
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="vx-card p-5">
      <div className="flex items-start gap-2.5">
        <Info size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={primary.href}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-fill)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-fill-hover)]"
            >
              {primary.label}
              <ArrowRight size={11} aria-hidden="true" />
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
