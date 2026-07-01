/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AnimatePresence } from 'motion/react'; 
import { AuthProvider, useAuth } from '@/lib/auth';

// Actual Pages
import { LandingPage } from '@/pages/LandingPage';
import { FeedPage } from '@/pages/FeedPage';
import { MapPage } from '@/pages/MapPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { ReportIssuePage } from '@/pages/ReportIssuePage';
import { IssueDetailsPage } from '@/pages/IssueDetailsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { FAQPage } from '@/pages/FAQPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { ContactPage } from '@/pages/ContactPage';
import { StatsPage } from '@/pages/StatsPage';

// Route Guard to verify auth and role-based policies
function RequireAuth({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafcfa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-14 border-4 border-[#004d2c]/20 border-t-[#004d2c] rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-wider text-[#004d2c]">Loading Security State...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save original location in React Router state to return post-login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Redirect already logged-in users away from Auth pages
function RequireAnonymous({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface selection:bg-[#004d2c]/20">
          <Header />
          
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Restricted Citizen & Admin Pages */}
                <Route path="/feed" element={<RequireAuth><FeedPage /></RequireAuth>} />
                <Route path="/map" element={<RequireAuth><MapPage /></RequireAuth>} />
                <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                <Route path="/report" element={<RequireAuth><ReportIssuePage /></RequireAuth>} />
                <Route path="/issue/:id" element={<RequireAuth><IssueDetailsPage /></RequireAuth>} />
                <Route path="/stats" element={<RequireAuth><StatsPage /></RequireAuth>} />
                
                {/* Restricted Admin Only */}
                <Route path="/admin" element={<RequireAuth adminOnly><AdminDashboardPage /></RequireAuth>} />

                {/* Authentication Routes */}
                <Route path="/login" element={<RequireAnonymous><LoginPage /></RequireAnonymous>} />
                <Route path="/register" element={<RequireAnonymous><RegisterPage /></RequireAnonymous>} />
                <Route path="/reset-password" element={<RequireAnonymous><ResetPasswordPage /></RequireAnonymous>} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


