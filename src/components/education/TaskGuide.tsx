import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useOSStore } from '../../store/useOSStore';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export const TaskGuide: React.FC = () => {
  const { tasks, completeTask } = useTaskStore();
  const { isTaskGuideOpen, toggleTaskGuide } = useOSStore();

  // Mock checking logic - in a real app, this would subscribe to store changes
  // For now, we'll just let users click to complete to simulate the flow
  // or add simple checks based on OS state if possible.

  return (
    <AnimatePresence>
      {isTaskGuideOpen && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden z-[60]"
        >
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <h2 className="font-semibold">Learning Tasks</h2>
            <button onClick={toggleTaskGuide} className="hover:bg-blue-700 rounded p-1">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={clsx(
                  "p-3 rounded-lg border transition-all duration-200",
                  task.isCompleted 
                    ? "bg-green-50 border-green-200" 
                    : "bg-white border-gray-200 hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => completeTask(task.id)}
                    className={clsx(
                      "mt-1 transition-colors",
                      task.isCompleted ? "text-green-500" : "text-gray-300 hover:text-blue-500"
                    )}
                  >
                    {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <div>
                    <h3 className={clsx("font-medium text-sm", task.isCompleted && "text-gray-500 line-through")}>
                      {task.title}
                    </h3>
                    <p className={clsx("text-xs mt-1", task.isCompleted ? "text-gray-400" : "text-gray-600")}>
                      {task.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-center text-gray-500">
            Complete tasks to master Windows 11!
          </div>
        </motion.div>
      )}
      
      {!isTaskGuideOpen && (
        <button
          onClick={toggleTaskGuide}
          className="absolute top-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-[60]"
        >
          <CheckCircle2 size={24} />
        </button>
      )}
    </AnimatePresence>
  );
};
