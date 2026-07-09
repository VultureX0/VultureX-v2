"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError("Invalid email or password");
      else { router.push("/dashboard"); router.refresh(); }
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <h1 className="text-lg font-semibold mb-1">Sign in</h1>
      <p className="text-xs text-[var(--text-muted)] mb-6">Welcome back to VultureX</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        {error && <p className="text-xs text-[var(--red)]">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-2 text-xs font-medium bg-[var(--text)] text-[var(--bg)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 mt-1">
          {loading ? "Signing in..." : "Sign in"}
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
