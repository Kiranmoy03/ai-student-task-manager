import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';

interface CleanNavbarProps {
  onGetStarted: () => void;
  onOpenDashboard: () => void;
}

export const CleanNavbar: React.FC<CleanNavbarProps> = ({ onGetStarted, onOpenDashboard }) => {
  const { user, openAuthModal, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#09090D]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white group-hover:text-violet-200 transition-colors">
            TaskFlow <span className="text-violet-400 text-xs font-normal">AI</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#ai-planner" className="hover:text-white transition-colors flex items-center gap-1.5">
            <span>AI Planner</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              3.5
            </span>
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenDashboard}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] text-xs font-medium transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-semibold shadow-sm shadow-violet-900/30 transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-300" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-2 pb-6 bg-[#0B0B10] border-b border-white/[0.08] space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            How It Works
          </a>
          <a
            href="#ai-planner"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-white"
          >
            AI Study Planner
          </a>
          <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full py-2 text-slate-400 text-xs"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2 rounded-xl border border-white/10 text-white text-xs font-medium"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGetStarted();
                  }}
                  className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
