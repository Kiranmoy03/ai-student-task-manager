import { Task, SubjectProgress, ScheduleBlock } from '../types/student';

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Linear Algebra problem set 4',
    subject: 'MATH 204',
    dueDate: 'Today',
    dueTime: '5:00 PM',
    estimatedMinutes: 90,
    priority: 'high',
    completed: false,
  },
  {
    id: 't-2',
    title: 'Cognitive Science: Attention models reading',
    subject: 'COG 110',
    dueDate: 'Today',
    dueTime: '8:30 PM',
    estimatedMinutes: 45,
    priority: 'medium',
    completed: true,
  },
  {
    id: 't-3',
    title: 'Biochemistry lab protocol draft',
    subject: 'BIO 140',
    dueDate: 'Tomorrow',
    dueTime: '11:59 PM',
    estimatedMinutes: 60,
    priority: 'high',
    completed: false,
  },
  {
    id: 't-4',
    title: 'Algorithms: Dynamic programming review',
    subject: 'CS 161',
    dueDate: 'Thursday',
    dueTime: '2:00 PM',
    estimatedMinutes: 75,
    priority: 'low',
    completed: false,
  },
];

export const SAMPLE_SUBJECTS: SubjectProgress[] = [
  {
    id: 's-1',
    name: 'Linear Algebra & Matrices',
    code: 'MATH 204',
    color: '#8b5cf6', // Vivid violet
    completedTasks: 8,
    totalTasks: 10,
    nextDeadline: 'Today 5:00 PM',
  },
  {
    id: 's-2',
    name: 'Cognitive Systems',
    code: 'COG 110',
    color: '#3b82f6', // Blue
    completedTasks: 6,
    totalTasks: 7,
    nextDeadline: 'Today 8:30 PM',
  },
  {
    id: 's-3',
    name: 'Molecular Biochemistry',
    code: 'BIO 140',
    color: '#10b981', // Emerald green
    completedTasks: 5,
    totalTasks: 9,
    nextDeadline: 'Tomorrow',
  },
  {
    id: 's-4',
    name: 'Design of Algorithms',
    code: 'CS 161',
    color: '#a855f7', // Purple
    completedTasks: 11,
    totalTasks: 12,
    nextDeadline: 'Thursday',
  },
];

export const DAILY_SCHEDULE: ScheduleBlock[] = [
  {
    time: '09:00 AM',
    taskTitle: 'Algorithm Lecture & Live Notes',
    subjectCode: 'CS 161',
    duration: '50m',
    completed: true,
  },
  {
    time: '11:15 AM',
    taskTitle: 'Problem Set 4: Eigenvalues & Proofs',
    subjectCode: 'MATH 204',
    duration: '90m',
    completed: false,
  },
  {
    time: '02:30 PM',
    taskTitle: 'Biochem Lab Pre-Experiment Check',
    subjectCode: 'BIO 140',
    duration: '45m',
    completed: false,
  },
  {
    time: '04:15 PM',
    taskTitle: 'Attention Models Literature Review',
    subjectCode: 'COG 110',
    duration: '60m',
    completed: false,
  },
];
