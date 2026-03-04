import React from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Search, Power, Settings, FileText, Image, Calculator, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const StartMenu: React.FC = () => {
  const { isStartMenuOpen, toggleStartMenu, openWindow } = useOSStore();

  const apps = [
    { id: 'explorer', name: 'File Explorer', icon: <LayoutGrid className="text-blue-500" />, component: 'FileExplorer' },
    { id: 'notepad', name: 'Notepad', icon: <FileText className="text-slate-600" />, component: 'Notepad' },
    { id: 'paint', name: 'Paint', icon: <Image className="text-purple-500" />, component: 'Paint' },
    { id: 'calculator', name: 'Calculator', icon: <Calculator className="text-orange-500" />, component: 'Calculator' },
    { id: 'settings', name: 'Settings', icon: <Settings className="text-gray-500" />, component: 'Settings' },
  ];

  return (
    <AnimatePresence>
      {isStartMenuOpen && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[640px] h-[700px] bg-white/85 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-50 flex flex-col overflow-hidden"
        >
          {/* Search Bar */}
          <div className="p-6 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Type here to search" 
                className="w-full bg-gray-100/50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Pinned Apps */}
          <div className="flex-1 p-6 pt-2 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Pinned</h3>
              <button className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded hover:bg-white">All apps &gt;</button>
            </div>
            
            <div className="grid grid-cols-6 gap-4">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    openWindow(app.id, app.name, 'app-icon', app.component);
                  }}
                  className="flex flex-col items-center gap-2 p-2 hover:bg-white/50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                    {app.icon}
                  </div>
                  <span className="text-xs text-gray-700 font-medium">{app.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Recommended</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 hover:bg-white/50 rounded-lg cursor-pointer">
                  <FileText size={16} className="text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-800">Welcome.txt</span>
                    <span className="text-xs text-gray-500">Recently added</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="h-16 bg-gray-100/50 border-t border-gray-200/50 flex items-center justify-between px-8">
            <div className="flex items-center gap-3 hover:bg-white/50 p-2 rounded-lg cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                S
              </div>
              <span className="text-sm font-medium text-gray-700">Student</span>
            </div>
            <button className="p-2 hover:bg-white/50 rounded-lg text-gray-600">
              <Power size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
