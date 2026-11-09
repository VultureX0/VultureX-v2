"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarClock, Home, LayoutGrid, User } from "lucide-react";

const ITEMS = [
  { label: "Home", href: "/knowledge-hub/for-you", icon: Home },
  { label: "Learn", href: "/knowledge-hub/start-business", icon: BookOpen },
  { label: "Opportunities", href: "/knowledge-hub/funding", icon: CalendarClock },
  { label: "Hub", href: "/knowledge-hub", icon: LayoutGrid },
  { label: "Profile", href: "/settings", icon: User },
];

/**
 * Founder Home bottom dock for small screens. It reuses existing routes; the
 * page reserves bottom padding so the dock never covers content.
 */
export function ForYouBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Founder quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                  active
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <item.icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
