import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, MapPin, Target, DollarSign } from "lucide-react";
import { db } from "@/db";
import { investors, users } from "@/db/schema";
import { auth } from "@/features/auth";
import { getInterestStatus } from "@/features/connections";
import { InterestPlusButton } from "@/components/connections/InterestPlusButton";

const TYPE_LABEL: Record<string, string> = {
  angel: "Angel Investor",
  vc: "Venture Capital",
  family_office: "Family Office",
  corporate_vc: "Corporate VC",
};

type Props = { params: Promise<{ id: string }> };

export default async function InvestorProfilePage({ params }: Props) {
  const { id } = await params;

  const [row] = await db
    .select({
      userId: investors.userId,
      fullName: investors.fullName,
      investorType: investors.investorType,
      firmName: investors.firmName,
      location: investors.location,
      checkSizeMin: investors.checkSizeMin,
      checkSizeMax: investors.checkSizeMax,
      stageFocus: investors.stageFocus,
      sectorFocus: investors.sectorFocus,
      investmentThesis: investors.investmentThesis,
      linkedin: investors.linkedin,
      avatarUrl: users.avatarUrl,
    })
    .from(investors)
    .innerJoin(users, eq(users.id, investors.userId))
    .where(eq(investors.userId, id))
    .limit(1);

  if (!row || !row.userId) notFound();

  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const viewerRole = (session?.user as { role?: string } | undefined)?.role;
  const isOwner = viewerId === row.userId;
  const canSendInterest = viewerRole === "startup" && !isOwner;
  const interest =
    viewerId && canSendInterest
      ? await getInterestStatus(viewerId, row.userId)
      : null;

  return (
    <div className="max-w-4xl">
      <Link
        href="/investors"
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-5 transition-colors"
      >
        <ArrowLeft size={12} /> All investors
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-xl font-bold text-[var(--text-muted)] overflow-hidden shrink-0">
            {row.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              row.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold truncate">{row.fullName}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {row.firmName || TYPE_LABEL[row.investorType] || "Investor"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[10px] font-medium text-[var(--text-muted)] border border-[var(--border)]">
                {TYPE_LABEL[row.investorType] ?? row.investorType}
              </span>
              {row.location && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                  <MapPin size={10} /> {row.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {canSendInterest && (
          <InterestPlusButton
            targetUserId={row.userId}
            targetName={row.fullName}
            initialState={interest}
            authenticated
          />
        )}
        {isOwner && (
          <Link
            href="/settings"
            className="text-xs font-medium px-4 py-2 border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
          >
            Edit profile
          </Link>
        )}
        {row.linkedin && (
          <a
            href={row.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
          >
            LinkedIn <ExternalLink size={10} />
          </a>
        )}
        {!viewerId && (
          <Link href="/signup" className="text-xs font-medium text-[var(--accent)] hover:underline">
            Sign up to connect
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1.5">
            <DollarSign size={12} />
            <span className="text-[10px]">Check size</span>
          </div>
          <p className="text-sm font-semibold">
            {row.checkSizeMin || row.checkSizeMax
              ? `$${row.checkSizeMin}K – $${row.checkSizeMax}K`
              : "Not specified"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1.5">
            <Target size={12} />
            <span className="text-[10px]">Stages</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {(row.stageFocus ?? []).length > 0
              ? (row.stageFocus ?? []).join(", ")
              : "Not specified"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1.5">
            <Target size={12} />
            <span className="text-[10px]">Sectors</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {(row.sectorFocus ?? []).length > 0
              ? (row.sectorFocus ?? []).join(", ")
              : "Not specified"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] p-5">
        <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Investment thesis</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {row.investmentThesis || "This investor has not added a thesis yet."}
        </p>
      </div>
    </div>
  );
}
