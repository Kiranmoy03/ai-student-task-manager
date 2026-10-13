import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority } from '../types/student';
import { SAMPLE_SUBJECTS, DAILY_SCHEDULE } from '../data/sampleData';
import { fetchTasks, createTask, updateTask, deleteTask as apiDeleteTask } from '../lib/taskApi';
import { SparkleIcon } from './SparkleIcon';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Plus,
  Check,
  AlertCircle,
  Lock,
  LogOut,
  User as UserIcon,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface DashboardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardPreviewModal: React.FC<DashboardPreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, session, loading: authLoading, openAuthModal, signOut } = useAuth();

  const [taskState, setTaskState] = useState<{ ownerId: string | null; items: Task[] }>({
    ownerId: null, items: [],
  });
  // Never render a previous account's tasks, even during the first render after login switching.
  const tasks = user && taskState.ownerId === user.id ? taskState.items : [];
  const currentOwner = useRef(user?.id ?? null);
  const currentToken = useRef(session?.access_token ?? null);
  currentOwner.current = user?.id ?? null;
  currentToken.current = session?.access_token ?? null;
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tasks' | 'schedule' | 'planner'>('tasks');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('MATH 204');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDue, setNewTaskDue] = useState('');

  // A new or signed-out session cannot display or overwrite another student's tasks.
  useEffect(() => {
    let cancelled = false;
    setSelectedSubject('all');
    setNewTaskTitle('');
    setNewTaskDue('');
    setSavingTask(false);
    setBusyTaskId(null);
    setTaskError(null);
    if (!user || !session) {
      setTaskState({ ownerId: null, items: [] });
      setLoadingTasks(false);
      return;
    }

    const ownerId = user.id;
    const accessToken = session.access_token;
    setTaskState({ ownerId, items: [] });
    setLoadingTasks(true);
    fetchTasks(accessToken)
      .then((items) => {
        if (!cancelled && currentOwner.current === ownerId && currentToken.current === accessToken) {
          setTaskState({ ownerId, items });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && currentOwner.current === ownerId && currentToken.current === accessToken) {
          setTaskError(err instanceof Error ? err.message : 'Unable to load tasks.');
        }
      })
      .finally(() => {
        if (!cancelled && currentOwner.current === ownerId && currentToken.current === accessToken) {
          setLoadingTasks(false);
        }
      });
    return () => { cancelled = true; };
  }, [user?.id, session?.access_token]);

  if (!isOpen) return null;

  const toggleTask = async (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task || !session || !user || busyTaskId || savingTask || loadingTasks) return;
    const ownerId = user.id;
    const accessToken = session.access_token;
    setBusyTaskId(id);
    setTaskError(null);
    try {
      const saved = await updateTask(accessToken, id, { completed: !task.completed });
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskState((prev) => prev.ownerId === ownerId ? {
          ownerId, items: prev.items.map((item) => item.id === id ? saved : item),
        } : prev);
      }
    } catch (err) {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskError(err instanceof Error ? err.message : 'Unable to update task.');
      }
    } finally {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setBusyTaskId(null);
      }
    }
  };

  const removeTask = async (id: string) => {
    if (!session || !user || busyTaskId || savingTask || loadingTasks) return;
    const ownerId = user.id;
    const accessToken = session.access_token;
    setBusyTaskId(id);
    setTaskError(null);
    try {
      await apiDeleteTask(accessToken, id);
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskState((prev) => prev.ownerId === ownerId ? {
          ownerId, items: prev.items.filter((item) => item.id !== id),
        } : prev);
      }
    } catch (err) {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskError(err instanceof Error ? err.message : 'Unable to delete task.');
      }
    } finally {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setBusyTaskId(null);
      }
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !session || !user || savingTask || busyTaskId || loadingTasks) return;
    const ownerId = user.id;
    const accessToken = session.access_token;
    setSavingTask(true);
    setTaskError(null);
    try {
      const saved = await createTask(accessToken, {
        title: newTaskTitle.trim(),
        subject: newTaskSubject,
        priority: newTaskPriority,
        ...(newTaskDue ? { due: newTaskDue } : {}),
      });
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskState((prev) => prev.ownerId === ownerId ? {
          ownerId, items: [saved, ...prev.items],
        } : prev);
        setNewTaskTitle('');
        setNewTaskDue('');
      }
    } catch (err) {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskError(err instanceof Error ? err.message : 'Unable to create task.');
      }
    } finally {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setSavingTask(false);
      }
    }
  };

  const filteredTasks =
    selectedSubject === 'all'
      ? tasks
      : tasks.filter((t) => t.subject === selectedSubject);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Student Task Manager Dashboard"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0e0e16] border border-violet-500/30 text-white shadow-2xl overflow-hidden">
        
        {/* Supabase Auth & Backend Boundary Notice Banner */}
        <div className="px-5 py-2.5 bg-violet-950/80 border-b border-violet-800/40 flex flex-wrap items-center justify-between gap-2 text-xs text-violet-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-violet-400 shrink-0" />
            <span>
              {user ? (
                <>
                  Authenticated as <strong className="text-white">{user.email}</strong> · Tasks securely sync through FastAPI and Supabase RLS.
                </>
              ) : (
                <>
                  Protected Workspace · Sign in with Supabase Auth to access your account.
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-700/50 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Supabase Auth Active</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/70 border border-amber-700/50 px-2 py-0.5 rounded">
                Login Required
              </span>
            )}
          </div>
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md">
              <SparkleIcon size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Student Dashboard</h2>
              <p className="text-xs text-slate-400">
                {user ? `Personal study workspace for ${user.email}` : 'Protected Student Area'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* View Switcher Tabs (Only shown when authenticated) */}
                <div className="hidden sm:flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'tasks' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tasks ({tasks.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'schedule' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Daily Schedule
                  </button>
                  <button
                    onClick={() => setActiveTab('planner')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'planner' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Study Plan
                  </button>
                </div>

                {/* Sign out button */}
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-white/10 transition-colors cursor-pointer"
                  title="Sign out of Supabase Auth"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              aria-label="Close dashboard modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PROTECTED STATE: Signed-out view (Requirement: signed-out users should see login) */}
        {authLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            <p className="text-sm text-slate-400">Verifying Supabase authentication session...</p>
          </div>
        ) : !user ? (
          <div className="flex-1 overflow-y-auto p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-violet-600/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-lg shadow-violet-600/10">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-violet-400">
                Authentication Required
              </span>
              <h3 className="text-2xl font-light text-white tracking-tight">
                Sign in to your student dashboard
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Your personal tasks, semester timetable, and progress logs are protected by Supabase Auth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="w-full sm:flex-1 py-3 px-5 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <span>Sign in with Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="w-full sm:flex-1 py-3 px-5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <span>Create new account</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 w-full text-xs text-slate-500 space-y-1">
              <p>Demo showcase cards on the home page remain accessible without login.</p>
              <p className="text-[11px] text-slate-600">
                Connected to project: <span className="font-mono text-slate-500">ojrkktrfjbigmgkserfl.supabase.co</span>
              </p>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED USER DASHBOARD CONTENT */
          <>
            {/* Mobile Tabs */}
            <div className="sm:hidden flex border-b border-white/10 px-4 py-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3 py-1.5 rounded-lg ${activeTab === 'tasks' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-3 py-1.5 rounded-lg ${activeTab === 'schedule' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
              >
                Schedule
              </button>
              <button
                onClick={() => setActiveTab('planner')}
                className={`px-3 py-1.5 rounded-lg ${activeTab === 'planner' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
              >
                Study Plan
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Backend boundary explanation banner */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3 text-xs text-slate-300">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <UserIcon className="w-3.5 h-3.5 text-violet-400" />
                        <span>Student Account: {user.email}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        The database table <code className="font-mono text-violet-300 bg-white/5 px-1 py-0.5 rounded">public.tasks</code> with RLS is configured. Your tasks are loaded from Supabase through FastAPI. Each user can access only their own tasks.
                      </p>
                    </div>
                  </div>

                  {/* Add Task Input Form */}
                  <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Add Task to Workspace
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="e.g., Read Chapter 4 on Neural Networks..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      />
                      <select
                        value={newTaskSubject}
                        onChange={(e) => setNewTaskSubject(e.target.value)}
                        className="bg-[#1a1a26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                      >
                        {SAMPLE_SUBJECTS.map((s) => (
                          <option key={s.id} value={s.code} className="bg-[#1a1a26]">
                            {s.code}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                        className="bg-[#1a1a26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="high" className="bg-[#1a1a26]">High</option>
                        <option value="medium" className="bg-[#1a1a26]">Medium</option>
                        <option value="low" className="bg-[#1a1a26]">Low</option>
                      </select>
                      <input
                        type="date"
                        aria-label="Optional task due date"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                        className="bg-[#1a1a26] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <button
                        type="submit"
                        disabled={savingTask || Boolean(busyTaskId) || loadingTasks}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{savingTask ? 'Saving...' : 'Add'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Subject Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-400 text-xs shrink-0">Filter:</span>
                    <button
                      onClick={() => setSelectedSubject('all')}
                      className={`px-3 py-1 rounded-full transition-colors shrink-0 ${
                        selectedSubject === 'all'
                          ? 'bg-white text-slate-900 font-semibold'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      All Courses
                    </button>
                    {SAMPLE_SUBJECTS.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubject(sub.code)}
                        className={`px-3 py-1 rounded-full transition-colors shrink-0 ${
                          selectedSubject === sub.code
                            ? 'bg-violet-600 text-white font-medium'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {sub.code}
                      </button>
                    ))}
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2">
                    {loadingTasks && <p className="text-xs text-slate-400">Loading your tasks...</p>}
                    {taskError && <p role="alert" className="text-xs text-rose-300">{taskError}</p>}
                    {!loadingTasks && !taskError && tasks.length === 0 && (
                      <p className="text-xs text-slate-400">No tasks yet. Add your first one above.</p>
                    )}
                    {!loadingTasks && !taskError && tasks.length > 0 && filteredTasks.length === 0 && (
                      <p className="text-xs text-slate-400">No tasks match this subject.</p>
                    )}
                    {!loadingTasks && filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          task.completed
                            ? 'bg-white/[0.02] border-white/5 text-slate-500'
                            : 'bg-white/[0.05] border-white/10 hover:border-violet-500/40 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                              task.completed
                                ? 'bg-violet-600 border-violet-500 text-white'
                                : 'border-slate-500'
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span
                              className={`text-sm block tracking-tight ${
                                task.completed ? 'line-through text-slate-500' : 'font-medium'
                              }`}
                            >
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>{task.subject}</span>
                              <span>·</span>
                              <span>{task.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">

                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                              task.priority === 'high'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40'
                                : task.priority === 'medium'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <button
                            type="button"
                            disabled={busyTaskId === task.id}
                            onClick={(event) => { event.stopPropagation(); void removeTask(task.id); }}
                            aria-label={`Delete ${task.title}`}
                            className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-300 disabled:opacity-40"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Summary */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs text-slate-300">
                    <span>
                      Completion: <strong className="text-white">{completedCount}</strong> of {tasks.length}
                    </span>
                    <span className="font-mono text-violet-400">
                      {tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}% Complete
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Sample Daily Schedule (demo)</h3>
                    <span className="text-xs text-slate-400 font-mono">Today: 4h 45m scheduled</span>
                  </div>
                  <div className="space-y-3">
                    {DAILY_SCHEDULE.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-violet-300 w-16">{item.time}</span>
                          <div>
                            <div className="text-sm font-medium text-slate-100">{item.taskTitle}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{item.subjectCode}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                          {item.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: STUDY PLAN (Explicitly "Coming soon" as instructed) */}
              {activeTab === 'planner' && (
                <div className="p-8 rounded-3xl bg-white/[0.03] border border-violet-500/20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center mx-auto">
                    <SparkleIcon size={20} className="text-violet-300" />
                  </div>
                  <div>
                    <span className="inline-block text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full mb-2">
                      Coming soon
                    </span>
                    <h3 className="text-xl font-light text-white">
                      Python AI Study Planner Engine
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Adaptive study planning endpoint will automatically distribute problem sets, active recall decks, and practice tests across open calendar gaps. Integration with the Python/FastAPI backend is pending.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-[#09090f] flex items-center justify-between text-xs text-slate-400">
          <span>
            {user ? `Connected: ${user.email}` : 'Supabase Auth Protected'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
          >
            Back to page
          </button>
        </div>

      </div>
    </div>
  );
};
