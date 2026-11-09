"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "vx-theme";

/**
 * Switches the whole application between the two token sets.
 *
 * The active theme is read from the root class that the bootstrap script in
 * app/layout.tsx already applied, so this component needs no state of its own:
 * the icons are chosen by CSS, and the click handler updates the same class and
 * persists the choice.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";

    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the theme still applies for this page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      title="Switch between light and dark mode"
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] ${className}`}
    >
      <Sun size={13} className="hidden dark:block" aria-hidden="true" />
      <Moon size={13} className="block dark:hidden" aria-hidden="true" />
    </button>
  );
}
