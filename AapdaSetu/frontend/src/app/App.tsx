import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '../layouts/MainLayout';
import { PortalLayout } from '../layouts/PortalLayout';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import { Register } from '../pages/Register';
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
import PresentationMode from '../components/PresentationMode';
import HomeOverview from '../pages/HomeOverview';
import RWADashboard from '../pages/rwa/RWADashboard';
import HeatwaveMap from '../pages/heatwave/HeatwaveMap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes - Wrapped in general layout with header/footer */}
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
              <MainLayout>
                <Login />
              </MainLayout>
            }
          />
          <Route
            path="/register"
            element={
              <MainLayout>
                <Register />
              </MainLayout>
            }
          />

          {/* Government Portal Routes - Wrapped in Left Sidebar PortalLayout */}
          <Route
            path="/gov/*"
            element={
              <PortalLayout>
                <Routes>
                  <Route path="overview" element={<HomeOverview />} />
                  <Route path="active" element={<Dashboard />} />
                  <Route path="rwa" element={<RWADashboard />} />
                  <Route path="heatwave" element={<HeatwaveMap />} />
                  <Route path="analyze" element={<AnalyzeIncident />} />
                  <Route path="past" element={<PastIncidents />} />
                  <Route path="requests" element={<PendingRequests />} />
                  <Route path="blockchain" element={<Blockchain />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="overview" replace />} />
                </Routes>
              </PortalLayout>
            }
          />

          {/* NGO Portal Routes - Wrapped in Left Sidebar PortalLayout */}
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

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <PresentationMode />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
