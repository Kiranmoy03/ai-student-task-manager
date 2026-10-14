import React from 'react';
import { ParticleRingCanvas } from './ParticleRingCanvas';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface CleanHeroProps {
  onGetStarted: () => void;
  onOpenDashboard: () => void;
}

export const CleanHero: React.FC<CleanHeroProps> = ({ onGetStarted, onOpenDashboard }) => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(124, 58, 237, 0.16) 0%, rgba(15, 12, 28, 0.4) 45%, rgba(9, 9, 13, 1) 90%)',
        }}
      />

      {/* Particle ring canvas in background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <ParticleRingCanvas />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Subtle pill kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium backdrop-blur-sm animate-in fade-in duration-500">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>AI-Powered Student Productivity</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.08] max-w-3xl mx-auto">
          Helping students stay organized and reduce overwhelm.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Bring your assignments, deadlines, and study priorities into one calm, minimal workspace. Let AI generate your optimal daily study plan.
        </p>

        {/* Single Main CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold shadow-lg shadow-violet-900/30 transition-all cursor-pointer"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold shadow-lg shadow-violet-900/30 transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clean Dashboard Preview Mockup */}
        <div className="pt-10 sm:pt-14 max-w-3xl mx-auto w-full">
          <div className="rounded-2xl bg-[#101018]/90 border border-white/10 p-4 sm:p-6 shadow-2xl shadow-violet-950/20 backdrop-blur-md text-left space-y-4">
            {/* Mock Top bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                <span className="font-medium text-slate-200">Study Workspace · Fall Semester</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                <span>3 Pending</span>
                <span>·</span>
                <span className="text-violet-300">AI Plan Active</span>
              </div>
            </div>

            {/* Mock Tasks & Plan in preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Task 1 */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                <div className="w-5 h-5 rounded-lg border border-violet-500/40 bg-violet-500/10 flex items-center justify-center text-violet-400 mt-0.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">Linear Algebra Problem Set 4</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-violet-300">MATH 204</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Today</span>
                  </div>
                </div>
              </div>

              {/* Task 2 */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                <div className="w-5 h-5 rounded-lg border border-white/20 bg-transparent flex items-center justify-center mt-0.5 shrink-0" />
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">Biochemistry Lab Protocol</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-violet-300">BIO 140</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Tomorrow</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Plan Banner in mockup */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-black/30 border border-violet-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-violet-200">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                <span>AI Strategy: Tackle Linear Algebra first during your 9:00 AM peak focus block.</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 shrink-0 hidden sm:inline-block">
                90m Block
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
