import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { useFileSystemStore } from '../../store/useFileSystemStore';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { WindowFrame } from './WindowFrame';
import { AppRegistry } from '../../apps/AppRegistry';
import { TaskGuide } from '../education/TaskGuide';

import { TaskMonitor } from '../education/TaskMonitor';

import { DesktopIcon } from './DesktopIcon';
import { LayoutGrid, FileText, Trash2, Monitor, FileCode, Presentation, Folder, RefreshCw, Settings, Plus, Eye, Grid, GraduationCap } from 'lucide-react';

import { NotificationToast } from './NotificationToast';

export const Desktop: React.FC = () => {
  const { wallpaper, windows, openWindow, addNotification } = useOSStore();
  const { getChildren, deleteItem, createItem } = useFileSystemStore();
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'desktop' | 'file'; fileId?: string } | null>(null);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const desktopFiles = getChildren('desktop');

  const systemIcons = [
    { id: 'this-pc', name: 'This PC', icon: <Monitor size={40} className="text-blue-200" />, action: () => openWindow('explorer', 'File Explorer', 'folder', 'FileExplorer') },
    { id: 'recycle-bin', name: 'Recycle Bin', icon: <Trash2 size={40} className="text-gray-300" />, action: () => openWindow('recycle-bin', 'Recycle Bin', 'trash', 'FileExplorer') },
    { id: 'word-app', name: 'Word', icon: <FileText size={40} className="text-blue-500" />, action: () => openWindow('word', 'Word', 'file-text', 'Word') },
    { id: 'powerpoint-app', name: 'PowerPoint', icon: <Presentation size={40} className="text-orange-500" />, action: () => openWindow('powerpoint', 'PowerPoint', 'presentation', 'PowerPoint') },
    { id: 'learning-tasks', name: 'Learning Tasks', icon: <GraduationCap size={40} className="text-indigo-500" />, action: () => openWindow('learning-tasks', 'Learning Tasks', 'graduation-cap', 'LearningTasks') },
  ];

  const handleFileOpen = (file: any) => {
    if (file.type === 'folder') {
      openWindow('explorer', file.name, 'folder', 'FileExplorer', { path: file.id });
    } else if (file.name.endsWith('.txt')) {
      openWindow('notepad', file.name, 'file-text', 'Notepad', { fileId: file.id });
    } else if (file.name.endsWith('.docx')) {
      openWindow('word', file.name, 'file-text', 'Word', { fileId: file.id });
    } else if (file.name.endsWith('.pptx')) {
      openWindow('powerpoint', file.name, 'presentation', 'PowerPoint', { fileId: file.id });
    } else {
      addNotification('System', 'No app associated with this file type.');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'file', fileId });
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'desktop' });
  };

  const handleDeleteFile = (fileId: string) => {
    deleteItem(fileId);
    addNotification('Desktop', 'File moved to Recycle Bin.');
    setContextMenu(null);
  };

  const handleCreateFolder = () => {
    createItem('desktop', 'New Folder', 'folder');
    setContextMenu(null);
  };

  const handleRefresh = () => {
    setContextMenu(null);
    // Force re-render if needed, but React handles state updates automatically
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-cover bg-center select-none"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onContextMenu={handleDesktopContextMenu}
    >
      <TaskMonitor />
      <NotificationToast />
      
      {/* Desktop Icons Area */}
      <div className="absolute top-0 left-0 bottom-12 w-full p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-2 content-start items-start justify-start w-auto">
        {systemIcons.map((icon) => (
          <DesktopIcon 
            key={icon.id} 
            id={icon.id} 
            name={icon.name} 
            icon={icon.icon} 
            onDoubleClick={icon.action} 
          />
        ))}
        
        {desktopFiles.map((file) => (
          <DesktopIcon 
            key={file.id} 
            id={file.id} 
            name={file.name} 
            icon={
              file.type === 'folder' ? <Folder size={40} className="text-yellow-400 fill-yellow-400" /> :
              file.name.endsWith('.docx') ? <FileText size={40} className="text-blue-600" /> :
              file.name.endsWith('.pptx') ? <Presentation size={40} className="text-orange-600" /> :
              <FileText size={40} className="text-gray-200" />
            }
            onDoubleClick={() => handleFileOpen(file)}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('fileId', file.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onContextMenu={(e) => handleContextMenu(e, file.id)}
          />
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="absolute bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-lg py-1 z-[9999] min-w-[200px] text-sm text-gray-700"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'file' ? (
            <>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2"
                onClick={() => {
                  const file = desktopFiles.find(f => f.id === contextMenu.fileId);
                  if (file) handleFileOpen(file);
                  setContextMenu(null);
                }}
              >
                <FileText size={16} /> Open
              </button>
              <div className="h-px bg-gray-200 my-1" />
              <button 
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                onClick={() => contextMenu.fileId && handleDeleteFile(contextMenu.fileId)}
              >
                <Trash2 size={16} /> Delete
              </button>
            </>
          ) : (
            <>
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2" onClick={() => setContextMenu(null)}>
                <Eye size={16} /> View
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2" onClick={() => setContextMenu(null)}>
                <Grid size={16} /> Sort by
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2" onClick={handleRefresh}>
                <RefreshCw size={16} /> Refresh
              </button>
              <div className="h-px bg-gray-200 my-1" />
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2" onClick={handleCreateFolder}>
                <Plus size={16} /> New Folder
              </button>
              <div className="h-px bg-gray-200 my-1" />
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2" onClick={() => { openWindow('settings', 'Settings', 'settings', 'Settings'); setContextMenu(null); }}>
                <Settings size={16} /> Personalize
              </button>
            </>
          )}
        </div>
      )}

      {/* Windows Layer */}
      {windows.map((window) => {
        const App = AppRegistry[window.component];
        return (
          <WindowFrame key={window.id} window={window}>
            {App ? <App windowId={window.id} /> : <div className="p-4">App not found: {window.component}</div>}
          </WindowFrame>
        );
      })}

      {/* UI Overlays */}
      <StartMenu />
      <Taskbar />
      <TaskGuide />
    </div>
  );
};
