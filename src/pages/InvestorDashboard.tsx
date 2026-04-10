import { Link, Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Wallet,
  Bookmark,
  MessageSquare,
  Settings,
  User,
  Target,
  Building2,
  LogOut,
  TrendingUp,
  Bell,
  Shield,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { useInvestor } from '../context/InvestorContext';
import { STARTUP_PROFILES } from '../services/startups';
import type { StartupProfileData } from '../types';

const investorTypeLabels: Record<string, string> = {
  vc: 'Venture Capital / Investment Firm',
  angel: 'Angel Investor',
  family_office: 'Family Office',
  corporate_vc: 'Corporate VC',
};

const lookLabels: Record<string, string> = {
  lead: 'Lead',
  co_invest: 'Co-invest',
  passive: 'Passive',
};

function Sidebar() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-colors ${
      isActive ? 'bg-[#60a5fa]/10 text-[#a5b4fc]' : 'text-gray-600 hover:text-[#111111] hover:bg-white/5'
    }`;

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-[#e8e8e2] hidden md:flex flex-col flex-shrink-0">
      <div className="px-5 py-4 border-b border-[#e8e8e2]">
        <div className="text-xs uppercase tracking-wider text-gray-600 mb-2">Investor</div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#c35c5c] flex items-center justify-center text-xs font-bold text-[#111111]">
            VX
          </div>
          <div>
            <div className="text-sm font-semibold text-[#111111]">Vulture X</div>
            <div className="text-xs text-gray-600">Investor Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/investor-dashboard" end className={navClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/investor-dashboard/investments" className={navClass}>
          <Wallet size={18} /> My Investments
        </NavLink>
        <NavLink to="/investor-dashboard/saved" className={navClass}>
          <Bookmark size={18} /> Saved Startups
        </NavLink>
        <NavLink to="/investor-dashboard/messages" className={navClass}>
          <MessageSquare size={18} /> Messages
        </NavLink>
        <NavLink to="/investor-dashboard/settings" className={navClass}>
          <Settings size={18} /> Settings
        </NavLink>
      </nav>
    </aside>
  );
}

function ProfileSummary() {
  const { profile } = useInvestor();
  if (!profile) {
    return (
      <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-8 text-center text-gray-600">
        No profile data. Complete <NavLink to="/investor-onboarding" className="text-[#60a5fa] hover:underline">onboarding</NavLink> first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Typical check size" value={`$${profile.checkSizeMin}K – $${profile.checkSizeMax}K`} icon={Wallet} />
        <MetricCard label="Preferred sectors" value={profile.preferredSectors.length ? `${profile.preferredSectors.length} selected` : 'Not set'} icon={Target} />
        <MetricCard label="Cold pitches" value={profile.openToColdPitches ? 'Open' : 'Closed'} icon={Bell} />
      </div>

      <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-[#60a5fa] mb-4">
          <User size={20} />
          <h3 className="text-lg font-semibold text-[#111111]">Profile Summary</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 block mb-0.5">Full Name</span>
            <span className="text-[#111111]">{profile.fullName}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Email</span>
            <span className="text-[#111111]">{profile.email}</span>
          </div>
          {profile.phone && (
            <div>
              <span className="text-gray-600 block mb-0.5">Phone</span>
              <span className="text-[#111111]">{profile.phone}</span>
            </div>
          )}
          {profile.linkedIn && (
            <div>
              <span className="text-gray-600 block mb-0.5">LinkedIn</span>
              <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-[#60a5fa] hover:underline truncate block">
                {profile.linkedIn}
              </a>
            </div>
          )}
          {profile.location && (
            <div>
              <span className="text-gray-600 block mb-0.5">Location</span>
              <span className="text-[#111111]">{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-[#60a5fa] mb-4">
          <Target size={20} />
          <h3 className="text-lg font-semibold text-[#111111]">Investment Preferences</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600 block mb-0.5">Investor Type</span>
            <span className="text-[#111111]">{investorTypeLabels[profile.investorType] ?? profile.investorType}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Check Size</span>
            <span className="text-[#111111]">${profile.checkSizeMin}K – ${profile.checkSizeMax}K</span>
          </div>
          {profile.preferredSectors.length > 0 && (
            <div>
              <span className="text-gray-600 block mb-1">Preferred Sectors</span>
              <div className="flex flex-wrap gap-2">
                {profile.preferredSectors.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 rounded-xl bg-[#e8e8e2] text-gray-700 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.geographyFocus && (
            <div>
              <span className="text-gray-600 block mb-0.5">Geography</span>
              <span className="text-[#111111]">{profile.geographyFocus}</span>
            </div>
          )}
          <div>
            <span className="text-gray-600 block mb-0.5">Looking to</span>
            <span className="text-[#111111]">{lookLabels[profile.lookingTo] ?? profile.lookingTo}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Open to cold pitches</span>
            <span className="text-[#111111]">{profile.openToColdPitches ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {(profile.investorType === 'vc' && (profile.firmName || profile.fundSize)) && (
        <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
          <div className="flex items-center gap-2 text-[#60a5fa] mb-4">
            <Building2 size={20} />
            <h3 className="text-lg font-semibold text-[#111111]">Firm Details</h3>
          </div>
          <div className="space-y-3 text-sm">
            {profile.firmName && (
              <div>
                <span className="text-gray-600 block mb-0.5">Firm Name</span>
                <span className="text-[#111111]">{profile.firmName}</span>
              </div>
            )}
            {profile.firmWebsite && (
              <div>
                <span className="text-gray-600 block mb-0.5">Website</span>
                <a href={profile.firmWebsite} target="_blank" rel="noopener noreferrer" className="text-[#60a5fa] hover:underline">
                  {profile.firmWebsite}
                </a>
              </div>
            )}
            {profile.fundSize && (
              <div>
                <span className="text-gray-600 block mb-0.5">Fund Size</span>
                <span className="text-[#111111]">{profile.fundSize}</span>
              </div>
            )}
            {profile.stageFocus.length > 0 && (
              <div>
                <span className="text-gray-600 block mb-1">Stage Focus</span>
                <div className="flex flex-wrap gap-2">
                  {profile.stageFocus.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-xl bg-[#e8e8e2] text-gray-700 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {profile.investmentThesis && (
        <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#111111] mb-3">Investment Thesis</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{profile.investmentThesis}</p>
        </div>
      )}

      <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-[#111111]">Recommended Startups</h3>
            <p className="text-sm text-gray-600 mt-1">Matched from your sector preferences and platform activity.</p>
          </div>
          <Link to="/explore" className="text-sm text-[#60a5fa] hover:text-[#93c5fd] transition-colors inline-flex items-center gap-1">
            Explore all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {getRecommendedStartups(profile.preferredSectors).map((startup: StartupProfileData) => (
            <Link
              key={startup.id}
              to={`/startup/profile/${startup.id}`}
              className="flex items-center justify-between gap-4 bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl px-4 py-3 hover:border-[#60a5fa]/30 hover:bg-[#101021] transition-all"
            >
              <div className="min-w-0">
                <div className="text-[#111111] font-medium">{startup.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {startup.sector} · {startup.stage} · {startup.location}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[#60a5fa] font-semibold">{startup.matchScore ?? startup.score}</div>
                <div className="text-xs text-gray-600">match</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {profile.submittedAt && (
        <p className="text-gray-600 text-xs">
          Profile submitted {new Date(profile.submittedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function InvestmentsView() {
  const items = [
    { name: 'SolarAI', stage: 'Due diligence', value: '$250K target', status: 'In review' },
    { name: 'AgriSense', stage: 'Partner call', value: '$500K target', status: 'Meeting booked' },
    { name: 'CodeStream', stage: 'Pipeline', value: '$150K target', status: 'Watching' },
  ];

  return (
    <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
      <div className="flex items-center gap-2 text-[#60a5fa] mb-5">
        <TrendingUp size={20} />
        <h3 className="text-lg font-semibold text-[#111111]">My Investments</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[#111111] font-medium">{item.name}</div>
              <div className="text-xs text-gray-600 mt-0.5">{item.stage}</div>
            </div>
            <div className="text-sm text-gray-700">{item.value}</div>
            <span className="px-2.5 py-1 rounded-full text-xs bg-[#60a5fa]/10 text-[#93c5fd] border border-[#60a5fa]/20">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavedStartupsView() {
  const saved = STARTUP_PROFILES.slice(0, 4);

  return (
    <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
      <div className="flex items-center gap-2 text-[#60a5fa] mb-5">
        <Bookmark size={20} />
        <h3 className="text-lg font-semibold text-[#111111]">Saved Startups</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {saved.map((startup: StartupProfileData) => (
          <Link
            key={startup.id}
            to={`/startup/profile/${startup.id}`}
            className="bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl p-5 hover:border-[#60a5fa]/30 hover:bg-[#101021] transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="text-[#111111] font-medium">{startup.name}</div>
                <div className="text-xs text-gray-600">{startup.sector} · {startup.stage}</div>
              </div>
              <div className="text-[#60a5fa] text-sm font-semibold">{startup.matchScore ?? startup.score}</div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{startup.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MessagesView() {
  const messages = [
    { from: 'Founders Desk', subject: 'New startups match your thesis', preview: 'Three clean tech startups now fit your check size and geography.' },
    { from: 'SolarAI', subject: 'Thanks for saving our profile', preview: 'We would be happy to share our latest deck and pilot updates.' },
    { from: 'Vulture X Team', subject: 'Your investor profile is 92% complete', preview: 'Add firm website and thesis details to improve recommendations.' },
  ];

  return (
    <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
      <div className="flex items-center gap-2 text-[#60a5fa] mb-5">
        <MessageSquare size={20} />
        <h3 className="text-lg font-semibold text-[#111111]">Messages</h3>
      </div>
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.subject} className="bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-[#111111] font-medium">{message.subject}</div>
              <div className="text-xs text-gray-600">{message.from}</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{message.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  const { clearProfile } = useInvestor();

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-[#60a5fa] mb-5">
          <Settings size={20} />
          <h3 className="text-lg font-semibold text-[#111111]">Settings</h3>
        </div>
        <div className="space-y-4">
          <ToggleRow icon={Bell} title="Startup match alerts" description="Get notified when new startups fit your thesis." enabled />
          <ToggleRow icon={Globe} title="Weekly market digest" description="Receive curated market and portfolio updates every week." enabled />
          <ToggleRow icon={Shield} title="Cold pitch access" description="Allow founders to send you introductory requests." enabled={false} />
        </div>
      </div>

      <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[#111111] mb-2">Reset investor profile</h3>
        <p className="text-sm text-gray-600 mb-4">
          This clears your saved onboarding data from the current browser.
        </p>
        <button
          type="button"
          onClick={clearProfile}
          className="px-4 py-2 rounded-2xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
        >
          Clear saved profile
        </button>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="bg-white border border-[#e8e8e2] shadow-[0_8px_24px_rgba(17,17,17,0.06)] rounded-2xl p-5">
      <Icon size={18} className="text-[#60a5fa] mb-3" />
      <div className="text-lg font-semibold text-[#111111]">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[#f9f9f7] border border-[#e8e8e2] rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <Icon size={18} className="text-[#60a5fa] mt-0.5" />
        <div>
          <div className="text-[#111111] text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-600 mt-1">{description}</div>
        </div>
      </div>
      <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${enabled ? 'bg-[#60a5fa]' : 'bg-gray-700'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
    </div>
  );
}

function getRecommendedStartups(preferredSectors: string[]) {
  const preferred = STARTUP_PROFILES.filter((startup: StartupProfileData) => preferredSectors.includes(startup.sector));
  return (preferred.length ? preferred : STARTUP_PROFILES).slice(0, 4);
}

function DashboardLayout() {
  const navigate = useNavigate();
  const { profile } = useInvestor();

  return (
    <div className="min-h-screen pt-20 bg-[#ffffff] text-[#111111] flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">Investor Dashboard</h1>
              <p className="text-gray-600 text-sm mt-0.5">
                {profile ? `Welcome back, ${profile.fullName}` : 'Manage your deal flow and profile.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NavLink
                to="/investor-onboarding"
                className="px-4 py-2 rounded-2xl text-sm font-medium border border-[#e8e8e2] text-gray-700 hover:text-[#111111] hover:border-[#60a5fa]/40 transition-all"
              >
                Edit Profile
              </NavLink>
              <button
                type="button"
                onClick={() => navigate('/for-investors')}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm text-gray-600 hover:text-[#111111] hover:bg-white/5 transition-all"
              >
                <LogOut size={16} /> Back to site
              </button>
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function InvestorDashboard() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<ProfileSummary />} />
        <Route path="investments" element={<InvestmentsView />} />
        <Route path="saved" element={<SavedStartupsView />} />
        <Route path="messages" element={<MessagesView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>
    </Routes>
  );
}
