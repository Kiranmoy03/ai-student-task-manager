import React from 'react';
import { CheckSquare, Sparkles, TrendingUp, Calendar, BookOpen, ShieldCheck } from 'lucide-react';

export const CleanFeatures: React.FC = () => {
  const features = [
    {
      icon: <CheckSquare className="w-5 h-5 text-violet-400" />,
      title: 'Minimal Task Management',
      description:
        'Type your own course names freely, assign priorities, and track deadlines without clutter or rigid templates.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      title: 'AI Smart Study Planner',
      description:
        'Intelligently synthesizes your pending assignments into an optimal study sequence with strategic, focused time blocks.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-indigo-400" />,
      title: 'Semester Progress Tracking',
      description:
        'Stay ahead of finals with real-time completion percentages, upcoming deadline alerts, and cognitive rest suggestions.',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Designed for focused, calm study sessions.
        </h2>
        <p className="text-sm text-slate-400">
          Everything you need to master your syllabus without the distraction of overly complex tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#101018] border border-white/[0.08] hover:border-violet-500/30 transition-all space-y-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              {feature.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mini "How it works" summary banner */}
      <div id="how-it-works" className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-violet-950/20 via-[#101018] to-purple-950/20 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-violet-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Student Architecture</span>
          </div>
          <h4 className="text-base font-medium text-white">
            Built with Supabase Auth, FastAPI Task Engine & Smart Study AI
          </h4>
          <p className="text-xs text-slate-400 max-w-xl">
            Your tasks are user-scoped with strict Row-Level Security. No public exposure, no telemetry clutter.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-300 font-mono shrink-0">
          <div className="text-center">
            <div className="text-white font-semibold text-sm">100%</div>
            <div className="text-[10px] text-slate-500">RLS Isolated</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-violet-400 font-semibold text-sm">Smart</div>
            <div className="text-[10px] text-slate-500">Study Planner</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-emerald-400 font-semibold text-sm">REST</div>
            <div className="text-[10px] text-slate-500">FastAPI CRUD</div>
          </div>
        </div>
      </div>
    </section>
  );
};
