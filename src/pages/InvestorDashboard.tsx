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
} from 'lucide-react';
import { useInvestor } from '../features/investors';

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
        <Route path="investments" element={<Placeholder title="My Investments" icon={Wallet} />} />
        <Route path="saved" element={<Placeholder title="Saved Startups" icon={Bookmark} />} />
        <Route path="messages" element={<Placeholder title="Messages" icon={MessageSquare} />} />
        <Route path="settings" element={<Placeholder title="Settings" icon={Settings} />} />
      </Route>
    </Routes>
  );
}
