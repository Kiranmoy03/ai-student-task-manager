import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Priority, StudyPlan } from '../types/student';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask as apiDeleteTask,
  fetchStudyPlan,
} from '../lib/taskApi';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ListTodo,
  Sparkles,
  Settings,
  LogOut,
  Plus,
  Check,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Menu,
  X,
  BookOpen,
  TrendingUp,
  Flame,
  Lightbulb,
} from 'lucide-react';

interface DashboardViewProps {
  onViewLanding: () => void;
  initialTab?: 'dashboard' | 'tasks' | 'planner' | 'settings';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onViewLanding,
  initialTab = 'dashboard',
}) => {
  const { user, session, signOut, openAuthModal } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'planner' | 'settings'>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Task State (isolated per authenticated user session)
  const [taskState, setTaskState] = useState<{ ownerId: string | null; items: Task[] }>({
    ownerId: null,
    items: [],
  });
  const tasks = user && taskState.ownerId === user.id ? taskState.items : [];
  const currentOwner = useRef(user?.id ?? null);
  const currentToken = useRef(session?.access_token ?? null);
  currentOwner.current = user?.id ?? null;
  currentToken.current = session?.access_token ?? null;

  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Add Task Modal / Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDue, setNewTaskDue] = useState('');

  // AI Smart Study Planner State
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Sync initial tab if provided
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Reusable task loader with retry support
  const loadTasks = React.useCallback(async () => {
    if (!user || !session) {
      setTaskState({ ownerId: null, items: [] });
      setLoadingTasks(false);
      return;
    }

    const ownerId = user.id;
    const accessToken = session.access_token;
    setTaskError(null);
    setLoadingTasks(true);

    try {
      const items = await fetchTasks(accessToken);
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskState({ ownerId, items });
      }
    } catch (err: unknown) {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskError(err instanceof Error ? err.message : 'Unable to load tasks.');
      }
    } finally {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setLoadingTasks(false);
      }
    }
  }, [user, session]);

  // Fetch tasks on user / session change
  useEffect(() => {
    setTaskError(null);
    setStudyPlan(null);
    setGeneratingPlan(false);
    setPlanError(null);
    loadTasks();
  }, [user?.id, session?.access_token, loadTasks]);

  // Dynamic unique subjects from the student's actual tasks (never hardcoded)
  const existingSubjects = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.subject && t.subject.trim()) {
        set.add(t.subject.trim());
      }
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Derived metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityPendingCount = tasks.filter((t) => !t.completed && t.priority === 'high').length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Toggle completion
  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || !session || !user || busyTaskId || savingTask || loadingTasks) return;

    const ownerId = user.id;
    const accessToken = session.access_token;
    setBusyTaskId(id);
    setTaskError(null);

    try {
      const updated = await updateTask(accessToken, id, { completed: !task.completed });
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskState((prev) =>
          prev.ownerId === ownerId
            ? {
                ownerId,
                items: prev.items.map((item) => (item.id === id ? updated : item)),
              }
            : prev
        );
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

  // Remove task
  const handleRemoveTask = async (id: string) => {
    if (!session || !user || busyTaskId || savingTask || loadingTasks) return;

    const ownerId = user.id;
    const accessToken = session.access_token;
    setBusyTaskId(id);
    setTaskError(null);

    try {
      await apiDeleteTask(accessToken, id);
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskState((prev) =>
          prev.ownerId === ownerId
            ? {
                ownerId,
                items: prev.items.filter((item) => item.id !== id),
              }
            : prev
        );
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

  // Add task (free-text subject input!)
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !session || !user || savingTask || busyTaskId || loadingTasks) return;

    const ownerId = user.id;
    const accessToken = session.access_token;
    const subjectToSave = newTaskSubject.trim() || 'General';

    setSavingTask(true);
    setTaskError(null);

    try {
      const created = await createTask(accessToken, {
        title: newTaskTitle.trim(),
        subject: subjectToSave,
        priority: newTaskPriority,
        ...(newTaskDue ? { due: newTaskDue } : {}),
      });

      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setTaskState((prev) =>
          prev.ownerId === ownerId ? { ownerId, items: [created, ...prev.items] } : prev
        );
        setNewTaskTitle('');
        setNewTaskSubject('');
        setNewTaskDue('');
        setIsAddModalOpen(false);
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

  // Generate AI study plan
  const handleGenerateStudyPlan = async () => {
    if (!session?.access_token || !user || generatingPlan) return;

    const ownerId = user.id;
    const accessToken = session.access_token;
    setGeneratingPlan(true);
    setPlanError(null);

    try {
      const plan = await fetchStudyPlan(accessToken);
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setStudyPlan(plan);
      }
    } catch (err: unknown) {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setPlanError(err instanceof Error ? err.message : 'Unable to generate study plan.');
      }
    } finally {
      if (currentOwner.current === ownerId && currentToken.current === accessToken) {
        setGeneratingPlan(false);
      }
    }
  };

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject) return false;
      }
      // Subject filter
      if (selectedSubject !== 'all' && t.subject !== selectedSubject) {
        return false;
      }
      // Priority filter
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
        return false;
      }
      // Status filter
      if (statusFilter === 'pending' && t.completed) return false;
      if (statusFilter === 'completed' && !t.completed) return false;

      return true;
    });
  }, [tasks, searchQuery, selectedSubject, selectedPriority, statusFilter]);

  // Upcoming deadlines sorted
  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((t) => !t.completed)
      .sort((a, b) => {
        if (!a.dueDate || a.dueDate === 'No deadline') return 1;
        if (!b.dueDate || b.dueDate === 'No deadline') return -1;
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 5);
  }, [tasks]);

  const studentName = user?.email?.split('@')[0] || 'Student';

  return (
    <div className="min-h-screen bg-[#09090D] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0C0C12] border-b border-white/[0.08] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-white">TaskFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-1.5 rounded-lg bg-violet-600 text-white text-xs"
            title="Add task"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* SIDEBAR (Desktop & Mobile Drawer) */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-[#0C0C12] border-r border-white/[0.06] p-4 shrink-0 fixed md:sticky top-0 h-auto md:h-screen z-20`}
      >
        {/* Brand */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-4 mb-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-white tracking-tight leading-tight">TaskFlow</h1>
            <p className="text-[10px] text-slate-400">Student Workspace</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-violet-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('tasks');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-violet-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ListTodo className="w-4 h-4" />
              <span>My Tasks</span>
            </div>
            {pendingCount > 0 && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  activeTab === 'tasks' ? 'bg-violet-800 text-white' : 'bg-white/[0.06] text-slate-300'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('planner');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-violet-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Study Planner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-violet-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Profile</span>
          </button>
        </nav>

        {/* Bottom Profile Card */}
        <div className="pt-4 mt-auto border-t border-white/[0.06] space-y-2">
          {user ? (
            <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                  {studentName[0] || 'S'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{studentName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="px-3 py-2.5 rounded-xl bg-violet-950/30 border border-violet-500/20 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-violet-200">Guest Student</p>
                <p className="text-[10px] text-slate-400">Sign in to sync tasks</p>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1 rounded-lg text-xs bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors cursor-pointer shrink-0"
              >
                Sign In
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onViewLanding}
            className="w-full py-1.5 text-center text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Public Landing Page</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 max-w-6xl w-full mx-auto space-y-8">
        {/* Global Error Banner */}
        {taskError && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-300">
            <div className="flex items-start gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <span className="font-semibold text-rose-200">Cannot reach the task API</span>
                <p className="text-rose-300/90 leading-relaxed text-[11px] break-words">{taskError}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => loadTasks()}
                disabled={loadingTasks}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-100 font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTasks ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => setTaskError(null)}
                className="text-rose-400 hover:text-white px-2 py-1 text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD (OVERVIEW) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Welcome back, {studentName} 👋
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  ·{' '}
                  {taskError ? (
                    <span className="text-rose-400 font-medium">Task sync unavailable</span>
                  ) : pendingCount === 0 ? (
                    'All caught up for today!'
                  ) : (
                    `${pendingCount} tasks pending`
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-900/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Row (3 cards: Total Tasks, Pending Tasks, Completed Tasks) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Tasks */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12121A] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Total Tasks</span>
                  <BookOpen className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {taskError ? '—' : totalCount}
                </div>
                <p className="text-[11px] text-slate-500">
                  {taskError ? 'Coursework unavailable' : 'In your academic roster'}
                </p>
              </div>

              {/* Pending Tasks */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12121A] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Pending Tasks</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-tight">
                  {taskError ? '—' : pendingCount}
                </div>
                <p className="text-[11px] text-slate-500">
                  {taskError ? 'Connection needed' : 'Requiring focus'}
                </p>
              </div>

              {/* Completed Tasks */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12121A] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-medium">Completed Tasks</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
                  {taskError ? '—' : completedCount}
                </div>
                <p className="text-[11px] text-slate-500">
                  {taskError ? 'Data unavailable' : `${completionPercentage}% completion rate`}
                </p>
              </div>
            </div>

            {/* Compact Task Completion Progress */}
            <div className="p-4 rounded-xl bg-[#12121A] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-semibold text-white">Coursework Progress</span>
                </div>
                <span className="font-mono text-xs text-violet-300 font-semibold">
                  {taskError ? 'Unavailable' : `${completionPercentage}% (${completedCount}/${totalCount} completed)`}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${taskError ? 0 : completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Two Column Grid: Upcoming Deadlines & AI Planner Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 cols): Upcoming Deadlines */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span>Upcoming Deadlines</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs text-violet-300 hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View all tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {loadingTasks ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" />
                    Loading coursework...
                  </div>
                ) : taskError ? (
                  <div className="p-8 rounded-2xl bg-[#12121A] border border-rose-900/30 text-center space-y-3">
                    <AlertCircle className="w-7 h-7 text-rose-400 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-white">Cannot Load Deadlines</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Unable to connect to the task API. Check your connection or backend configuration.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadTasks()}
                      disabled={loadingTasks}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingTasks ? 'animate-spin' : ''}`} />
                      <span>Retry Connection</span>
                    </button>
                  </div>
                ) : upcomingDeadlines.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#12121A] border border-white/[0.06] text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-medium text-white">No upcoming deadlines</p>
                    <p className="text-xs text-slate-400">You are all caught up on your assignments!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcomingDeadlines.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-[#12121A] border border-white/[0.06] hover:border-violet-500/30 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            disabled={busyTaskId === task.id}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              task.completed
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : 'border-white/20 hover:border-violet-400'
                            }`}
                          >
                            {busyTaskId === task.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-violet-300" />
                            ) : task.completed ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : null}
                          </button>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${
                                task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="text-violet-300 font-medium">{task.subject}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {task.dueDate || 'No deadline'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md ${
                              task.priority === 'high'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                : task.priority === 'medium'
                                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                                : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column (1 col): AI Planner Snapshot Card */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>AI Study Assistant</span>
                </h3>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/40 via-[#12121A] to-purple-950/20 border border-violet-500/20 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-white">Optimize Your Study Flow</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {studyPlan
                        ? studyPlan.summary
                        : 'Evaluates task priorities and deadlines to build an efficient, step-by-step study sequence with strategic focus blocks.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('planner')}
                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{studyPlan ? 'View Active Plan' : 'Generate Study Plan'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header with Title and Add Task button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">My Tasks</h2>
                <p className="text-xs text-slate-400">
                  Manage all course assignments, problem sets, and deadlines.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-900/20 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-[#12121A] border border-white/[0.06] space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks or subjects..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Subject Selector (Dynamic from student's tasks) */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="all" className="bg-[#12121A] text-white">
                    All Subjects ({tasks.length})
                  </option>
                  {existingSubjects.map((sub) => (
                    <option key={sub} value={sub} className="bg-[#12121A] text-white">
                      {sub} ({tasks.filter((t) => t.subject === sub).length})
                    </option>
                  ))}
                </select>

                {/* Priority Selector */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="all" className="bg-[#12121A] text-white">
                    All Priorities
                  </option>
                  <option value="high" className="bg-[#12121A] text-white">
                    High Priority
                  </option>
                  <option value="medium" className="bg-[#12121A] text-white">
                    Medium Priority
                  </option>
                  <option value="low" className="bg-[#12121A] text-white">
                    Low Priority
                  </option>
                </select>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === 'pending'
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === 'completed'
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>

            {/* Task List */}
            {loadingTasks ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-violet-400" />
                <span>Loading your tasks...</span>
              </div>
            ) : taskError ? (
              <div className="p-12 rounded-2xl bg-[#12121A] border border-rose-900/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-semibold text-white">Cannot Reach Task API</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {taskError}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => loadTasks()}
                    disabled={loadingTasks}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingTasks ? 'animate-spin' : ''}`} />
                    <span>Retry Connection</span>
                  </button>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#12121A] border border-white/[0.06] text-center space-y-3">
                <ListTodo className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-medium text-white">No tasks match your criteria</p>
                <p className="text-xs text-slate-400">
                  Try adjusting filters or click below to add a new task.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-[#12121A] border border-white/[0.06] hover:border-violet-500/30 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        disabled={busyTaskId === task.id}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          task.completed
                            ? 'bg-violet-600 border-violet-600 text-white'
                            : 'border-white/20 hover:border-violet-400'
                        }`}
                        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {busyTaskId === task.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-violet-300" />
                        ) : task.completed ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : null}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="text-violet-300 font-medium">{task.subject}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {task.dueDate || 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md ${
                          task.priority === 'high'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                            : task.priority === 'medium'
                            ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveTask(task.id)}
                        disabled={busyTaskId === task.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI STUDY PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Generate Button */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-[#12121A] border border-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">AI Smart Study Planner</h2>
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Synthesizes your pending assignments into an optimal study order with strategic focus time estimates and cognitive breaks.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateStudyPlan}
                disabled={generatingPlan || loadingTasks || Boolean(taskError)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-violet-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {generatingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Plan...</span>
                  </>
                ) : studyPlan ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Study Plan</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Study Plan</span>
                  </>
                )}
              </button>
            </div>

            {/* If task API is disconnected */}
            {taskError && (
              <div className="p-5 rounded-2xl bg-[#12121A] border border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-300">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-200">Coursework Sync Unavailable</span>
                    <p className="text-rose-300/80 mt-0.5">
                      FastAPI tasks could not be loaded. Reconnect to generate an accurate study sequence.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => loadTasks()}
                  disabled={loadingTasks}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-100 font-medium transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTasks ? 'animate-spin' : ''}`} />
                  <span>Retry Tasks</span>
                </button>
              </div>
            )}

            {/* Error Message */}
            {planError && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex items-start justify-between gap-3 text-xs text-rose-300">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-200">Unable to generate plan</span>
                    <p className="text-rose-300/90 mt-0.5">{planError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateStudyPlan}
                  className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-100 text-xs font-medium shrink-0 transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {generatingPlan && (
              <div className="p-10 rounded-2xl bg-[#12121A] border border-white/[0.06] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400 animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">Crafting your personalized study plan...</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Evaluating assignment priorities, deadlines, and optimal study blocks.
                  </p>
                </div>
              </div>
            )}

            {/* If no plan and not generating */}
            {!generatingPlan && !studyPlan && (
              <div className="p-10 rounded-2xl bg-[#12121A] border border-white/[0.06] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">Ready to plan your study session?</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click "Generate Study Plan" above to analyze your {pendingCount} pending tasks and get an evidence-based roadmap.
                  </p>
                </div>
                {pendingCount === 0 && (
                  <p className="text-xs text-amber-300/90 italic">
                    Note: You currently have 0 pending tasks. Add coursework in "My Tasks" first for best results.
                  </p>
                )}
              </div>
            )}

            {/* Display Generated Plan */}
            {!generatingPlan && studyPlan && (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="p-5 rounded-2xl bg-[#12121A] border border-violet-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalized Strategy Summary</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{studyPlan.summary}</p>
                </div>

                {/* Empty Plan Tasks fallback */}
                {studyPlan.tasks.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#12121A] border border-white/[0.06] text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h3 className="text-sm font-semibold text-white">All Caught Up!</h3>
                    <p className="text-xs text-slate-400">
                      No incomplete tasks require scheduling right now. Great job keeping your syllabus on track!
                    </p>
                  </div>
                ) : (
                  /* Ordered Task Cards */
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                      Recommended Study Order ({studyPlan.tasks.length} Focus Blocks)
                    </h3>
                    <div className="space-y-3">
                      {studyPlan.tasks.map((item, idx) => (
                        <div
                          key={item.task_id || idx}
                          className="p-5 rounded-2xl bg-[#12121A] border border-white/[0.06] hover:border-violet-500/30 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-mono font-bold shrink-0 mt-0.5">
                                {String(item.order || idx + 1).padStart(2, '0')}
                              </span>
                              <div>
                                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  <span className="text-violet-300 font-medium">{item.subject}</span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    {item.due || 'No deadline'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono font-semibold text-violet-300 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {item.duration_minutes}m block
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300 leading-relaxed">
                            <span className="text-slate-400 font-medium">Why now: </span>
                            {item.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Study Tips */}
                {studyPlan.study_tips && studyPlan.study_tips.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#12121A] border border-white/[0.06] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Evidence-Based Study Tips for Today</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {studyPlan.study_tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300 leading-relaxed"
                        >
                          <span className="text-amber-400 font-bold mr-1.5">0{idx + 1}.</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS & PROFILE */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">Settings & Profile</h2>
              <p className="text-xs text-slate-400">Manage your student account and workspace preferences.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#12121A] border border-white/[0.06] space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold uppercase shadow-lg">
                  {studentName[0] || 'S'}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{studentName}</h3>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Authenticated Session
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.06] text-xs">
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">Authentication Provider</span>
                  <span className="text-slate-200 font-medium">Supabase Auth (JWT)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">Backend Task API</span>
                  <span className="text-slate-200 font-medium">FastAPI REST Engine</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">Task API Status</span>
                  <span className={`font-medium ${taskError ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {taskError ? 'Disconnected' : 'Connected'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">AI Planner</span>
                  <span className="text-violet-300 font-medium">Adaptive Study Sequence</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Data Storage Isolation</span>
                  <span className="text-emerald-400 font-medium">Row-Level Security (RLS)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  type="button"
                  onClick={onViewLanding}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  View Public Landing Page
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD TASK MODAL (Clean, with free-text Subject input) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#12121A] border border-white/10 p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Add New Task</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Read Chapter 4 on Thermodynamics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Custom Subject Input (Free text input!) */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Course / Subject * <span className="text-[11px] text-slate-500 font-normal">(Type any subject)</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  placeholder="e.g. BIO 140, Linear Algebra, Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
                {/* Existing subject suggestion chips */}
                {existingSubjects.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-500">Quick select:</span>
                    {existingSubjects.slice(0, 5).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setNewTaskSubject(sub)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-violet-600/30 text-slate-300 hover:text-violet-200 border border-white/5 transition-colors cursor-pointer"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#161622] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask || !newTaskTitle.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingTask ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
