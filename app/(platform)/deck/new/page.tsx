"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export default function NewDeckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/deck/generate", { method: "POST" });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate deck");
        return;
      }

      const deck = await res.json();
      router.push(`/deck/${deck.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto text-center pt-12">
      <div className="w-20 h-20 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-[var(--accent)]" />
      </div>

      <h1 className="text-xl font-semibold mb-3">Generate Your Pitch Deck</h1>
      <p className="text-xs text-[var(--text-muted)] mb-8 max-w-sm mx-auto">
        Our AI will create an investor-ready pitch deck from your profile data in about 30 seconds.
      </p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-[#171717] font-medium rounded-xl text-lg hover:bg-[var(--accent-hover)] disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Deck
          </>
        )}
      </button>

      {loading && (
        <p className="text-xs text-[var(--text-muted)] mt-4 animate-pulse">
          Writing your pitch narrative with AI...
        </p>
      )}
    </div>
  );
}
