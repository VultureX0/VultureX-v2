import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pitchDeckEvents, pitchDeckFiles, pitchDeckRequests, startups } from "@/db/schema";
import {
  batchAnswersView,
  buildDeckSummary,
  getActor,
  type Answers,
  type DeckSummary,
} from "@/features/pitch-deck";
import { StatusBadge } from "@/components/pitch-deck/StatusBadge";
import { AdminRequestControls } from "@/components/pitch-deck/AdminRequestControls";

/** Profile dollar amounts are stored in cents; group them en-US (server
 * locale would otherwise render 150000 as "1,50,000"). */
function usd(cents: number | null | undefined): string {
  if (!cents) return "";
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=/admin/pitch-decks");
  if (actor.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const [request] = await db
    .select()
    .from(pitchDeckRequests)
    .where(eq(pitchDeckRequests.id, id))
    .limit(1);
  if (!request) notFound();

  const [startup] = await db
    .select()
    .from(startups)
    .where(eq(startups.id, request.startupId))
    .limit(1);
  if (!startup) notFound();

  const files = await db
    .select()
    .from(pitchDeckFiles)
    .where(eq(pitchDeckFiles.requestId, request.id))
    .orderBy(desc(pitchDeckFiles.uploadedAt));

  const events = await db
    .select()
    .from(pitchDeckEvents)
    .where(eq(pitchDeckEvents.requestId, request.id))
    .orderBy(desc(pitchDeckEvents.createdAt));

  const answers = (request.answers ?? {}) as Answers;
  const screenshot = files.find((f) => f.kind === "product_screenshot");
  const deckFiles = files.filter((f) => f.kind === "deck");

  const approvedSummary = (request.approvedSummary as DeckSummary | null) ?? null;
  const workingSummary =
    (request.summary as DeckSummary | null) ??
    buildDeckSummary({ startup, answers, screenshotFileId: screenshot?.id ?? null });

  const batches = batchAnswersView(answers);

  return (
    <div className="max-w-5xl">
      <p className="text-[10px] text-[var(--text-muted)] mb-1">
        <Link href="/admin/pitch-decks" className="hover:text-[var(--text-secondary)]">
          Pitch Deck Requests
        </Link>{" "}
        / {request.title}
      </p>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">{request.title}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {startup.name} · {startup.sector} · {startup.stage}
            {startup.location ? ` · ${startup.location}` : ""}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5 flex flex-wrap gap-x-3">
            <span>Submitted {request.submittedAt ? new Date(request.submittedAt).toLocaleString() : "—"}</span>
            <span>Approved {request.approvedAt ? new Date(request.approvedAt).toLocaleString() : "—"}</span>
            <span>Published {request.publishedAt ? new Date(request.publishedAt).toLocaleString() : "—"}</span>
            <span>
              {request.kind === "revision" ? `Revision v${request.version}` : "New deck request"}
            </span>
          </p>
        </div>
        <StatusBadge
          status={request.status}
          changedSinceApproval={request.summaryChangedSinceApproval}
        />
      </div>

      {!request.approvedSummary && (
        <div className="mb-5 px-4 py-3 rounded-md border border-[var(--amber)]/30 bg-[var(--amber-muted)] text-[11px] text-[var(--amber)]">
          No approved summary yet — this request cannot be prepared or published until the founder
          approves it.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Admin actions */}
        <div>
          <AdminRequestControls
            requestId={request.id}
            status={request.status}
            hasApprovedSummary={Boolean(request.approvedSummary)}
            files={deckFiles.map((f) => ({
              id: f.id,
              fileName: f.fileName,
              sizeBytes: f.sizeBytes,
              isPublished: f.isPublished,
              uploadedAt: f.uploadedAt ? f.uploadedAt.toISOString() : null,
            }))}
            adminNote={request.adminNote}
          />
        </div>

        {/* Startup profile + summary */}
        <div className="space-y-5">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3">
              Startup profile (read-only)
            </h2>
            <dl className="space-y-2 text-[11px]">
              {[
                ["Company", startup.name],
                ["Tagline", startup.tagline],
                ["Sector / stage", `${startup.sector} · ${startup.stage}`],
                ["Location", startup.location],
                ["Website", startup.website],
                ["Founder", `${startup.founderName ?? "—"} (${startup.founderRole ?? "—"})`],
                ["Founder bio", startup.founderBio],
                ["Team size", startup.teamSize ? String(startup.teamSize) : null],
                ["MRR", startup.mrr ? usd(startup.mrr) : null],
                ["Growth", startup.monthlyGrowth ? `${startup.monthlyGrowth}%` : null],
                ["Active users", startup.activeUsers ? startup.activeUsers.toLocaleString() : null],
                ["Customers", startup.customers ? startup.customers.toLocaleString() : null],
                ["Total raised", startup.fundingRaised ? usd(startup.fundingRaised) : null],
                ["Burn", startup.burnRate ? usd(startup.burnRate) : null],
                ["Runway", startup.runwayMonths ? `${startup.runwayMonths} months` : null],
                ["Problem", startup.problem],
                ["Solution", startup.solution],
              ].map(([label, value]) => (
                <div key={label as string} className="grid grid-cols-3 gap-2">
                  <dt className="text-[10px] text-[var(--text-muted)]">{label}</dt>
                  <dd className="col-span-2 text-[var(--text-secondary)] whitespace-pre-line">
                    {value || <span className="text-[var(--text-muted)]">—</span>}
                  </dd>
                </div>
              ))}
              {screenshot && (
                <div className="grid grid-cols-3 gap-2">
                  <dt className="text-[10px] text-[var(--text-muted)]">Screenshot</dt>
                  <dd className="col-span-2">
                    <a
                      href={`/api/files/${screenshot.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--accent)] hover:underline"
                    >
                      Open private attachment
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="text-xs font-medium text-[var(--text-muted)] mb-1">
              {approvedSummary ? "Approved summary (what the deck is built from)" : "Working summary"}
            </h2>
            {request.summaryChangedSinceApproval && approvedSummary && (
              <p className="text-[10px] text-[var(--red)] mb-3">
                The founder edited the summary after approving it — confirm which version to use
                before publishing.
              </p>
            )}
            <div className="space-y-4 mt-3">
              {(approvedSummary ?? workingSummary).sections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-[10px] font-medium text-[var(--text-muted)] mb-1.5">
                    {section.title}
                  </h3>
                  <dl className="space-y-1">
                    {section.fields.map((field) => (
                      <div key={field.id} className="grid grid-cols-3 gap-2">
                        <dt className="text-[10px] text-[var(--text-muted)]">{field.label}</dt>
                        <dd className="col-span-2 text-[11px] text-[var(--text-secondary)] whitespace-pre-line">
                          {field.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Original questionnaire answers */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 mt-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-4">
          Original questionnaire answers (all three batches)
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {batches.map((batch) => (
            <div key={batch.batch}>
              <h3 className="text-[11px] font-medium mb-2">
                Batch {batch.batch} — {batch.title}
              </h3>
              <dl className="space-y-1.5">
                {batch.rows.map((row) => (
                  <div key={row.id}>
                    <dt className="text-[10px] text-[var(--text-muted)]">
                      {row.id} · {row.label}
                    </dt>
                    <dd
                      className={`text-[11px] whitespace-pre-line ${
                        row.empty ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {row.value || "—"}
                    </dd>
                  </div>
                ))}
                {batch.followUps.map((row) => (
                  <div key={row.id}>
                    <dt className="text-[10px] text-[var(--text-muted)]">{row.label}</dt>
                    <dd className="text-[11px] text-[var(--text-secondary)] whitespace-pre-line">
                      {row.value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 mt-5">
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3">History</h2>
        <ol className="space-y-2.5">
          {events.map((event) => (
            <li key={event.id} className="text-[11px]">
              <p className="text-[var(--text-secondary)]">{event.message ?? event.type}</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {event.actorRole ?? "system"} ·{" "}
                {event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}
              </p>
            </li>
          ))}
          {events.length === 0 && (
            <li className="text-[11px] text-[var(--text-muted)]">No history yet.</li>
          )}
        </ol>
      </section>
    </div>
  );
}
