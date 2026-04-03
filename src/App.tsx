import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
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
import { StartupMandateProvider } from './context/StartupMandateContext';
import StartupMandate from './pages/StartupMandate';
import { ImpactVerificationProvider } from './context/ImpactVerificationContext';
import ImpactVerification from './pages/ImpactVerification';

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'investor') return <Navigate to="/investor-dashboard" replace />;
  return <Dashboard />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
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

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <InvestorProvider>
        <StartupProvider>
        <StartupMandateProvider>
        <ImpactVerificationProvider>
        <div className="min-h-screen bg-[#06060f] text-gray-100">
          <CustomCursor />
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
                  path="/dashboard/*"
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
                <Route path="/startup-mandate" element={<StartupMandate />} />
                <Route path="/impact-verification" element={<ImpactVerification />} />
              </Routes>
            </AnimationProvider>
          </main>
          <Footer />
        </div>
        </ImpactVerificationProvider>
        </StartupMandateProvider>
        </StartupProvider>
        </InvestorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
