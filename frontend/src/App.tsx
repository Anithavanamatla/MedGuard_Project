import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
// Dashboards (Placeholder for now)
import { PatientDashboard } from './pages/dashboard/PatientDashboard';
import { PatientSubmitClaim } from './pages/dashboard/PatientSubmitClaim';
import { HospitalDashboard } from './pages/dashboard/HospitalDashboard';
import { InsuranceDashboard } from './pages/dashboard/InsuranceDashboard';
import { ClaimAnalysis } from './pages/dashboard/ClaimAnalysis';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return <PublicLayout>{children}</PublicLayout>;
};

import DarkVeil from './components/ui/DarkVeil';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-white relative isolate">
          {/* Dark Veil Background */}
          <div className="fixed inset-0 z-[-1] opacity-60 pointer-events-none">
            <DarkVeil
              hueShift={0}
              noiseIntensity={0.02}
              scanlineIntensity={0.05}
              speed={0.15}
              scanlineFrequency={0}
              warpAmount={0}
            />
          </div>

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Patient Routes */}
            <Route path="/patient/*" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Routes>
                  <Route index element={<PatientDashboard />} />
                  <Route path="submit" element={<PatientSubmitClaim />} />
                  <Route path="claims" element={<div>My Claims Page</div>} />
                </Routes>
              </ProtectedRoute>
            } />

            {/* Hospital Routes */}
            <Route path="/hospital/*" element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <Routes>
                  <Route index element={<HospitalDashboard />} />
                  <Route path="submit" element={<div>Submit Claim Page</div>} />
                </Routes>
              </ProtectedRoute>
            } />

            {/* Insurance Routes */}
            <Route path="/insurance/*" element={
              <ProtectedRoute allowedRoles={['insurance']}>
                <Routes>
                  <Route index element={<InsuranceDashboard />} />
                  <Route path="reviews" element={<div>Review Claims Page</div>} />
                </Routes>
              </ProtectedRoute>
            } />

            {/* Claim Analysis Route */}
            <Route path="/claims/:claimId" element={
              <ProtectedRoute allowedRoles={['insurance']}>
                <ClaimAnalysis />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
