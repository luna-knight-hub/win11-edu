import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useOSStore();

  return (
    <div className="absolute bottom-16 right-4 flex flex-col gap-2 z-[100] pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="w-80 bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-4 pointer-events-auto flex gap-3"
          >
            <div className="mt-1">
              <Bell size={20} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm text-gray-800">{notification.title}</h4>
                <button 
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
