import {
  COLLABORATION_VISIBILITY_VALUES,
  LANGUAGE_VALUES,
  type CollaborationVisibility,
  type FounderLanguage,
} from "@/features/founder-profile/options";

export type ReminderPrefs = {
  inApp: boolean;
  email: boolean;
  taskDue: boolean;
  milestones: boolean;
  clinics: boolean;
};

export type FounderProfileFormValues = {
  location: string;
  preferredLanguage: FounderLanguage;
  currentObjective: string;
  challenges: string[];
  guidanceAreas: string[];
  priorities: string[];
  learningInterests: string[];
  fundingInterest: string;
  marketingNeeds: string[];
  collaborationInterests: string[];
  recommendationTypes: string[];
  reminderPreferences: ReminderPrefs;
  profileVisibility: boolean;
  collaborationVisibility: CollaborationVisibility;
  onboardingCompleted: boolean;
};

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  inApp: true,
  email: false,
  taskDue: true,
  milestones: true,
  clinics: true,
};

export const EMPTY_PROFILE_VALUES: FounderProfileFormValues = {
  location: "",
  preferredLanguage: "en",
  currentObjective: "",
  challenges: [],
  guidanceAreas: [],
  priorities: [],
  learningInterests: [],
  fundingInterest: "",
  marketingNeeds: [],
  collaborationInterests: [],
  recommendationTypes: ["roadmap", "resources", "opportunities"],
  reminderPreferences: DEFAULT_REMINDER_PREFS,
  profileVisibility: true,
  collaborationVisibility: "private",
  onboardingCompleted: false,
};

type ProfileLike = {
  location: string | null;
  preferredLanguage: string;
  currentObjective: string | null;
  challenges: string[];
  guidanceAreas: string[];
  priorities: string[];
  learningInterests: string[];
  fundingInterest: string | null;
  marketingNeeds: string[];
  collaborationInterests: string[];
  recommendationTypes: string[];
  reminderPreferences: ReminderPrefs | null;
  profileVisibility: boolean;
  collaborationVisibility: string;
  onboardingCompletedAt: Date | string | null;
};

function safeLanguage(value: string): FounderLanguage {
  return LANGUAGE_VALUES.includes(value as FounderLanguage) ? (value as FounderLanguage) : "en";
}

function safeVisibility(value: string): CollaborationVisibility {
  return COLLABORATION_VISIBILITY_VALUES.includes(value as CollaborationVisibility)
    ? (value as CollaborationVisibility)
    : "private";
}

/** Maps a stored profile (or its absence) onto the editable form shape. */
export function buildProfileFormValues(
  profile: ProfileLike | null,
  fallbackLocation: string | null
): FounderProfileFormValues {
  if (!profile) {
    return { ...EMPTY_PROFILE_VALUES, location: fallbackLocation ?? "" };
  }

  return {
    location: profile.location ?? fallbackLocation ?? "",
    preferredLanguage: safeLanguage(profile.preferredLanguage),
    currentObjective: profile.currentObjective ?? "",
    challenges: profile.challenges ?? [],
    guidanceAreas: profile.guidanceAreas ?? [],
    priorities: profile.priorities ?? [],
    learningInterests: profile.learningInterests ?? [],
    fundingInterest: profile.fundingInterest ?? "",
    marketingNeeds: profile.marketingNeeds ?? [],
    collaborationInterests: profile.collaborationInterests ?? [],
    recommendationTypes: profile.recommendationTypes ?? EMPTY_PROFILE_VALUES.recommendationTypes,
    reminderPreferences: profile.reminderPreferences ?? DEFAULT_REMINDER_PREFS,
    profileVisibility: profile.profileVisibility,
    collaborationVisibility: safeVisibility(profile.collaborationVisibility),
    onboardingCompleted: Boolean(profile.onboardingCompletedAt),
  };
}
