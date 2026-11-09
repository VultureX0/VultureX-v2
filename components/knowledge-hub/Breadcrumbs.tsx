import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight size={10} className="text-[var(--text-muted)]" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
