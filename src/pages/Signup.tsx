import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth';

type Step = 'form' | 'verify-email';

export default function Signup() {
  const { signUp, error, clearError } = useAuth();
  const [step, setStep] = useState<Step>('form');
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
      setStep('verify-email');
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-[#06060f] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-16 w-[480px] h-[480px] bg-[#8b5cf6]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-[#7c3aed]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#c4b5fd] mb-4">
            Join Vulture X
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {step === 'form' ? 'Create your account' : 'Check your email'}
          </h1>
          <p className="text-sm text-gray-400">
            {step === 'form'
              ? 'Get started as a startup or investor on the platform.'
              : `We've sent a verification link to ${email}`}
          </p>
        </div>

        {displayError && (
          <p className="mb-4 px-4 py-2.5 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-300">
            {displayError}
          </p>
        )}

        {step === 'form' ? (
          <form
            onSubmit={handleSignUp}
            autoComplete="on"
            className="bg-[#0b0b18]/90 border border-[#1c1c3a] rounded-2xl p-6 sm:p-7 shadow-[0_0_40px_rgba(15,23,42,0.8)] backdrop-blur neon-border space-y-5"
          >
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {(['startup', 'investor'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      role === r
                        ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/40 text-white'
                        : 'bg-[#050511] border-[#1c1c3a] text-gray-400 hover:text-white hover:border-[#2d2d50]'
                    }`}
                  >
                    {r === 'startup' ? 'Startup Founder' : 'Investor'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050511] border border-[#1c1c3a] text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050511] border border-[#1c1c3a] text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <div className="bg-[#0b0b18]/90 border border-[#1c1c3a] rounded-2xl p-6 sm:p-7 shadow-[0_0_40px_rgba(15,23,42,0.8)] backdrop-blur neon-border space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-sm text-gray-300">
              Click the link in the email to verify your account, then sign in.
            </p>
            <p className="text-xs text-gray-500">
              Didn&apos;t receive it? Check your spam folder.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all"
            >
              Go to Sign In
            </Link>
          </div>
        )}

        <p className="mt-5 text-xs text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#c4b5fd] hover:text-white font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
