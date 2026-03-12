import type { ComponentType } from 'react';
import { useState } from 'react';
import { BarChart3, DollarSign, FileText, Settings, Users, LayoutDashboard, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const [investorView, setInvestorView] = useState(false);

  return (
    <div className="min-h-screen pt-20 bg-[#050511] text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0b0b18] border-r border-[#1c1c3a] hidden md:flex flex-col">
        <div className="px-5 py-4 border-b border-[#1c1c3a]">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Startup</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-xs font-bold">
              VX
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Vulture X Labs</div>
              <div className="text-xs text-gray-500">AI Dealflow Infrastructure</div>
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
              High-level overview of your startup profile as seen by investors.
            </p>
          </div>

          {/* Investor View toggle */}
          <div className="inline-flex items-center gap-3 px-3 py-2 rounded-full bg-[#0b0b18] border border-[#1c1c3a]">
            <span className="text-xs text-gray-400">Investor View</span>
            <button
              type="button"
              onClick={() => setInvestorView((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                investorView ? 'bg-[#8b5cf6]' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  investorView ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <section className="space-y-6 lg:col-span-2">
            {/* Startup overview */}
            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-xl font-bold">
                  VX
                </div>
                <div>
                  <div className="text-lg font-semibold text-white flex items-center gap-2">
                    Vulture X Labs
                    {investorView && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    AI-powered marketplace connecting startups and investors through structured competitions and data-driven ranking.
                  </p>
                  <div className="mt-1 text-xs text-gray-500">Industry: FinTech · B2B SaaS</div>
                </div>
              </div>

              {/* Founder & funding */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Founder</div>
                  <div className="text-sm text-white font-medium">Aarya Mehta</div>
                  <div className="text-xs text-gray-500">Ex-VC, 8+ yrs dealflow</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Funding Stage</div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    Seed · Raising $1.5M
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Location</div>
                  <div className="text-sm text-white">Remote · Global</div>
                </div>
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
                  <Metric label="MRR" value="$38.5K" highlight={investorView} />
                  <Metric label="Active Startups" value="2,430" />
                  <Metric label="Active Investors" value="860" />
                  <Metric label="3M User Growth" value="+32%" trend="up" highlight={investorView} />
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
                    <span className="text-white font-medium">17 months</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Monthly Burn</span>
                    <span className="text-white font-medium">$42K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Cash in Bank</span>
                    <span className="text-white font-medium">$720K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team members */}
            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Users size={16} className="text-sky-400" />
                Team Members
              </h2>
              <div className="space-y-3 text-sm">
                {[
                  { name: 'Aarya Mehta', role: 'CEO & Co-founder', note: 'Fundraising, product strategy' },
                  { name: 'Rohan Iyer', role: 'CTO & Co-founder', note: 'Platform architecture, AI scoring' },
                  { name: 'Sara Khan', role: 'Head of Growth', note: 'Ecosystem partnerships, competitions' },
                ].map((member) => (
                  <div key={member.name} className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-medium">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.role}</div>
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs text-right">{member.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right column */}
          <section className="space-y-6">
            {/* Pitch deck upload */}
            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#8b5cf6]" />
                Pitch Deck
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Upload a single, investor-ready deck (PDF or PPT). Investors will see this in their pipeline.
              </p>
              <div className="border border-dashed border-[#2d2d4a] rounded-xl p-4 text-center text-xs text-gray-400">
                <p className="mb-2 text-gray-300">Drag & drop your deck here</p>
                <p className="mb-3 text-gray-500">or</p>
                <button className="px-4 py-1.5 rounded-lg bg-[#8b5cf6] text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                  Choose File
                </button>
                <p className="mt-3 text-[11px] text-gray-500">Max 25MB · PDF, PPTX</p>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-[#0b0b18] border border-[#1c1c3a] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FileText size={16} className="text-emerald-400" />
                Documents
              </h2>
              <ul className="space-y-2 text-xs">
                {[
                  { name: 'One-pager.pdf', status: 'Uploaded' },
                  { name: 'Cap table.xlsx', status: 'Missing' },
                  { name: 'Data room link', status: 'Optional' },
                ].map((doc) => (
                  <li key={doc.name} className="flex items-center justify-between">
                    <span className="text-gray-300">{doc.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        doc.status === 'Uploaded'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

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

type MetricProps = {
  label: string;
  value: string;
  trend?: 'up' | 'down';
  highlight?: boolean;
};

function Metric({ label, value, trend, highlight }: MetricProps) {
  return (
    <div className="bg-[#09091a] rounded-xl p-3">
      <div className="text-[11px] text-gray-500 mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${highlight ? 'text-[#c4b5fd]' : 'text-white'}`}>
          {value}
        </span>
        {trend && (
          <span
            className={`text-[11px] ${
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend === 'up' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </div>
  );
}

