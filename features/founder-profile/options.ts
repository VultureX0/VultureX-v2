/**
 * Pure founder-personalisation vocabulary.
 *
 * Kept free of database imports so client forms, the For You page and the API
 * all share exactly the same option values. Nothing here is a claim about the
 * founder; every value is self-declared and optional.
 */

export const LANGUAGE_VALUES = ["en", "hi", "pa"] as const;
export type FounderLanguage = (typeof LANGUAGE_VALUES)[number];

export const COLLABORATION_VISIBILITY_VALUES = ["public", "network", "private"] as const;
export type CollaborationVisibility = (typeof COLLABORATION_VISIBILITY_VALUES)[number];

export type Option = { value: string; label: string; description?: string };

export const LANGUAGES: { value: FounderLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी · Hindi" },
  { value: "pa", label: "ਪੰਜਾਬੀ · Punjabi" },
];

export const OBJECTIVES: Option[] = [
  { value: "validate-idea", label: "Validate an idea" },
  { value: "find-customers", label: "Find first customers" },
  { value: "build-product", label: "Build the product" },
  { value: "grow-revenue", label: "Grow revenue" },
  { value: "raise-funding", label: "Prepare for funding" },
  { value: "hire-team", label: "Build a team" },
  { value: "expand-market", label: "Expand to a new market" },
  { value: "measure-impact", label: "Measure impact" },
];

export const CHALLENGES: Option[] = [
  { value: "customer-discovery", label: "Customer discovery" },
  { value: "pricing", label: "Pricing" },
  { value: "funding", label: "Funding" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "product", label: "Product" },
  { value: "operations", label: "Operations" },
  { value: "hiring", label: "Hiring" },
  { value: "legal", label: "Legal & compliance" },
  { value: "collaboration", label: "Finding partners" },
  { value: "impact", label: "Impact measurement" },
  { value: "time", label: "Managing time" },
];

export const GUIDANCE_AREAS: Option[] = [
  { value: "strategy", label: "Strategy" },
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "product", label: "Product" },
  { value: "technology", label: "Technology" },
  { value: "operations", label: "Operations" },
  { value: "impact", label: "Impact" },
  { value: "fundraising", label: "Fundraising" },
];

export const PRIORITIES: Option[] = [
  { value: "validate-idea", label: "Validate the idea" },
  { value: "first-customers", label: "Win first customers" },
  { value: "revenue", label: "Reach revenue" },
  { value: "product", label: "Ship the product" },
  { value: "team", label: "Build the team" },
  { value: "funding", label: "Raise funding" },
  { value: "partnerships", label: "Build partnerships" },
  { value: "impact", label: "Prove impact" },
];

export const LEARNING_INTERESTS: Option[] = [
  { value: "startup-basics", label: "Startup basics" },
  { value: "industry-guides", label: "Industry guides" },
  { value: "funding", label: "Funding" },
  { value: "marketing", label: "Marketing & sales" },
  { value: "tools", label: "Tools & templates" },
  { value: "collaboration", label: "Collaboration" },
  { value: "impact", label: "Impact" },
  { value: "scam-awareness", label: "Staying safe" },
];

export const FUNDING_INTERESTS: Option[] = [
  { value: "bootstrapping", label: "Bootstrapping" },
  { value: "grants", label: "Grants & schemes" },
  { value: "loans", label: "Loans" },
  { value: "equity", label: "Equity funding" },
  { value: "incubators", label: "Incubators & accelerators" },
  { value: "not-sure", label: "Not sure yet" },
];

export const MARKETING_NEEDS: Option[] = [
  { value: "channels", label: "Choosing channels" },
  { value: "content", label: "Content planning" },
  { value: "acquisition", label: "Customer acquisition" },
  { value: "sales-system", label: "Sales systems" },
  { value: "crm", label: "CRM basics" },
];

export const COLLABORATION_INTERESTS: Option[] = [
  { value: "find-partner", label: "Find a startup partner" },
  { value: "offer-capability", label: "Offer a capability" },
  { value: "pilot", label: "Run a pilot" },
  { value: "distribution", label: "Distribution" },
  { value: "technology", label: "Technology" },
  { value: "manufacturing", label: "Manufacturing" },
];

export const RECOMMENDATION_TYPES: Option[] = [
  { value: "roadmap", label: "Roadmap actions" },
  { value: "resources", label: "Learning resources" },
  { value: "opportunities", label: "Opportunities" },
  { value: "collaboration", label: "Collaboration matches" },
];

export const COLLABORATION_VISIBILITY_OPTIONS: {
  value: CollaborationVisibility;
  label: string;
  description: string;
}[] = [
  {
    value: "private",
    label: "Private",
    description: "Keep collaboration interests visible only to you.",
  },
  {
    value: "network",
    label: "VultureX network",
    description: "Saved for collaboration matching with signed-in founders when it launches.",
  },
  {
    value: "public",
    label: "Public",
    description: "Saved for a future public collaboration profile. Nothing is published today.",
  },
];

/**
 * Challenge → existing Knowledge Hub destination. Used only to route a founder
 * to a relevant section they already saved a challenge about; it is not a
 * recommendation score.
 */
export const CHALLENGE_HUB_LINKS: Record<string, string> = {
  "customer-discovery": "/knowledge-hub/start-business#idea-validation",
  pricing: "/knowledge-hub/start-business#business-model",
  funding: "/knowledge-hub/funding",
  marketing: "/knowledge-hub/marketing-sales",
  sales: "/knowledge-hub/marketing-sales#sales-systems",
  product: "/knowledge-hub/start-business#launch",
  operations: "/knowledge-hub/start-business#operations",
  hiring: "/knowledge-hub/community",
  legal: "/knowledge-hub/start-business#business-setup",
  collaboration: "/knowledge-hub/collaboration",
  impact: "/knowledge-hub/impact",
  time: "/knowledge-hub/tools-templates",
};

export function optionLabel(options: Option[], value: string | null | undefined): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? null;
}

export function languageLabel(value: string | null | undefined): string {
  return LANGUAGES.find((language) => language.value === value)?.label ?? "English";
}

export function optionLabels(options: Option[], values: string[] | null | undefined): string[] {
  if (!values) return [];
  return values
    .map((value) => optionLabel(options, value))
    .filter((label): label is string => Boolean(label));
}
