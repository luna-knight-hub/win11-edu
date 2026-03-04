import React, { useState, useMemo } from 'react';
import { useFileSystemStore, FileSystemItem } from '../store/useFileSystemStore';
import { useOSStore } from '../store/useOSStore';
import { Folder, FileText, ArrowLeft, ArrowUp, Plus, Trash2, Search, ArrowDownAZ, ArrowUpAZ, Calendar, HardDrive, Eye, EyeOff, Edit2, X, Check, Monitor, ChevronRight, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

type SortField = 'name' | 'date' | 'size';
type SortDirection = 'asc' | 'desc';

export const FileExplorer: React.FC<{ windowId: string }> = () => {
  const { items, createItem, deleteItem, renameItem, getChildren, moveItem } = useFileSystemStore();
  const { openWindow, addNotification } = useOSStore();
  const [currentPath, setCurrentPath] = useState<string>('root');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showPreview, setShowPreview] = useState(false);
  
  // Rename State
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Sidebar Expansion State
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'data-drive']));

  const currentFolder = items.find((i) => i.id === currentPath);
  
  // Filter and Sort Logic
  const displayedItems = useMemo(() => {
    let result: FileSystemItem[] = [];

    if (searchQuery.trim()) {
      result = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        item.id !== 'root' && 
        item.parentId !== null 
      );
    } else {
      result = getChildren(currentPath);
    }

    return result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.updatedAt - b.updatedAt;
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [items, currentPath, searchQuery, sortField, sortDirection, getChildren]);

  const selectedItem = useMemo(() => {
    if (selectedItemIds.size === 1) {
      const id = Array.from(selectedItemIds)[0];
      return items.find(i => i.id === id);
    }
    return null;
  }, [selectedItemIds, items]);

  const handleNavigate = (id: string) => {
    setCurrentPath(id);
    setSelectedItemIds(new Set());
    setSearchQuery('');
    setIsRenaming(false);
  };

  const handleUp = () => {
    if (currentFolder && currentFolder.parentId) {
      setCurrentPath(currentFolder.parentId);
    }
  };

  const handleCreateFolder = () => {
    createItem(currentPath, 'New Folder', 'folder');
  };

  const handleDelete = () => {
    selectedItemIds.forEach((id) => deleteItem(id));
    setSelectedItemIds(new Set());
    setIsRenaming(false);
  };
  
  const startRename = () => {
    if (selectedItem) {
      setRenameValue(selectedItem.name);
      setIsRenaming(true);
    }
  };

  const confirmRename = () => {
    if (selectedItem && renameValue.trim()) {
      renameItem(selectedItem.id, renameValue.trim());
      setIsRenaming(false);
    }
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setRenameValue('');
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Recursive Sidebar Item
  const SidebarItem: React.FC<{ item: FileSystemItem; depth?: number }> = ({ item, depth = 0 }) => {
    const children = getChildren(item.id).filter(child => child.type === 'folder');
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = currentPath === item.id;

    return (
      <div className="select-none">
        <div 
          className={clsx(
            "flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 rounded-sm transition-colors text-sm",
            isSelected && "bg-blue-100 text-blue-700 hover:bg-blue-100"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleNavigate(item.id)}
        >
          {children.length > 0 ? (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFolderExpansion(item.id); }}
              className="p-0.5 hover:bg-gray-200 rounded text-gray-500"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : <div className="w-4" />}
          
          {item.parentId === null ? (
            <HardDrive size={16} className={clsx("text-gray-500", isSelected && "text-blue-600")} />
          ) : (
            <Folder size={16} className={clsx("text-yellow-500 fill-yellow-500", isSelected && "text-yellow-600")} />
          )}
          
          <span className="truncate">{item.name}</span>
        </div>
        
        {isExpanded && children.map(child => (
          <SidebarItem key={child.id} item={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  const rootDrives = items.filter(i => i.parentId === null);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 flex items-center px-4 gap-3 bg-gray-50/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={handleUp} disabled={!currentFolder?.parentId || !!searchQuery} className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-30 transition-colors">
            <ArrowUp size={18} />
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-2" />
        
        <button onClick={handleCreateFolder} disabled={!!searchQuery} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white bg-white/50 border border-gray-200/50 shadow-sm rounded-md text-sm font-medium transition-all disabled:opacity-50">
          <Plus size={16} className="text-blue-600" /> New
        </button>
        
        <button onClick={startRename} disabled={!selectedItem} className="p-2 hover:bg-gray-200 text-gray-600 rounded-md disabled:opacity-30 transition-colors" title="Rename">
          <Edit2 size={18} />
        </button>

        <button onClick={handleDelete} disabled={selectedItemIds.size === 0} className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-md disabled:opacity-30 transition-colors" title="Delete">
          <Trash2 size={18} />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        {/* Sort Controls */}
        <div className="flex items-center gap-1 bg-gray-200/50 p-1 rounded-lg">
          <button onClick={() => toggleSort('name')} className={clsx("p-1.5 rounded-md transition-colors", sortField === 'name' ? "bg-white shadow-sm" : "hover:bg-gray-200")}>
            {sortDirection === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
          </button>
          <button onClick={() => toggleSort('date')} className={clsx("p-1.5 rounded-md transition-colors", sortField === 'date' ? "bg-white shadow-sm" : "hover:bg-gray-200")}>
            <Calendar size={16} />
          </button>
          <button onClick={() => toggleSort('size')} className={clsx("p-1.5 rounded-md transition-colors", sortField === 'size' ? "bg-white shadow-sm" : "hover:bg-gray-200")}>
            <HardDrive size={16} />
          </button>
        </div>

        <div className="flex-1" />

        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${currentFolder?.name || 'This PC'}`}
            className="w-full bg-white border border-gray-200 rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <button 
          onClick={() => setShowPreview(!showPreview)}
          className={clsx("ml-2 p-2 rounded-md transition-colors", showPreview ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200 text-gray-600")}
          title="Toggle Preview Pane"
        >
          {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {/* Address Bar */}
      <div className="h-9 border-b border-gray-200 flex items-center px-4 bg-white text-sm text-gray-600 shadow-sm z-10 shrink-0">
        <span className="text-gray-400 mr-2">Current Path:</span>
        <div className="flex items-center gap-1 font-medium text-gray-800">
           <Monitor size={14} className="text-blue-500" />
           <ChevronRight size={14} className="text-gray-400" />
           <span>{searchQuery ? 'Search Results' : (currentFolder?.name || 'This PC')}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Left Pane) */}
        <div className="w-64 border-r border-gray-200 bg-gray-50/30 overflow-y-auto p-2 flex flex-col gap-1 shrink-0">
          <div className="text-xs font-semibold text-gray-500 px-2 py-1 uppercase tracking-wider mb-1">This PC</div>
          {rootDrives.map(drive => (
            <SidebarItem key={drive.id} item={drive} />
          ))}
        </div>

        {/* Main Content (Right Pane) */}
        <div 
          className="flex-1 p-4 overflow-auto bg-white"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const fileId = e.dataTransfer.getData('fileId');
            if (fileId) {
              moveItem(fileId, currentPath);
              addNotification('File Explorer', 'File moved successfully.');
            }
          }}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (isRenaming && selectedItem?.id === item.id) return; 
                  
                  const newSet = new Set(selectedItemIds);
                  if (newSet.has(item.id)) {
                    // keep selected
                  } else {
                    newSet.clear();
                    newSet.add(item.id);
                  }
                  setSelectedItemIds(newSet);
                  if (selectedItem?.id !== item.id) {
                    setIsRenaming(false); 
                  }
                }}
                onDoubleClick={() => {
                  if (isRenaming) return;
                  if (item.type === 'folder') {
                    handleNavigate(item.id);
                  } else if (item.type === 'file') {
                    openWindow('notepad', item.name, 'file-text', 'Notepad', { fileId: item.id });
                  }
                }}
                className={clsx(
                  "group flex flex-col items-center p-3 rounded-md cursor-pointer border transition-all duration-200",
                  selectedItemIds.has(item.id) 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "border-transparent hover:bg-gray-50 hover:border-gray-100"
                )}
              >
                {item.type === 'folder' ? (
                  <Folder size={48} className="text-yellow-400 fill-yellow-400 drop-shadow-sm transition-transform group-hover:scale-105" strokeWidth={1.5} />
                ) : (
                  <div className="relative">
                    <FileText size={48} className="text-gray-400 drop-shadow-sm transition-transform group-hover:scale-105" strokeWidth={1.5} />
                    <div className="absolute bottom-0 right-0 bg-white rounded shadow-sm px-0.5 text-[8px] font-bold text-gray-500 border border-gray-200">TXT</div>
                  </div>
                )}
                
                {isRenaming && selectedItem?.id === item.id ? (
                  <div className="mt-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="w-24 text-xs text-center border border-blue-500 rounded px-1 py-0.5 focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename();
                        if (e.key === 'Escape') cancelRename();
                      }}
                    />
                    <button onClick={confirmRename} className="text-green-600 hover:bg-green-100 rounded p-0.5"><Check size={12} /></button>
                    <button onClick={cancelRename} className="text-red-600 hover:bg-red-100 rounded p-0.5"><X size={12} /></button>
                  </div>
                ) : (
                  <span className="text-xs text-center mt-2 w-full truncate px-1 rounded text-gray-700 font-medium group-hover:text-gray-900">
                    {item.name}
                  </span>
                )}
                
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {item.type === 'folder' ? format(item.updatedAt, 'MMM d') : `${item.size} B`}
                </span>
              </div>
            ))}
            {displayedItems.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-gray-400 mt-20 gap-2">
                <Folder size={48} className="text-gray-200" />
                <span>{searchQuery ? 'No items found.' : 'This folder is empty.'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Preview Pane (Rightmost) */}
        {showPreview && selectedItem && (
          <div className="w-64 border-l border-gray-200 bg-gray-50 p-4 flex flex-col shrink-0 overflow-y-auto">
            <div className="flex flex-col items-center mb-6">
              {selectedItem.type === 'folder' ? (
                <Folder size={64} className="text-yellow-400 fill-yellow-400 mb-4" />
              ) : (
                <FileText size={64} className="text-gray-400 mb-4" />
              )}
              <h3 className="font-semibold text-gray-800 text-center break-words w-full">{selectedItem.name}</h3>
              <span className="text-xs text-gray-500 uppercase mt-1">{selectedItem.type}</span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date Modified</label>
                <span className="text-gray-800">{format(selectedItem.updatedAt, 'PP p')}</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Size</label>
                <span className="text-gray-800">{selectedItem.size} bytes</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Path</label>
                <span className="text-gray-800 break-all text-xs font-mono bg-gray-100 p-1 rounded block">
                  {selectedItem.parentId}/{selectedItem.id}
                </span>
              </div>
            </div>

            {selectedItem.type === 'file' && selectedItem.content && (
              <div className="mt-6 flex-1 flex flex-col min-h-[100px]">
                <label className="text-xs text-gray-500 block mb-2">Preview</label>
                <div className="flex-1 bg-white border border-gray-200 rounded p-2 text-xs font-mono text-gray-600 overflow-auto whitespace-pre-wrap">
                  {selectedItem.content.slice(0, 500)}
                  {selectedItem.content.length > 500 && '...'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-gray-50 border-t border-gray-200 flex items-center px-4 text-xs text-gray-500 gap-4 shrink-0">
        <span>{displayedItems.length} items</span>
        {selectedItemIds.size > 0 && (
          <>
            <div className="h-3 w-px bg-gray-300" />
            <span>{selectedItemIds.size} item(s) selected</span>
            {selectedItem && <span>{selectedItem.size} bytes</span>}
          </>
        )}
      </div>
    </div>
  );
};

