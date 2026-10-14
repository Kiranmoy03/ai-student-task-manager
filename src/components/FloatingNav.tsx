import React, { useState, useEffect } from 'react';
import { SparkleIcon } from './SparkleIcon';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowUpRight, LogOut, User as UserIcon, Loader2 } from 'lucide-react';

interface FloatingNavProps {
  onOpenDashboard: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ onOpenDashboard }) => {
  const { user, loading, openAuthModal, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStartedClick = () => {
    if (user) {
      onOpenDashboard();
    } else {
      openAuthModal('signup');
    }
  };

  const handleDashboardClick = () => {
    onOpenDashboard();
  };

  return (
    <>
      <header
        className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        aria-label="Main Navigation"
      >
        <div
          className={`pointer-events-auto flex items-center justify-between gap-3 sm:gap-6 px-3.5 sm:px-4 py-2 rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 text-slate-900 border-slate-200/90 shadow-xl shadow-black/10 backdrop-blur-md'
              : 'bg-white/90 text-slate-900 border-slate-200/80 shadow-lg shadow-black/5 backdrop-blur-sm'
          }`}
        >
          <a
            href="#"
            className="flex items-center gap-2 pl-1 pr-1 sm:pr-2 text-sm font-semibold tracking-tight text-slate-900 whitespace-nowrap group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-full"
            aria-label="Student Task Manager Home"
          >
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:rotate-12">
              <SparkleIcon size={12} className="text-white" />
            </div>
            <span className="font-medium tracking-tight">Task Manager</span>
          </a>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600">
            <a
              href="#features"
              className="px-3 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100/80 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1.5 rounded-full hover:text-slate-950 hover:bg-slate-100/80 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              How it works
            </a>
            <button
              onClick={handleDashboardClick}
              type="button"
              className="px-3 py-1.5 rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
            >
              <span>Dashboard</span>
              {user ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Signed in" />
              ) : (
                <span className="text-[10px] uppercase font-bold text-violet-700 bg-violet-50 px-1.5 py-0.2 rounded">
                  Auth
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {loading ? (
              <div className="w-20 flex justify-center py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                  title={`Signed in as ${user.email}`}
                >
                  <UserIcon className="w-3 h-3 text-violet-600" />
                  <span className="max-w-[110px] truncate">{user.email?.split('@')[0]}</span>
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-full flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  title="Sign out of Supabase Auth"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={handleGetStartedClick}
                  className="px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 active:scale-[0.98] transition-all rounded-full shadow-sm whitespace-nowrap flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <span>Get started</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 md:hidden bg-white/95 backdrop-blur-lg border border-slate-200 rounded-2xl p-4 shadow-2xl text-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              How it works
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleDashboardClick();
              }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <span>Dashboard</span>
              {user ? (
                <span className="text-xs text-emerald-600 font-mono">Active</span>
              ) : (
                <span className="text-xs uppercase font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">
                  Auth Required
                </span>
              )}
            </button>

            <div className="pt-2 mt-2 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-xs text-slate-500 bg-slate-50 rounded-xl truncate">
                    Signed in: {user.email}
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full py-2.5 px-4 text-center text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-full py-2.5 px-4 text-center text-sm font-medium text-slate-800 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('signup');
                    }}
                    className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-black rounded-xl hover:bg-neutral-800 transition-colors"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
