import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Trophy, Users, Star, ChevronRight, Globe, Target, BarChart3, BookOpen, Shield, DollarSign, Zap } from 'lucide-react';
import type { ReactNode, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

/* ---- Particle Background ---- */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; alpha: number; color: string }> = [];
    const colors = ['rgba(139,92,246,', 'rgba(124,58,237,', 'rgba(167,139,250,'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.1,
        alpha: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}

/* ---- Rotating 3D Orbit ---- */
function OrbitRings() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none z-0 hidden xl:block">
      <div className="relative w-full h-full">
        {/* Outer ring */}
        <div className="absolute inset-0 border border-[#8b5cf6]/10 rounded-full spin-slow" />
        <div className="absolute inset-12 border border-[#7c3aed]/15 rounded-full" style={{ animation: 'spin-slow 15s linear infinite reverse' }} />
        <div className="absolute inset-24 border border-[#a78bfa]/20 rounded-full spin-slow" style={{ animationDuration: '10s' }} />

        {/* Orbiting dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-[#8b5cf6] rounded-full absolute shadow-[0_0_8px_rgba(139,92,246,0.8)]"
            style={{ animation: 'orbit 8s linear infinite', transformOrigin: 'center' }} />
          <div className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full absolute shadow-[0_0_10px_rgba(167,139,250,0.8)]"
            style={{ animation: 'orbit-rev 12s linear infinite', transformOrigin: 'center' }} />
        </div>

        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

/* ---- 3D Tilt Card ---- */
function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const tiltX = ((y - cy) / cy) * 10;
    const tiltY = ((cx - x) / cx) * 10;
    el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(8px)`;
    el.style.transition = 'transform 0.05s linear';
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

/* ---- Counter Hook ---- */
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

const stats = [
  { value: 2400, display: '2,400+', label: 'Startups Registered' },
  { value: 180, display: '$180M+', label: 'Capital Facilitated', prefix: '$', suffix: 'M+' },
  { value: 850, display: '850+', label: 'Active Investors' },
  { value: 120, display: '120+', label: 'Competitions Hosted' },
];

const howItWorks = [
  { step: '01', icon: Zap, title: 'Build Your Startup Identity', desc: 'Submit structured data — problem, solution, market, traction — and receive an AI-generated investor-ready pitch deck.', color: 'from-[#8b5cf6] to-[#7c3aed]' },
  { step: '02', icon: Trophy, title: 'Compete & Get Discovered', desc: 'Enter themed competitions, earn winner badges, and get ranked dynamically on the merit-based leaderboard.', color: 'from-[#60a5fa] to-[#a78bfa]' },
  { step: '03', icon: Users, title: 'Connect With Capital', desc: 'Verified investors discover you, request meetings, and manage their pipeline — all within the platform.', color: 'from-[#4ade80] to-[#22c55e]' },
];

const trendingStartups = [
  { name: 'SolarAI', sector: 'CleanTech', stage: 'MVP', score: 94, sdg: true, raised: '$2.1M', rank: 1 },
  { name: 'NeuralPay', sector: 'FinTech', stage: 'Revenue', score: 91, sdg: false, raised: '$5.4M', rank: 2 },
  { name: 'AgriSense', sector: 'AgriTech', stage: 'Scaling', score: 89, sdg: true, raised: '$8.2M', rank: 3 },
  { name: 'HealthChain', sector: 'HealthTech', stage: 'MVP', score: 87, sdg: true, raised: '$1.8M', rank: 4 },
  { name: 'CodeStream', sector: 'SaaS', stage: 'Revenue', score: 85, sdg: false, raised: '$3.6M', rank: 5 },
];

const competitions = [
  { title: 'Climate Innovation Challenge', prize: '$50K + Mentorship', deadline: '14 days left', sector: 'CleanTech', applicants: 234, color: 'from-[#4ade80] to-[#22c55e]' },
  { title: 'Web3 Founders Sprint', prize: '$30K + Pilot', deadline: '7 days left', sector: 'Web3', applicants: 178, color: 'from-[#60a5fa] to-[#a78bfa]' },
  { title: 'SaaS Product Showdown', prize: '$25K + Visibility', deadline: '21 days left', sector: 'SaaS', applicants: 312, color: 'from-[#8b5cf6] to-[#7c3aed]' },
];

const features = [
  { icon: Zap, title: 'AI Pitch Deck', desc: 'Auto-generated investor-ready decks from your data', color: 'text-[#8b5cf6]', bg: 'bg-[#8b5cf6]/10' },
  { icon: BarChart3, title: 'Merit-Based Rankings', desc: 'Dynamic rankings based on traction, scores & competitions', color: 'text-[#60a5fa]', bg: 'bg-[#60a5fa]/10' },
  { icon: Shield, title: 'Verified Investors', desc: 'Only verified angels, VCs and institutional investors', color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10' },
  { icon: Target, title: 'SDG Aligned', desc: 'Impact startups get 0% success fee & priority discovery', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10' },
  { icon: Trophy, title: 'Themed Competitions', desc: 'Sector-specific challenges with real prizes and visibility', color: 'text-[#f472b6]', bg: 'bg-[#f472b6]/10' },
  { icon: BookOpen, title: 'Knowledge Hub', desc: 'Complete startup education from MVP to fundraising', color: 'text-[#fb923c]', bg: 'bg-[#fb923c]/10' },
  { icon: Globe, title: 'Global Ecosystem', desc: 'Multi-country, multi-sector discovery platform', color: 'text-[#34d399]', bg: 'bg-[#34d399]/10' },
  { icon: DollarSign, title: 'Success Fee Model', desc: '3% only when capital is raised — 0% for impact startups', color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Co-founder, AgriSense', quote: 'Vulture X gave our startup credibility. The AI pitch deck alone saved us months of work. We closed our seed round in 6 weeks.', sdg: true },
  { name: 'James Chen', role: 'Partner, Apex Ventures', quote: 'Finally, a structured deal flow platform. I can filter by sector, stage, and AI score. No more random cold pitches.', sdg: false },
  { name: 'Amina Al-Hassan', role: 'Founder, SolarAI', quote: 'As an impact startup, the 0% success fee policy is transformative. We raised $2M through Vulture X without any barrier.', sdg: true },
];

function StatCard({ stat }: { stat: typeof stats[0] }) {
  const { count, ref } = useCounter(stat.value);
  const display = stat.display.replace(/\d+/, count.toLocaleString());
  return (
    <div ref={ref} className="reveal-scale bg-[#0f0f1e]/80 backdrop-blur border border-[#1c1c3a] rounded-2xl p-5 neon-border text-center relative overflow-hidden group">
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="text-3xl font-bold gradient-text mb-1 relative z-10">{display}</div>
      <div className="text-gray-400 text-sm relative z-10">{stat.label}</div>
    </div>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax hero
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* =================== HERO =================== */}
      <section className="relative pt-28 pb-24 overflow-hidden grid-bg min-h-screen flex items-center">
        <ParticleField />
        <OrbitRings />

        {/* Animated background blobs */}
        <div ref={heroRef} className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-1/4 w-[700px] h-[700px] bg-[#8b5cf6]/6 rounded-full blur-[140px] blob-anim" />
          <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-[#7c3aed]/5 rounded-full blur-[120px] blob-anim-2" />
          <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-[#a78bfa]/4 rounded-full blur-[100px] blob-anim" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2 px-5 py-2.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/25 rounded-full text-[#a78bfa] text-sm font-medium mb-8 backdrop-blur neon-border">
            <Star size={14} fill="currentColor" />
            AI-Powered Startup Ecosystem
            <span className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="reveal delay-200 text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6 max-w-6xl mx-auto leading-[1.05]">
            Where Startups Get<br />
            <span className="gradient-text">Discovered, Ranked</span><br />
            <span className="text-white/80">& Funded</span>
          </h1>

          <p className="reveal delay-300 text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Vulture X is the merit-based marketplace connecting ambitious founders with verified investors through AI-powered tools, structured competitions, and persistent visibility.
          </p>

          {/* CTAs */}
          <div className="reveal delay-400 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/for-startups"
              className="relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold rounded-xl hover:opacity-90 transition-all text-base overflow-hidden group shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              Launch Your Startup
              <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/for-investors"
              className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-[#1c1c3a] text-white font-semibold rounded-xl hover:bg-white/10 hover:border-[#8b5cf6]/40 transition-all text-base backdrop-blur neon-border"
            >
              Join as Investor
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`delay-${(i + 1) * 100}`}>
                <StatCard stat={stat} />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs reveal" style={{ animationDelay: '1s' }}>
          <span>Scroll to explore</span>
          <div className="w-5 h-8 border border-gray-600 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-[#8b5cf6] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section className="py-28 bg-[#09091a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#06060f] to-transparent opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="reveal text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-3">How It Works</div>
            <h2 className="reveal delay-100 text-4xl lg:text-5xl font-bold text-white">Three Steps to Funding</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-container">
            {howItWorks.map((item, i) => (
              <TiltCard
                key={item.step}
                className={`reveal delay-${(i + 1) * 200} relative bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-8 neon-border group overflow-hidden`}
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-6 right-6 text-5xl font-black text-[#1c1c3a] group-hover:text-[#8b5cf6]/10 transition-colors">{item.step}</div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg float-anim`} style={{ animationDelay: `${i * 0.5}s` }}>
                  <item.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${item.color} w-0 group-hover:w-full transition-all duration-500`} />
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TRENDING STARTUPS =================== */}
      <section className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="reveal text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                <TrendingUp size={14} /> Live Rankings
              </div>
              <h2 className="reveal delay-100 text-4xl lg:text-5xl font-bold text-white">Trending Startups</h2>
            </div>
            <Link to="/trending" className="reveal flex items-center gap-1.5 text-[#8b5cf6] text-sm hover:gap-3 transition-all hover:text-[#a78bfa]">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {trendingStartups.map((startup, i) => (
              <div
                key={startup.name}
                className={`reveal delay-${i * 100 + 100} flex items-center gap-4 bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl px-6 py-4 cursor-pointer group neon-border transition-all duration-300 hover:bg-[#12102a] hover:border-[#8b5cf6]/30`}
              >
                <div className={`text-2xl font-black min-w-[2.5rem] text-center transition-transform group-hover:scale-110 ${i === 0 ? 'text-[#8b5cf6]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-[#cd7f32]' : 'text-gray-500'}`}>
                  #{startup.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white group-hover:text-[#a78bfa] transition-colors">{startup.name}</span>
                    {startup.sdg && (
                      <span className="px-2 py-0.5 text-xs bg-[#1a2e1a] text-[#4ade80] border border-[#4ade80]/20 rounded-full">🌱 Impact</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm text-gray-400">{startup.sector}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-sm text-gray-400">{startup.stage}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Raised</div>
                    <div className="text-sm font-semibold text-white">{startup.raised}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[#1c1c3a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] rounded-full transition-all duration-1000"
                        style={{ width: `${startup.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#8b5cf6]">{startup.score}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-[#8b5cf6] transition-all group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== COMPETITIONS =================== */}
      <section className="py-28 bg-[#09091a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8b5cf6]/4 rounded-full blur-[100px] pointer-events-none blob-anim-2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="reveal text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-2">🏆 Competitions</div>
              <h2 className="reveal delay-100 text-4xl lg:text-5xl font-bold text-white">Active Challenges</h2>
            </div>
            <Link to="/competitions" className="reveal flex items-center gap-1.5 text-[#8b5cf6] text-sm hover:text-[#a78bfa] transition-all hover:gap-3">
              All Competitions <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {competitions.map((comp, i) => (
              <TiltCard
                key={comp.title}
                className={`reveal delay-${i * 200 + 100} bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 cursor-pointer group neon-border overflow-hidden relative`}
              >
                {/* Animated top border */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${comp.color}`} />
                <div className={`inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r ${comp.color} text-black rounded-full mb-4`}>
                  {comp.sector}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#a78bfa] transition-colors">{comp.title}</h3>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-400">{comp.applicants} applicants</span>
                  <span className="text-orange-400 font-medium animate-pulse">{comp.deadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8b5cf6] font-semibold">{comp.prize}</span>
                  <Link
                    to="/login"
                    className="text-sm text-gray-400 hover:text-white border border-[#1c1c3a] hover:border-[#8b5cf6]/40 px-3 py-1.5 rounded-lg transition-all hover:bg-[#8b5cf6]/10"
                  >
                    Apply Now
                  </Link>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FEATURES GRID =================== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[#7c3aed]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="reveal text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-3">Platform Features</div>
            <h2 className="reveal delay-100 text-4xl lg:text-5xl font-bold text-white">Everything You Need to Raise</h2>
            <p className="reveal delay-200 text-gray-400 mt-4 max-w-xl mx-auto">
              One platform. AI-powered tools. Merit-based visibility. Real capital connections.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <TiltCard
                key={f.title}
                className={`reveal delay-${(i % 4) * 100 + 100} group bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-6 neon-border cursor-default relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[#8b5cf6]/3 transition-all duration-500" />
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h4 className="text-white font-semibold mb-2 group-hover:text-[#a78bfa] transition-colors">{f.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* =================== IMPACT =================== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#06060f] via-[#0a0f0a] to-[#06060f] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <TiltCard className="reveal bg-gradient-to-br from-[#0d2010] via-[#0f2010] to-[#091509] border border-[#4ade80]/15 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.06)_0%,transparent_70%)] pointer-events-none" />
            <div className="text-6xl mb-4 float-anim">🌱</div>
            <h2 className="reveal delay-100 text-4xl lg:text-5xl font-bold text-white mb-4">Built for Impact</h2>
            <p className="reveal delay-200 text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Impact startups aligned with the UN Sustainable Development Goals receive{' '}
              <strong className="text-[#4ade80]">free Pro access</strong> and{' '}
              <strong className="text-[#4ade80]">0% success fee</strong> after manual verification.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['SDG 1 – No Poverty', 'SDG 7 – Clean Energy', 'SDG 13 – Climate Action', 'SDG 8 – Decent Work', 'SDG 10 – Reduced Inequalities'].map((sdg, i) => (
                <span
                  key={sdg}
                  className={`reveal delay-${i * 100 + 100} px-4 py-2 bg-[#1a2e1a]/80 text-[#4ade80] border border-[#4ade80]/20 rounded-full text-sm backdrop-blur hover:bg-[#4ade80]/10 transition-colors cursor-default`}
                >
                  {sdg}
                </span>
              ))}
            </div>
            <Link
              to="/impact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4ade80] text-black font-semibold rounded-xl hover:bg-[#22c55e] transition-all hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] group"
            >
              Explore Impact Startups
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </TiltCard>
        </div>
      </section>

      {/* =================== TESTIMONIALS =================== */}
      <section className="py-28 bg-[#09091a] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="reveal text-[#8b5cf6] text-sm font-semibold uppercase tracking-widest mb-3">Success Stories</div>
            <h2 className="reveal delay-100 text-4xl lg:text-5xl font-bold text-white">Founders & Investors Love Vulture X</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TiltCard
                key={t.name}
                className={`reveal delay-${i * 200 + 100} bg-[#0f0f1e] border border-[#1c1c3a] rounded-2xl p-7 neon-border group relative overflow-hidden`}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={14} className="text-[#8b5cf6]" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 italic group-hover:text-white transition-colors">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm flex items-center gap-2">
                      {t.name}
                      {t.sdg && <span className="text-[#4ade80] text-xs">🌱</span>}
                    </div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* =================== CTA BANNER =================== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#09091a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#8b5cf6]/6 rounded-full blur-[100px] pointer-events-none blob-anim" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="border border-[#8b5cf6]/20 rounded-3xl p-14 text-center neon-border backdrop-blur relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-50" />
            <h2 className="reveal text-4xl sm:text-6xl font-bold text-white mb-4 relative z-10">
              Ready to Get <span className="gradient-text">Discovered?</span>
            </h2>
            <p className="reveal delay-100 text-gray-400 text-xl mb-10 max-w-xl mx-auto relative z-10">
              Join 2,400+ startups already on Vulture X. Build your identity, compete, and raise capital.
            </p>
            <div className="reveal delay-200 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                to="/for-startups"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-bold rounded-xl hover:opacity-90 transition-all text-lg shadow-[0_0_40px_rgba(139,92,246,0.35)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] group"
              >
                Create Startup Profile
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/for-investors"
                className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-[#8b5cf6]/30 transition-all text-lg backdrop-blur"
              >
                Join as Investor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
