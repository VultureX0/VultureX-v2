"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Loader2 } from "lucide-react";

// ============================================
// LAYOUT
// ============================================

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}

export function Section({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-[var(--border)] p-5 ${className}`}>{children}</div>;
}

export function CardTitle({ icon: Icon, title, action }: { icon?: LucideIcon; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-[var(--accent)]" />}
        <p className="text-xs font-medium text-[var(--text-muted)]">{title}</p>
      </div>
      {action}
    </div>
  );
}

// ============================================
// EMPTY STATES
// ============================================

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description: string; action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4">
        <Icon size={20} className="text-[var(--text-muted)]" />
      </div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-[var(--text-muted)] max-w-xs">{description}</p>
      {action && (
        <Link href={action.href} className="mt-5 text-xs font-medium px-4 py-2 bg-[var(--accent)] text-[#171717] rounded-md hover:bg-[var(--accent-hover)] transition-colors">
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ============================================
// BUTTONS
// ============================================

export function Button({ children, onClick, href, variant = "primary", size = "md", disabled, loading, className = "" }: {
  children: ReactNode; onClick?: () => void; href?: string; variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md"; disabled?: boolean; loading?: boolean; className?: string;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-xs" };
  const variants = {
    primary: "bg-[var(--accent)] text-[#171717] hover:bg-[var(--accent-hover)]",
    secondary: "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]",
    ghost: "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]",
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button onClick={onClick} disabled={disabled || loading} className={cls}>
      {loading && <Loader2 size={12} className="animate-spin" />}
      {children}
    </button>
  );
}

// ============================================
// LIST ITEMS
// ============================================

export function ListItem({ href, icon, title, subtitle, trailing, delay = 0 }: {
  href: string; icon?: ReactNode; title: string; subtitle?: string; trailing?: ReactNode; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay }}>
      <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors group border-b border-[var(--border)] last:border-0">
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-[var(--accent)] transition-colors">{title}</p>
          {subtitle && <p className="text-[10px] text-[var(--text-muted)] truncate">{subtitle}</p>}
        </div>
        {trailing}
        <ArrowRight size={10} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </motion.div>
  );
}

export function Avatar({ letter, size = "sm" }: { letter: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-[11px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-lg" };
  return (
    <div className={`${sizes[size]} rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center font-medium text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-muted)] transition-colors`}>
      {letter}
    </div>
  );
}

// ============================================
// DATA DISPLAY
// ============================================

export function StatCard({ icon: Icon, label, value, sub, delay = 0 }: {
  icon: LucideIcon; label: string; value: string | number; sub?: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay }}
      className="rounded-lg border border-[var(--border)] p-3.5 hover:border-[var(--border-hover)] transition-colors">
      <Icon size={13} className="text-[var(--text-muted)] mb-2" />
      <p className="text-lg font-semibold tabular-nums">
        {value}{sub && <span className="text-[10px] font-normal text-[var(--text-muted)] ml-1">{sub}</span>}
      </p>
      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
    </motion.div>
  );
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "accent" | "green" }) {
  const variants = {
    default: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]",
    accent: "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/20",
    green: "bg-[var(--green-muted)] text-[var(--green)] border-[var(--green)]/20",
  };
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${variants[variant]}`}>{children}</span>;
}

export function ProgressBar({ value, max, delay = 0 }: { value: number; max: number; delay?: number }) {
  return (
    <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        className="h-full rounded-full bg-[var(--accent)]" />
    </div>
  );
}

// ============================================
// FORMS
// ============================================

export function Input({ label, value, onChange, placeholder, type = "text", id: customId }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; id?: string;
}) {
  const id = customId ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] text-[var(--text-muted)] mb-1">{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors" />
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3, id: customId }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; id?: string;
}) {
  const id = customId ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] text-[var(--text-muted)] mb-1">{label}</label>
      <textarea id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors resize-none" />
    </div>
  );
}
