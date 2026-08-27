import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '../layouts/MainLayout';
import { PortalLayout } from '../layouts/PortalLayout';
import { Navbar } from '../components/Navbar';
import { CustomCursor } from '../components/CustomCursor';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import { Register } from '../pages/Register';
import DonorPortal from '../pages/DonorPortal';
import Dashboard from '../pages/Dashboard';
import AnalyzeIncident from '../pages/AnalyzeIncident';
import ActiveIncidents from '../pages/ActiveIncidents';
import PastIncidents from '../pages/PastIncidents';
import PendingRequests from '../pages/PendingRequests';
import Blockchain from '../pages/Blockchain';
import Settings from '../pages/Settings';
import NGODashboard from '../pages/NGODashboard';
import NGOIncidents from '../pages/NGOIncidents';
import NGOFundRequest from '../pages/NGOFundRequest';
import Profile from '../pages/Profile';
import { CommandCenter } from '../pages/CommandCenter';
import Reports from '../pages/Reports';
import PresentationMode from '../components/PresentationMode';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ScrollRevealWatcher() {
  const location = useLocation();

  useEffect(() => {
    const selectors = '.sr-hidden,.sr-left,.sr-right,.sr-scale,.stagger-grid';
    const targets = Array.from(document.querySelectorAll(selectors));
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-30px 0px' }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [location.pathname]);

  return null;
}

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <LandingPage />
              </MainLayout>
            }
          />
          <Route
            path="/login"
            element={
              <div className="min-h-screen bg-[#0a1929] relative">
                <div className="relative z-50"><Navbar /></div>
                <CustomCursor />
                <Login />
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="min-h-screen bg-[#0a1929] relative">
                <div className="relative z-50"><Navbar /></div>
                <CustomCursor />
                <Register />
              </div>
            }
          />
          <Route
            path="/donor"
            element={
              <MainLayout>
                <DonorPortal />
              </MainLayout>
            }
          />
          <Route
            path="/command-center"
            element={
              <PortalLayout>
                <CommandCenter />
              </PortalLayout>
            }
          />
          <Route
            path="/blockchain"
            element={
              <PortalLayout>
                <Blockchain />
              </PortalLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <PortalLayout>
                <Reports />
              </PortalLayout>
            }
          />

          {/* Government Portal Routes */}
          <Route
            path="/gov/*"
            element={
              <PortalLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="analyze" element={<AnalyzeIncident />} />
                  <Route path="active" element={<ActiveIncidents />} />
                  <Route path="past" element={<PastIncidents />} />
                  <Route path="requests" element={<PendingRequests />} />
                  <Route path="blockchain" element={<Blockchain />} />
                  <Route path="command-center" element={<CommandCenter />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </PortalLayout>
            }
          />
          <Route path="/gov" element={<Navigate to="/gov/dashboard" replace />} />
          <Route path="/government/*" element={<Navigate to="/gov/dashboard" replace />} />
          <Route path="/government" element={<Navigate to="/gov/dashboard" replace />} />

          {/* NGO Portal Routes */}
          <Route
            path="/ngo/*"
            element={
              <PortalLayout>
                <Routes>
                  <Route path="dashboard" element={<NGODashboard />} />
                  <Route path="assigned" element={<NGOIncidents />} />
                  <Route path="tasks" element={<NGOIncidents />} />
                  <Route path="requests" element={<NGOFundRequest />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </PortalLayout>
            }
          />
          <Route path="/ngo" element={<Navigate to="/ngo/dashboard" replace />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ScrollRevealWatcher />
        <PresentationMode />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
