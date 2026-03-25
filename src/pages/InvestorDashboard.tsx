import type { ComponentType } from 'react';
import { Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  Star,
  Bell,
  Shield,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { useInvestor } from '../context/InvestorContext';

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
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
      isActive ? 'bg-[#60a5fa]/10 text-[#a5b4fc]' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <aside className="w-64 bg-[#0b0b18] border-r border-[#1c1c3a] hidden md:flex flex-col flex-shrink-0">
      <div className="px-5 py-4 border-b border-[#1c1c3a]">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Investor</div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] flex items-center justify-center text-xs font-bold text-black">
            VX
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Vulture X</div>
            <div className="text-xs text-gray-500">Investor Portal</div>
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
      <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-8 text-center text-gray-400">
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

      <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-[#60a5fa] mb-4">
          <User size={20} />
          <h3 className="text-lg font-semibold text-white">Profile Summary</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-0.5">Full Name</span>
            <span className="text-white">{profile.fullName}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Email</span>
            <span className="text-white">{profile.email}</span>
          </div>
          {profile.phone && (
            <div>
              <span className="text-gray-500 block mb-0.5">Phone</span>
              <span className="text-white">{profile.phone}</span>
            </div>
          )}
          {profile.linkedIn && (
            <div>
              <span className="text-gray-500 block mb-0.5">LinkedIn</span>
              <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-[#60a5fa] hover:underline truncate block">
                {profile.linkedIn}
              </a>
            </div>
          )}
          {profile.location && (
            <div>
              <span className="text-gray-500 block mb-0.5">Location</span>
              <span className="text-white">{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-[#60a5fa] mb-4">
          <Target size={20} />
          <h3 className="text-lg font-semibold text-white">Investment Preferences</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500 block mb-0.5">Investor Type</span>
            <span className="text-white">{investorTypeLabels[profile.investorType] ?? profile.investorType}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Check Size</span>
            <span className="text-white">${profile.checkSizeMin}K – ${profile.checkSizeMax}K</span>
          </div>
          {profile.preferredSectors.length > 0 && (
            <div>
              <span className="text-gray-500 block mb-1">Preferred Sectors</span>
              <div className="flex flex-wrap gap-2">
                {profile.preferredSectors.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-lg bg-[#1c1c3a] text-gray-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.geographyFocus && (
            <div>
              <span className="text-gray-500 block mb-0.5">Geography</span>
              <span className="text-white">{profile.geographyFocus}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500 block mb-0.5">Looking to</span>
            <span className="text-white">{lookLabels[profile.lookingTo] ?? profile.lookingTo}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Open to cold pitches</span>
            <span className="text-white">{profile.openToColdPitches ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {(profile.investorType === 'vc' && (profile.firmName || profile.fundSize)) && (
        <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
          <div className="flex items-center gap-2 text-[#60a5fa] mb-4">
            <Building2 size={20} />
            <h3 className="text-lg font-semibold text-white">Firm Details</h3>
          </div>
          <div className="space-y-3 text-sm">
            {profile.firmName && (
              <div>
                <span className="text-gray-500 block mb-0.5">Firm Name</span>
                <span className="text-white">{profile.firmName}</span>
              </div>
            )}
            {profile.firmWebsite && (
              <div>
                <span className="text-gray-500 block mb-0.5">Website</span>
                <a href={profile.firmWebsite} target="_blank" rel="noopener noreferrer" className="text-[#60a5fa] hover:underline">
                  {profile.firmWebsite}
                </a>
              </div>
            )}
            {profile.fundSize && (
              <div>
                <span className="text-gray-500 block mb-0.5">Fund Size</span>
                <span className="text-white">{profile.fundSize}</span>
              </div>
            )}
            {profile.stageFocus.length > 0 && (
              <div>
                <span className="text-gray-500 block mb-1">Stage Focus</span>
                <div className="flex flex-wrap gap-2">
                  {profile.stageFocus.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-lg bg-[#1c1c3a] text-gray-300 text-xs">
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
        <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Investment Thesis</h3>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">{profile.investmentThesis}</p>
        </div>
      )}

      <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white">Recommended Startups</h3>
            <p className="text-sm text-gray-500 mt-1">Matched from your sector preferences and platform activity.</p>
          </div>
          <Link to="/explore" className="text-sm text-[#60a5fa] hover:text-[#93c5fd] transition-colors inline-flex items-center gap-1">
            Explore all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {getRecommendedStartups(profile.preferredSectors).map((startup) => (
            <Link
              key={startup.id}
              to={`/startup/profile/${startup.id}`}
              className="flex items-center justify-between gap-4 bg-[#09091a] border border-[#1c1c3a] rounded-xl px-4 py-3 hover:border-[#60a5fa]/30 hover:bg-[#101021] transition-all"
            >
              <div className="min-w-0">
                <div className="text-white font-medium">{startup.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {startup.sector} · {startup.stage} · {startup.location}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[#60a5fa] font-semibold">{startup.matchScore ?? startup.score}</div>
                <div className="text-xs text-gray-500">match</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {profile.submittedAt && (
        <p className="text-gray-500 text-xs">
          Profile submitted {new Date(profile.submittedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function Placeholder({ title, icon: Icon }: { title: string; icon: ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-12 text-center">
      <Icon size={48} className="mx-auto text-gray-600 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">This section is coming soon. Your data is saved and the dashboard is ready to expand.</p>
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
    <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
      <div className="flex items-center gap-2 text-[#60a5fa] mb-5">
        <TrendingUp size={20} />
        <h3 className="text-lg font-semibold text-white">My Investments</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-white font-medium">{item.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.stage}</div>
            </div>
            <div className="text-sm text-gray-300">{item.value}</div>
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
    <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
      <div className="flex items-center gap-2 text-[#60a5fa] mb-5">
        <Bookmark size={20} />
        <h3 className="text-lg font-semibold text-white">Saved Startups</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {saved.map((startup) => (
          <Link
            key={startup.id}
            to={`/startup/profile/${startup.id}`}
            className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-5 hover:border-[#60a5fa]/30 hover:bg-[#101021] transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="text-white font-medium">{startup.name}</div>
                <div className="text-xs text-gray-500">{startup.sector} · {startup.stage}</div>
              </div>
              <div className="text-[#60a5fa] text-sm font-semibold">{startup.matchScore ?? startup.score}</div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{startup.tagline}</p>
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
    <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
      <div className="flex items-center gap-2 text-[#60a5fa] mb-5">
        <MessageSquare size={20} />
        <h3 className="text-lg font-semibold text-white">Messages</h3>
      </div>
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.subject} className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-white font-medium">{message.subject}</div>
              <div className="text-xs text-gray-500">{message.from}</div>
            </div>
            <p className="text-sm text-gray-400 mt-2">{message.preview}</p>
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
      <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-[#60a5fa] mb-5">
          <Settings size={20} />
          <h3 className="text-lg font-semibold text-white">Settings</h3>
        </div>
        <div className="space-y-4">
          <ToggleRow icon={Bell} title="Startup match alerts" description="Get notified when new startups fit your thesis." enabled />
          <ToggleRow icon={Globe} title="Weekly market digest" description="Receive curated market and portfolio updates every week." enabled />
          <ToggleRow icon={Shield} title="Cold pitch access" description="Allow founders to send you introductory requests." enabled={false} />
        </div>
      </div>

      <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Reset investor profile</h3>
        <p className="text-sm text-gray-400 mb-4">
          This clears your saved onboarding data from the current browser.
        </p>
        <button
          type="button"
          onClick={clearProfile}
          className="px-4 py-2 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
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
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-5">
      <Icon size={18} className="text-[#60a5fa] mb-3" />
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[#09091a] border border-[#1c1c3a] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Icon size={18} className="text-[#60a5fa] mt-0.5" />
        <div>
          <div className="text-white text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        </div>
      </div>
      <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${enabled ? 'bg-[#60a5fa]' : 'bg-gray-700'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
    </div>
  );
}

function getRecommendedStartups(preferredSectors: string[]) {
  const preferred = STARTUP_PROFILES.filter((startup) => preferredSectors.includes(startup.sector));
  return (preferred.length ? preferred : STARTUP_PROFILES).slice(0, 4);
}

function DashboardLayout() {
  const navigate = useNavigate();
  const { profile } = useInvestor();

  return (
    <div className="min-h-screen pt-20 bg-[#050511] text-gray-100 flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Investor Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {profile ? `Welcome back, ${profile.fullName}` : 'Manage your deal flow and profile.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NavLink
                to="/investor-onboarding"
                className="px-4 py-2 rounded-xl text-sm font-medium border border-[#1c1c3a] text-gray-300 hover:text-white hover:border-[#60a5fa]/40 transition-all"
              >
                Edit Profile
              </NavLink>
              <button
                type="button"
                onClick={() => navigate('/for-investors')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
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
