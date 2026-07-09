"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Search, FileText,
  BarChart3, Bookmark, Settings, LogOut, Heart,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Explore", href: "/explore", icon: Search },
  { label: "Rankings", href: "/rankings", icon: BarChart3 },
  { label: "Interests", href: "/interests", icon: Heart },
  { label: "My Decks", href: "/deck", icon: FileText, roles: ["startup"] as string[] },
  { label: "Saved", href: "/saved", icon: Bookmark, roles: ["investor"] as string[] },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ role }: { role: "startup" | "investor" }) {
  const pathname = usePathname();
  const items = navItems.filter((i) => !i.roles || i.roles.includes(role));

  return (
    <aside aria-label="Platform navigation" className="hidden md:flex flex-col w-48 border-r border-[var(--border)] min-h-screen">
      <div className="px-4 h-12 flex items-center border-b border-[var(--border)]">
        <Link href="/dashboard" className="text-sm font-semibold">VultureX</Link>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                active
                  ? "text-[var(--text)] bg-[var(--bg-elevated)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-3 border-t border-[var(--border)]">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] rounded-md transition-colors w-full"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
