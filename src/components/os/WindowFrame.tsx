import React, { useRef } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useOSStore, WindowState } from '../../store/useOSStore';
import { clsx } from 'clsx';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window, children }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow } = useOSStore();
  const nodeRef = useRef(null);

  if (window.isMinimized) {
    return null;
  }

  return (
    <Rnd
      default={{
        x: window.x || 100,
        y: window.y || 50,
        width: window.width || 800,
        height: window.height || 600,
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="window-titlebar"
      enableResizing={!window.isMaximized}
      disableDragging={window.isMaximized}
      size={window.isMaximized ? { width: '100%', height: '100%' } : undefined}
      position={window.isMaximized ? { x: 0, y: 0 } : undefined}
      onDragStart={() => focusWindow(window.id)}
      onClick={() => focusWindow(window.id)}
      style={{ zIndex: window.zIndex }}
      className={clsx(
        "flex flex-col bg-white/90 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden border border-white/20 transition-shadow duration-200",
        window.isMaximized && "rounded-none border-none"
      )}
    >
      {/* Title Bar */}
      <div 
        className="window-titlebar h-10 flex items-center justify-between px-4 select-none bg-gray-100/50 border-b border-gray-200/50"
        onDoubleClick={() => maximizeWindow(window.id)}
      >
        <div className="flex items-center gap-2">
          {/* App Icon */}
          <span className="text-sm font-medium text-gray-700">{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id); }}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); maximizeWindow(window.id); }}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
          >
            {window.isMaximized ? <Square size={12} /> : <Maximize2 size={12} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(window.id); }}
            className="p-2 hover:bg-red-500 hover:text-white rounded-md transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col relative overflow-auto w-full h-full">
        {children}
      </div>
    </Rnd>
  );
};
