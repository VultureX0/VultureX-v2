/**
 * Pure roadmap rules: stage normalisation, suggested stage tasks, progress and
 * explainable recommendations.
 *
 * Template tasks are guidance that a founder explicitly adds to their roadmap.
 * Nothing here asserts that a task was done or that a metric exists.
 */

export const ROADMAP_STAGE_KEYS = [
  "idea",
  "pre-seed",
  "mvp",
  "seed",
  "growth",
  "general",
] as const;

export type RoadmapStageKey = (typeof ROADMAP_STAGE_KEYS)[number];

export type RoadmapTaskPriority = "high" | "medium" | "low";
export type RoadmapTaskStatus = "not_started" | "in_progress" | "completed" | "skipped";
export type RoadmapMilestoneStatus = "planned" | "in_progress" | "achieved";

export type RoadmapTemplateTask = {
  taskKey: string;
  title: string;
  description: string;
  category: string;
  priority: RoadmapTaskPriority;
  sortOrder: number;
};

export type RoadmapTaskLike = {
  id: string;
  taskKey: string;
  title: string;
  description: string | null;
  category: string;
  priority: RoadmapTaskPriority;
  status: RoadmapTaskStatus;
  sortOrder: number;
  dueDate: Date | string | null;
  completedAt: Date | string | null;
};

export type RoadmapMilestoneLike = {
  id: string;
  title: string;
  description: string | null;
  status: RoadmapMilestoneStatus;
  targetDate: Date | string | null;
  achievedAt: Date | string | null;
};

export type RoadmapProgress = {
  tasksTotal: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOpen: number;
  tasksSkipped: number;
  taskPercent: number;
  milestonesTotal: number;
  milestonesAchieved: number;
  milestonePercent: number;
};

export type RoadmapRecommendation = {
  kind: "build_roadmap" | "next_task" | "stage_task" | "milestone";
  title: string;
  description: string;
  why: string;
  taskId?: string;
};

export const STAGE_LABELS: Record<RoadmapStageKey, string> = {
  idea: "Idea",
  "pre-seed": "Pre-seed",
  mvp: "MVP",
  seed: "Seed",
  growth: "Growth",
  general: "General",
};

const TEMPLATES: Record<RoadmapStageKey, RoadmapTemplateTask[]> = {
  idea: [
    {
      taskKey: "idea-problem-statement",
      title: "Write the problem statement",
      description:
        "Describe who has the problem, when it happens and what it costs them today. Keep it to a paragraph you can test.",
      category: "Validation",
      priority: "high",
      sortOrder: 10,
    },
    {
      taskKey: "idea-customer-interviews",
      title: "Interview 10 potential customers",
      description:
        "Ask about their current behaviour and workarounds. Record exact quotes instead of asking whether they would buy.",
      category: "Customers",
      priority: "high",
      sortOrder: 20,
    },
    {
      taskKey: "idea-alternatives",
      title: "Map current alternatives",
      description:
        "List how people solve the problem now, including spreadsheets, agencies and doing nothing. This is your real competition.",
      category: "Validation",
      priority: "medium",
      sortOrder: 30,
    },
    {
      taskKey: "idea-ideal-customer",
      title: "Define your ideal customer",
      description:
        "Name the segment, buyer and daily user. A narrow first segment makes testing and messaging possible.",
      category: "Customers",
      priority: "medium",
      sortOrder: 40,
    },
    {
      taskKey: "idea-demand-test",
      title: "Run a small demand test",
      description:
        "Test one concrete signal such as a landing page, a waitlist or a paid pilot conversation. Decide the pass/fail bar first.",
      category: "Validation",
      priority: "high",
      sortOrder: 50,
    },
    {
      taskKey: "idea-assumptions",
      title: "List assumptions and risks",
      description:
        "Write the riskiest assumptions about demand, pricing, delivery and regulation, then choose which one to test next.",
      category: "Strategy",
      priority: "medium",
      sortOrder: 60,
    },
  ],
  "pre-seed": [
    {
      taskKey: "preseed-mvp-scope",
      title: "Define the smallest useful product",
      description:
        "Cut the product to the single workflow that proves the core value. List what is explicitly out of scope for this version.",
      category: "Product",
      priority: "high",
      sortOrder: 10,
    },
    {
      taskKey: "preseed-prototype",
      title: "Build a testable prototype",
      description:
        "Ship something a real user can complete the core task with, even if parts are manual behind the scenes.",
      category: "Product",
      priority: "high",
      sortOrder: 20,
    },
    {
      taskKey: "preseed-pilot",
      title: "Run a pilot with real users",
      description:
        "Recruit a small group, define what success means and observe them using the prototype without guiding every step.",
      category: "Customers",
      priority: "high",
      sortOrder: 30,
    },
    {
      taskKey: "preseed-usage-tracking",
      title: "Set up basic usage tracking",
      description:
        "Record one activation event and one repeat-use event so the pilot produces evidence rather than anecdotes.",
      category: "Operations",
      priority: "medium",
      sortOrder: 40,
    },
    {
      taskKey: "preseed-price-test",
      title: "Test a price with early users",
      description:
        "Ask for a real commitment at a stated price. A polite maybe is not pricing evidence.",
      category: "Revenue",
      priority: "medium",
      sortOrder: 50,
    },
    {
      taskKey: "preseed-risk-review",
      title: "Review the riskiest assumptions",
      description:
        "Compare what the pilot proved with what you believed. Update or remove assumptions that did not survive contact with users.",
      category: "Strategy",
      priority: "medium",
      sortOrder: 60,
    },
  ],
  mvp: [
    {
      taskKey: "mvp-ship",
      title: "Ship the MVP to a small group",
      description:
        "Release to a limited cohort with a clear way to report problems. Avoid a public launch before the core flow is stable.",
      category: "Product",
      priority: "high",
      sortOrder: 10,
    },
    {
      taskKey: "mvp-onboarding",
      title: "Create a first-run onboarding",
      description:
        "Make the first useful action obvious. Remove steps that do not help a new user reach value.",
      category: "Product",
      priority: "medium",
      sortOrder: 20,
    },
    {
      taskKey: "mvp-feedback-loop",
      title: "Set up a feedback loop",
      description:
        "Choose where feedback lands, who reviews it and how often. Close the loop with users when something changes.",
      category: "Customers",
      priority: "high",
      sortOrder: 30,
    },
    {
      taskKey: "mvp-retention-signal",
      title: "Track one retention signal",
      description:
        "Pick a repeat-use action that indicates value and record it consistently. Do not substitute signups for retention.",
      category: "Metrics",
      priority: "high",
      sortOrder: 40,
    },
    {
      taskKey: "mvp-support-process",
      title: "Document the support process",
      description:
        "Define the channel, response expectation and escalation path so early customers are not lost in ad-hoc messages.",
      category: "Operations",
      priority: "medium",
      sortOrder: 50,
    },
    {
      taskKey: "mvp-launch-checklist",
      title: "Prepare a launch checklist",
      description:
        "Cover messaging, analytics, support load, legal basics and rollback before widening access.",
      category: "Marketing",
      priority: "medium",
      sortOrder: 60,
    },
  ],
  seed: [
    {
      taskKey: "seed-metrics-baseline",
      title: "Record your current metrics baseline",
      description:
        "Write down the few numbers you already track, with their definitions and date range. Do not estimate missing figures.",
      category: "Metrics",
      priority: "high",
      sortOrder: 10,
    },
    {
      taskKey: "seed-customer-interviews",
      title: "Interview five active customers",
      description:
        "Focus on why they started, what they tried before and what would make them stop. Capture churn signals early.",
      category: "Customers",
      priority: "high",
      sortOrder: 20,
    },
    {
      taskKey: "seed-sales-process",
      title: "Document your sales process",
      description:
        "Map the steps from first conversation to payment, including who does what and where deals stall.",
      category: "Revenue",
      priority: "high",
      sortOrder: 30,
    },
    {
      taskKey: "seed-use-of-funds",
      title: "Outline a use-of-funds plan",
      description:
        "If you are considering external funding, list the specific hires, tools or pilots the money would unlock. This is planning, not an eligibility claim.",
      category: "Funding",
      priority: "medium",
      sortOrder: 40,
    },
    {
      taskKey: "seed-hiring-gap",
      title: "Identify the next critical hire",
      description:
        "Name the bottleneck the team cannot cover today, the responsibilities and how you would judge whether the hire worked.",
      category: "Team",
      priority: "medium",
      sortOrder: 50,
    },
    {
      taskKey: "seed-ninety-day-milestone",
      title: "Set one 90-day milestone",
      description:
        "Choose one measurable outcome for the next 90 days and the evidence you will use to decide whether it was reached.",
      category: "Strategy",
      priority: "high",
      sortOrder: 60,
    },
  ],
  growth: [
    {
      taskKey: "growth-channel-test",
      title: "Test one new growth channel",
      description:
        "Run a bounded experiment with a clear budget, audience and success metric. Stop or scale based on the result.",
      category: "Marketing",
      priority: "high",
      sortOrder: 10,
    },
    {
      taskKey: "growth-funnel-review",
      title: "Review your conversion funnel",
      description:
        "Find the step with the largest drop-off using existing data. Fix that step before adding more top-of-funnel volume.",
      category: "Metrics",
      priority: "high",
      sortOrder: 20,
    },
    {
      taskKey: "growth-market-entry",
      title: "Write a new-market entry plan",
      description:
        "Cover demand evidence, local requirements, pricing, delivery and the first ten target customers.",
      category: "Strategy",
      priority: "medium",
      sortOrder: 30,
    },
    {
      taskKey: "growth-key-hire",
      title: "Plan your next key hire",
      description:
        "Define the role, the gap it closes, the interview signal that matters and a 90-day success measure.",
      category: "Team",
      priority: "medium",
      sortOrder: 40,
    },
    {
      taskKey: "growth-pricing-review",
      title: "Review pricing and packaging",
      description:
        "Check whether price matches value, whether packaging creates a clear upgrade path and what existing customers would experience.",
      category: "Revenue",
      priority: "medium",
      sortOrder: 50,
    },
    {
      taskKey: "growth-ops-playbook",
      title: "Document an operations playbook",
      description:
        "Write down the repeatable process for delivery or support so quality does not depend on one person.",
      category: "Operations",
      priority: "medium",
      sortOrder: 60,
    },
  ],
  general: [
    {
      taskKey: "general-ninety-day-goal",
      title: "Define your 90-day goal",
      description:
        "Choose one outcome and the evidence that would show it was reached. Avoid a list of unrelated ambitions.",
      category: "Strategy",
      priority: "high",
      sortOrder: 10,
    },
    {
      taskKey: "general-customer-conversations",
      title: "Talk to five customers",
      description:
        "Ask about recent behaviour and blockers. Record what surprised you and what you should test next.",
      category: "Customers",
      priority: "high",
      sortOrder: 20,
    },
    {
      taskKey: "general-metrics-baseline",
      title: "Record a metrics baseline",
      description:
        "Write down the numbers you already have, their definitions and the period they cover. Leave unknowns blank.",
      category: "Metrics",
      priority: "medium",
      sortOrder: 30,
    },
    {
      taskKey: "general-bottleneck",
      title: "Name your biggest bottleneck",
      description:
        "Pick the constraint that is actually limiting progress this month, not the most interesting problem.",
      category: "Strategy",
      priority: "high",
      sortOrder: 40,
    },
    {
      taskKey: "general-experiment",
      title: "Run one small experiment",
      description:
        "State the hypothesis, the change, the success measure and the review date before starting.",
      category: "Validation",
      priority: "medium",
      sortOrder: 50,
    },
    {
      taskKey: "general-weekly-review",
      title: "Schedule a weekly review",
      description:
        "Block time to review progress, blockers and the next action. Keep the cadence small enough to sustain.",
      category: "Operations",
      priority: "medium",
      sortOrder: 60,
    },
  ],
};

/** Maps the free-text startup stage onto a supported roadmap checklist. */
export function normalizeRoadmapStage(stage: string | null | undefined): RoadmapStageKey {
  const value = (stage ?? "").trim().toLowerCase();

  if (ROADMAP_STAGE_KEYS.includes(value as RoadmapStageKey)) {
    return value as RoadmapStageKey;
  }
  if (value.includes("pre") && value.includes("seed")) return "pre-seed";
  if (value.includes("idea") || value.includes("concept") || value.includes("validat")) {
    return "idea";
  }
  if (value.includes("mvp") || value.includes("prototype") || value.includes("beta")) {
    return "mvp";
  }
  if (value.includes("growth") || value.includes("scale") || value.includes("series")) {
    return "growth";
  }
  if (value.includes("seed")) return "seed";
  return "general";
}

export function roadmapStageLabel(stage: string | null | undefined): string {
  return STAGE_LABELS[normalizeRoadmapStage(stage)];
}

export function getStageTemplate(stage: string | null | undefined): RoadmapTemplateTask[] {
  return TEMPLATES[normalizeRoadmapStage(stage)];
}

export function computeRoadmapProgress(
  tasks: RoadmapTaskLike[],
  milestones: RoadmapMilestoneLike[]
): RoadmapProgress {
  const counted = tasks.filter((task) => task.status !== "skipped");
  const tasksCompleted = counted.filter((task) => task.status === "completed").length;
  const tasksInProgress = counted.filter((task) => task.status === "in_progress").length;

  return {
    tasksTotal: counted.length,
    tasksCompleted,
    tasksInProgress,
    tasksOpen: counted.length - tasksCompleted,
    tasksSkipped: tasks.length - counted.length,
    taskPercent:
      counted.length === 0 ? 0 : Math.round((tasksCompleted / counted.length) * 100),
    milestonesTotal: milestones.length,
    milestonesAchieved: milestones.filter((milestone) => milestone.status === "achieved")
      .length,
    milestonePercent:
      milestones.length === 0
        ? 0
        : Math.round(
            (milestones.filter((milestone) => milestone.status === "achieved").length /
              milestones.length) *
              100
          ),
  };
}

const PRIORITY_ORDER: Record<RoadmapTaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Picks the task a founder should look at next, using only their own records. */
export function pickNextTask(tasks: RoadmapTaskLike[]): RoadmapTaskLike | null {
  const open = tasks
    .filter((task) => task.status !== "completed" && task.status !== "skipped")
    .sort((a, b) => {
      const statusOrder = (task: RoadmapTaskLike) =>
        task.status === "in_progress" ? 0 : 1;
      return (
        statusOrder(a) - statusOrder(b) ||
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        a.sortOrder - b.sortOrder
      );
    });

  return open[0] ?? null;
}

export function buildRoadmapRecommendations({
  stage,
  tasks,
  milestones,
}: {
  stage: string | null | undefined;
  tasks: RoadmapTaskLike[];
  milestones: RoadmapMilestoneLike[];
}): RoadmapRecommendation[] {
  const stageKey = normalizeRoadmapStage(stage);
  const stageLabel = STAGE_LABELS[stageKey];
  const template = TEMPLATES[stageKey];
  const progress = computeRoadmapProgress(tasks, milestones);
  const recommendations: RoadmapRecommendation[] = [];

  if (tasks.length === 0) {
    return [
      {
        kind: "build_roadmap",
        title: `Build your ${stageLabel} roadmap`,
        description: `Add the ${template.length} suggested ${stageLabel} tasks to your workspace. They start as not started, and you can edit or skip any of them.`,
        why: `No roadmap tasks exist yet. The checklist is based on your saved startup stage (${stageLabel}).`,
      },
    ];
  }

  const nextTask = pickNextTask(tasks);
  if (nextTask) {
    recommendations.push({
      kind: "next_task",
      title: nextTask.title,
      description: nextTask.description ?? "Continue this task on your roadmap.",
      why: `You have ${progress.tasksCompleted} of ${progress.tasksTotal} active tasks complete. This is the highest-priority open task.`,
      taskId: nextTask.id,
    });
  }

  // A missing milestone is more important than a second optional template task,
  // so it stays inside the three-card recommendation limit.
  if (milestones.length === 0) {
    recommendations.push({
      kind: "milestone",
      title: "Add your first milestone",
      description:
        "A milestone is a date-bound outcome you choose. It is separate from individual tasks and starts as planned.",
      why: "No milestones are recorded for this startup yet.",
    });
  }

  const existingKeys = new Set(tasks.map((task) => task.taskKey));
  const missing = template.filter((task) => !existingKeys.has(task.taskKey)).slice(0, 2);
  for (const task of missing) {
    recommendations.push({
      kind: "stage_task",
      title: task.title,
      description: task.description,
      why: `Suggested in the ${stageLabel} checklist and not on your roadmap yet.`,
    });
  }

  return recommendations.slice(0, 3);
}
