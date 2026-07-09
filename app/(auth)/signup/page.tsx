"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"startup" | "investor" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { setError("Select a role"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      const { signIn } = await import("next-auth/react");
      await signIn("credentials", { email, password, redirect: false });
      router.push(role === "startup" ? "/onboarding/startup" : "/onboarding/investor");
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <h1 className="text-lg font-semibold mb-1">Create account</h1>
      <p className="text-xs text-[var(--text-muted)] mb-5">Join VultureX</p>

      {/* Role */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button type="button" onClick={() => setRole("startup")}
          className={`py-2.5 text-xs rounded-md border transition-colors ${role === "startup" ? "border-[var(--text)] text-[var(--text)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"}`}>
          Startup
        </button>
        <button type="button" onClick={() => setRole("investor")}
          className={`py-2.5 text-xs rounded-md border transition-colors ${role === "investor" ? "border-[var(--text)] text-[var(--text)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"}`}>
          Investor
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Name" type="text" value={name} onChange={setName} placeholder="Jane Smith" />
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="jane@startup.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 6 characters" min={6} />
        {error && <p className="text-xs text-[var(--red)]">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-2 text-xs font-medium bg-[var(--text)] text-[var(--bg)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 mt-1">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="text-xs text-[var(--text-muted)] mt-5 text-center">
        Have an account? <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--text)]">Sign in</Link>
      </p>
    </>
  );
}

function Input({ label, type, value, onChange, placeholder, min }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string; min?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required placeholder={placeholder} minLength={min}
        className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--border-hover)] transition-colors" />
    </div>
  );
}
