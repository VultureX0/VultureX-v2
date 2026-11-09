"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Rocket, Briefcase, ShieldCheck } from "lucide-react";

type Role = "startup" | "investor" | "admin";

const ROLES: { value: Role; label: string; description: string; icon: typeof Rocket }[] = [
  { value: "startup", label: "Startup", description: "Manage your profile and pitch decks", icon: Rocket },
  { value: "investor", label: "Investor", description: "Discover and back startups", icon: Briefcase },
  { value: "admin", label: "Admin", description: "Vulture X team access only", icon: ShieldCheck },
];

// NOTE: the form deliberately does not use `useSearchParams`. Reading it needs a
// Suspense boundary, and the client-side suspension after hydration discards the
// first render — which silently reset the selected role and any typed input. The
// callback URL is read from the live location instead, on submit only.
export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("startup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const active = ROLES.find((r) => r.value === role)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError(
          role === "admin"
            ? "Invalid email or password for an admin account"
            : `Invalid email or password, or this account is not a ${active.label.toLowerCase()} account`,
        );
        return;
      }

      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      const destination =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : role === "admin" ? "/admin" : "/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-lg font-semibold mb-1">Sign in</h1>
      <p className="text-xs text-[var(--text-muted)] mb-5">Welcome back to VultureX</p>

      {/* Role selection — startup, investor or admin */}
      <div className="mb-5">
        <p className="block text-[10px] text-[var(--text-muted)] mb-1.5">Sign in as</p>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const selected = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  setRole(r.value);
                  setError("");
                }}
                aria-pressed={selected}
                title={r.description}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 text-xs rounded-md border transition-colors ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                }`}
              >
                <Icon size={14} />
                {r.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1.5">{active.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        {error && <p className="text-xs text-[var(--red)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 text-xs font-medium bg-[var(--text)] text-[var(--bg)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
        >
          {loading ? "Signing in..." : `Sign in as ${active.label}`}
        </button>
      </form>

      <p className="text-xs text-[var(--text-muted)] mt-5 text-center">
        No account? <Link href="/signup" className="text-[var(--text-secondary)] hover:text-[var(--text)]">Sign up</Link>
      </p>
    </>
  );
}

function Input({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors" />
    </div>
  );
}
