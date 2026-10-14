import React, { useRef, useState, useEffect } from 'react';
import { SparkleIcon } from './SparkleIcon';
import { BarChart3, Layers, Info } from 'lucide-react';

export const WhiteRotatingCardsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showPillNotice, setShowPillNotice] = useState(false);
  const [manualExpand, setManualExpand] = useState<boolean | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const progress = manualExpand !== null ? (manualExpand ? 1 : 0) : scrollProgress;

  // Stable 2D stack-to-fan-out transforms (prevents 3D surface clipping/intersections)
  // Stacked (p=0): Left peek at -24px (-4deg), Center at 0 (0deg, z:30), Right peek at +24px (+4deg, z:10)
  // Expanded (p=1): Clean side-by-side arrangement (-380px, 0, +380px) with 0deg rotation
  const leftX = -24 + progress * (-356); // from -24 to -380
  const leftY = 8 - progress * 8;        // from 8 to 0
  const leftRotate = -4 * (1 - progress); // from -4 to 0

  const rightX = 24 + progress * 356;    // from 24 to 380
  const rightY = 12 - progress * 12;     // from 12 to 0
  const rightRotate = 4 * (1 - progress); // from 4 to 0

  return (
    <div
      ref={containerRef}
      id="how-it-works"
      className="pillars-section relative w-full min-h-[160vh] lg:min-h-[190vh] my-6"
    >
      <div className="sticky top-20 md:top-24 min-h-[85vh] flex flex-col justify-between py-10 sm:py-14 px-4 sm:px-8 lg:px-12 bg-white text-slate-900 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-200/90 shadow-2xl mx-3 sm:mx-6 lg:mx-10">
        
        <div className="w-full text-center pt-2 select-none relative z-10">
          <span className="text-xs uppercase tracking-widest text-violet-600 font-semibold mb-2 block">
            Three Continuous Pillars
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-slate-900 leading-tight">
            Your day, brought together.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Scroll or toggle below to inspect the three pillars: Organize, Prioritize, and Track.
          </p>
        </div>

        <div className="hidden lg:flex relative w-full flex-1 items-center justify-center my-6 py-6 min-h-[540px]">
          <div className="relative w-full max-w-[1180px] h-[520px] flex items-center justify-center">

            <div
              className="absolute w-[340px] h-[500px] rounded-[2.2rem] bg-[#0d0e17] text-white p-7 border border-slate-800 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out select-none"
              style={{
                transform: `translate3d(${leftX}px, ${leftY}px, 0) rotate(${leftRotate}deg)`,
                zIndex: progress > 0.6 ? 25 : 15,
              }}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-violet-400 mb-6">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    Pillar 01
                  </span>
                  <span className="uppercase tracking-widest text-slate-400">Structure</span>
                </div>

                <h3 className="text-3xl font-light tracking-tight text-white mb-3">
                  Organize
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Cluster tasks by university course, lab group or personal research. Keep syllabi and deadlines synchronized in one canonical ledger.
                </p>

                <div className="mt-6 space-y-2.5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Course Syllabus Sync</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Active</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Modular Workspaces</span>
                    <span className="text-violet-400 font-mono text-[11px]">4 Enrolled</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 font-mono">
                Centralized student architecture
              </div>
            </div>

            <div
              className="absolute w-[350px] h-[510px] rounded-[2.2rem] p-7 shadow-[0_25px_60px_rgba(0,0,0,0.35)] flex flex-col justify-between transition-transform duration-300 ease-out select-none border border-violet-300/40"
              style={{
                background:
                  'linear-gradient(180deg, #fce7f3 0%, #d8b4fe 16%, #8b5cf6 42%, #2e1065 72%, #090611 100%)',
                transform: 'translate3d(0, 0, 0)',
                zIndex: 30, // Always stays above when stacked; equal presence when expanded
              }}
            >
              <div>
                <div className="flex items-center justify-between text-slate-900 font-medium pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-md">
                      <SparkleIcon size={14} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold tracking-tight text-slate-950">
                      Student Task Manager
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-purple-950 font-semibold bg-white/50 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    Prioritize
                  </span>
                </div>

                <div className="mt-7 text-center relative">
                  <button
                    type="button"
                    onClick={() => setShowPillNotice(!showPillNotice)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0a0712] text-white text-xs font-medium border border-violet-400/40 shadow-lg hover:border-violet-300 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 active:scale-95"
                    aria-label="What should I study next info"
                  >
                    <SparkleIcon size={12} className="text-violet-400" />
                    <span>What should I study next?</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showPillNotice && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-14 w-64 bg-slate-950/95 text-slate-200 text-[11px] p-3 rounded-2xl border border-violet-500/40 shadow-2xl z-40">
                      <p className="font-medium text-white mb-1">Coming Soon</p>
                      <p className="text-slate-400 leading-normal">
                        This feature connects to the planned Python/FastAPI AI study engine. No simulated answers are generated in preview mode.
                      </p>
                      <button
                        onClick={() => setShowPillNotice(false)}
                        className="mt-2 text-violet-300 hover:text-white font-medium underline text-[10px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="my-3 text-center px-2">
                <div className="inline-block px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[11px] font-semibold mb-2">
                  Intelligent Urgency Scoring
                </div>
                <p className="text-xs text-white/90 font-light max-w-xs mx-auto">
                  Automatic sorting by exam weight, credit hours and submission deadlines.
                </p>
              </div>

              <div className="pt-4 border-t border-white/20 text-center">
                <p className="text-xs sm:text-sm font-light text-white tracking-tight leading-snug">
                  Tasks, deadlines and study goals — in one workspace.
                </p>
              </div>
            </div>

            <div
              className="absolute w-[340px] h-[500px] rounded-[2.2rem] bg-[#0c0d14] text-white p-7 border border-slate-800 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out select-none"
              style={{
                transform: `translate3d(${rightX}px, ${rightY}px, 0) rotate(${rightRotate}deg)`,
                zIndex: progress > 0.6 ? 25 : 10,
              }}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-6">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Pillar 03
                  </span>
                  <span className="uppercase tracking-widest text-slate-400">Momentum</span>
                </div>

                <h3 className="text-3xl font-light tracking-tight text-white mb-3">
                  Track
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Observe genuine study hours without vanity metrics. Gain clean visibility over semester pacing and upcoming exam checkpoints.
                </p>

                <div className="mt-6 space-y-2.5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Weekly Target Reach</span>
                    <span className="text-emerald-400 font-mono text-[11px]">84% Achieved</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                    <span className="text-slate-300">Exam Buffer Time</span>
                    <span className="text-violet-400 font-mono text-[11px]">+3 Days</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 font-mono">
                Continuous semester analytics
              </div>
            </div>

          </div>
        </div>

        <div className="lg:hidden flex flex-col gap-6 my-6">
          <div
            className="w-full rounded-[2rem] p-6 text-white border border-violet-300/40 shadow-xl"
            style={{
              background:
                'linear-gradient(180deg, #fce7f3 0%, #d8b4fe 16%, #8b5cf6 42%, #2e1065 72%, #090611 100%)',
            }}
          >
            <div className="flex items-center justify-between text-slate-900 font-medium pb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center">
                  <SparkleIcon size={12} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-950">Student Task Manager</span>
              </div>
              <span className="text-[10px] font-mono text-purple-950 font-bold bg-white/50 px-2 py-0.5 rounded-full">
                Prioritize
              </span>
            </div>
            <div className="text-center my-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#0a0712] text-white text-xs border border-violet-400/40">
                What should I study next?
              </div>
            </div>
            <p className="text-xs text-center text-white/90 pt-2 border-t border-white/20">
              Tasks, deadlines and study goals — in one workspace.
            </p>
          </div>

          <div className="w-full rounded-[2rem] bg-[#0d0e17] text-white p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-violet-400 mb-3">
              <span>Pillar 01</span>
              <span className="text-slate-400">Structure</span>
            </div>
            <h3 className="text-2xl font-light text-white mb-2">Organize</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Cluster tasks by university course, lab group or personal research.
            </p>
          </div>

          <div className="w-full rounded-[2rem] bg-[#0c0d14] text-white p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-3">
              <span>Pillar 03</span>
              <span className="text-slate-400">Momentum</span>
            </div>
            <h3 className="text-2xl font-light text-white mb-2">Track</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Observe genuine study hours without vanity metrics and monitor pacing.
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tabular-nums">
              Pillars Expanded: {Math.round(progress * 100)}%
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <span className={`transition-colors ${progress > 0.3 ? 'text-slate-900 font-semibold' : ''}`}>
                Organize
              </span>
              <span>·</span>
              <span className={`transition-colors ${progress > 0.3 ? 'text-slate-900 font-semibold' : ''}`}>
                Prioritize
              </span>
              <span>·</span>
              <span className={`transition-colors ${progress > 0.3 ? 'text-slate-900 font-semibold' : ''}`}>
                Track
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setManualExpand(manualExpand ? false : true)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              {manualExpand ? 'Stack panels' : 'Fan out panels'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
