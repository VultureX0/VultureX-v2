import {
  BATCH_QUESTIONS,
  BATCH_TITLES,
  asAllocation,
  asCompetitors,
  formatMoney,
  isVisible,
  type Answers,
  type BatchNumber,
  type Question,
} from "./questionnaire";

export type AnswerRow = { id: string; label: string; value: string; empty: boolean };

export type BatchAnswersView = {
  batch: BatchNumber;
  title: string;
  rows: AnswerRow[];
  followUps: AnswerRow[];
};

function formatQuestionValue(question: Question, value: unknown): string {
  switch (question.type) {
    case "money":
      return formatMoney(value);
    case "multiselect":
      return Array.isArray(value) ? value.join(", ") : "";
    case "repeatable":
      return asCompetitors(value)
        .filter((c) => c.name.trim())
        .map((c) => `${c.name}${c.difference ? ` — ${c.difference}` : ""}`)
        .join("\n");
    case "allocations": {
      const a = asAllocation(value);
      const lines = (["product", "sales", "hiring", "operations"] as const)
        .filter((k) => a[k] > 0)
        .map((k) => `${k}: ${a[k]}%`);
      if (a.other > 0) lines.push(`${a.otherLabel || "Other"}: ${a.other}%`);
      return lines.join("\n");
    }
    case "file":
      return value ? "Attached (private file)" : "";
    default:
      return value === undefined || value === null ? "" : String(value);
  }
}

/** Read-back view of the original answers, one entry per batch. */
export function batchAnswersView(answers: Answers): BatchAnswersView[] {
  return ([1, 2, 3] as BatchNumber[]).map((batch) => {
    const rows: AnswerRow[] = [];
    const followUps: AnswerRow[] = [];

    for (const question of BATCH_QUESTIONS[batch]) {
      const value = formatQuestionValue(question, answers[question.id]);
      const label = question.labelWhen?.(answers) ?? question.label;

      if (!isVisible(question, answers) && !value) continue;

      rows.push({ id: question.id, label, value, empty: !value });

      if (question.followUp) {
        const fv = String(answers[question.followUp.id] ?? "").trim();
        followUps.push({ id: question.followUp.id, label: question.followUp.label, value: fv, empty: !fv });
      }
    }

    return { batch, title: BATCH_TITLES[batch], rows, followUps };
  });
}

/** Contact / headline facts the admin needs at a glance. */
export function questionnaireHighlights(answers: Answers): AnswerRow[] {
  const pick = (id: string, label: string) => ({
    id,
    label,
    value: formatQuestionValue(
      BATCH_QUESTIONS[1].find((q) => q.id === id) ??
        BATCH_QUESTIONS[2].find((q) => q.id === id) ??
        BATCH_QUESTIONS[3].find((q) => q.id === id) ??
        ({ type: "text" } as Question),
      answers[id],
    ),
    empty: !String(answers[id] ?? "").trim(),
  });

  return [
    pick("Q11", "Fundraising status"),
    pick("Q11A", "Raise amount"),
    pick("Q12", "Contact email"),
    pick("Q7", "Product stage"),
  ];
}
