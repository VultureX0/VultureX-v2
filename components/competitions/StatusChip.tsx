"use client";

import { Badge } from "@/components/ui";
import { STATUS_LABELS, statusTone } from "@/features/competitions/types";
import type { CompetitionStatus } from "@/db/schema";

export function StatusChip({ status }: { status: CompetitionStatus | string }) {
  return (
    <Badge variant={statusTone(status)}>
      {STATUS_LABELS[status as CompetitionStatus] ?? status}
    </Badge>
  );
}
