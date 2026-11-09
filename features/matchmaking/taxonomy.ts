/**
 * Deterministic business vocabulary used by the matchmaking engine.
 *
 * Everything here is plain data + pure functions: no API calls, no randomness
 * and no model inference. The lists can be extended later without touching the
 * scoring code, and every match can be traced back to one of these categories.
 */

export type Capability = {
  id: string;
  label: string;
  /** Keywords/phrases that indicate this capability. Matched on word boundaries. */
  keywords: string[];
};

export const CAPABILITIES: Capability[] = [
  {
    id: "packaging",
    label: "packaging",
    keywords: [
      "packaging",
      "package",
      "packaged",
      "packs",
      "wrapping",
      "containers",
      "cartons",
      "bottles",
      "labels",
      "labelling",
      "pouches",
      "refill",
      "reusable",
      "compostable",
      "single-use",
    ],
  },
  {
    id: "logistics",
    label: "logistics and fulfilment",
    keywords: [
      "logistics",
      "shipping",
      "delivery",
      "fulfilment",
      "fulfillment",
      "courier",
      "freight",
      "warehouse",
      "warehousing",
      "last-mile",
      "supply chain",
      "transport",
      "fleet",
    ],
  },
  {
    id: "manufacturing",
    label: "manufacturing",
    keywords: [
      "manufacturing",
      "manufacturer",
      "production",
      "factory",
      "fabrication",
      "assembly",
      "contract manufacturing",
      "oem",
      "tooling",
      "machining",
      "injection molding",
      "moulding",
      "molding",
    ],
  },
  {
    id: "distribution",
    label: "distribution and retail access",
    keywords: [
      "distribution",
      "distributor",
      "retail",
      "wholesale",
      "stockists",
      "reseller",
      "market access",
      "shelf space",
      "channel partners",
      "supermarkets",
      "grocers",
    ],
  },
  {
    id: "marketing",
    label: "marketing and growth",
    keywords: [
      "marketing",
      "advertising",
      "growth marketing",
      "seo",
      "performance marketing",
      "social media",
      "influencer",
      "campaign",
      "public relations",
      "co-marketing",
      "lead generation",
      "brand awareness",
    ],
  },
  {
    id: "design",
    label: "design and branding",
    keywords: [
      "design",
      "branding",
      "ux",
      "ui",
      "product design",
      "creative studio",
      "packaging design",
      "graphic",
      "visual identity",
    ],
  },
  {
    id: "software",
    label: "software",
    keywords: [
      "software",
      "saas",
      "platform",
      "app",
      "api",
      "dashboard",
      "automation",
      "crm",
      "erp",
      "workflow",
      "no-code",
      "tool",
    ],
  },
  {
    id: "ai_data",
    label: "data and AI",
    keywords: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "ml",
      "data analytics",
      "analytics",
      "insights",
      "forecasting",
      "llm",
      "computer vision",
      "data platform",
      "predictive",
    ],
  },
  {
    id: "fintech",
    label: "payments and finance operations",
    keywords: [
      "payments",
      "payment",
      "lending",
      "credit",
      "banking",
      "invoicing",
      "accounting",
      "bookkeeping",
      "payroll",
      "insurance",
      "treasury",
      "fintech",
      "financial",
      "expense",
    ],
  },
  {
    id: "legal",
    label: "legal and compliance",
    keywords: [
      "legal",
      "compliance",
      "contracts",
      "regulatory",
      "incorporation",
      "trademark",
      "intellectual property",
      "gst",
      "tax filing",
      "audit",
    ],
  },
  {
    id: "talent",
    label: "hiring and talent",
    keywords: [
      "hiring",
      "recruitment",
      "recruiting",
      "talent",
      "human resources",
      "hr",
      "staffing",
      "people ops",
      "upskilling",
      "training",
    ],
  },
  {
    id: "cloud_infra",
    label: "cloud infrastructure",
    keywords: [
      "cloud",
      "hosting",
      "devops",
      "infrastructure",
      "servers",
      "kubernetes",
      "serverless",
      "database",
    ],
  },
  {
    id: "cybersecurity",
    label: "cybersecurity",
    keywords: [
      "cybersecurity",
      "security",
      "penetration testing",
      "soc2",
      "iso 27001",
      "threat",
      "encryption",
      "fraud detection",
    ],
  },
  {
    id: "sustainability",
    label: "sustainability",
    keywords: [
      "sustainability",
      "sustainable",
      "circular",
      "recycling",
      "recycled",
      "carbon",
      "emissions",
      "esg",
      "biodegradable",
      "waste",
      "renewable",
      "climate",
    ],
  },
  {
    id: "food",
    label: "food and beverage",
    keywords: [
      "food",
      "beverage",
      "snacks",
      "drinks",
      "grocery",
      "fmcg",
      "dairy",
      "bakery",
      "coffee",
      "tea",
      "nutrition",
      "restaurant",
      "kitchen",
    ],
  },
  {
    id: "ecommerce",
    label: "e-commerce and D2C",
    keywords: [
      "ecommerce",
      "e-commerce",
      "d2c",
      "direct-to-consumer",
      "online store",
      "shopify",
      "marketplace",
      "checkout",
      "cart",
      "shoppers",
    ],
  },
  {
    id: "hardware",
    label: "hardware and devices",
    keywords: [
      "hardware",
      "iot",
      "sensors",
      "device",
      "electronics",
      "robotics",
      "drone",
      "embedded",
    ],
  },
  {
    id: "health",
    label: "health and healthcare",
    keywords: [
      "health",
      "healthcare",
      "medical",
      "clinic",
      "patient",
      "diagnostics",
      "wellness",
      "pharma",
      "telehealth",
    ],
  },
  {
    id: "education",
    label: "education and learning",
    keywords: [
      "education",
      "learning",
      "edtech",
      "school",
      "students",
      "courses",
      "skilling",
      "curriculum",
    ],
  },
  {
    id: "media",
    label: "media and content",
    keywords: [
      "media",
      "content",
      "video",
      "podcast",
      "publishing",
      "streaming",
      "creator",
      "gaming",
      "games",
      "entertainment",
    ],
  },
  {
    id: "agriculture",
    label: "agriculture",
    keywords: [
      "agriculture",
      "farming",
      "agritech",
      "crops",
      "farm",
      "harvest",
      "agri",
      "livestock",
    ],
  },
  {
    id: "energy",
    label: "energy",
    keywords: [
      "energy",
      "solar",
      "battery",
      "ev",
      "charging",
      "power grid",
      "clean energy",
    ],
  },
  {
    id: "construction",
    label: "construction and real estate",
    keywords: [
      "construction",
      "real estate",
      "building",
      "architecture",
      "interior",
      "proptech",
      "infrastructure projects",
    ],
  },
  {
    id: "support",
    label: "customer support",
    keywords: [
      "customer support",
      "helpdesk",
      "call center",
      "chatbot",
      "customer service",
      "support desk",
    ],
  },
  {
    id: "travel",
    label: "travel and hospitality",
    keywords: [
      "travel",
      "tourism",
      "hospitality",
      "booking",
      "hotel",
      "guest",
    ],
  },
  {
    id: "events",
    label: "events and exhibitions",
    keywords: ["events", "exhibition", "conference", "trade show", "expo"],
  },
];

export const CAPABILITY_BY_ID = new Map(
  CAPABILITIES.map((capability) => [capability.id, capability])
);

/**
 * How well two capability areas pair up for a bundle, co-marketing or
 * supplier relationship. Undirected; `capabilityAffinity` checks both orders.
 * Only pairs that are business-relevant are listed — everything else is 0.
 */
const CAPABILITY_AFFINITY: Record<string, number> = {
  "food|packaging": 0.9,
  "distribution|food": 0.75,
  "agriculture|food": 0.8,
  "ecommerce|logistics": 0.9,
  "logistics|manufacturing": 0.6,
  "distribution|logistics": 0.7,
  "ecommerce|marketing": 0.75,
  "marketing|media": 0.7,
  "design|marketing": 0.65,
  "design|packaging": 0.6,
  "manufacturing|packaging": 0.7,
  "hardware|manufacturing": 0.65,
  "distribution|ecommerce": 0.7,
  "ecommerce|fintech": 0.6,
  "fintech|software": 0.55,
  "health|software": 0.5,
  "education|software": 0.5,
  "logistics|software": 0.55,
  "manufacturing|software": 0.5,
  "agriculture|software": 0.45,
  "construction|software": 0.45,
  "energy|software": 0.45,
  "legal|software": 0.5,
  "software|talent": 0.5,
  "ecommerce|software": 0.6,
  "media|software": 0.4,
  "ai_data|software": 0.6,
  "ai_data|marketing": 0.6,
  "ai_data|health": 0.55,
  "ai_data|fintech": 0.5,
  "ai_data|logistics": 0.5,
  "ai_data|manufacturing": 0.5,
  "ai_data|education": 0.45,
  "energy|sustainability": 0.8,
  "packaging|sustainability": 0.85,
  "food|sustainability": 0.6,
  "manufacturing|sustainability": 0.6,
  "logistics|sustainability": 0.5,
  "cloud_infra|software": 0.7,
  "cloud_infra|cybersecurity": 0.6,
  "cybersecurity|software": 0.55,
  "agriculture|logistics": 0.55,
  "distribution|packaging": 0.6,
  "construction|energy": 0.6,
  "energy|hardware": 0.5,
  "events|marketing": 0.55,
  "support|software": 0.5,
  "travel|software": 0.45,
  "health|packaging": 0.4,
  "food|hardware": 0.4,
};

export function capabilityAffinity(a: string, b: string): number {
  if (a === b) return 0.4; // same area: possible bundle, never a strong signal
  return CAPABILITY_AFFINITY[`${a}|${b}`] ?? CAPABILITY_AFFINITY[`${b}|${a}`] ?? 0;
}

// ============================================
// SECTORS
// ============================================
// Mirrors the sector values collected by onboarding/explore. Unknown or custom
// sectors are treated as "no signal" rather than as incompatible.
const SECTOR_GROUPS: Record<string, string> = {
  saas: "tech",
  "ai/ml": "tech",
  cybersecurity: "tech",
  marketplace: "commerce",
  fintech: "finance",
  banking: "finance",
  insurance: "finance",
  healthtech: "health",
  biotech: "health",
  healthcare: "health",
  edtech: "education",
  education: "education",
  climate: "climate",
  energy: "climate",
  sustainability: "climate",
  "e-commerce": "commerce",
  ecommerce: "commerce",
  retail: "commerce",
  media: "media",
  gaming: "media",
  entertainment: "media",
};

const SECTOR_ADJACENCY: Record<string, number> = {
  "ai/ml|saas": 0.75,
  "ai/ml|fintech": 0.5,
  "ai/ml|healthtech": 0.5,
  "ai/ml|e-commerce": 0.5,
  "cybersecurity|fintech": 0.6,
  "fintech|saas": 0.6,
  "e-commerce|fintech": 0.6,
  "e-commerce|marketplace": 0.85,
  "e-commerce|saas": 0.55,
  "marketplace|saas": 0.55,
  "climate|e-commerce": 0.4,
  "biotech|healthtech": 0.85,
  "edtech|saas": 0.55,
  "healthtech|saas": 0.55,
  "media|saas": 0.45,
  "gaming|media": 0.8,
};

export function normalizeSector(sector: string | null | undefined): string | null {
  if (!sector) return null;
  const cleaned = sector.trim().toLowerCase();
  const known = SECTOR_GROUPS[cleaned] ?? SECTOR_GROUPS[cleaned.replace(/\s+/g, "")];
  if (known) return cleaned.replace(/\s+/g, "");
  if (cleaned === "other" || cleaned === "") return null;
  // Custom sectors still compare against each other, just without a group map.
  return cleaned.replace(/\s+/g, "");
}

/**
 * 1 = same sector, 0.8 = same broad group, 0.2-0.85 = adjacent, 0.2 = unrelated.
 * Different sectors are never treated as incompatible (0), because horizontal
 * businesses (software, packaging, logistics) routinely sell across industries.
 */
export function sectorRelation(
  a: string | null | undefined,
  b: string | null | undefined
): number | null {
  const left = normalizeSector(a);
  const right = normalizeSector(b);
  if (!left || !right) return null;
  if (left === right) return 1;
  const adjacency = SECTOR_ADJACENCY[`${left}|${right}`] ?? SECTOR_ADJACENCY[`${right}|${left}`];
  if (adjacency) return adjacency;
  const leftGroup = SECTOR_GROUPS[left];
  const rightGroup = SECTOR_GROUPS[right];
  if (leftGroup && rightGroup && leftGroup === rightGroup) return 0.8;
  return 0.2;
}

// ============================================
// CUSTOMER SEGMENTS
// ============================================
export type AudienceId =
  | "b2b"
  | "b2c"
  | "enterprise"
  | "smb"
  | "developers"
  | "retailers";

export const AUDIENCE_LABELS: Record<AudienceId, string> = {
  b2b: "business customers",
  b2c: "consumers",
  enterprise: "enterprise buyers",
  smb: "small and growing businesses",
  developers: "developers and technical teams",
  retailers: "retailers and distributors",
};

const AUDIENCE_KEYWORDS: Record<AudienceId, string[]> = {
  b2b: ["b2b", "businesses", "companies", "teams", "organizations", "organisations", "brands", "agencies"],
  b2c: ["b2c", "consumers", "shoppers", "individuals", "households", "families", "people"],
  enterprise: ["enterprise", "corporations", "large companies"],
  smb: ["smb", "sme", "small business", "small businesses", "startups", "local businesses"],
  developers: ["developers", "developers", "engineering teams", "api users"],
  retailers: ["retailers", "shops", "stores", "supermarkets", "grocers", "distributors"],
};

// ============================================
// TEXT HELPERS
// ============================================
export function normalizeText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(haystack: string, phrase: string): boolean {
  const normalized = normalizeText(phrase);
  if (!normalized) return false;
  return ` ${haystack} `.includes(` ${normalized} `);
}

/** Capability ids explicitly mentioned in a free-text field. */
export function detectCapabilities(
  value: string | null | undefined
): Set<string> {
  const text = normalizeText(value);
  const found = new Set<string>();
  if (!text) return found;
  for (const capability of CAPABILITIES) {
    if (capability.keywords.some((keyword) => containsPhrase(text, keyword))) {
      found.add(capability.id);
    }
  }
  return found;
}

export function detectCapabilitiesInList(
  values: (string | null | undefined)[] | null | undefined
): Set<string> {
  const found = new Set<string>();
  for (const value of values ?? []) {
    for (const id of detectCapabilities(value)) found.add(id);
  }
  return found;
}

export function detectAudiences(values: (string | null | undefined)[]): Set<AudienceId> {
  const text = normalizeText(values.filter(Boolean).join(" "));
  const found = new Set<AudienceId>();
  if (!text) return found;
  for (const [id, keywords] of Object.entries(AUDIENCE_KEYWORDS) as [
    AudienceId,
    string[],
  ][]) {
    if (keywords.some((keyword) => containsPhrase(text, keyword))) found.add(id);
  }
  return found;
}

export function capabilityLabel(id: string): string {
  return CAPABILITY_BY_ID.get(id)?.label ?? id.replace(/_/g, " ");
}
