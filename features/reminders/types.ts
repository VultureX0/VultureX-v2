export type ReminderView = {
  id: string;
  title: string;
  description: string | null;
  dueAt: string;
  hasTime: boolean;
  completedAt: string | null;
  roadmapTaskId: string | null;
  savedResourceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReminderSummary = {
  total: number;
  overdue: number;
  dueToday: number;
  upcoming: number;
  completed: number;
};

export type ReminderTaskOption = {
  id: string;
  title: string;
  status: string;
};

export type ReminderResourceOption = {
  id: string;
  title: string;
  category: string;
};
