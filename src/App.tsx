import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ExploreStartups from './pages/ExploreStartups';
import Trending from './pages/Trending';
import Competitions from './pages/Competitions';
import ForStartups from './pages/ForStartups';
import ForInvestors from './pages/ForInvestors';
import KnowledgeHub from './pages/KnowledgeHub';
import Impact from './pages/Impact';
import About from './pages/About';
import { useScrollReveal } from './hooks/useAnimations';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StartupDetail from './pages/StartupDetail';
import StartupProfile from './pages/StartupProfile';
import { AuthProvider, useAuth } from './features/auth';
import { InvestorProvider } from './features/investors';
import { StartupProvider } from './features/startups';
import InvestorOnboarding from './pages/InvestorOnboarding';
import InvestorDashboard from './pages/InvestorDashboard';
import StartupOnboarding from './pages/StartupOnboarding';
import AdminCompetitions from './pages/AdminCompetitions';
import AdminLeaderboards from './pages/AdminLeaderboards';
import AdminSeedTools from './pages/AdminSeedTools';

/** Route /dashboard based on user role */
function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'investor') return <Navigate to="/investor-dashboard" replace />;
  return <Dashboard />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Defer so the new route has painted; ensures Home is visible from the top
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [pathname]);
  return null;
}

function AnimationProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useScrollReveal(pathname);
  return <>{children}</>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050511]">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function HiddenRouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">404</h1>
        <p className="text-gray-400">Page not found.</p>
      </div>
    </div>
  );
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050511]">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <HiddenRouteFallback />;
  }

  if (user?.role !== 'admin') {
    return <HiddenRouteFallback />;
  }

  return children;
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <InvestorProvider>
        <StartupProvider>
        <div className="min-h-screen bg-[#06060f] text-gray-100">
          <Navbar />
          <main>
            <AnimationProvider>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<ExploreStartups />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/competitions" element={<Competitions />} />
                <Route path="/for-startups" element={<ForStartups />} />
                <Route path="/for-investors" element={<ForInvestors />} />
                <Route path="/knowledge-hub" element={<KnowledgeHub />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <RoleDashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/startup-onboarding"
                  element={
                    <RequireAuth>
                      <StartupOnboarding />
                    </RequireAuth>
                  }
                />
                <Route path="/startup/profile/:id" element={<StartupProfile />} />
                <Route
                  path="/startup/view/:name"
                  element={
                    <RequireAuth>
                      <StartupDetail />
                    </RequireAuth>
                  }
                />
                <Route path="/investor-onboarding" element={<InvestorOnboarding />} />
                <Route path="/investor-dashboard/*" element={<InvestorDashboard />} />
                <Route
                  path="/workspace/sync-center"
                  element={
                    <RequireAdmin>
                      <AdminCompetitions />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/workspace/ranking-lab"
                  element={
                    <RequireAdmin>
                      <AdminLeaderboards />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/workspace/bootstrap-kit"
                  element={
                    <RequireAdmin>
                      <AdminSeedTools />
                    </RequireAdmin>
                  }
                />
              </Routes>
            </AnimationProvider>
          </main>
          <Footer />
        </div>
        </StartupProvider>
        </InvestorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;


