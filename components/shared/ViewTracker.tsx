"use client";

import { useEffect } from "react";

export function ViewTracker({ startupId }: { startupId: string }) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "profile", startupId }),
    }).catch(() => {});
  }, [startupId]);

  return null;
}
