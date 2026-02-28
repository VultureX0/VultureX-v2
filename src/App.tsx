import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import Dashboard from './pages/Dashboard';
import StartupDetail from './pages/StartupDetail';
import { AuthProvider, useAuth } from './context/AuthContext';

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

function AnimationProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  useScrollReveal(pathname);
  return <>{children}</>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
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
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/startup/:name"
                  element={
                    <RequireAuth>
                      <StartupDetail />
                    </RequireAuth>
                  }
                />
              </Routes>
            </AnimationProvider>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;


