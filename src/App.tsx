/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardView } from './components/DashboardView';
import { CleanNavbar } from './components/CleanNavbar';
import { CleanHero } from './components/CleanHero';
import { CleanFeatures } from './components/CleanFeatures';
import { AuthModal } from './components/AuthModal';

function MainContent() {
  const { user, openAuthModal } = useAuth();
  // Default to the full-page dashboard experience
  const [view, setView] = useState<'dashboard' | 'landing'>('dashboard');

  return (
    <div className="min-h-screen bg-[#09090D] text-slate-100 flex flex-col selection:bg-violet-600 selection:text-white">
      {view === 'landing' ? (
        <>
          <CleanNavbar
            onGetStarted={() => {
              if (user) {
                setView('dashboard');
              } else {
                openAuthModal('signup');
              }
            }}
            onOpenDashboard={() => setView('dashboard')}
          />

          <main className="flex-1 w-full flex flex-col">
            <CleanHero
              onGetStarted={() => {
                if (user) {
                  setView('dashboard');
                } else {
                  openAuthModal('signup');
                }
              }}
              onOpenDashboard={() => setView('dashboard')}
            />
            <CleanFeatures />
          </main>

          <footer className="py-8 px-4 border-t border-white/[0.06] text-center text-xs text-slate-500">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">TaskFlow AI · Student Task Manager</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setView('dashboard')}
                  className="hover:text-violet-300 transition-colors cursor-pointer text-slate-400"
                >
                  Go to Dashboard
                </button>
                <span>·</span>
                <span>FastAPI + Supabase Auth + Gemini AI</span>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <DashboardView onViewLanding={() => setView('landing')} />
      )}

      <AuthModal onAuthSuccess={() => setView('dashboard')} />
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
