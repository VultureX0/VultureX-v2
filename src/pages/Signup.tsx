import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [role, setRole] = useState<'startup' | 'investor'>('startup');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPw) {
      setLocalError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, role);
      navigate('/login', { state: { message: 'Account created! Sign in to get started.' }, replace: true });
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[#f6f6f2] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-16 w-[480px] h-[480px] bg-[#d14343]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-[#b73535]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-[#d14343]/10 border border-[#d14343]/30 text-[#a24a4a] mb-4">
            Join Vulture X
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-3">Create your account</h1>
          <p className="text-sm text-gray-600">Get started as a startup or investor on the platform.</p>
        </div>

        {displayError && (
          <p className="mb-4 px-4 py-2.5 rounded-2xl text-sm bg-red-500/10 border border-red-500/30 text-red-300">
            {displayError}
          </p>
        )}

        <form
          onSubmit={handleSignUp}
          autoComplete="on"
          className="bg-[#ffffff]/90 border border-[#e8e8e2] rounded-2xl p-6 sm:p-7 shadow-[0_0_40px_rgba(15,23,42,0.8)] backdrop-blur neon-border space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {(['startup', 'investor'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all ${
                    role === r
                      ? 'bg-[#d14343]/10 border-[#d14343]/40 text-[#111111]'
                      : 'bg-[#ffffff] border-[#e8e8e2] text-gray-600 hover:text-[#111111] hover:border-[#d5d5ce]'
                  }`}
                >
                  {r === 'startup' ? 'Startup Founder' : 'Investor'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              id="email"
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] text-sm text-[#111111] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d14343] focus:border-transparent transition-all"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] text-sm text-[#111111] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d14343] focus:border-transparent transition-all"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#d14343] to-[#b73535] text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-xs text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#a24a4a] hover:text-[#111111] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
