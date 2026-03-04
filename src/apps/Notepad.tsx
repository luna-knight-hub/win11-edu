import React, { useState, useEffect, useRef } from 'react';
import { useFileSystemStore } from '../store/useFileSystemStore';
import { useOSStore } from '../store/useOSStore';
import { ChevronRight, Save, FilePlus, FolderOpen, Settings, Minus, X, Copy, Scissors, Clipboard, Undo, Redo, Type, ArrowUp, Folder, HardDrive, Monitor } from 'lucide-react';
import { clsx } from 'clsx';

export const Notepad: React.FC<{ windowId: string }> = ({ windowId }) => {
  const { windows } = useOSStore();
  const window = windows.find(w => w.id === windowId);
  const fileId = window?.data?.fileId;

  const { getItem, updateFileContent, createItem, getChildren } = useFileSystemStore();
  const { addNotification, updateWindow } = useOSStore();
  
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled.txt');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(14);
  
  // Save As State
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [currentSavePath, setCurrentSavePath] = useState<string | null>('desktop');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (fileId) {
      const item = getItem(fileId);
      if (item) {
        setContent(item.content || '');
        setFileName(item.name);
      }
    }
  }, [fileId, getItem]);

  const handleSave = () => {
    if (fileId) {
      // Existing file: Just save
      updateFileContent(fileId, content);
      addNotification('Notepad', 'Saved.');
    } else {
      // New file: Trigger Save As
      setSaveAsName(fileName);
      setIsSaveAsOpen(true);
      setCurrentSavePath('desktop'); // Default to desktop
    }
    setActiveMenu(null);
  };

  const handleSaveAs = () => {
    setSaveAsName(fileName);
    setIsSaveAsOpen(true);
    setCurrentSavePath('desktop'); // Default to desktop
    setActiveMenu(null);
  };

  const handleSaveAsConfirm = () => {
    if (saveAsName.trim() && currentSavePath) {
      const name = saveAsName.trim().endsWith('.txt') ? saveAsName.trim() : `${saveAsName.trim()}.txt`;
      const newFileId = createItem(currentSavePath, name, 'file', content);
      
      const folderName = getItem(currentSavePath)?.name || 'This PC';
      addNotification('Notepad', `Saved as ${name} to ${folderName}.`);
      setIsSaveAsOpen(false);
      
      // Update window context to the new file
      updateWindow(windowId, { 
        title: name,
        data: { ...window?.data, fileId: newFileId }
      });
      setFileName(name);
    }
  };

  const handleNavigate = (id: string) => {
    setCurrentSavePath(id);
  };

  const handleUp = () => {
    if (currentSavePath) {
      const current = getItem(currentSavePath);
      if (current && current.parentId) {
        setCurrentSavePath(current.parentId);
      } else if (current && current.parentId === null) {
        setCurrentSavePath(null); // Go to This PC view
      } else {
        // Already at root or null
        setCurrentSavePath(null);
      }
    }
  };

  const currentFolderItems = getChildren(currentSavePath);
  const currentFolderName = currentSavePath ? (getItem(currentSavePath)?.name || 'Unknown') : 'This PC';

  const MenuButton = ({ label, items }: { label: string, items: { label: string, shortcut?: string, action: () => void, separator?: boolean }[] }) => (
    <div className="relative">
      <button 
        className={clsx(
          "px-3 py-1 text-sm hover:bg-gray-100 rounded-md select-none transition-colors",
          activeMenu === label && "bg-gray-200 text-gray-900"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setActiveMenu(activeMenu === label ? null : label);
        }}
      >
        {label}
      </button>
      {activeMenu === label && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 shadow-xl rounded-lg py-1.5 z-50">
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.separator && <div className="h-px bg-gray-100 my-1" />}
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex justify-between items-center group transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                }}
              >
                <span className="text-gray-700">{item.label}</span>
                {item.shortcut && <span className="text-xs text-gray-400 group-hover:text-gray-600">{item.shortcut}</span>}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );

  const IconButton = ({ icon: Icon, title, onClick }: { icon: any, title: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
      title={title}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );

  return (
    <div className="flex flex-col w-full h-full bg-white relative font-sans">
      {/* Save As Dialog */}
      {isSaveAsOpen && (
        <div className="absolute inset-0 bg-black/10 z-[60] flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-white rounded-xl shadow-2xl p-0 w-[600px] h-[400px] border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Save As</h3>
              <button onClick={() => setIsSaveAsOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            {/* Address Bar & Navigation */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <button 
                onClick={handleUp} 
                disabled={!currentSavePath}
                className="p-1 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30"
                title="Up to parent folder"
              >
                <ArrowUp size={16} />
              </button>
              <div className="flex-1 border border-gray-200 bg-white rounded px-2 py-1 text-sm text-gray-700 flex items-center gap-2">
                {currentSavePath ? <Folder size={14} className="text-yellow-500" /> : <Monitor size={14} className="text-blue-500" />}
                <span>{currentFolderName}</span>
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-auto p-2 bg-white">
              <div className="grid grid-cols-4 gap-2">
                {currentFolderItems.map((item) => (
                  <div 
                    key={item.id}
                    className={clsx(
                      "flex flex-col items-center p-2 rounded hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-all",
                      item.type === 'folder' ? "text-gray-700" : "text-gray-500 opacity-70"
                    )}
                    onDoubleClick={() => {
                      if (item.type === 'folder') {
                        handleNavigate(item.id);
                      } else {
                        // If it's a file, maybe select it to overwrite?
                        setSaveAsName(item.name);
                      }
                    }}
                    onClick={() => {
                      if (item.type === 'file') {
                        setSaveAsName(item.name);
                      }
                    }}
                  >
                    {item.type === 'folder' ? (
                      item.id === 'root' || item.id === 'data-drive' ? (
                        <HardDrive size={32} className="text-gray-400 mb-1" />
                      ) : (
                        <Folder size={32} className="text-yellow-400 fill-yellow-400 mb-1" />
                      )
                    ) : (
                      <div className="relative">
                        <div className="absolute bottom-0 right-0 bg-white text-[8px] border rounded px-0.5">TXT</div>
                        <FilePlus size={32} className="text-gray-400 mb-1" />
                      </div>
                    )}
                    <span className="text-xs text-center w-full truncate">{item.name}</span>
                  </div>
                ))}
                {currentFolderItems.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center text-gray-300 mt-10">
                    <Folder size={48} />
                    <span className="text-sm mt-2">Empty folder</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm text-gray-600 w-16">File name:</label>
                <input 
                  type="text" 
                  value={saveAsName}
                  onChange={(e) => setSaveAsName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAsConfirm();
                    if (e.key === 'Escape') setIsSaveAsOpen(false);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-16">Save as type:</label>
                <select className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none" disabled>
                  <option>Text Documents (*.txt)</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button 
                  onClick={() => setIsSaveAsOpen(false)}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAsConfirm}
                  disabled={!saveAsName.trim() || !currentSavePath}
                  className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Container */}
      <div className="flex flex-col border-b border-gray-200 bg-white">
        {/* Menu Bar */}
        <div className="flex items-center px-1 py-1 select-none">
          <MenuButton 
            label="File" 
            items={[
              { label: 'New', shortcut: 'Ctrl+N', action: () => { setContent(''); setFileName('Untitled.txt'); } },
              { label: 'Open...', shortcut: 'Ctrl+O', action: () => alert('Open not implemented yet') },
              { label: 'Save', shortcut: 'Ctrl+S', action: handleSave, separator: true },
              { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: handleSaveAs },
              { label: 'Exit', action: () => {} /* Close window logic needed */, separator: true },
            ]} 
          />
          <MenuButton 
            label="Edit" 
            items={[
              { label: 'Undo', shortcut: 'Ctrl+Z', action: () => {} },
              { label: 'Cut', shortcut: 'Ctrl+X', action: () => {} },
              { label: 'Copy', shortcut: 'Ctrl+C', action: () => {} },
              { label: 'Paste', shortcut: 'Ctrl+V', action: () => {} },
            ]} 
          />
          <MenuButton 
            label="Format" 
            items={[
              { label: 'Word Wrap', action: () => {} },
              { label: 'Font...', action: () => {} },
            ]} 
          />
          <MenuButton 
            label="View" 
            items={[
              { label: 'Zoom In', shortcut: 'Ctrl++', action: () => setFontSize(s => Math.min(s + 2, 32)) },
              { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => setFontSize(s => Math.max(s - 2, 8)) },
              { label: 'Restore Default Zoom', shortcut: 'Ctrl+0', action: () => setFontSize(14), separator: true },
              { label: 'Status Bar', action: () => {} },
            ]} 
          />
          <MenuButton 
            label="Help" 
            items={[
              { label: 'About Notepad', action: () => alert('Windows 11 EduSim Notepad v1.0') },
            ]} 
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center px-2 pb-2 gap-1 select-none">
          <IconButton icon={FilePlus} title="New" onClick={() => { setContent(''); setFileName('Untitled.txt'); }} />
          <IconButton icon={FolderOpen} title="Open" onClick={() => alert('Open not implemented yet')} />
          <IconButton icon={Save} title="Save" onClick={handleSave} />
          
          <div className="w-px h-5 bg-gray-300 mx-2" />
          
          <IconButton icon={Undo} title="Undo" onClick={() => {}} />
          <IconButton icon={Redo} title="Redo" onClick={() => {}} />
          
          <div className="w-px h-5 bg-gray-300 mx-2" />
          
          <IconButton icon={Type} title="Increase Font Size" onClick={() => setFontSize(s => Math.min(s + 2, 32))} />
          
          <div className="flex-1" />
          
          <IconButton icon={Settings} title="Settings" onClick={() => {}} />
        </div>
      </div>

      {/* Text Area */}
      <textarea
        className="flex-1 p-1 resize-none focus:outline-none font-mono leading-relaxed text-gray-800 selection:bg-blue-100 w-full"
        style={{ fontSize: `${fontSize}px` }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type something..."
        spellCheck={false}
      />
      
      {/* Status Bar */}
      <div className="h-8 bg-gray-50 border-t border-gray-200 flex items-center justify-end px-4 text-xs text-gray-500 gap-6 select-none">
        <span className="hover:text-gray-700 cursor-pointer">{Math.round(fontSize / 14 * 100)}%</span>
        <span className="hover:text-gray-700 cursor-pointer">UTF-8</span>
        <span className="hover:text-gray-700 cursor-pointer">Windows (CRLF)</span>
        <span className="hover:text-gray-700 cursor-pointer">Ln 1, Col 1</span>
      </div>
    </div>
  );
};
