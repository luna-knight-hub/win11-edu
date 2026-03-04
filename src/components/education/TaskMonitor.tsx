import React, { useEffect } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useOSStore } from '../../store/useOSStore';
import { useFileSystemStore } from '../../store/useFileSystemStore';

export const TaskMonitor: React.FC = () => {
  const { completeTask } = useTaskStore();
  const { windows, wallpaper } = useOSStore();
  const { items } = useFileSystemStore();

  useEffect(() => {
    // Task 1: Open File Explorer
    if (windows.some(w => w.component === 'FileExplorer')) {
      completeTask('task-1');
    }

    // Task 2: Create a Folder named "MyWork"
    if (items.some(i => i.name === 'MyWork' && i.type === 'folder')) {
      completeTask('task-2');
    }

    // Task 3: Create a Text File named "Note.txt" on Desktop
    if (items.some(i => i.name === 'Note.txt' && i.parentId === 'desktop')) {
      completeTask('task-3');
    }

    // Task 4: Change Wallpaper
    if (wallpaper !== 'https://picsum.photos/seed/windows11/1920/1080') {
      completeTask('task-4');
    }

    // Task 5: Open Word
    if (windows.some(w => w.component === 'Word')) {
      completeTask('task-5');
    }

    // Task 6: Create a Word Document
    if (items.some(i => i.name.endsWith('.docx'))) {
      completeTask('task-6');
    }

    // Task 7: Open Calculator
    if (windows.some(w => w.component === 'Calculator')) {
      completeTask('task-7');
    }

    // Task 8: Open Paint
    if (windows.some(w => w.component === 'Paint')) {
      completeTask('task-8');
    }

    // Task 9: Maximize a Window
    if (windows.some(w => w.isMaximized)) {
      completeTask('task-9');
    }

  }, [windows, items, wallpaper, completeTask]);

  return null;
};
