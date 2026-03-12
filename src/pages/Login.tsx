import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, error, clearError } = useAuth();
  const from = (location.state as { from?: string })?.from;
  const message = (location.state as { message?: string })?.message;
  const startup = (location.state as { startup?: { name: string } })?.startup;
  const returnToStartup = (location.state as { returnToStartup?: boolean })?.returnToStartup;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signIn(email, password);
      if (returnToStartup && startup?.name) {
        navigate(`/startup/view/${encodeURIComponent(startup.name)}`, { state: { startup }, replace: true });
      } else {
        navigate(from || '/dashboard', { replace: true });
      }
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[#06060f] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-16 w-[480px] h-[480px] bg-[#8b5cf6]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-[#7c3aed]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        <div className="mb-8 text-center">
          {message && (
            <p className="mb-4 px-4 py-2.5 rounded-xl text-sm bg-amber-500/10 border border-amber-500/30 text-amber-200">
              {message}
            </p>
          )}
          {error && (
            <p className="mb-4 px-4 py-2.5 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-300">
              {error}
            </p>
          )}
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#c4b5fd] mb-4">
            Welcome back to Vulture X
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Sign in</h1>
          <p className="text-sm text-gray-400">
            Access your startup or investor dashboard and continue where you left off.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0b0b18]/90 border border-[#1c1c3a] rounded-2xl p-6 sm:p-7 shadow-[0_0_40px_rgba(15,23,42,0.8)] backdrop-blur neon-border space-y-5"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050511] border border-[#1c1c3a] text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050511] border border-[#1c1c3a] text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        <p className="mt-5 text-xs text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-[#c4b5fd] hover:text-white font-medium transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

