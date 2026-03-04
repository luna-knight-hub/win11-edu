import React, { useState } from 'react';
import { useTaskStore, Task } from '../../store/useTaskStore';
import { useOSStore } from '../../store/useOSStore';
import { Plus, Trash2, Save, X, Edit2 } from 'lucide-react';

export const TaskGuideEditor: React.FC = () => {
  const { tasks, addTask, removeTask, completeTask } = useTaskStore();
  const { addNotification } = useOSStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
  });

  const handleAddTask = () => {
    if (!newTask.title || !newTask.description) {
      addNotification('Error', 'Please fill in both title and description.');
      return;
    }

    const task: Task = {
      id: `custom-task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      isCompleted: false,
      checkCondition: () => false, // Custom tasks are manually completed for now
    };

    addTask(task);
    setNewTask({ title: '', description: '' });
    setIsEditing(false);
    addNotification('Success', 'New task added to the guide.');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <span>Customize Task Guide</span>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
        )}
      </h3>

      {isEditing && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Open Calculator"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
              placeholder="Instructions for the student..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddTask}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group border border-transparent hover:border-gray-100">
            <div>
              <p className="font-medium text-sm">{task.title}</p>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{task.description}</p>
            </div>
            <button 
              onClick={() => removeTask(task.id)}
              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
              title="Remove Task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
