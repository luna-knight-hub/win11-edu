import { create } from 'zustand';

export type TaskType = 'quiz' | 'fill_blank' | 'drag_drop' | 'ai_response';

export interface Question {
  id: string;
  text: string;
  options?: string[]; // For quiz
  correctAnswer?: string | string[]; // For quiz/fill_blank
  media?: { type: 'image' | 'video' | 'audio', url: string };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  grade: number;
  subject: string;
  topic: string;
  type: TaskType;
  content: Question[];
  settings: {
    deadline?: string;
    points: number;
    rubric?: string;
  };
  createdAt: string;
}

export interface StudentProgress {
  id: string;
  taskId: string;
  studentId: string;
  status: 'assigned' | 'in_progress' | 'completed';
  score?: number;
  answers: Record<string, any>; // questionId -> answer
  feedback?: string;
  completedAt?: string;
}

interface LearningTaskStore {
  tasks: Task[];
  progress: StudentProgress[];
  
  // Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  submitProgress: (progress: StudentProgress) => void;
  updateProgress: (id: string, updates: Partial<StudentProgress>) => void;
  
  getTasksByGrade: (grade: number) => Task[];
  getTasksBySubject: (subject: string) => Task[];
  getProgressByStudent: (studentId: string) => StudentProgress[];
}

// Dummy Data
const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Fun with Fractions',
    description: 'Learn how to add simple fractions with common denominators.',
    grade: 5,
    subject: 'Math',
    topic: 'Fractions',
    type: 'quiz',
    content: [
      {
        id: 'q1',
        text: 'What is 1/4 + 2/4?',
        options: ['1/2', '3/4', '1/8', '3/8'],
        correctAnswer: '3/4',
        media: { type: 'image', url: 'https://picsum.photos/seed/fraction/300/200' }
      },
      {
        id: 'q2',
        text: 'Which fraction is larger?',
        options: ['1/3', '1/2'],
        correctAnswer: '1/2'
      }
    ],
    settings: { points: 10, deadline: '2023-12-31' },
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Solar System Adventure',
    description: 'Explore the planets in our solar system.',
    grade: 4,
    subject: 'Science',
    topic: 'Space',
    type: 'drag_drop', // Simplified for now as quiz
    content: [
      {
        id: 'q1',
        text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Mars',
        media: { type: 'image', url: 'https://picsum.photos/seed/mars/300/200' }
      }
    ],
    settings: { points: 5 },
    createdAt: new Date().toISOString()
  }
];

export const useLearningTaskStore = create<LearningTaskStore>((set, get) => ({
  tasks: initialTasks,
  progress: [],

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),

  submitProgress: (progress) => set((state) => ({
    progress: [...state.progress, progress]
  })),
  updateProgress: (id, updates) => set((state) => ({
    progress: state.progress.map((p) => (p.id === id ? { ...p, ...updates } : p))
  })),

  getTasksByGrade: (grade) => get().tasks.filter((t) => t.grade === grade),
  getTasksBySubject: (subject) => get().tasks.filter((t) => t.subject === subject),
  getProgressByStudent: (studentId) => get().progress.filter((p) => p.studentId === studentId),
}));
