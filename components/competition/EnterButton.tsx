"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

export function EnterCompetitionButton({ competitionId, startupId }: { competitionId: string; startupId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnter() {
    setLoading(true);
    try {
      const res = await fetch(`/api/competitions/${competitionId}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId }),
      });
      if (res.ok) router.refresh();
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  return (
    <button
      onClick={handleEnter}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--amber)] text-black font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      <Trophy size={18} />
      {loading ? "Entering..." : "Enter Competition"}
    </button>
  );
}
