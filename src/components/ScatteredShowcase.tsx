import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Task } from '../types/student';
import { INITIAL_TASKS, SAMPLE_SUBJECTS } from '../data/sampleData';
import { Check, Clock, BookOpen, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';

interface ScatteredShowcaseProps {
  onOpenDashboard: () => void;
}

export const ScatteredShowcase: React.FC<ScatteredShowcaseProps> = ({ onOpenDashboard }) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <section
      id="showcase"
      className="showcase-section bg-[#09090d] text-white"
      aria-label="Spatial Product Showcase"
    >
      {/* Header section with minimal typography */}
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-14">
        <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3 inline-block">
          Interactive Product Showcase
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white/95">
          Designed for how students actually work.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          High-contrast, distraction-free modular surfaces that bring order to assignments, exams and research papers.
        </p>
      </div>

      {/* Responsive Grid with Defined Layout Spaces and Flow */}
      <div className="showcase-grid">

        {/* 1. Subject Overview (Column 1, Row 1 on Desktop) */}
        <div className="showcase-item">
          <motion.div
            className="showcase-motion"
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ y: -5 }}
          >
            <article className="card-surface bg-[#12121a] border border-white/10 shadow-xl">
              <div
                className="card-decoration bg-gradient-to-br from-violet-500/5 via-transparent to-transparent"
                aria-hidden="true"
              />
              <div className="card-content p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">Subject Overview</h3>
                      <p className="text-xs text-slate-400">Fall Semester · 4 Enrolled</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-violet-300 bg-violet-950/60 border border-violet-800/40 px-2 py-0.5 rounded-full">
                    4 Courses
                  </span>
                </div>

                <div className="space-y-3.5">
                  {SAMPLE_SUBJECTS.slice(0, 3).map((sub) => {
                    const pct = Math.round((sub.completedTasks / sub.totalTasks) * 100);
                    return (
                      <div key={sub.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{sub.code}</span>
                          <span className="font-mono text-slate-400 tabular-nums">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: sub.color }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{sub.nextDeadline}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          </motion.div>
        </div>

        {/* 2. Today's Tasks (CENTER - LARGEST CARD, Spans 2 Rows on Desktop) */}
        <div className="showcase-item lg:row-span-2 lg:col-start-2">
          <motion.div
            className="showcase-motion"
            animate={{ y: [3, -3, 3] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ y: -4 }}
          >
            <article className="card-surface bg-[#151522] border border-violet-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(139,92,246,0.12)]">
              <div
                className="card-decoration bg-gradient-to-b from-violet-600/10 via-transparent to-violet-900/10"
                aria-hidden="true"
              />
              <div className="card-content p-6 sm:p-7">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white tracking-tight">Today’s Tasks</h3>
                      <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 font-medium px-2 py-0.5 rounded-full">
                        Interactive
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {completedCount} of {tasks.length} tasks completed today
                    </p>
                  </div>
                  <button
                    onClick={onOpenDashboard}
                    type="button"
                    className="text-xs font-semibold text-violet-300 hover:text-white flex items-center gap-1 transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-lg p-1"
                  >
                    <span>Expand</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        task.completed
                          ? 'bg-white/[0.02] border-white/5 text-slate-500'
                          : 'bg-white/[0.05] border-white/10 hover:border-violet-500/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className={`w-5 h-5 rounded-lg shrink-0 flex items-center justify-center transition-colors border ${
                            task.completed
                              ? 'bg-violet-600 border-violet-500 text-white'
                              : 'border-slate-600 group-hover:border-violet-400 bg-transparent'
                          }`}
                        >
                          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span
                            className={`text-sm tracking-tight transition-all block truncate ${
                              task.completed ? 'line-through text-slate-500' : 'font-medium'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {task.subject} · {task.dueTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-slate-400">
                          {task.estimatedMinutes}m
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-rose-400'
                              : task.priority === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          title={`Priority: ${task.priority}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Click any item to toggle completion</span>
                  <span className="font-mono text-violet-400">
                    {Math.round((completedCount / tasks.length) * 100)}% Complete
                  </span>
                </div>
              </div>
            </article>
          </motion.div>
        </div>

        {/* 3. Upcoming Deadline (Column 3, Row 1 on Desktop) */}
        <div className="showcase-item">
          <motion.div
            className="showcase-motion"
            animate={{ y: [-2, 4, -2] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ y: -5 }}
          >
            <article className="card-surface bg-[#12121a] border border-white/10 shadow-xl">
              <div
                className="card-decoration bg-gradient-to-bl from-rose-500/5 via-transparent to-transparent"
                aria-hidden="true"
              />
              <div className="card-content p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">Upcoming Deadline</h3>
                  </div>
                  <span className="text-[11px] font-mono text-rose-300 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
                    Urgent
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
                  <div className="text-sm font-medium text-slate-100">
                    MATH 204: Problem Set 4
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Due today at 5:00 PM</span>
                    <span className="text-amber-400 font-mono">2h 45m left</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-3/4 rounded-full" />
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                  <span>Next: Bio Lab Protocol</span>
                  <span className="text-slate-300">Tomorrow</span>
                </div>
              </div>
            </article>
          </motion.div>
        </div>

        {/* 4. Weekly Progress (Column 1, Row 2 on Desktop) */}
        <div className="showcase-item">
          <motion.div
            className="showcase-motion"
            animate={{ y: [4, -3, 4] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ y: -5 }}
          >
            <article className="card-surface bg-[#12121a] border border-white/10 shadow-xl">
              <div
                className="card-decoration bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent"
                aria-hidden="true"
              />
              <div className="card-content p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">Weekly Progress</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    84% on track
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="text-[11px] text-slate-400">Focused Hours</div>
                    <div className="text-lg font-light text-white mt-0.5 font-mono">28.4 / 32h</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="text-[11px] text-slate-400">Study Streak</div>
                    <div className="text-lg font-light text-white mt-0.5 font-mono">6 Days</div>
                  </div>
                </div>

                <div className="flex items-end justify-between h-14 pt-1 px-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const heights = [70, 85, 95, 60, 90, 45, 80];
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-3.5 bg-white/5 rounded-t-sm h-10 flex items-end">
                          <div
                            className="w-full bg-violet-500/80 rounded-t-sm transition-all"
                            style={{ height: `${heights[idx]}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          </motion.div>
        </div>

        {/* 5. Study-Plan Preview (Column 3, Row 2 on Desktop) */}
        <div className="showcase-item">
          <motion.div
            className="showcase-motion"
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ y: -5 }}
          >
            <article className="card-surface bg-[#12121a] border border-white/10 shadow-xl">
              <div
                className="card-decoration bg-gradient-to-tl from-amber-500/5 via-transparent to-transparent"
                aria-hidden="true"
              />
              <div className="card-content p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">Study-Plan Preview</h3>
                      <p className="text-[11px] text-slate-400">Adaptive schedule engine</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-200">Deep Work: MATH 204</div>
                      <div className="text-[10px] text-slate-400">Cognitive peak window</div>
                    </div>
                    <span className="text-xs font-mono text-violet-300">09:00 - 10:30</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-200">Active Recall: BIO 140</div>
                      <div className="text-[10px] text-slate-400">Spaced repetition deck</div>
                    </div>
                    <span className="text-xs font-mono text-violet-300">14:00 - 15:00</span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-500 italic text-center">
                  Python AI study planning endpoint integration pending
                </p>
              </div>
            </article>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
