import React, { useState } from 'react';
import { ParticleRingCanvas } from './ParticleRingCanvas';
import { SparkleIcon } from './SparkleIcon';
import { ArrowDown, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStartPlanning: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartPlanning }) => {
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full bg-[#070709] text-white flex flex-col justify-between pt-24 pb-12 px-6 sm:px-10 lg:px-16 overflow-hidden select-none"
      aria-label="Student Task Manager Hero"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.12) 0%, rgba(10, 8, 16, 0.6) 50%, rgba(7, 7, 9, 1) 100%)',
        }}
      />

      <ParticleRingCanvas
        onPointerMoveCoords={(coords) => {
          setPointerOffset({ x: coords.x * 12, y: coords.y * 12 });
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className="relative flex items-center justify-center transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${pointerOffset.x * 0.4}px, ${-pointerOffset.y * 0.4}px, 0)`,
          }}
        >
          <div className="absolute w-20 h-20 rounded-full bg-violet-500/25 blur-xl animate-pulse" />
          <div className="absolute w-8 h-8 rounded-full bg-white/40 blur-md" />
          <SparkleIcon size={24} className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
        </div>
      </div>

      <div
        className="relative z-20 pt-8 sm:pt-12 max-w-3xl pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${pointerOffset.x * 0.6}px, ${-pointerOffset.y * 0.6}px, 0)`,
        }}
      >
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight tracking-tighter text-white/95 leading-[0.95] drop-shadow-sm">
          Less overwhelm
        </h1>
      </div>

      <div className="relative z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 sm:gap-12 pb-4">
        <div className="max-w-md lg:max-w-lg space-y-6">
          <p className="text-base sm:text-lg md:text-xl font-light text-slate-300/90 leading-relaxed tracking-tight">
            Bring your tasks, deadlines and study goals into one clear workspace.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onStartPlanning}
              className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-100 hover:shadow-lg hover:shadow-violet-500/10 active:scale-95 transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <span>Start planning</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#showcase"
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium text-sm border border-white/15 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 backdrop-blur-sm"
            >
              <span>Explore features</span>
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div
          className="text-right self-end md:self-auto transition-transform duration-500 ease-out pointer-events-none"
          style={{
            transform: `translate3d(${-pointerOffset.x * 0.6}px, ${pointerOffset.y * 0.6}px, 0)`,
          }}
        >
          <div className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight tracking-tighter text-white/95 leading-[0.95] drop-shadow-sm">
            More progress
          </div>
        </div>
      </div>
    </section>
  );
};
