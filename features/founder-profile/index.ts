/**
 * Server-side founder profile service.
 *
 * The account id always comes from the authenticated session at the API layer;
 * nothing in this module accepts a client-supplied owner id.
 */

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  DEFAULT_REMINDER_PREFERENCES,
  founderProfiles,
  type CollaborationVisibility,
  type FounderLanguage,
  type ReminderPreferences,
} from "@/db/schema";
import {
  CHALLENGES,
  COLLABORATION_INTERESTS,
  COLLABORATION_VISIBILITY_VALUES,
  FUNDING_INTERESTS,
  GUIDANCE_AREAS,
  LANGUAGE_VALUES,
  LEARNING_INTERESTS,
  MARKETING_NEEDS,
  OBJECTIVES,
  PRIORITIES,
  RECOMMENDATION_TYPES,
} from "./options";

export type FounderProfileInput = {
  location: string | null;
  preferredLanguage: FounderLanguage;
  currentObjective: string | null;
  challenges: string[];
  guidanceAreas: string[];
  priorities: string[];
  learningInterests: string[];
  fundingInterest: string | null;
  marketingNeeds: string[];
  collaborationInterests: string[];
  recommendationTypes: string[];
  reminderPreferences: ReminderPreferences;
  profileVisibility: boolean;
  collaborationVisibility: CollaborationVisibility;
};

export class FounderProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FounderProfileValidationError";
  }
}

function allowedValues(options: { value: string }[]): string[] {
  return options.map((option) => option.value);
}

function normalizeList(value: unknown, allowed: string[], max = 6): string[] {
  if (!Array.isArray(value)) return [];
  const allowedSet = new Set(allowed);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim();
    if (!trimmed || !allowedSet.has(trimmed) || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
    if (result.length >= max) break;
  }

  return result;
}

function normalizeOptionalText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function normalizeOptionalChoice(value: unknown, allowed: string[]): string | null {
  if (typeof value !== "string") return null;
  return allowed.includes(value) ? value : null;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeReminderPreferences(value: unknown): ReminderPreferences {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    inApp: normalizeBoolean(source.inApp, DEFAULT_REMINDER_PREFERENCES.inApp),
    email: normalizeBoolean(source.email, DEFAULT_REMINDER_PREFERENCES.email),
    taskDue: normalizeBoolean(source.taskDue, DEFAULT_REMINDER_PREFERENCES.taskDue),
    milestones: normalizeBoolean(source.milestones, DEFAULT_REMINDER_PREFERENCES.milestones),
    clinics: normalizeBoolean(source.clinics, DEFAULT_REMINDER_PREFERENCES.clinics),
  };
}

/**
 * Normalises and validates untrusted request input. Unknown values are dropped
 * rather than trusted, and list fields are capped so a request cannot store an
 * unbounded payload.
 */
export function normalizeFounderProfileInput(body: unknown): FounderProfileInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new FounderProfileValidationError("A profile object is required");
  }

  const source = body as Record<string, unknown>;

  const preferredLanguage = source.preferredLanguage;
  if (
    typeof preferredLanguage !== "string" ||
    !LANGUAGE_VALUES.includes(preferredLanguage as FounderLanguage)
  ) {
    throw new FounderProfileValidationError("A supported preferred language is required");
  }

  const collaborationVisibility = normalizeOptionalChoice(
    source.collaborationVisibility,
    [...COLLABORATION_VISIBILITY_VALUES]
  ) as CollaborationVisibility | null;

  return {
    location: normalizeOptionalText(source.location, 120),
    preferredLanguage: preferredLanguage as FounderLanguage,
    currentObjective: normalizeOptionalChoice(source.currentObjective, allowedValues(OBJECTIVES)),
    challenges: normalizeList(source.challenges, allowedValues(CHALLENGES)),
    guidanceAreas: normalizeList(source.guidanceAreas, allowedValues(GUIDANCE_AREAS)),
    priorities: normalizeList(source.priorities, allowedValues(PRIORITIES)),
    learningInterests: normalizeList(source.learningInterests, allowedValues(LEARNING_INTERESTS)),
    fundingInterest: normalizeOptionalChoice(source.fundingInterest, allowedValues(FUNDING_INTERESTS)),
    marketingNeeds: normalizeList(source.marketingNeeds, allowedValues(MARKETING_NEEDS)),
    collaborationInterests: normalizeList(
      source.collaborationInterests,
      allowedValues(COLLABORATION_INTERESTS)
    ),
    recommendationTypes: normalizeList(
      source.recommendationTypes,
      allowedValues(RECOMMENDATION_TYPES),
      4
    ),
    reminderPreferences: normalizeReminderPreferences(source.reminderPreferences),
    profileVisibility: normalizeBoolean(source.profileVisibility, true),
    collaborationVisibility: collaborationVisibility ?? "private",
  };
}

export async function getFounderProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(founderProfiles)
    .where(eq(founderProfiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

/**
 * Saves the signed-in founder's own profile. Completion is only stamped when the
 * caller explicitly finishes onboarding/save, so editing preferences later does
 * not re-run onboarding.
 */
export async function saveFounderProfile(
  userId: string,
  input: FounderProfileInput,
  markOnboardingComplete: boolean
) {
  const now = new Date();
  const values: Record<string, unknown> = { ...input, updatedAt: now };

  if (markOnboardingComplete) {
    values.onboardingCompletedAt = now;
  }

  const [profile] = await db
    .insert(founderProfiles)
    .values({ userId, ...input, updatedAt: now, ...(markOnboardingComplete ? { onboardingCompletedAt: now } : {}) })
    .onConflictDoUpdate({
      target: founderProfiles.userId,
      set: values,
    })
    .returning();

  return profile;
}
