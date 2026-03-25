import type { ComponentType } from 'react';
import { useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import {
  BarChart3,
  DollarSign,
  FileText,
  Settings,
  Users,
  LayoutDashboard,
  Briefcase,
  Rocket,
  Pencil,
  ShieldCheck,
  Upload,
  Eye,
  Bell,
  Lock,
  Globe,
  FolderOpen,
} from 'lucide-react';
import { useStartup } from '../features/startups';
import { useAuth } from '../features/auth';
import { useStartupMandate } from '../context/StartupMandateContext';
import { useImpactVerification } from '../context/ImpactVerificationContext';

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

export default function Dashboard() {
  const { profile, isLoading } = useStartup();

  if (isLoading) return <DashboardSkeleton />;
  if (!profile || !profile.companyName) return <EmptyDashboard />;

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="startup-info" element={<StartupInfoView />} />
        <Route path="financials" element={<FinancialsView />} />
        <Route path="documents" element={<DocumentsView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>
    </Routes>
  );
}

function DashboardLayout() {
  const { profile } = useStartup();
  const { mandate } = useStartupMandate();

  const initials = profile?.companyName
    ? profile.companyName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'VX';

  return (
    <div className="min-h-screen pt-20 bg-[#050511] text-gray-100 flex">
      <aside className="w-64 bg-[#0b0b18] border-r border-[#1c1c3a] hidden md:flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-[#1c1c3a]">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Startup</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-white truncate max-w-[150px]">{profile?.companyName}</div>
              <div className="text-xs text-gray-500 truncate max-w-[150px]">{profile?.tagline || profile?.sector}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
          <SidebarLink to="/dashboard/startup-info" icon={Briefcase} label="Startup Info" />
          <SidebarLink to="/dashboard/financials" icon={BarChart3} label="Financials" />
          <SidebarLink to="/dashboard/documents" icon={FileText} label="Documents" />
          <SidebarLink to="/dashboard/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="px-3 pb-4">
          <div className={`rounded-xl border p-3 text-xs ${mandate ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'}`}>
            <div className="font-medium mb-1">Mandate status</div>
            <div>{mandate ? 'Exclusive mandate active' : 'Exclusive mandate pending'}</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          <div className="md:hidden mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" end compact />
              <SidebarLink to="/dashboard/startup-info" icon={Briefcase} label="Startup Info" compact />
              <SidebarLink to="/dashboard/financials" icon={BarChart3} label="Financials" compact />
              <SidebarLink to="/dashboard/documents" icon={FileText} label="Documents" compact />
              <SidebarLink to="/dashboard/settings" icon={Settings} label="Settings" compact />
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function DashboardOverview() {
  const [investorView, setInvestorView] = useState(false);
  const { profile } = useStartup();
  const { user } = useAuth();
  const { mandate } = useStartupMandate();
  const { application } = useImpactVerification();

  const initials = profile?.companyName
    ? profile.companyName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'VX';

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Your startup profile as seen by investors.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/startup-onboarding"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#1c1c3a] text-gray-300 hover:text-white hover:border-[#8b5cf6]/40 transition-all"
          >
            <Pencil size={14} /> Edit Profile
          </Link>
          <div className="inline-flex items-center gap-3 px-3 py-2 rounded-full bg-[#09091a] border border-[#1c1c3a]">
            <span className="text-xs text-gray-400">Investor View</span>
            <button
              type="button"
              onClick={() => setInvestorView((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${investorView ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${investorView ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="space-y-6 lg:col-span-2">
          <MandateBanner mandate={mandate} />
          <ImpactBanner application={application} />

          <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <div>
                <div className="text-lg font-semibold text-white flex items-center gap-2">
                  {profile?.companyName}
                  {investorView && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300">
                      Investor View
                    </span>
                  )}
                </div>
                {profile?.tagline && <p className="text-sm text-gray-400">{profile.tagline}</p>}
                {profile?.sector && (
                  <div className="mt-1 text-xs text-gray-500">
                    Industry: {profile.sector}
                    {profile.stage ? ` ? ${profile.stage}` : ''}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {profile?.founderName && (
                <InfoBlock label="Founder" value={profile.founderName} sub={profile.founderRole} />
              )}
              {(profile?.stage || profile?.fundingRaised) && (
                <InfoBlock label="Funding Stage" value={profile.stage} sub={profile.fundingRaised ? `Raised ${profile.fundingRaised}` : undefined} accent />
              )}
              {profile?.location && (
                <InfoBlock label="Location" value={profile.location} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Traction Metrics" icon={Users}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Metric label="MRR" value={profile?.mrr || '?'} highlight={investorView} />
                <Metric label="Active Users" value={profile?.activeUsers || '?'} />
                <Metric label="Customers" value={profile?.customers || '?'} />
                <Metric
                  label="Monthly Growth"
                  value={profile?.monthlyGrowthPercent ? `${profile.monthlyGrowthPercent}` : '?'}
                  trend={profile?.monthlyGrowthPercent && !profile.monthlyGrowthPercent.startsWith('-') ? 'up' : undefined}
                  highlight={investorView}
                />
              </div>
            </SectionCard>

            <SectionCard title="Financial Summary" icon={DollarSign}>
              <div className="space-y-3 text-sm">
                <SimpleRow label="Runway" value={profile?.runway || '?'} />
                <SimpleRow label="Monthly Burn" value={profile?.burnRate || '?'} />
                <SimpleRow label="Cash in Bank" value={profile?.cashInBank || '?'} />
              </div>
            </SectionCard>
          </div>

          {(profile?.team && profile.team.length > 0 || profile?.founderName) && (
            <SectionCard title="Team Members" icon={Users}>
              <div className="space-y-3 text-sm">
                {profile?.founderName && (
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
                {profile?.team.map((member) => (
                  <div key={member.name + member.role} className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-medium">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </section>

        <section className="space-y-6">
          <SectionCard title="Pitch Deck" icon={BarChart3}>
            {profile?.pitchDeckUrl ? (
              <div className="space-y-3">
                <a
                  href={profile.pitchDeckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#c4b5fd] hover:text-white transition-colors"
                >
                  <FileText size={14} /> View Pitch Deck ?
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
          </SectionCard>

          <SectionCard title="Documents" icon={FileText}>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'One-pager.pdf', status: 'Uploaded' },
                { name: 'Cap table.xlsx', status: 'Missing' },
                { name: 'Data room link', status: 'Optional' },
              ].map((doc) => (
                <li key={doc.name} className="flex items-center justify-between">
                  <span className="text-gray-300">{doc.name}</span>
                  <StatusBadge status={doc.status} />
                </li>
              ))}
            </ul>
            <Link to="/dashboard/documents" className="inline-flex items-center gap-2 text-sm text-[#8b5cf6] hover:text-[#c4b5fd] mt-4">
              Manage documents <Eye size={14} />
            </Link>
          </SectionCard>

          <SectionCard title="Account" icon={Settings}>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-300">{user?.email}</span>
              </div>
              {profile?.website && (
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
              {profile?.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-gray-300">
                    {new Date(profile.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </SectionCard>
        </section>
      </div>
    </div>
  );
}

function StartupInfoView() {
  const { profile } = useStartup();

  const cards = [
    { label: 'Startup Name', value: profile?.companyName || '?' },
    { label: 'Tagline', value: profile?.tagline || '?' },
    { label: 'Sector', value: profile?.sector || '?' },
    { label: 'Location', value: profile?.location || '?' },
    { label: 'Stage', value: profile?.stage || '?' },
    { label: 'Team Size', value: profile?.team ? `${profile.team.length + 1} members` : '?' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Startup Info" description="Core profile details investors and internal team members rely on." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-5">
            <div className="text-xs text-gray-500 mb-1">{card.label}</div>
            <div className="text-white font-medium">{card.value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Company Narrative" icon={Briefcase}>
        <div className="space-y-5 text-sm">
          {profile?.problemStatement && <TextBlock label="Problem" value={profile.problemStatement} />}
          {profile?.solutionDescription && <TextBlock label="Solution" value={profile.solutionDescription} />}
        </div>
      </SectionCard>

      <SectionCard title="Founder Profiles" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile?.founderName && (
            <div className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-5">
              <div className="text-white font-medium">{profile.founderName}</div>
              <div className="text-xs text-[#8b5cf6] mt-1">{profile.founderRole || 'Founder'}</div>
              {profile.founderBio && <p className="text-sm text-gray-400 mt-3 leading-relaxed">{profile.founderBio}</p>}
            </div>
          )}
          {profile?.team.map((member) => (
            <div key={member.name} className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-5">
              <div className="text-white font-medium">{member.name}</div>
              <div className="text-xs text-[#8b5cf6] mt-1">{member.role}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function FinancialsView() {
  const { profile } = useStartup();

  return (
    <div className="space-y-6">
      <PageHeader title="Financials" description="Track round status, burn, runway, and funding readiness." />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Funding Raised" value={profile?.fundingRaised || '?'} />
        <MetricCard label="MRR" value={profile?.mrr || '?'} />
        <MetricCard label="Monthly Burn" value={profile?.burnRate || '?'} />
        <MetricCard label="Runway" value={profile?.runway || '?'} />
      </div>

      <SectionCard title="Financial Snapshot" icon={DollarSign}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <SimpleRow label="MRR" value={profile?.mrr || '?'} />
            <SimpleRow label="Active Users" value={profile?.activeUsers || '?'} />
            <SimpleRow label="Customers" value={profile?.customers || '?'} />
            <SimpleRow label="Growth" value={profile?.monthlyGrowthPercent ? `${profile.monthlyGrowthPercent}%` : '?'} />
          </div>
          <div className="space-y-3">
            <SimpleRow label="Cash at Bank" value={profile?.cashInBank || '?'} />
            <SimpleRow label="Runway" value={profile?.runway || '?'} />
            <SimpleRow label="Monthly Burn" value={profile?.burnRate || '?'} />
            <SimpleRow label="Stage" value={profile?.stage || '?'} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Readiness Checklist" icon={ShieldCheck}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            { item: 'Signed exclusive mandate', done: true },
            { item: 'Updated cap table', done: !!profile?.fundingRaised },
            { item: 'Current financial model', done: !!profile?.mrr },
            { item: 'Pitch deck uploaded', done: !!profile?.pitchDeckUrl },
            { item: 'Founder profile complete', done: !!profile?.founderName },
            { item: 'Data room index prepared', done: false },
          ].map((entry) => (
            <div key={entry.item} className="flex items-center gap-2 text-gray-300">
              <span className={`h-2.5 w-2.5 rounded-full ${entry.done ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {entry.item}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function DocumentsView() {
  const sections = [
    {
      title: 'Fundraising essentials',
      docs: [
        { name: 'Pitch Deck.pdf', status: 'Uploaded' },
        { name: 'One Pager.pdf', status: 'Uploaded' },
        { name: 'Financial Model.xlsx', status: 'Review due' },
      ],
    },
    {
      title: 'Corporate docs',
      docs: [
        { name: 'Certificate of Incorporation.pdf', status: 'Uploaded' },
        { name: 'Shareholder Register.pdf', status: 'Missing' },
        { name: 'Board Consent.pdf', status: 'Optional' },
      ],
    },
    {
      title: 'Investor diligence',
      docs: [
        { name: 'Cap Table.xlsx', status: 'Missing' },
        { name: 'Customer Metrics.csv', status: 'Uploaded' },
        { name: 'Security Policy.pdf', status: 'Optional' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Organize what investors can review inside your deal room." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {sections.map((section) => (
          <SectionCard key={section.title} title={section.title} icon={FolderOpen}>
            <div className="space-y-3">
              {section.docs.map((doc) => (
                <div key={doc.name} className="bg-[#09091a] border border-[#1c1c3a] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{doc.name}</div>
                    <div className="text-xs text-gray-500 mt-1">Visible in investor room when unlocked</div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard title="Upload Center" icon={Upload}>
        <div className="border border-dashed border-[#2d2d4a] rounded-2xl p-8 text-center text-gray-400">
          <p className="text-white mb-2">Drop files here or choose from your device</p>
          <p className="text-sm text-gray-500 mb-4">PDF, PPTX, XLSX, CSV ? Max 25MB per file</p>
          <button className="px-4 py-2 rounded-lg bg-[#8b5cf6] text-sm font-medium text-white hover:opacity-90 transition-opacity">
            Choose Files
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function SettingsView() {
  const { mandate } = useStartupMandate();
  const { application } = useImpactVerification();
  const [visibilityPublic, setVisibilityPublic] = useState(true);
  const [allowInvestorRequests, setAllowInvestorRequests] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Control startup visibility, investor access, and fundraising workflow preferences." />

      <SectionCard title="Profile Visibility" icon={Globe}>
        <div className="space-y-4">
          <ToggleRow title="Visible to verified investors" description="Allow your profile to appear in investor discovery and curated lists." enabled={visibilityPublic} onToggle={() => setVisibilityPublic((v) => !v)} />
          <ToggleRow title="Accept investor intro requests" description="Let verified investors request access to your startup profile and documents." enabled={allowInvestorRequests} onToggle={() => setAllowInvestorRequests((v) => !v)} />
          <ToggleRow title="Weekly performance digest" description="Receive weekly updates about views, saves, and investor activity." enabled={weeklyDigest} onToggle={() => setWeeklyDigest((v) => !v)} />
        </div>
      </SectionCard>

      <SectionCard title="Mandate & Platform Terms" icon={Lock}>
        <div className="space-y-4 text-sm">
          <SimpleRow label="Exclusive mandate" value={mandate ? 'Signed and active' : 'Pending signature'} />
          <SimpleRow label="Impact verification" value={application ? `${application.status} (${new Date(application.submittedAt).toLocaleDateString()})` : 'Not applied'} />
          <SimpleRow label="Success fee" value="3% on platform-originated closes" />
          <SimpleRow label="Conversation policy" value="All investor conversations should remain on-platform" />
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/startup-mandate" className="inline-flex items-center gap-2 text-[#8b5cf6] hover:text-[#c4b5fd]">
              Review mandate and signature details <Eye size={14} />
            </Link>
            <Link to="/impact-verification" className="inline-flex items-center gap-2 text-[#4ade80] hover:text-[#86efac]">
              Review impact verification <Eye size={14} />
            </Link>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notifications" icon={Bell}>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-4">Investor viewed your profile</div>
          <div className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-4">Investor requested intro</div>
          <div className="bg-[#09091a] border border-[#1c1c3a] rounded-xl p-4">Document review requested</div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ??? Shared UI components ??? */

function SidebarLink({
  to,
  icon: Icon,
  label,
  end,
  compact,
}: {
  to: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  end?: boolean;
  compact?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${compact ? 'inline-flex' : 'flex w-full'} items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-xs ${
          isActive ? 'bg-[#8b5cf6]/10 text-[#e5deff]' : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={16} className={isActive ? 'text-[#8b5cf6]' : 'text-gray-500'} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function MandateBanner({ mandate }: { mandate: ReturnType<typeof useStartupMandate>['mandate'] }) {
  return (
    <div className={`border rounded-2xl p-5 ${mandate ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">
            {mandate ? 'Exclusive mandate signed' : 'Exclusive mandate pending'}
          </div>
          <p className="text-sm mt-1 text-gray-300">
            {mandate
              ? `Signed by ${mandate.founderName} on ${new Date(mandate.signedAt).toLocaleDateString()}. Vulture X now acts as the exclusive fundraising mandate with a 3% success fee on platform-originated closes.`
              : 'Sign your Vulture X exclusive mandate so all investor introductions and closes are contractually covered by the 3% success fee.'}
          </p>
        </div>
        <Link
          to="/startup-mandate"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors text-center ${
            mandate ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-amber-300 text-black hover:bg-amber-200'
          }`}
        >
          {mandate ? 'View mandate' : 'Sign now'}
        </Link>
      </div>
    </div>
  );
}

function ImpactBanner({
  application,
}: {
  application: ReturnType<typeof useImpactVerification>['application'];
}) {
  if (!application) {
    return (
      <div className="border rounded-2xl p-5 bg-[#0f1a0f] border-[#4ade80]/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">Impact verification available</div>
            <p className="text-sm mt-1 text-gray-300">
              If your startup is aligned with measurable SDG outcomes, apply for free Pro access and 0% success fee.
            </p>
          </div>
          <Link to="/impact-verification" className="px-4 py-2 rounded-xl text-sm font-medium bg-[#4ade80] text-black hover:bg-[#22c55e] transition-colors text-center">
            Apply
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl p-5 ${application.status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#0f1a0f] border-[#4ade80]/20'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">
            {application.status === 'verified' ? 'Impact verified' : 'Impact verification under review'}
          </div>
          <p className="text-sm mt-1 text-gray-300">
            {application.status === 'verified'
              ? 'Your startup is verified for SDG impact and eligible for free Pro access and 0% success fee.'
              : `Application submitted on ${new Date(application.submittedAt).toLocaleDateString()}. Our team will review your SDG alignment and evidence.`}
          </p>
        </div>
        <Link to="/impact-verification" className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-colors text-center">
          View application
        </Link>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Icon size={16} className="text-[#8b5cf6]" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoBlock({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-sm font-medium ${accent ? 'text-amber-300' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function SimpleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-5">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === 'Uploaded'
      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
      : status === 'Review due'
        ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30';

  return <span className={`px-2 py-0.5 rounded-full text-[10px] ${classes}`}>{status}</span>;
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[#09091a] border border-[#1c1c3a] rounded-xl p-4">
      <div>
        <div className="text-white text-sm font-medium">{title}</div>
        <div className="text-xs text-gray-500 mt-1">{description}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-[#8b5cf6]' : 'bg-gray-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function Metric({ label, value, trend, highlight }: { label: string; value: string; trend?: 'up' | 'down'; highlight?: boolean }) {
  return (
    <div className="bg-[#09091a] rounded-xl p-3">
      <div className="text-[11px] text-gray-500 mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${highlight ? 'text-[#c4b5fd]' : 'text-white'}`}>{value}</span>
        {trend && (
          <span className={`text-[11px] ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? '?' : '?'}
          </span>
        )}
      </div>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1.5">{label}</div>
      <p className="text-gray-300 leading-relaxed">{value}</p>
    </div>
  );
}
