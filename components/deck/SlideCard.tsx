type Slide = {
  type: string;
  headline: string;
  body: string;
  bullets?: string[];
  metric?: { value: string; label: string };
};

export function SlideCard({ slide }: { slide: Slide }) {
  return (
    <div className="aspect-[16/9] p-8 md:p-12 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] flex flex-col justify-center relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative">
        <span className="inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md mb-4 w-fit">
          {slide.type}
        </span>

        <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight text-[var(--text)]">
          {slide.headline}
        </h2>

        <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-4">
          {slide.body}
        </p>

        {slide.bullets && slide.bullets.length > 0 && (
          <ul className="space-y-2 mb-4">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}

        {slide.metric && (
          <div className="mt-auto pt-4 border-t border-[var(--border)]">
            <div className="text-3xl md:text-4xl font-bold ">{slide.metric.value}</div>
            <div className="text-sm text-[var(--text-muted)]">{slide.metric.label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
