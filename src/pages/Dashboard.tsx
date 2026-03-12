import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, DollarSign, FileText, Settings, Users, LayoutDashboard, Briefcase, Rocket, Pencil } from 'lucide-react';
import { useStartup } from '../features/startups';
import { useAuth } from '../features/auth';

/* ─── Empty state (no profile yet) ─── */
function EmptyDashboard() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen pt-20 bg-[#050511] text-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex items-center justify-center">
          <Rocket size={36} className="text-[#8b5cf6]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Welcome to your Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">
          You&apos;re signed in as <span className="text-white font-medium">{user?.email}</span>.
          <br />
          Set up your startup profile so investors can discover you.
        </p>
        <Link
          to="/startup-onboarding"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:opacity-90 transition-all"
        >
          <Rocket size={18} /> Set Up Startup Profile
        </Link>
      </div>
    </div>
  );
}

/* ─── Loading skeleton ─── */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen pt-20 bg-[#050511] text-gray-100 px-4 sm:px-6 lg:px-10 pb-10">
      <div className="animate-pulse space-y-6 max-w-5xl mx-auto mt-6">
        <div className="h-8 w-48 bg-[#1c1c3a] rounded-lg" />
        <div className="h-4 w-80 bg-[#1c1c3a] rounded" />
        <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-8 space-y-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-[#1c1c3a] rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-1/3 bg-[#1c1c3a] rounded" />
              <div className="h-4 w-2/3 bg-[#1c1c3a] rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-40 bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl" />
          <div className="h-40 bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main dynamic dashboard ─── */
export default function Dashboard() {
  const { profile, isLoading } = useStartup();
  const { user } = useAuth();

  if (isLoading) return <DashboardSkeleton />;
  if (!profile || !profile.companyName) return <EmptyDashboard />;

  const initials = profile.companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen pt-20 bg-[#050511] text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0b0b18] border-r border-[#1c1c3a] hidden md:flex flex-col">
        <div className="px-5 py-4 border-b border-[#1c1c3a]">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Startup</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-white truncate max-w-[150px]">{profile.companyName}</div>
              <div className="text-xs text-gray-500 truncate max-w-[150px]">{profile.tagline || profile.sector}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={Briefcase} label="Startup Info" />
          <SidebarItem icon={BarChart3} label="Financials" />
          <SidebarItem icon={FileText} label="Documents" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-10 pb-10">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              Your startup profile as seen by investors.
            </p>
          </div>
          <Link
            to="/startup-onboarding"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#1c1c3a] text-gray-300 hover:text-white hover:border-[#8b5cf6]/40 transition-all"
          >
            <Pencil size={14} /> Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <section className="space-y-6 lg:col-span-2">
            {/* Startup overview */}
            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-xl font-bold">
                  {initials}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{profile.companyName}</div>
                  {profile.tagline && (
                    <p className="text-sm text-gray-400">{profile.tagline}</p>
                  )}
                  {profile.sector && (
                    <div className="mt-1 text-xs text-gray-500">
                      Industry: {profile.sector}
                      {profile.stage ? ` · ${profile.stage}` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Founder & funding */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {profile.founderName && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Founder</div>
                    <div className="text-sm text-white font-medium">{profile.founderName}</div>
                    {profile.founderRole && (
                      <div className="text-xs text-gray-500">{profile.founderRole}</div>
                    )}
                  </div>
                )}
                {(profile.stage || profile.fundingRaised) && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Funding Stage</div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                      {profile.stage}
                      {profile.fundingRaised ? ` · Raised ${profile.fundingRaised}` : ''}
                    </div>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="text-sm text-white">{profile.location}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Traction & financials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traction metrics */}
              <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users size={16} className="text-[#8b5cf6]" />
                    Traction Metrics
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Metric label="MRR" value={profile.mrr || '—'} />
                  <Metric label="Active Users" value={profile.activeUsers || '—'} />
                  <Metric label="Customers" value={profile.customers || '—'} />
                  <Metric
                    label="Monthly Growth"
                    value={profile.monthlyGrowthPercent ? `${profile.monthlyGrowthPercent}` : '—'}
                    trend={profile.monthlyGrowthPercent && !profile.monthlyGrowthPercent.startsWith('-') ? 'up' : undefined}
                  />
                </div>
              </div>

              {/* Financial summary */}
              <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-400" />
                    Financial Summary
                  </h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Runway</span>
                    <span className="text-white font-medium">{profile.runway || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Monthly Burn</span>
                    <span className="text-white font-medium">{profile.burnRate || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Cash in Bank</span>
                    <span className="text-white font-medium">{profile.cashInBank || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team members */}
            {(profile.team.length > 0 || profile.founderName) && (
              <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={16} className="text-sky-400" />
                  Team Members
                </h2>
                <div className="space-y-3 text-sm">
                  {/* Founder always first */}
                  {profile.founderName && (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white font-medium">{profile.founderName}</div>
                        <div className="text-xs text-gray-400">{profile.founderRole || 'Founder'}</div>
                      </div>
                      {profile.founderBio && (
                        <div className="text-xs text-gray-500 max-w-xs text-right">{profile.founderBio}</div>
                      )}
                    </div>
                  )}
                  {profile.team.map((member) => (
                    <div key={member.name + member.role} className="flex items-start justify-between">
                      <div>
                        <div className="text-white font-medium">{member.name}</div>
                        <div className="text-xs text-gray-400">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right column */}
          <section className="space-y-6">
            {/* Pitch deck */}
            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#8b5cf6]" />
                Pitch Deck
              </h2>
              {profile.pitchDeckUrl ? (
                <div className="space-y-3">
                  <a
                    href={profile.pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#c4b5fd] hover:text-white transition-colors"
                  >
                    <FileText size={14} /> View Pitch Deck →
                  </a>
                  <p className="text-[11px] text-gray-500">
                    Update your deck URL in{' '}
                    <Link to="/startup-onboarding" className="text-[#a78bfa] hover:text-white transition-colors">
                      Edit Profile
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400 mb-3">No pitch deck linked yet.</p>
                  <Link
                    to="/startup-onboarding"
                    className="px-4 py-1.5 rounded-lg bg-[#8b5cf6] text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Add Deck URL
                  </Link>
                </div>
              )}
            </div>

            {/* Account info */}
            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Settings size={16} className="text-gray-400" />
                Account
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-gray-300">{user?.email}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Website</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a78bfa] hover:text-white transition-colors truncate max-w-[180px]"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {profile.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-gray-300">
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ─── Sidebar item ─── */
type SidebarItemProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  active?: boolean;
};

function SidebarItem({ icon: Icon, label, active }: SidebarItemProps) {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-xs ${
        active ? 'bg-[#8b5cf6]/10 text-[#e5deff]' : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={16} className={active ? 'text-[#8b5cf6]' : 'text-gray-500'} />
      <span>{label}</span>
    </button>
  );
}

/* ─── Metric card ─── */
type MetricProps = {
  label: string;
  value: string;
  trend?: 'up' | 'down';
};

function Metric({ label, value, trend }: MetricProps) {
  return (
    <div className="bg-[#09091a] rounded-xl p-3">
      <div className="text-[11px] text-gray-500 mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{value}</span>
        {trend && (
          <span className={`text-[11px] ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </div>
  );
}
