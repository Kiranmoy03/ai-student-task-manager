/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FloatingNav } from './components/FloatingNav';
import { HeroSection } from './components/HeroSection';
import { ScatteredShowcase } from './components/ScatteredShowcase';
import { PurpleFeatureSection } from './components/PurpleFeatureSection';
import { WhiteRotatingCardsSection } from './components/WhiteRotatingCardsSection';
import { SimpleEnding } from './components/SimpleEnding';
import { DashboardPreviewModal } from './components/DashboardPreviewModal';
import { AuthModal } from './components/AuthModal';

function MainContent() {
  const { user, openAuthModal } = useAuth();
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const handleOpenDashboard = () => {
    setIsDashboardOpen(true);
  };

  const handleCloseDashboard = () => {
    setIsDashboardOpen(false);
  };

  const handleGetStarted = () => {
    if (user) {
      setIsDashboardOpen(true);
    } else {
      openAuthModal('signup');
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-100 flex flex-col selection:bg-violet-600 selection:text-white">
      {/* 2. Floating Navigation (Stays centered near top, visible during scroll) */}
      <FloatingNav onOpenDashboard={handleOpenDashboard} />

      <main className="flex-1 w-full flex flex-col">
        {/* 1. Dark Particle-Ring Hero */}
        <HeroSection onStartPlanning={handleOpenDashboard} />

        {/* 3. Scattered Product-Card Showcase */}
        <ScatteredShowcase onOpenDashboard={handleOpenDashboard} />

        {/* 4. Purple Feature Section */}
        <PurpleFeatureSection onSeeDashboard={handleOpenDashboard} />

        {/* 5. White Rotating-Card Section */}
        <WhiteRotatingCardsSection />

        {/* 6. Simple Ending */}
        <SimpleEnding onGetStarted={handleGetStarted} />
      </main>

      {/* Interactive Student Workspace Dashboard Modal (Protected) */}
      <DashboardPreviewModal
        isOpen={isDashboardOpen}
        onClose={handleCloseDashboard}
      />

      {/* Supabase Authentication Modal (Email/Password Login & Signup) */}
      <AuthModal onAuthSuccess={() => setIsDashboardOpen(true)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
