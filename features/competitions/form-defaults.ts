/** Plain (server-safe) defaults for the investor competition form. */

export type CriterionInput = { key: string; label: string; weight: string };

export type CompetitionFormInitial = {
  id?: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  hostOrganization: string;
  bannerUrl: string;
  openAt: string;
  deadline: string;
  evaluationEndsAt: string;
  winnerAnnouncementAt: string;
  completionAt: string;
  prizeAmount: string;
  prizeCurrency: string;
  prizeDescription: string;
  benefits: {
    mentorship: boolean;
    incubation: boolean;
    pilotPartnership: boolean;
    investorVisibility: boolean;
    other: string;
  };
  eligibility: {
    allStages: boolean;
    stages: string[];
    sectors: string[];
    minMrr: string;
    maxMrr: string;
    regions: string;
    requirements: string;
    requiredSdgs: number[];
    requireVerifiedImpact: boolean;
  };
  criteria: CriterionInput[];
  sdgGoals: number[];
  sdgPrimary: number | null;
  rules: string;
  status?: string;
};

export const EMPTY_COMPETITION_FORM: CompetitionFormInitial = {
  title: "",
  summary: "",
  description: "",
  category: "",
  hostOrganization: "",
  bannerUrl: "",
  openAt: "",
  deadline: "",
  evaluationEndsAt: "",
  winnerAnnouncementAt: "",
  completionAt: "",
  prizeAmount: "",
  prizeCurrency: "USD",
  prizeDescription: "",
  benefits: {
    mentorship: false,
    incubation: false,
    pilotPartnership: false,
    investorVisibility: false,
    other: "",
  },
  eligibility: {
    allStages: true,
    stages: [],
    sectors: [],
    minMrr: "",
    maxMrr: "",
    regions: "",
    requirements: "",
    requiredSdgs: [],
    requireVerifiedImpact: false,
  },
  criteria: [
    { key: "innovation", label: "Innovation", weight: "30" },
    { key: "feasibility", label: "Feasibility", weight: "25" },
    { key: "impact", label: "Impact", weight: "25" },
    { key: "scalability", label: "Scalability", weight: "20" },
  ],
  sdgGoals: [],
  sdgPrimary: null,
  rules: "",
};
