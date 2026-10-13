import React, { useState } from 'react';
import { DAILY_SCHEDULE } from '../data/sampleData';
import { ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';

interface PurpleFeatureSectionProps {
  onSeeDashboard: () => void;
}

export const PurpleFeatureSection: React.FC<PurpleFeatureSectionProps> = ({ onSeeDashboard }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section
      id="features"
      className="relative my-8 sm:my-14 mx-3 sm:mx-6 lg:mx-10 rounded-[2.5rem] lg:rounded-[3.5rem] bg-gradient-to-b from-[#090611] via-[#160b2e] to-[#240c4a] border border-violet-800/30 text-white overflow-hidden py-20 sm:py-28 px-6 sm:px-12 lg:px-20 scroll-mt-[110px]"
      aria-label="Features: Daily Student Schedule"
    >
      {/* Soft Purple Glow near bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] pointer-events-none opacity-70 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(168, 85, 247, 0.45) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 80%)',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[580px]">
        {/* Left Column: Upper Heading + Lower Supporting Text & Button */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-12">
          {/* Upper-Left Heading */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-300 mb-4 inline-block">
              Daily Structured Rhythm
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05]">
              A clearer plan.
              <br />
              <span className="text-violet-200">A calmer day.</span>
            </h2>
          </div>

          {/* Lower-Left Supporting Text and CTA */}
          <div className="space-y-6 max-w-lg">
            <p className="text-base sm:text-lg text-violet-100/80 leading-relaxed font-light">
              Time-blocking structured for university terms. Balance heavy assignment problem sets with spaced review intervals so you stay ahead without burn-out.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onSeeDashboard}
                className="px-6 py-3.5 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-violet-50 active:scale-95 transition-all shadow-lg shadow-black/20 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
              >
                <span>See the dashboard</span>
                <ArrowRight className="w-4 h-4 text-slate-800" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tall Tilted Product-Preview Card showing daily student schedule */}
        <div
          className="lg:col-span-6 flex justify-center lg:justify-end perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="w-full max-w-[420px] rounded-[2.2rem] bg-[#140e26] border border-violet-400/30 p-6 sm:p-8 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),0_0_50px_rgba(139,92,246,0.25)] transition-transform duration-200 ease-out transform-style-3d"
            style={{
              transform: `rotateY(${-6 + tilt.x}deg) rotateX(${4 + tilt.y}deg) scale(1)`,
            }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-5">
              <div>
                <span className="text-[11px] font-mono text-violet-300 uppercase tracking-wider block">
                  Today’s Sequence
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Wednesday Study Schedule
                </h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-900/60 border border-violet-700/40 text-[11px] text-violet-200 font-mono">
                <Clock className="w-3 h-3" />
                <span>4h 45m</span>
              </div>
            </div>

            {/* Daily Schedule Blocks */}
            <div className="space-y-3.5">
              {DAILY_SCHEDULE.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.completed
                      ? 'bg-white/[0.03] border-white/5 opacity-70'
                      : idx === 1
                      ? 'bg-violet-600/15 border-violet-500/50 shadow-inner shadow-violet-500/10'
                      : 'bg-white/[0.04] border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-violet-400">
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-violet-400" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-sm tracking-tight ${
                            item.completed ? 'line-through text-slate-400' : 'font-medium text-slate-100'
                          }`}
                        >
                          {item.taskTitle}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-violet-300/80 font-mono">
                          <span>{item.subjectCode}</span>
                          <span>·</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 bg-white/5 px-2 py-0.5 rounded">
                      {item.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Card Footer status */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-violet-300/80">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                Next block in 25 min
              </span>
              <span className="font-mono text-slate-300">Target: 5:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
