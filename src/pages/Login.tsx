import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { forgotPassword } from '../services/auth';

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
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setResetSent(false);
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

  const handleForgotPassword = async () => {
    setResetError('');
    if (!email.trim()) {
      setResetError('Enter your email above first, then click Forgot password.');
      return;
    }
    try {
      await forgotPassword(email);
      setResetSent(true);
    } catch {
      setResetError('Could not send reset email. Please check the address and try again.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[#f6f6f2] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-16 w-[480px] h-[480px] bg-[#d14343]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-[#b73535]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        <div className="mb-8 text-center">
          {message && (
            <p className="mb-4 px-4 py-2.5 rounded-2xl text-sm bg-amber-500/10 border border-amber-500/30 text-amber-200">
              {message}
            </p>
          )}
          {resetSent && (
            <p className="mb-4 px-4 py-2.5 rounded-2xl text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              Password reset link sent! Check your email.
            </p>
          )}
          {(error || resetError) && (
            <p className="mb-4 px-4 py-2.5 rounded-2xl text-sm bg-red-500/10 border border-red-500/30 text-red-300">
              {error || resetError}
            </p>
          )}
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-[#d14343]/10 border border-[#d14343]/30 text-[#a24a4a] mb-4">
            Welcome back to Vulture X
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-3">Sign in</h1>
          <p className="text-sm text-gray-600">
            Access your startup or investor dashboard and continue where you left off.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#ffffff]/90 border border-[#e8e8e2] rounded-2xl p-6 sm:p-7 shadow-[0_0_40px_rgba(15,23,42,0.8)] backdrop-blur neon-border space-y-5"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] text-sm text-[#111111] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d14343] focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-[#c35c5c] hover:text-[#a24a4a] transition-colors"
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
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] text-sm text-[#111111] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d14343] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#d14343] to-[#b73535] text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        <p className="mt-5 text-xs text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-[#a24a4a] hover:text-[#111111] font-medium transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

