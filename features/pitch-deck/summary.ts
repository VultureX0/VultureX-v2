/**
 * Summary engine.
 *
 * Combines two data sources into one editable, structured summary:
 *   1. the startup profile captured during onboarding (never asked again), and
 *   2. the answers submitted across the three questionnaire batches.
 *
 * Rules from the brief:
 *   - profile data fills sections the questionnaire does not cover
 *   - when both sources describe the same thing both values are preserved
 *     (profileValue / questionnaireValue) so nothing is silently discarded
 *   - unreconcilable values are flagged for the founder instead of guessed
 *   - missing information is marked as missing, never invented
 *   - editing the summary never writes back to the startup profile
 */

import type { startups } from "@/db/schema";
import {
  asAllocation,
  asCompetitors,
  asMoney,
  countWords,
  formatMoney,
  marketSizeWarning,
  DESCRIPTION_QUESTION_ID,
} from "./questionnaire";
import type { Answers } from "./questionnaire";

export type SummarySource = "profile" | "questionnaire" | "merged" | "missing";

export type SummaryField = {
  id: string;
  label: string;
  /** Editable display value shown to the founder and the admin */
  value: string;
  source: SummarySource;
  editable: boolean;
  /** Immutable originals — used to detect edits and to keep provenance */
  profileValue?: string | null;
  questionnaireValue?: string | null;
  /** Flagged when the two sources cannot be reconciled safely */
  conflict?: { message: string; profile: string; questionnaire: string };
  /** True when nothing was available from either source */
  missing?: boolean;
  /** Attachment reference (e.g. product screenshot) */
  fileId?: string;
  /** Extra context for the admin (not editable-by-accident) */
  note?: string;
};

export type SummarySection = {
  id: string;
  title: string;
  description?: string;
  fields: SummaryField[];
};

export type DeckSummary = {
  version: number;
  generatedAt: string;
  sections: SummarySection[];
  warnings: string[];
};

export type ProfileForSummary = typeof startups.$inferSelect;

export type BuildSummaryInput = {
  startup: ProfileForSummary;
  answers: Answers;
  /** Id of the uploaded product screenshot, when the founder uploaded one */
  screenshotFileId?: string | null;
  previousSummary?: DeckSummary | null;
};

const MISSING = "Not provided — flagged for review";

function clean(value: string | null | undefined): string {
  return (value ?? "").toString().trim();
}

/**
 * Dollar amounts from the profile are stored in cents and must be grouped
 * en-US. A bare `toLocaleString()` uses the *server's* locale, which on an
 * Indian host renders 150000 as "1,50,000" — wrong for a USD figure and
 * inconsistent with the client-rendered dashboards.
 */
function usd(cents: number | null | undefined): string {
  if (!cents) return "";
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

function textFrom(answers: Answers, id: string): string {
  return clean(answers[id] as string | undefined);
}

function listFrom(answers: Answers, id: string): string {
  const value = answers[id];
  if (!Array.isArray(value)) return "";
  return value.filter((v) => typeof v === "string" && v.trim()).join(", ");
}

function moneyFrom(answers: Answers, id: string): string {
  const value = answers[id];
  if (!value) return "";
  const m = asMoney(value);
  if (!m.value) return "";
  return formatMoney(value);
}

/**
 * Builds the merged, editable summary. Deterministic: same profile + answers
 * always produces the same structure, which keeps edits stable across reloads.
 */
export function buildDeckSummary({
  startup,
  answers,
  screenshotFileId,
  previousSummary,
}: BuildSummaryInput): DeckSummary {
  const warnings: string[] = [];

  // --- helpers ------------------------------------------------------------
  const edited = new Map<string, SummaryField>();
  if (previousSummary) {
    for (const section of previousSummary.sections) {
      for (const field of section.fields) edited.set(field.id, field);
    }
  }

  function field(input: {
    id: string;
    label: string;
    profileValue?: string | null;
    questionnaireValue?: string | null;
    /** which source wins by default when both exist */
    prefer?: "profile" | "questionnaire" | "merge-lines";
    conflictMessage?: string;
    note?: string;
    fileId?: string;
  }): SummaryField {
    const profileValue = clean(input.profileValue);
    const questionnaireValue = clean(input.questionnaireValue);
    const prefer: "profile" | "questionnaire" =
      input.prefer === "profile" ? "profile" : "questionnaire";

    let value = "";
    let source: SummarySource = "missing";

    if (profileValue && questionnaireValue) {
      if (input.prefer === "merge-lines") {
        value = `${profileValue}\n\n${questionnaireValue}`;
        source = "merged";
      } else {
        value = prefer === "profile" ? profileValue : questionnaireValue;
        source = prefer;
      }
    } else if (profileValue) {
      value = profileValue;
      source = "profile";
    } else if (questionnaireValue) {
      value = questionnaireValue;
      source = "questionnaire";
    }

    const missing = !value;
    const existing = edited.get(input.id);

    // Preserve founder edits across re-generation of the summary
    const finalValue = existing?.value?.trim() ? existing.value : value;

    return {
      id: input.id,
      label: input.label,
      value: missing ? MISSING : finalValue,
      source,
      editable: true,
      profileValue: profileValue || null,
      questionnaireValue: questionnaireValue || null,
      conflict:
        input.conflictMessage && profileValue && questionnaireValue
          ? {
              message: input.conflictMessage,
              profile: profileValue,
              questionnaire: questionnaireValue,
            }
          : undefined,
      missing,
      fileId: input.fileId,
      note: input.note,
    };
  }

  // --- Data pulled from the questionnaire ---------------------------------
  const description = textFrom(answers, DESCRIPTION_QUESTION_ID);
  const businessModel = textFrom(answers, "Q1A");
  const sellsTo = textFrom(answers, "Q1B");
  const paymentModel = textFrom(answers, "Q1C");
  const tam = moneyFrom(answers, "Q2");
  const sam = moneyFrom(answers, "Q3");
  const som = moneyFrom(answers, "Q4");
  const marketBasis = textFrom(answers, "Q5");
  const idealCustomer = textFrom(answers, "Q6");
  const productStage = textFrom(answers, "Q7");
  const demoLink = textFrom(answers, "Q7_DEMO");
  const competitors = asCompetitors(answers.Q8).filter((c) => c.name.trim());
  const moat = listFrom(answers, "Q9");
  const moatExplain = textFrom(answers, "Q9_TEXT");
  const acquisition = listFrom(answers, "Q10");
  const gtmExplain = textFrom(answers, "Q10_TEXT");
  const fundraisingStatus = textFrom(answers, "Q11");
  const raiseAmount = moneyFrom(answers, "Q11A");
  const outcome = textFrom(answers, "Q11C");
  const contactEmail = textFrom(answers, "Q12");

  const allocation = asAllocation(answers.Q11B);
  const allocationLines = (["product", "sales", "hiring", "operations"] as const)
    .filter((k) => allocation[k] > 0)
    .map(
      (k) =>
        `${k === "product" ? "Product / Technology" : k === "sales" ? "Sales & Marketing" : k === "hiring" ? "Hiring" : "Operations"}: ${allocation[k]}%`,
    )
    .concat(
      allocation.other > 0
        ? [`${allocation.otherLabel.trim() || "Other"}: ${allocation.other}%`]
        : [],
    );
  const useOfFunds = allocationLines.length ? allocationLines.join("\n") : "";

  // --- Profile / questionnaire reconciliation ------------------------------
  const profileStage = clean(startup.stage);
  const profileRaised = usd(startup.fundingRaised);

  // Recently closed round: the questionnaire amount should agree with the
  // total raised on the profile. Flag (never rewrite) if it does not.
  let raiseConflict: string | undefined;
  if (raiseAmount && profileRaised && fundraisingStatus === "closed") {
    const q = asMoney(answers.Q11A);
    const multiplier: Record<string, number> = {
      Lakh: 1e5,
      Crore: 1e7,
      Million: 1e6,
      Billion: 1e9,
    };
    const normalised = (parseFloat(q.value) || 0) * (multiplier[q.unit] ?? 1);
    const profileNumber = (startup.fundingRaised ?? 0) / 100;
    if (normalised > profileNumber * 1.15) {
      raiseConflict =
        "The amount you just raised is higher than the total raised on your profile. Confirm which figure is current.";
    }
  }

  const descriptionNote = description
    ? "Founder's own words — used for the intro/positioning slides."
    : undefined;

  const warningsList: string[] = [...warnings];
  const soft = marketSizeWarning(answers);
  if (soft) warningsList.push(soft);

  const sections: SummarySection[] = [
    {
      id: "company",
      title: "Company Overview",
      description: "Company facts. Most of these come from your existing startup profile.",
      fields: [
        field({ id: "company.name", label: "Company name", profileValue: startup.name, prefer: "profile" }),
        field({ id: "company.tagline", label: "Tagline", profileValue: startup.tagline, prefer: "profile" }),
        field({
          id: "company.description",
          label: "Startup description (founder's words)",
          questionnaireValue: description,
          note: descriptionNote,
        }),
        field({ id: "company.sector", label: "Sector", profileValue: startup.sector, prefer: "profile" }),
        field({
          id: "company.funding_stage",
          label: "Funding stage",
          profileValue: profileStage,
          prefer: "profile",
          note: productStage
            ? `Product stage collected separately in the questionnaire: ${productStage}.`
            : undefined,
        }),
        field({ id: "company.location", label: "Location", profileValue: startup.location, prefer: "profile" }),
        field({ id: "company.website", label: "Website", profileValue: startup.website, prefer: "profile" }),
        field({
          id: "company.contact_email",
          label: "Contact email",
          profileValue: contactEmail,
          prefer: "profile",
        }),
      ],
    },
    {
      id: "problem_solution",
      title: "Problem & Solution",
      description: "From your profile, with the founder's description kept alongside.",
      fields: [
        field({ id: "problem", label: "Problem", profileValue: startup.problem, prefer: "profile" }),
        field({ id: "solution", label: "Solution", profileValue: startup.solution, prefer: "profile" }),
        field({
          id: "positioning",
          label: "Positioning statement",
          profileValue: startup.tagline,
          questionnaireValue: description,
          prefer: "merge-lines",
          note: "Combines the profile tagline with the description you wrote in the questionnaire.",
        }),
      ],
    },
    {
      id: "market",
      title: "Market Opportunity",
      description: "New in the questionnaire — TAM, SAM and SOM as you entered them.",
      fields: [
        field({ id: "market.tam", label: "TAM (Total Addressable Market)", questionnaireValue: tam }),
        field({ id: "market.sam", label: "SAM (Serviceable Addressable Market)", questionnaireValue: sam }),
        field({ id: "market.som", label: "SOM (Serviceable Obtainable Market)", questionnaireValue: som }),
        field({ id: "market.basis", label: "Basis for the estimates", questionnaireValue: marketBasis }),
        field({ id: "market.ideal_customer", label: "Ideal customer", questionnaireValue: idealCustomer }),
      ],
    },
    {
      id: "business_model",
      title: "Business Model",
      description: "How you make money and who pays you.",
      fields: [
        field({ id: "model.primary", label: "Primary business model", questionnaireValue: businessModel }),
        field({ id: "model.buyer", label: "Who you sell to", questionnaireValue: sellsTo }),
        field({ id: "model.payment", label: "How customers pay", questionnaireValue: paymentModel }),
      ],
    },
    {
      id: "product",
      title: "Product & Stage",
      fields: [
        field({ id: "product.stage", label: "Product stage", questionnaireValue: productStage }),
        field({ id: "product.demo", label: "Demo link", questionnaireValue: demoLink }),
        field({
          id: "product.screenshot",
          label: "Product screenshot",
          questionnaireValue: screenshotFileId ? "Attached" : "",
          fileId: screenshotFileId ?? undefined,
          note: screenshotFileId
            ? "Stored privately — the admin can open it from the request detail page."
            : undefined,
        }),
      ],
    },
    {
      id: "traction",
      title: "Traction & Financials",
      description: "Pulled automatically from your profile. Edit here to correct the deck summary only — your profile is left untouched.",
      fields: [
        field({
          id: "traction.mrr",
          label: "Monthly recurring revenue (MRR)",
          profileValue: startup.mrr ? `${usd(startup.mrr)}/mo` : "",
          prefer: "profile",
        }),
        field({
          id: "traction.growth",
          label: "Monthly growth",
          profileValue: startup.monthlyGrowth ? `${startup.monthlyGrowth}%` : "",
          prefer: "profile",
        }),
        field({
          id: "traction.users",
          label: "Active users",
          profileValue: startup.activeUsers ? startup.activeUsers.toLocaleString() : "",
          prefer: "profile",
        }),
        field({
          id: "traction.customers",
          label: "Paying customers",
          profileValue: startup.customers ? startup.customers.toLocaleString() : "",
          prefer: "profile",
        }),
        field({
          id: "traction.total_raised",
          label: "Total raised to date",
          profileValue: profileRaised,
          prefer: "profile",
        }),
        field({
          id: "traction.burn",
          label: "Monthly burn",
          profileValue: startup.burnRate ? `${usd(startup.burnRate)}/mo` : "",
          prefer: "profile",
        }),
        field({
          id: "traction.runway",
          label: "Runway",
          profileValue: startup.runwayMonths ? `${startup.runwayMonths} months` : "",
          prefer: "profile",
        }),
      ],
    },
    {
      id: "competition",
      title: "Competition",
      fields: [
        field({
          id: "competition.list",
          label: "Competitors and alternatives",
          questionnaireValue: competitors
            .map((c) => `• ${c.name}${c.difference ? ` — ${c.difference}` : ""}`)
            .join("\n"),
          note: competitors.some((c) => !c.difference)
            ? "Some competitors have no differentiation line — strengthen the Competition slide."
            : undefined,
        }),
      ],
    },
    {
      id: "moat",
      title: "Defensibility / Moat",
      fields: [
        field({ id: "moat.tags", label: "Moat (selected)", questionnaireValue: moat }),
        field({ id: "moat.explanation", label: "Moat explained", questionnaireValue: moatExplain }),
      ],
    },
    {
      id: "gtm",
      title: "Go-to-Market",
      fields: [
        field({ id: "gtm.channels", label: "Customer acquisition channels", questionnaireValue: acquisition }),
        field({ id: "gtm.strategy", label: "Go-to-market strategy", questionnaireValue: gtmExplain }),
      ],
    },
    {
      id: "team",
      title: "Team",
      description: "From your profile. Edit here to adjust the deck summary only.",
      fields: [
        field({ id: "team.founder", label: "Founder", profileValue: startup.founderName, prefer: "profile" }),
        field({ id: "team.role", label: "Role", profileValue: startup.founderRole, prefer: "profile" }),
        field({ id: "team.bio", label: "Founder bio", profileValue: startup.founderBio, prefer: "profile" }),
        field({ id: "team.linkedin", label: "LinkedIn", profileValue: startup.founderLinkedin, prefer: "profile" }),
        field({
          id: "team.size",
          label: "Team size",
          profileValue: startup.teamSize ? String(startup.teamSize) : "",
          prefer: "profile",
        }),
      ],
    },
    {
      id: "ask",
      title: "Fundraising & Ask",
      fields: [
        field({
          id: "ask.status",
          label: "Fundraising status",
          questionnaireValue: fundraisingStatus
            ? fundraisingStatus
                .replace(/_/g, " ")
                .replace(/^\w/, (c) => c.toUpperCase())
            : "",
        }),
        field({
          id: "ask.amount",
          label: "Raise amount",
          profileValue: profileRaised,
          questionnaireValue: raiseAmount,
          prefer: "questionnaire",
          conflictMessage: raiseConflict,
        }),
        field({
          id: "ask.use_of_funds",
          label: "Use of funds",
          questionnaireValue: useOfFunds,
        }),
        field({
          id: "ask.outcome",
          label: "What this funding achieves (12-18 months)",
          questionnaireValue: outcome,
        }),
      ],
    },
  ];

  // Collect warnings from every section
  for (const section of sections) {
    for (const f of section.fields) {
      if (f.conflict) warningsList.push(`${f.label}: ${f.conflict.message}`);
    }
    const emptyCount = section.fields.filter((f) => f.missing).length;
    if (emptyCount === section.fields.length) {
      warningsList.push(`${section.title}: no information available — this section may be skipped in the deck.`);
    }
  }

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    sections,
    warnings: Array.from(new Set(warningsList)),
  };
}

/** Flat list of editable fields — used by the summary editor client. */
export function summaryFieldMap(summary: DeckSummary): Record<string, SummaryField> {
  const map: Record<string, SummaryField> = {};
  for (const section of summary.sections) {
    for (const f of section.fields) map[f.id] = f;
  }
  return map;
}

/** Counts genuinely empty fields (used for the admin/summary completeness hint). */
export function summaryCompleteness(summary: DeckSummary): { filled: number; total: number } {
  let filled = 0;
  let total = 0;
  for (const section of summary.sections) {
    for (const f of section.fields) {
      if (!f.editable) continue;
      total += 1;
      if (!f.missing && f.value.trim()) filled += 1;
    }
  }
  return { filled, total };
}

/** Word count helper reused by the description question renderer. */
export function descriptionWordCount(answers: Answers): number {
  return countWords(textFrom(answers, DESCRIPTION_QUESTION_ID));
}
