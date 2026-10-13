export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  dueTime?: string;
  estimatedMinutes: number;
  priority: Priority;
  completed: boolean;
}

export interface SubjectProgress {
  id: string;
  name: string;
  code: string;
  color: string;
  completedTasks: number;
  totalTasks: number;
  nextDeadline: string;
}

export interface ScheduleBlock {
  time: string;
  taskTitle: string;
  subjectCode: string;
  duration: string;
  completed?: boolean;
}
