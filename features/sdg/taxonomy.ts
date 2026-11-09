/**
 * Canonical United Nations Sustainable Development Goals.
 *
 * This is the single source of truth for SDG identifiers, names and colours.
 * Every surface (startup profiles, investor preferences, Explore filters,
 * rankings, competitions, pitch decks, admin review) imports from here, so a
 * goal can never be labelled or numbered differently in two places.
 *
 * Ids are the official UN goal numbers (1-17). Names follow the official UN
 * wording. `shortName` is the compact label used in badges and chips.
 */

export type SdgGoal = {
  id: number;
  name: string;
  shortName: string;
  /** Official UN colour for the goal. Used as a small accent only. */
  color: string;
  /** One-line description of what the goal covers. */
  description: string;
};

export const SDG_GOALS: readonly SdgGoal[] = [
  {
    id: 1,
    name: "No Poverty",
    shortName: "No Poverty",
    color: "#E5243B",
    description: "End poverty in all its forms everywhere.",
  },
  {
    id: 2,
    name: "Zero Hunger",
    shortName: "Zero Hunger",
    color: "#DDA63A",
    description: "End hunger, achieve food security and improved nutrition.",
  },
  {
    id: 3,
    name: "Good Health and Well-being",
    shortName: "Good Health",
    color: "#4C9F38",
    description: "Ensure healthy lives and promote well-being for all ages.",
  },
  {
    id: 4,
    name: "Quality Education",
    shortName: "Quality Education",
    color: "#C5192D",
    description: "Ensure inclusive and equitable quality education.",
  },
  {
    id: 5,
    name: "Gender Equality",
    shortName: "Gender Equality",
    color: "#FF3A21",
    description: "Achieve gender equality and empower all women and girls.",
  },
  {
    id: 6,
    name: "Clean Water and Sanitation",
    shortName: "Clean Water",
    color: "#26BDE2",
    description: "Ensure availability of water and sanitation for all.",
  },
  {
    id: 7,
    name: "Affordable and Clean Energy",
    shortName: "Clean Energy",
    color: "#FCC30B",
    description: "Ensure access to affordable, reliable, sustainable energy.",
  },
  {
    id: 8,
    name: "Decent Work and Economic Growth",
    shortName: "Decent Work",
    color: "#A21942",
    description: "Promote sustained, inclusive and sustainable economic growth.",
  },
  {
    id: 9,
    name: "Industry, Innovation and Infrastructure",
    shortName: "Industry & Innovation",
    color: "#FD6925",
    description: "Build resilient infrastructure and foster innovation.",
  },
  {
    id: 10,
    name: "Reduced Inequalities",
    shortName: "Reduced Inequalities",
    color: "#DD1367",
    description: "Reduce inequality within and among countries.",
  },
  {
    id: 11,
    name: "Sustainable Cities and Communities",
    shortName: "Sustainable Cities",
    color: "#FD9D24",
    description: "Make cities inclusive, safe, resilient and sustainable.",
  },
  {
    id: 12,
    name: "Responsible Consumption and Production",
    shortName: "Responsible Consumption",
    color: "#BF8B2E",
    description: "Ensure sustainable consumption and production patterns.",
  },
  {
    id: 13,
    name: "Climate Action",
    shortName: "Climate Action",
    color: "#3F7E44",
    description: "Take urgent action to combat climate change and its impacts.",
  },
  {
    id: 14,
    name: "Life Below Water",
    shortName: "Life Below Water",
    color: "#0A97D9",
    description: "Conserve and sustainably use marine resources.",
  },
  {
    id: 15,
    name: "Life on Land",
    shortName: "Life on Land",
    color: "#56C02B",
    description: "Protect terrestrial ecosystems and halt biodiversity loss.",
  },
  {
    id: 16,
    name: "Peace, Justice and Strong Institutions",
    shortName: "Peace & Justice",
    color: "#00689D",
    description: "Promote peaceful societies and accountable institutions.",
  },
  {
    id: 17,
    name: "Partnerships for the Goals",
    shortName: "Partnerships",
    color: "#19486A",
    description: "Strengthen the means of implementation and partnerships.",
  },
] as const;

export const SDG_GOAL_COUNT = SDG_GOALS.length;

export const SDG_IDS: readonly number[] = SDG_GOALS.map((goal) => goal.id);

const BY_ID = new Map<number, SdgGoal>(SDG_GOALS.map((goal) => [goal.id, goal]));

/** True only for an integer id that exists in the official taxonomy. */
export function isSdgId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    BY_ID.has(value)
  );
}

export function sdgGoal(id: number): SdgGoal | undefined {
  return BY_ID.get(id);
}

/** Full official goal name, with a safe fallback for malformed input. */
export function sdgName(id: number): string {
  return BY_ID.get(id)?.name ?? `SDG ${id}`;
}

export function sdgShortName(id: number): string {
  return BY_ID.get(id)?.shortName ?? `SDG ${id}`;
}

export function sdgColor(id: number): string {
  return BY_ID.get(id)?.color ?? "var(--border-hover)";
}

/** Compact label used by existing competition badges. */
export function sdgLabel(id: number): string {
  return sdgName(id);
}

/**
 * Normalises arbitrary user/API input into a validated, de-duplicated,
 * ascending list of official goal ids.
 *
 * Accepts an array (settings / API payloads) or a comma-separated string
 * (query parameters). Unknown values are dropped instead of failing the whole
 * request, so an old client can never write a non-existent goal.
 */
export function sanitizeSdgIds(value: unknown): number[] {
  const raw: unknown[] = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const ids = new Set<number>();
  for (const entry of raw) {
    const id =
      typeof entry === "number"
        ? entry
        : typeof entry === "string" && entry.trim() !== ""
          ? Number(entry)
          : NaN;
    if (isSdgId(id)) ids.add(id);
  }

  return [...ids].sort((a, b) => a - b);
}

/**
 * A primary goal is only valid while it belongs to the selected set. Removing
 * the primary selection therefore clears the designation instead of leaving a
 * dangling reference.
 */
export function normalizeSdgPrimary(
  goals: readonly number[],
  primary: unknown
): number | null {
  const id =
    typeof primary === "number"
      ? primary
      : typeof primary === "string" && primary.trim() !== ""
        ? Number(primary)
        : NaN;

  return goals.includes(id) ? id : null;
}

/** Orders goal ids for display: primary first, then ascending. */
export function orderSdgGoals(
  goals: readonly number[],
  primary: number | null | undefined
): number[] {
  const rest = goals.filter((id) => id !== primary);
  return primary && goals.includes(primary) ? [primary, ...rest] : [...goals];
}

export function sdgSelectionMatches(
  goals: readonly number[],
  selected: readonly number[],
  mode: "any" | "all" = "any"
): boolean {
  if (selected.length === 0) return true;
  return mode === "all"
    ? selected.every((id) => goals.includes(id))
    : selected.some((id) => goals.includes(id));
}
