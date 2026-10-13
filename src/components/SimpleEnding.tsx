import React from 'react';
import { ArrowRight, PlusCircle, SlidersHorizontal, LineChart } from 'lucide-react';
import { SparkleIcon } from './SparkleIcon';

interface SimpleEndingProps {
  onGetStarted: () => void;
}

export const SimpleEnding: React.FC<SimpleEndingProps> = ({ onGetStarted }) => {
  return (
    <footer
      id="ending"
      className="relative bg-[#070709] text-white pt-24 pb-16 px-6 sm:px-12 lg:px-20 overflow-hidden scroll-mt-[110px]"
      aria-label="Overview and Next Steps"
    >
      <div className="max-w-5xl mx-auto">
        {/* Concise Three-Step Section: Add tasks → Set priorities → Track progress */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-semibold tracking-widest text-violet-400 block mb-2">
              Workflow Sequence
            </span>
            <h3 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
              Three effortless steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="rounded-3xl bg-[#0f0f17] border border-white/10 p-7 space-y-4 hover:border-violet-500/40 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Step 01</span>
                <h4 className="text-lg font-medium text-white">Add tasks</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Capture assignments, lecture readings and project milestones as soon as they appear on your syllabus.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl bg-[#0f0f17] border border-white/10 p-7 space-y-4 hover:border-violet-500/40 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Step 02</span>
                <h4 className="text-lg font-medium text-white">Set priorities</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Categorize by cognitive effort, deadline proximity and course weight to isolate high-leverage work.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl bg-[#0f0f17] border border-white/10 p-7 space-y-4 hover:border-violet-500/40 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <LineChart className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Step 03</span>
                <h4 className="text-lg font-medium text-white">Track progress</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Keep momentum steady with honest completion logs and balanced weekly study intervals.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA: “Make your next step clear” */}
        <div className="text-center py-16 px-6 rounded-[2.5rem] bg-gradient-to-b from-[#131024] to-[#0a0814] border border-violet-800/30 relative overflow-hidden mb-20 shadow-2xl">
          <div className="absolute inset-0 bg-radial from-violet-600/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-white">
              Make your next step clear
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-light max-w-md mx-auto">
              Open the interactive student workspace and experience a calmer, focused approach to academic productivity.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 hover:shadow-xl hover:shadow-violet-500/20 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <SparkleIcon size={14} className="text-white" />
            <span>Student Task Manager</span>
          </div>

          <p className="text-center sm:text-right">
            Designed for focused academic study. Frontend architecture preview.
          </p>
        </div>
      </div>
    </footer>
  );
};
