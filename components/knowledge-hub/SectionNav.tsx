"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HUB_ROOT, HUB_SECTIONS } from "@/lib/knowledge-hub";

export function SectionNav() {
  const pathname = usePathname() ?? HUB_ROOT;

  const items = [
    { label: "Hub home", href: HUB_ROOT },
    ...HUB_SECTIONS.map((section) => ({
      label: section.navTitle,
      href: `${HUB_ROOT}/${section.slug}`,
    })),
  ];

  return (
    <nav aria-label="Knowledge Hub sections" className="border-t border-[var(--border)] pt-3">
      <ul className="vx-scroll-x flex items-center gap-1 pb-1 md:flex-wrap md:overflow-visible">
        {items.map((item) => {
          const active =
            item.href === HUB_ROOT
              ? pathname === HUB_ROOT
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-7 items-center rounded-md border px-2.5 text-[11px] whitespace-nowrap transition-colors ${
                  active
                    ? "border-[var(--accent)]/30 bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                    : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
