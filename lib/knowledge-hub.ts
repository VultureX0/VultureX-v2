/**
 * Knowledge Hub content model.
 *
 * Every destination, card, breadcrumb, cross-link and search result on the hub
 * reads this one file. Pages are rendered from it, so adding a guide later does
 * not require a new layout or a second navigation system.
 *
 * Content rules for this phase:
 * - Nothing here is an external or "official" resource; these are VultureX
 *   explainers and topic outlines authored for the hub.
 * - No statistics, dates, authors, popularity counts or verification badges are
 *   stored, because no content system records them yet.
 * - Tools that are not built are listed as planned directory entries and are
 *   never linked as if they work.
 */

import { slugify } from "@/lib/utils";

export type HubIconKey =
  | "sparkles"
  | "rocket"
  | "factory"
  | "wallet"
  | "megaphone"
  | "wrench"
  | "lightbulb"
  | "leaf"
  | "shield"
  | "users"
  | "handshake";

export type HubTopic = {
  title: string;
  description: string;
  /** Optional short status note, e.g. a planned tool. Never invents metadata. */
  meta?: string;
};

export type HubGroup = {
  title: string;
  description?: string;
  items: HubTopic[];
};

export type HubSection = {
  slug: string;
  title: string;
  navTitle: string;
  eyebrow: string;
  /** One sentence used on cards, metadata and search results. */
  summary: string;
  /** Intro paragraphs for the destination page. */
  intro: string[];
  icon: HubIconKey;
  topics: HubTopic[];
  groups?: HubGroup[];
  /** Accuracy / scope notes shown at the end of the page. */
  notes?: string[];
  /** Slugs of related destinations. */
  related: string[];
  cta?: { label: string; href: string; hint?: string };
};

export const HUB_ROOT = "/knowledge-hub";

export function hubSectionHref(slug: string): string {
  return `${HUB_ROOT}/${slug}`;
}

/** Stable in-page anchor for a topic or group heading. */
export function hubAnchor(title: string): string {
  return slugify(title);
}

export const HUB_SECTIONS: HubSection[] = [
  {
    slug: "for-you",
    title: "For You",
    navTitle: "For You",
    eyebrow: "Personal workspace",
    summary:
      "Your founder workspace: the next actions on your plate, what you are learning and the opportunities worth a look.",
    intro: [
      "For You is the founder home inside the Knowledge Hub. It pulls together your startup stage, the next actions worth doing and the parts of the hub that match where your business is right now.",
      "Everything shown is read from your own VultureX profile. Where a feature is not connected yet, the section says so instead of filling the space with sample numbers.",
    ],
    icon: "sparkles",
    topics: [
      {
        title: "Your next three actions",
        description:
          "A short, prioritised list built from the gaps in your startup profile, your pitch deck status and your business matches.",
      },
      {
        title: "Learning progress",
        description:
          "Resources you have started inside the hub. Nothing is marked complete until a learning record exists for your account.",
      },
      {
        title: "Founder metrics",
        description:
          "Profile views, investor interest and pitch deck counts taken from your own startup record.",
      },
      {
        title: "Opportunities for your stage",
        description:
          "Competitions and programmes published on VultureX, shown with their real deadline and status.",
      },
    ],
    related: ["start-business", "funding", "collaboration"],
  },
  {
    slug: "start-business",
    title: "Start a Business",
    navTitle: "Start a Business",
    eyebrow: "Founder journey",
    summary:
      "A five-stage path from a raw idea to a business that runs without you holding every thread.",
    intro: [
      "Starting a business is less about having a brilliant idea and more about reducing uncertainty in the right order. This path lays out the five stages most founders move through, what each stage is for and what evidence you should have before moving on.",
      "Work through it in sequence the first time. Later, use it as a checklist when something feels stuck — most stalls trace back to a skipped stage rather than a missing tactic.",
    ],
    icon: "rocket",
    topics: [
      {
        title: "Idea validation",
        description:
          "Test whether the problem is real, urgent and paid for today. Talk to people who already spend money or time on the problem, then look for evidence stronger than politeness.",
      },
      {
        title: "Business model",
        description:
          "Decide who pays, for what, how often and at what margin. Sketch the unit economics before you build, so growth does not make the losses bigger.",
      },
      {
        title: "Business setup",
        description:
          "Choose the legal structure, registrations, bank account, insurance and record-keeping you actually need at this size — no more.",
      },
      {
        title: "Launch",
        description:
          "Ship the smallest version that delivers the core promise, then run a deliberate first-customer push instead of a open-ended announcement.",
      },
      {
        title: "Operations",
        description:
          "Turn what worked into a repeatable process: suppliers, fulfilment, support, quality checks and the numbers you review weekly.",
      },
    ],
    notes: [
      "Legal, tax and registration requirements differ by country and business type. Confirm the specifics with a qualified local adviser before filing anything.",
    ],
    related: ["industry-guides", "funding", "tools-templates"],
    cta: {
      label: "Set up your startup profile",
      href: "/onboarding/startup",
      hint: "Put the stage you are at on your VultureX profile so recommendations match it.",
    },
  },
  {
    slug: "industry-guides",
    title: "Industry Guides",
    navTitle: "Industry Guides",
    eyebrow: "Sector playbooks",
    summary:
      "How the economics, constraints and first moves change across six very different kinds of business.",
    intro: [
      "The same advice lands differently in a software company and a food business. These guides outline what each industry rewards, where the fixed costs sit and which questions to answer before committing capital.",
      "Each category will hold multiple playbooks over time. For now, use the outline to identify the questions that matter most in your sector.",
    ],
    icon: "factory",
    topics: [
      {
        title: "Choosing your industry",
        description:
          "Compare industries on cycle time, capital intensity, regulation and how customers actually buy — not on how fashionable they are.",
      },
      {
        title: "Reading a sector playbook",
        description:
          "Start with the constraint that decides survival in that industry, then work backwards to the first three things you must prove.",
      },
    ],
    groups: [
      {
        title: "Software & AI",
        description:
          "Low marginal cost, high switching cost once embedded. The hard parts are distribution and proving the workflow is worth changing.",
        items: [
          {
            title: "Software playbook outline",
            description:
              "Positioning, onboarding time-to-value, pricing model, retention and the build-versus-buy decision for the first version.",
          },
          {
            title: "AI product checks",
            description:
              "Data rights, accuracy thresholds, human review where errors are costly, inference cost per active user and fallback behaviour.",
          },
        ],
      },
      {
        title: "Food & Beverage",
        description:
          "Perishable inventory, tight margins and compliance. Batch costing and shelf life decide more outcomes than branding.",
        items: [
          {
            title: "Food business playbook outline",
            description:
              "Recipe and batch costing, supplier terms, shelf life, licensing, kitchen or shared-facility options and waste control.",
          },
          {
            title: "Unit economics for food",
            description:
              "Cost per batch, yield, waste percentage, packaging, delivery cost and the contribution margin per order.",
          },
        ],
      },
      {
        title: "D2C & Consumer Products",
        description:
          "You own the customer relationship, which means you also own acquisition cost, returns and repeat purchase rate.",
        items: [
          {
            title: "Consumer playbook outline",
            description:
              "Product-market fit signals, channel tests, creative production, fulfilment, returns policy and subscription economics.",
          },
          {
            title: "Before you order inventory",
            description:
              "Pre-sell or sample first, validate landed cost including duties, and model cash tied up in stock before committing.",
          },
        ],
      },
      {
        title: "Services",
        description:
          "Revenue starts on day one but capacity is your ceiling. Productising the work is how service firms escape it.",
        items: [
          {
            title: "Service business playbook outline",
            description:
              "Scope definition, pricing by outcome versus hours, utilisation, pipeline, referrals and the first repeatable offer.",
          },
          {
            title: "Pricing and scope",
            description:
              "Write a fixed scope for the first engagement, track hours actually spent, and reprice before the second sale.",
          },
        ],
      },
      {
        title: "Manufacturing",
        description:
          "Tooling, lead times and working capital dominate. Small order quantities are expensive but safer than inventory you cannot sell.",
        items: [
          {
            title: "Manufacturing playbook outline",
            description:
              "Design for manufacture, supplier qualification, quality checks, minimum order quantities, lead times and equipment decisions.",
          },
          {
            title: "Equipment and facility choices",
            description:
              "Compare new versus used equipment and owned versus shared space on total cost, utilization and flexibility.",
          },
        ],
      },
      {
        title: "Reselling",
        description:
          "Thin margins reward speed and supplier terms. Differentiation has to come from selection, service or a niche.",
        items: [
          {
            title: "Reselling playbook outline",
            description:
              "Supplier negotiation, category selection, pricing and margin, stock turnover, returns and marketplace dependence.",
          },
          {
            title: "Supplier scorecard",
            description:
              "Score suppliers on lead time, defect rate, terms, minimums and responsiveness before you depend on one of them.",
          },
        ],
      },
    ],
    notes: [
      "These are general outlines, not industry statistics or regulatory advice. Requirements vary by market; verify locally.",
    ],
    related: ["start-business", "marketing-sales", "tools-templates"],
  },
  {
    slug: "funding",
    title: "Money & Funding",
    navTitle: "Money & Funding",
    eyebrow: "Capital",
    summary:
      "Every realistic way to fund a startup, what each one costs you, and how to be ready before you ask.",
    intro: [
      "Funding is not a single ladder from bootstrap to venture capital. It is a set of instruments with different costs, timelines and obligations. The right one depends on your growth rate, your assets and how much control you want to keep.",
      "Read this before you approach anyone. Being able to explain why a particular instrument fits your business is a stronger signal than a polished pitch.",
    ],
    icon: "wallet",
    topics: [
      {
        title: "Bootstrapping",
        description:
          "Fund growth from revenue and customer prepayments. Slower, but you keep ownership and learn what customers will actually pay for.",
      },
      {
        title: "Loans",
        description:
          "Debt suits predictable revenue and assets that can be financed. Understand the repayment schedule, covenants and personal guarantees.",
      },
      {
        title: "Grants and government schemes",
        description:
          "Usually non-dilutive but tied to eligibility, reporting and approved use of funds. Read the obligations before celebrating the award.",
      },
      {
        title: "Equity funding",
        description:
          "Sell a share of the company for capital and network. Understand dilution, preference terms, board rights and investor expectations.",
      },
      {
        title: "Investor readiness",
        description:
          "The materials, metrics and data room an investor expects, and the questions you must be able to answer without hesitating.",
      },
      {
        title: "Financial planning",
        description:
          "Build a simple model for revenue, costs, hiring and cash. It does not need to be perfect; it needs to be honest and updatable.",
      },
      {
        title: "Cash runway",
        description:
          "Know how many months you can operate at the current burn, what triggers a plan change and which costs are genuinely fixed.",
      },
    ],
    notes: [
      "VultureX does not approve, guarantee or broker funding. Nothing here is financial advice, and eligibility rules for schemes change — always confirm with the scheme provider.",
    ],
    related: ["start-business", "tools-templates", "industry-guides"],
    cta: {
      label: "Browse funding-ready templates",
      href: "/knowledge-hub/tools-templates",
      hint: "Cost estimators, runway planners and readiness assessments are listed in Tools & Templates.",
    },
  },
  {
    slug: "marketing-sales",
    title: "Marketing & Sales",
    navTitle: "Marketing & Sales",
    eyebrow: "Demand",
    summary:
      "How to choose channels, plan content, acquire customers deliberately and build a sales system that is not just you.",
    intro: [
      "Marketing makes a promise; sales makes it concrete. Early on, both are experiments. The goal is not to be everywhere — it is to find one channel that reliably produces conversations with the right people, then make it repeatable.",
      "Track what each channel costs and what it returns before you scale spending. A channel that works at small volume can break at larger volume.",
    ],
    icon: "megaphone",
    topics: [
      {
        title: "Marketing channels",
        description:
          "Compare channels by where your customers already pay attention, the cost to test and how long results take to appear.",
      },
      {
        title: "Content planning",
        description:
          "Plan around questions buyers ask before they buy. A small, consistent set of useful pieces outperforms a sporadic burst.",
      },
      {
        title: "Customer acquisition",
        description:
          "Define acquisition cost, conversion rate and payback period per channel. Kill tests early instead of defending them.",
      },
      {
        title: "Sales systems",
        description:
          "A repeatable path from first contact to signed deal: qualification, discovery, proposal, objections and follow-up.",
      },
      {
        title: "CRM basics",
        description:
          "Track every lead and next action in one place. The tool matters less than the discipline of a single source of truth.",
      },
    ],
    related: ["industry-guides", "tools-templates", "collaboration"],
  },
  {
    slug: "tools-templates",
    title: "Tools & Templates",
    navTitle: "Tools & Templates",
    eyebrow: "Directory",
    summary:
      "The working directory of planners, calculators and scorecards for each stage of building a startup.",
    intro: [
      "This directory lists the tools the hub will host, grouped by the job they help you do. It is deliberately grouped by task rather than by tool type, so you can start from the decision you are facing.",
      "The calculators and planners are not built yet. Each entry is marked as planned and is not clickable, so nothing here pretends to produce a result. Existing VultureX workflows are linked separately below.",
    ],
    icon: "wrench",
    topics: [],
    groups: [
      {
        title: "Idea validation",
        items: [
          { title: "Idea scorecard", description: "Score a candidate idea on problem severity, willingness to pay and your access to customers.", meta: "Planned" },
          { title: "Customer interview planner", description: "Structure discovery interviews and capture evidence without leading the witness.", meta: "Planned" },
          { title: "Validation experiment builder", description: "Define the cheapest test that could change your mind, plus the signal you will accept.", meta: "Planned" },
        ],
      },
      {
        title: "Customer discovery",
        items: [
          { title: "Interview note template", description: "A consistent place to record what was said, what it implies and what to test next.", meta: "Planned" },
          { title: "Buying-process map", description: "Document who uses, who approves and who pays before you design a sales motion.", meta: "Planned" },
        ],
      },
      {
        title: "Financial planning",
        items: [
          { title: "Startup cost estimator", description: "List one-off setup costs and recurring monthly costs before launch.", meta: "Planned" },
          { title: "Unit economics calculator", description: "Price, variable cost and contribution margin per unit or order.", meta: "Planned" },
          { title: "Break-even calculator", description: "The volume at which contribution covers fixed costs.", meta: "Planned" },
          { title: "Cash runway planner", description: "Months of cash remaining at the current burn, with trigger points.", meta: "Planned" },
          { title: "Food batch costing", description: "Cost per batch including yield, waste and packaging.", meta: "Planned" },
        ],
      },
      {
        title: "Funding preparation",
        items: [
          { title: "Funding readiness assessment", description: "Check the evidence and documents investors or lenders expect.", meta: "Planned" },
          { title: "Dilution scenario tool", description: "Model ownership after a round before you negotiate terms.", meta: "Planned" },
          { title: "Scheme eligibility navigator", description: "A structured checklist of questions to ask a scheme provider.", meta: "Planned" },
        ],
      },
      {
        title: "Marketing",
        items: [
          { title: "Marketing channel test planner", description: "Plan a bounded test per channel with a cost cap and success threshold.", meta: "Planned" },
        ],
      },
      {
        title: "Operations",
        items: [
          { title: "Hiring cost calculator", description: "Fully loaded cost of a hire, including tools, benefits and ramp time.", meta: "Planned" },
          { title: "Supplier scorecard", description: "Compare suppliers on lead time, quality, terms and responsiveness.", meta: "Planned" },
          { title: "Rent versus shared facility tool", description: "Compare owning or renting space against a shared facility on total cost and flexibility.", meta: "Planned" },
          { title: "New versus used equipment tool", description: "Compare purchase price, maintenance, downtime and resale value.", meta: "Planned" },
        ],
      },
      {
        title: "Impact measurement",
        items: [
          { title: "Impact measurement planner", description: "Define the outcome you claim, how you measure it and what you can evidence today.", meta: "Planned" },
        ],
      },
      {
        title: "Founder productivity",
        items: [
          { title: "Scam red-flag checker", description: "A fixed checklist of warning signs to run against any offer.", meta: "Planned" },
          { title: "Founder milestone tracker", description: "Track stage milestones and the evidence behind each one.", meta: "Planned" },
        ],
      },
    ],
    notes: [
      "No calculator in this directory is functional yet. Entries marked Planned are a published roadmap, not shipped tools.",
    ],
    related: ["start-business", "funding", "marketing-sales"],
    cta: {
      label: "Open the pitch deck workspace",
      href: "/pitch-decks",
      hint: "The deck and questionnaire workflow already exists in your account.",
    },
  },
  {
    slug: "startup-ideas",
    title: "Startup Ideas",
    navTitle: "Startup Ideas",
    eyebrow: "Discovery",
    summary:
      "Where ideas come from, how to compare them honestly and how to convert one into a first test.",
    intro: [
      "Ideas are cheap; access is not. The strongest starting points usually come from work you have done, problems you have lived with and customers you can reach without permission.",
      "Use these sections to widen the search, then narrow quickly. The goal is not to pick a perfect idea — it is to choose one worth testing this month.",
    ],
    icon: "lightbulb",
    topics: [
      {
        title: "Idea discovery",
        description:
          "Mine your own workflow, former employers, hobbies and communities for problems people already pay to solve badly.",
      },
      {
        title: "Idea categories",
        description:
          "Compare consumer, business, local and software ideas on capital needs, sales cycle and how fast you can reach a first customer.",
      },
      {
        title: "Feasibility exploration",
        description:
          "Check the constraint that could kill the idea: licensing, supply, technical risk, capital or access to distribution.",
      },
      {
        title: "Idea to action",
        description:
          "Turn the idea into a testable hypothesis with a customer, a promise and a measurable signal of interest.",
      },
    ],
    groups: [
      {
        title: "Starting points to explore",
        description: "Broad directions, not recommendations or market claims.",
        items: [
          { title: "Business-to-business workflow", description: "A repeated task a company pays staff to do manually." },
          { title: "Local and offline services", description: "A service where reliability and response time matter more than technology." },
          { title: "Consumer products", description: "A product people rebuy, where repeat purchase decides viability." },
          { title: "Software and AI tools", description: "A narrow workflow where speed or accuracy can be measurably improved." },
          { title: "Impact-led ventures", description: "A commercial model where the outcome is measurable and the buyer cares about it." },
        ],
      },
    ],
    notes: [
      "VultureX does not currently accept idea submissions. Use your startup profile to describe what you are building; the existing submission and pitch deck workflows handle the rest.",
    ],
    related: ["start-business", "collaboration", "industry-guides"],
    cta: {
      label: "Create or update your startup profile",
      href: "/onboarding/startup",
      hint: "Describe your idea in the existing profile workflow so other founders and investors can find it.",
    },
  },
  {
    slug: "impact",
    title: "Impact Hub",
    navTitle: "Impact Hub",
    eyebrow: "People, planet, purpose",
    summary:
      "How to define a credible impact claim, measure it and keep commercial and social goals aligned.",
    intro: [
      "Impact is a claim about an outcome, not a tone of voice. A credible claim names who benefits, what changed, how it is measured and what the business can actually evidence today.",
      "These sections separate the intention behind a venture from the proof of its results. VultureX shows self-declared SDG alignment on profiles; that is not a verification of outcomes.",
    ],
    icon: "leaf",
    topics: [
      {
        title: "People",
        description:
          "Who the business affects — customers, workers, suppliers and the community around it — and which effects are material.",
      },
      {
        title: "Planet",
        description:
          "Resource use, emissions, waste and lifecycle effects, measured at the level where you can actually collect data.",
      },
      {
        title: "Purpose",
        description:
          "The specific change the venture exists to make, written so it can be tested rather than admired.",
      },
      {
        title: "Impact measurement",
        description:
          "Choose a small set of indicators, a baseline and a collection method before you make a claim in public.",
      },
      {
        title: "Impact verification",
        description:
          "What independent verification requires, why it takes time, and how to present unverified claims honestly in the meantime.",
      },
      {
        title: "Benefits and opportunities",
        description:
          "How credible impact work can support hiring, procurement, partnerships and investor conversations.",
      },
    ],
    notes: [
      "Selecting an SDG on your profile is a self-declared alignment. It is never displayed as verified impact, and no verification is implied by this page.",
    ],
    related: ["start-business", "funding", "community"],
    cta: {
      label: "Explore impact-aligned startups",
      href: "/explore",
      hint: "Filter the existing startup directory by SDG goal.",
    },
  },
  {
    slug: "scam-watch",
    title: "Scam Watch",
    navTitle: "Scam Watch",
    eyebrow: "Safety",
    summary:
      "The patterns founders meet most often, how to verify an offer and what to do when something feels wrong.",
    intro: [
      "Founders are targeted because they are motivated, time-poor and often raising money for the first time. Most startup scams reuse a small number of patterns, which makes them easier to spot once you know the shape.",
      "This page describes patterns, not companies or individuals. It does not publish allegations, and nothing here should be read as a claim about a specific organisation.",
    ],
    icon: "shield",
    topics: [
      {
        title: "Common startup scams",
        description:
          "Advance-fee investors, guaranteed funding offers, paid grant intermediaries, fake accelerators, supplier deposit traps and phishing that imitates a real institution.",
      },
      {
        title: "Scam patterns",
        description:
          "Urgency, secrecy, an unverifiable intermediary, payment before paperwork and pressure to bypass your own advisers.",
      },
      {
        title: "Verification guidance",
        description:
          "Independently confirm the organisation, the person's role, the registered entity and the payment destination through a channel you found yourself.",
      },
      {
        title: "Safe practices",
        description:
          "Never pay to receive funding, keep negotiations in writing, use traceable payments and give a second person authority to stop a deal.",
      },
      {
        title: "Reporting information",
        description:
          "Preserve messages and payment records, report to your bank immediately, and file with the relevant local cybercrime or consumer authority.",
      },
    ],
    notes: [
      "If money has already moved, contact your bank before anything else. Reporting channels differ by country; use the official authority for your jurisdiction.",
      "VultureX cannot currently accept in-platform scam reports. This page is educational and does not investigate individual cases.",
    ],
    related: ["funding", "community", "start-business"],
  },
  {
    slug: "community",
    title: "Community & Experts",
    navTitle: "Community & Experts",
    eyebrow: "People",
    summary:
      "Founder communities, peer groups, expert access and the workshops that turn advice into progress.",
    intro: [
      "Most founder problems are not novel; they are just lonely. A peer group that has already survived your stage can save months, and a specialist can stop an expensive mistake in one conversation.",
      "Use the existing VultureX surfaces — the startup directory, messages and competitions — to find people, then keep the relationship specific. Vague networking rarely compounds.",
    ],
    icon: "users",
    topics: [
      {
        title: "Founder communities",
        description:
          "Find founders at a similar stage working on adjacent problems, and contribute before you ask for help.",
      },
      {
        title: "Peer groups",
        description:
          "Small, consistent groups work better than large channels. Agree on cadence, confidentiality and what each member brings.",
      },
      {
        title: "Expert access",
        description:
          "Prepare a narrow question with context and the decision you are facing. Specific asks get specific answers.",
      },
      {
        title: "Mentor clinics",
        description:
          "Short sessions are best used to review a decision you are about to make, not to request a general review of the business.",
      },
      {
        title: "Workshops",
        description:
          "Choose sessions that end with an artefact you can use — a pricing model, a validation plan, a hiring brief.",
      },
      {
        title: "Collaboration resources",
        description:
          "Templates and guidance for working with another company without confusing it with a customer relationship.",
      },
    ],
    related: ["collaboration", "startup-ideas", "funding"],
    cta: {
      label: "Browse founders on VultureX",
      href: "/explore",
      hint: "Open the existing startup directory to find people working on similar problems.",
    },
  },
  {
    slug: "collaboration",
    title: "Collaboration & Build With Startups",
    navTitle: "Collaboration",
    eyebrow: "Partnerships",
    summary:
      "Exchange capabilities with other startups: find a partner, offer what you do well and build something neither side could ship alone.",
    intro: [
      "Early-stage companies rarely have every capability they need. Another startup may already own the distribution, manufacturing, compliance or technical piece you are about to spend three months building.",
      "Collaboration works when the exchange is concrete: what each side provides, what each side receives, who owns the result and how either side can exit. Start with one scoped pilot, not a broad partnership.",
    ],
    icon: "handshake",
    topics: [
      {
        title: "Find a startup partner",
        description:
          "Look for companies whose customers, channels or capabilities complement yours — not simply companies in the same sector.",
      },
      {
        title: "Offer a capability to other startups",
        description:
          "Describe what you can deliver reliably, the terms you can hold and the capacity you actually have.",
      },
      {
        title: "Browse collaboration opportunities",
        description:
          "Use your business matches to find startups whose stated needs line up with what you offer.",
      },
      {
        title: "Explore potential partnerships",
        description:
          "Test one narrow joint deliverable before committing to revenue share, exclusivity or joint branding.",
      },
      {
        title: "How startup collaboration works",
        description:
          "Scope, ownership, confidentiality, payment, termination and what happens to shared customers.",
      },
    ],
    notes: [
      "Collaboration is not automated matching. Requests, contracts and data sharing are handled between the startups involved; VultureX does not broker agreements or expose private profile information.",
    ],
    related: ["community", "startup-ideas", "industry-guides"],
    cta: {
      label: "Find a startup partner",
      href: "/explore",
      hint: "Browse public startup profiles and reach out through the existing messaging workflow.",
    },
  },
];

export const HUB_SECTION_MAP = new Map(HUB_SECTIONS.map((section) => [section.slug, section]));

export function getHubSection(slug: string): HubSection | undefined {
  return HUB_SECTION_MAP.get(slug);
}

/** Destinations that are real pages, excluding the personalized workspace. */
export const HUB_DESTINATIONS = HUB_SECTIONS;

/** Featured starting points. These are hub topics, not external publications. */
export const FEATURED_RESOURCES: { title: string; description: string; category: string; href: string; icon: HubIconKey }[] = [
  {
    title: "Idea validation",
    description: "Test whether the problem is real, urgent and already paid for before you build.",
    category: "Start a Business",
    href: `${hubSectionHref("start-business")}#${hubAnchor("Idea validation")}`,
    icon: "rocket",
  },
  {
    title: "Investor readiness",
    description: "The materials, metrics and answers to prepare before an investor conversation.",
    category: "Money & Funding",
    href: `${hubSectionHref("funding")}#${hubAnchor("Investor readiness")}`,
    icon: "wallet",
  },
  {
    title: "Software & AI",
    description: "What decides survival in software, from time-to-value to inference cost per user.",
    category: "Industry Guides",
    href: `${hubSectionHref("industry-guides")}#${hubAnchor("Software & AI")}`,
    icon: "factory",
  },
  {
    title: "Scam patterns",
    description: "Urgency, secrecy and payment before paperwork: the shape most funding scams share.",
    category: "Scam Watch",
    href: `${hubSectionHref("scam-watch")}#${hubAnchor("Scam patterns")}`,
    icon: "shield",
  },
  {
    title: "Find a startup partner",
    description: "How to look for complementary capabilities instead of companies that look like you.",
    category: "Collaboration",
    href: `${hubSectionHref("collaboration")}#${hubAnchor("Find a startup partner")}`,
    icon: "handshake",
  },
  {
    title: "Cash runway",
    description: "Know how many months you can operate and which costs are genuinely fixed.",
    category: "Money & Funding",
    href: `${hubSectionHref("funding")}#${hubAnchor("Cash runway")}`,
    icon: "wallet",
  },
];

export const QUICK_ACCESS: { label: string; href: string }[] = [
  { label: "Startup guides", href: hubSectionHref("start-business") },
  { label: "Industry playbooks", href: hubSectionHref("industry-guides") },
  { label: "Funding resources", href: hubSectionHref("funding") },
  { label: "Business tools", href: hubSectionHref("tools-templates") },
  { label: "Startup ideas", href: hubSectionHref("startup-ideas") },
  { label: "Impact resources", href: hubSectionHref("impact") },
  { label: "Scam awareness", href: hubSectionHref("scam-watch") },
  { label: "Expert access", href: hubSectionHref("community") },
  { label: "Startup collaboration", href: hubSectionHref("collaboration") },
];

/** Curated starting sequence — not a popularity or recency ranking. */
export const START_HERE: { title: string; reason: string; href: string }[] = [
  {
    title: "Map your stage",
    reason: "Start a Business explains the five stages and the evidence each one should produce.",
    href: hubSectionHref("start-business"),
  },
  {
    title: "Check the money",
    reason: "Money & Funding compares the instruments available and what each one costs you.",
    href: hubSectionHref("funding"),
  },
  {
    title: "Find your first partner",
    reason: "Collaboration shows how to exchange a capability instead of building it yourself.",
    href: hubSectionHref("collaboration"),
  },
];

export type HubSearchKind = "Section" | "Topic" | "Tool";

export type HubSearchEntry = {
  title: string;
  description: string;
  href: string;
  sectionSlug: string;
  sectionTitle: string;
  kind: HubSearchKind;
  planned?: boolean;
};

function buildSearchIndex(): HubSearchEntry[] {
  const entries: HubSearchEntry[] = [];

  for (const section of HUB_SECTIONS) {
    entries.push({
      title: section.title,
      description: section.summary,
      href: hubSectionHref(section.slug),
      sectionSlug: section.slug,
      sectionTitle: section.title,
      kind: "Section",
    });

    for (const topic of section.topics) {
      entries.push({
        title: topic.title,
        description: topic.description,
        href: `${hubSectionHref(section.slug)}#${hubAnchor(topic.title)}`,
        sectionSlug: section.slug,
        sectionTitle: section.title,
        kind: "Topic",
      });
    }

    for (const group of section.groups ?? []) {
      entries.push({
        title: group.title,
        description: group.description ?? `A group inside ${section.title}.`,
        href: `${hubSectionHref(section.slug)}#${hubAnchor(group.title)}`,
        sectionSlug: section.slug,
        sectionTitle: section.title,
        kind: "Topic",
      });

      for (const item of group.items) {
        const planned = item.meta === "Planned";
        entries.push({
          title: item.title,
          description: item.description,
          href: `${hubSectionHref(section.slug)}#${hubAnchor(group.title)}`,
          sectionSlug: section.slug,
          sectionTitle: section.title,
          kind: planned ? "Tool" : "Topic",
          planned,
        });
      }
    }
  }

  return entries;
}

export const HUB_SEARCH_INDEX: HubSearchEntry[] = buildSearchIndex();

/**
 * Searches the hub's own index. Returns only real sections and topics, ranked by
 * where the match occurs. An empty query returns nothing — the UI shows starting
 * points instead of pretending everything is a result.
 */
export function searchHub(query: string): HubSearchEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const terms = needle.split(/\s+/).filter(Boolean);

  const scored = HUB_SEARCH_INDEX.map((entry) => {
    const title = entry.title.toLowerCase();
    const description = entry.description.toLowerCase();
    const section = entry.sectionTitle.toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (title === term) score += 60;
      else if (title.startsWith(term)) score += 45;
      else if (title.includes(term)) score += 30;

      if (section.includes(term)) score += 8;
      if (description.includes(term)) score += 12;
    }

    // Every term has to appear somewhere for the entry to qualify.
    const haystack = `${title} ${description} ${section}`;
    const matchesAll = terms.every((term) => haystack.includes(term));

    return { entry, score, matchesAll };
  })
    .filter((row) => row.matchesAll && row.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, 30)
    .map((row) => row.entry);

  return scored;
}
