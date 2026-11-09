import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRoadmapRecommendations,
  computeRoadmapProgress,
  getStageTemplate,
  normalizeRoadmapStage,
  pickNextTask,
  roadmapStageLabel,
  type RoadmapTaskLike,
} from "./stages";

const baseTask: RoadmapTaskLike = {
  id: "00000000-0000-0000-0000-000000000001",
  taskKey: "seed-metrics-baseline",
  title: "Record your current metrics baseline",
  description: null,
  category: "Metrics",
  priority: "high",
  status: "not_started",
  sortOrder: 10,
  dueDate: null,
  completedAt: null,
};

test("normalizes the database stages and common variants", () => {
  assert.equal(normalizeRoadmapStage("pre-seed"), "pre-seed");
  assert.equal(normalizeRoadmapStage("Pre Seed"), "pre-seed");
  assert.equal(normalizeRoadmapStage("seed"), "seed");
  assert.equal(normalizeRoadmapStage("Seed Stage"), "seed");
  assert.equal(normalizeRoadmapStage("MVP"), "mvp");
  assert.equal(normalizeRoadmapStage("growth"), "growth");
  assert.equal(normalizeRoadmapStage(null), "general");
  assert.equal(normalizeRoadmapStage("something-else"), "general");
  assert.equal(roadmapStageLabel("seed"), "Seed");
});

test("every stage template has unique keys and valid lengths", () => {
  for (const stage of ["idea", "pre-seed", "mvp", "seed", "growth", "general"]) {
    const template = getStageTemplate(stage);
    assert.ok(template.length >= 5, `${stage} should have tasks`);
    assert.equal(new Set(template.map((task) => task.taskKey)).size, template.length);
    for (const task of template) {
      assert.ok(task.title.length > 0 && task.title.length <= 160);
      assert.ok(task.description.length <= 1000);
      assert.ok(task.sortOrder > 0);
    }
  }
});

test("progress excludes skipped tasks and uses real counts", () => {
  const tasks: RoadmapTaskLike[] = [
    { ...baseTask, id: "t1", status: "completed" },
    { ...baseTask, id: "t2", taskKey: "k2", status: "completed" },
    { ...baseTask, id: "t3", taskKey: "k3", status: "in_progress" },
    { ...baseTask, id: "t4", taskKey: "k4", status: "skipped" },
  ];

  const progress = computeRoadmapProgress(tasks, [
    {
      id: "m1",
      title: "First paying customer",
      description: null,
      status: "achieved",
      targetDate: null,
      achievedAt: "2026-11-01T00:00:00.000Z",
    },
    {
      id: "m2",
      title: "Ten customers",
      description: null,
      status: "planned",
      targetDate: null,
      achievedAt: null,
    },
  ]);

  assert.equal(progress.tasksTotal, 3);
  assert.equal(progress.tasksCompleted, 2);
  assert.equal(progress.tasksInProgress, 1);
  assert.equal(progress.tasksOpen, 1);
  assert.equal(progress.tasksSkipped, 1);
  assert.equal(progress.taskPercent, 67);
  assert.equal(progress.milestonesTotal, 2);
  assert.equal(progress.milestonesAchieved, 1);
  assert.equal(progress.milestonePercent, 50);
});

test("empty roadmaps report zero instead of a fabricated percentage", () => {
  const progress = computeRoadmapProgress([], []);
  assert.equal(progress.tasksTotal, 0);
  assert.equal(progress.taskPercent, 0);
  assert.equal(progress.milestonesTotal, 0);
  assert.equal(progress.milestonePercent, 0);
});

test("next task prefers in-progress work, then priority and order", () => {
  const tasks: RoadmapTaskLike[] = [
    { ...baseTask, id: "high", priority: "high", sortOrder: 10 },
    { ...baseTask, id: "progress", taskKey: "k2", priority: "low", status: "in_progress" },
    { ...baseTask, id: "done", taskKey: "k3", status: "completed" },
    { ...baseTask, id: "skipped", taskKey: "k4", status: "skipped" },
  ];

  assert.equal(pickNextTask(tasks)?.id, "progress");
  assert.equal(pickNextTask([{ ...baseTask, status: "completed" }]), null);
});

test("recommendations are built only from the real roadmap state", () => {
  const empty = buildRoadmapRecommendations({ stage: "seed", tasks: [], milestones: [] });
  assert.equal(empty.length, 1);
  assert.equal(empty[0].kind, "build_roadmap");
  assert.match(empty[0].why, /No roadmap tasks exist yet/);

  const tasks: RoadmapTaskLike[] = [
    { ...baseTask, status: "completed" },
    {
      ...baseTask,
      id: "00000000-0000-0000-0000-000000000002",
      taskKey: "seed-customer-interviews",
      title: "Interview five active customers",
      priority: "high",
      sortOrder: 20,
    },
  ];

  const recommendations = buildRoadmapRecommendations({
    stage: "seed",
    tasks,
    milestones: [],
  });

  assert.equal(recommendations[0].kind, "next_task");
  assert.equal(recommendations[0].taskId, "00000000-0000-0000-0000-000000000002");
  assert.match(recommendations[0].why, /1 of 2 active tasks complete/);
  assert.ok(recommendations.some((item) => item.kind === "stage_task"));
  assert.ok(recommendations.some((item) => item.kind === "milestone"));
});
