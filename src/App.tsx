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
  const [dashboardTab, setDashboardTab] = useState<'tasks' | 'schedule' | 'planner'>('tasks');
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  const handleOpenDashboard = (tab: 'tasks' | 'schedule' | 'planner' = 'tasks') => {
    setDashboardTab(tab);
    setIsDashboardOpen(true);
  };

  const handleCloseDashboard = () => {
    setIsDashboardOpen(false);
    // Refresh the homepage card after the student adds/updates/deletes a task.
    setTaskRefreshKey((previous) => previous + 1);
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
      <FloatingNav onOpenDashboard={handleOpenDashboard} />

      <main className="flex-1 w-full flex flex-col">
        <HeroSection onStartPlanning={handleOpenDashboard} />

        <ScatteredShowcase onOpenDashboard={handleOpenDashboard} refreshKey={taskRefreshKey} />

        <PurpleFeatureSection onSeeDashboard={handleOpenDashboard} />

        <WhiteRotatingCardsSection />

        <SimpleEnding onGetStarted={handleGetStarted} />
      </main>

      <DashboardPreviewModal
        isOpen={isDashboardOpen}
        onClose={handleCloseDashboard}
        initialTab={dashboardTab}
      />

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
