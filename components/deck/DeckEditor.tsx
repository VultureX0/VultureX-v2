"use client";

import { useState } from "react";
import { SlideCard } from "./SlideCard";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

type Slide = {
  type: string;
  headline: string;
  body: string;
  bullets?: string[];
  metric?: { value: string; label: string };
};

export function DeckEditor({ deckId, initialSlides }: { deckId: string; initialSlides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateSlide(index: number, updates: Partial<Slide>) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/deck/${deckId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slides }) });
      setSaved(true);
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  const slide = slides[current];

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
            className="p-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] disabled:opacity-30 transition-colors text-[var(--text-secondary)]">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-[var(--text-secondary)] px-3">
            {current + 1} / {slides.length}
          </span>
          <button onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))} disabled={current === slides.length - 1}
            className="p-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] disabled:opacity-30 transition-colors text-[var(--text-secondary)]">
            <ChevronRight size={16} />
          </button>
        </div>
        <button onClick={handleSave} disabled={saving || saved}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--accent)] text-[#171717] rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
          <Save size={14} />
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {slides.map((s, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`shrink-0 w-20 h-12 rounded-md border text-[8px] font-medium flex items-center justify-center transition-all ${
              i === current
                ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
            }`}>
            {s.type}
          </button>
        ))}
      </div>

      {/* Slide preview */}
      <SlideCard slide={slide} />

      {/* Editor */}
      <div className="mt-6 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] space-y-4">
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Headline</label>
          <input type="text" value={slide.headline} onChange={(e) => updateSlide(current, { headline: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors" />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] mb-1">Body</label>
          <textarea value={slide.body} onChange={(e) => updateSlide(current, { body: e.target.value })} rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none" />
        </div>
        {slide.bullets && (
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-1">Bullets</label>
            {slide.bullets.map((b, i) => (
              <input key={i} type="text" value={b}
                onChange={(e) => { const newBullets = [...(slide.bullets || [])]; newBullets[i] = e.target.value; updateSlide(current, { bullets: newBullets }); }}
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--border-hover)] transition-colors mb-2" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
