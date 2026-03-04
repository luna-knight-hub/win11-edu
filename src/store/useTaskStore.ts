import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  checkCondition: (state: any) => boolean; // This will need to be evaluated in components
}

interface TaskStore {
  tasks: Task[];
  completeTask: (id: string) => void;
  resetTasks: () => void;
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
}

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Open File Explorer',
    description: 'Click on the folder icon in the taskbar or Start menu to open File Explorer.',
    isCompleted: false,
    checkCondition: () => false, // Placeholder
  },
  {
    id: 'task-2',
    title: 'Create a Folder',
    description: 'Navigate to Documents and create a new folder named "MyWork".',
    isCompleted: false,
    checkCondition: () => false, // Placeholder
  },
  {
    id: 'task-3',
    title: 'Create a Text File',
    description: 'Open Notepad, write a note, and save it. It will be saved as "Note.txt" on your Desktop.',
    isCompleted: false,
    checkCondition: () => false, // Placeholder
  },
  {
    id: 'task-4',
    title: 'Change Wallpaper',
    description: 'Open Settings and change the desktop wallpaper.',
    isCompleted: false,
    checkCondition: () => false, // Placeholder
  },
  {
    id: 'task-5',
    title: 'Open Word',
    description: 'Launch the Word application from the Start Menu or Desktop.',
    isCompleted: false,
    checkCondition: () => false,
  },
  {
    id: 'task-6',
    title: 'Create a Word Document',
    description: 'Save a document in Word. It will be saved as a .docx file.',
    isCompleted: false,
    checkCondition: () => false,
  },
  {
    id: 'task-7',
    title: 'Open Calculator',
    description: 'Open the Calculator app to perform some math.',
    isCompleted: false,
    checkCondition: () => false,
  },
  {
    id: 'task-8',
    title: 'Open Paint',
    description: 'Launch Paint to draw something.',
    isCompleted: false,
    checkCondition: () => false,
  },
  {
    id: 'task-9',
    title: 'Maximize a Window',
    description: 'Click the maximize button on any window to make it full screen.',
    isCompleted: false,
    checkCondition: () => false,
  },
];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: initialTasks,
  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) => 
        t.id === id ? { ...t, isCompleted: true } : t
      ),
    }));
  },
  resetTasks: () => set({ tasks: initialTasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
}));
