import type {
  RoadmapMilestoneStatus,
  RoadmapProgress,
  RoadmapRecommendation,
  RoadmapStageKey,
  RoadmapTaskPriority,
  RoadmapTaskStatus,
} from "./stages";

export type RoadmapStageView = {
  key: RoadmapStageKey;
  label: string;
  raw: string | null;
};

export type RoadmapTaskView = {
  id: string;
  taskKey: string;
  stage: string;
  title: string;
  description: string | null;
  category: string;
  priority: RoadmapTaskPriority;
  status: RoadmapTaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  source: "template" | "custom";
  sortOrder: number;
};

export type RoadmapMilestoneView = {
  id: string;
  title: string;
  description: string | null;
  status: RoadmapMilestoneStatus;
  targetDate: string | null;
  achievedAt: string | null;
};

export type RoadmapOverview = {
  stage: RoadmapStageView;
  tasks: RoadmapTaskView[];
  milestones: RoadmapMilestoneView[];
  progress: RoadmapProgress;
  recommendations: RoadmapRecommendation[];
};
