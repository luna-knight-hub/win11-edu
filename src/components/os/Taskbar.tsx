import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { LayoutGrid, Wifi, Volume2, Battery } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export const Taskbar: React.FC = () => {
  const { toggleStartMenu, isStartMenuOpen, windows, activeWindowId, focusWindow, minimizeWindow } = useOSStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-xl border-t border-white/20 flex items-center justify-between px-4 z-50">
      {/* Left Spacer (for centering) */}
      <div className="flex-1"></div>

      {/* Center Icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleStartMenu}
          className={clsx(
            "p-2 rounded-md transition-all duration-200 hover:bg-white/50 active:scale-95",
            isStartMenuOpen && "bg-white/60 shadow-sm"
          )}
        >
          <LayoutGrid size={24} className="text-blue-600 fill-blue-600" />
        </button>

        {/* Open Apps */}
        {windows.map((window) => (
          <button
            key={window.id}
            onClick={() => {
              if (activeWindowId === window.id && !window.isMinimized) {
                minimizeWindow(window.id);
              } else {
                focusWindow(window.id);
              }
            }}
            className={clsx(
              "relative p-2 rounded-md transition-all duration-200 hover:bg-white/50 active:scale-95 group",
              activeWindowId === window.id && !window.isMinimized && "bg-white/60 shadow-sm"
            )}
          >
            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">
              {window.title[0]}
            </div>
            {/* Active Indicator */}
            {!window.isMinimized && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-blue-500 rounded-full mb-1" />
            )}
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {window.title}
            </div>
          </button>
        ))}
      </div>

      {/* Right System Tray */}
      <div className="flex-1 flex justify-end items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 hover:bg-white/50 rounded-md transition-colors cursor-default">
          <Wifi size={16} />
          <Volume2 size={16} />
          <Battery size={16} />
        </div>
        <div className="flex flex-col items-end px-2 py-1 hover:bg-white/50 rounded-md transition-colors cursor-default text-right">
          <span className="text-xs font-medium">{format(time, 'h:mm aa')}</span>
          <span className="text-[10px] text-gray-600">{format(time, 'M/d/yyyy')}</span>
        </div>
      </div>
    </div>
  );
};
