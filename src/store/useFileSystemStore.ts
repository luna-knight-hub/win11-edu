import { create } from 'zustand';

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  content?: string; // For text files
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  size: number; // In bytes
}

interface FileSystemStore {
  items: FileSystemItem[];
  
  // Actions
  createItem: (parentId: string | null, name: string, type: 'folder' | 'file', content?: string) => string;
  deleteItem: (id: string) => void;
  renameItem: (id: string, newName: string) => void;
  moveItem: (id: string, newParentId: string | null) => void;
  updateFileContent: (id: string, content: string) => void;
  getItem: (id: string) => FileSystemItem | undefined;
  getChildren: (parentId: string | null) => FileSystemItem[];
}

const initialItems: FileSystemItem[] = [
  { id: 'root', name: 'Win 11 (C:)', type: 'folder', parentId: null, createdAt: Date.now(), updatedAt: Date.now(), size: 0 },
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'root', createdAt: Date.now(), updatedAt: Date.now(), size: 0 },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'root', createdAt: Date.now(), updatedAt: Date.now(), size: 0 },
  { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'root', createdAt: Date.now(), updatedAt: Date.now(), size: 0 },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'root', createdAt: Date.now(), updatedAt: Date.now(), size: 0 },
  { id: 'recycle-bin', name: 'Recycle Bin', type: 'folder', parentId: 'root', createdAt: Date.now(), updatedAt: Date.now(), size: 0 },
  { id: 'data-drive', name: 'Data (D:)', type: 'folder', parentId: null, createdAt: Date.now(), updatedAt: Date.now(), size: 0 },
  
  // Sample files
  { id: 'welcome-txt', name: 'Welcome.txt', type: 'file', content: 'Welcome to Windows 11 EduSim! Try creating a folder.', parentId: 'desktop', createdAt: Date.now(), updatedAt: Date.now(), size: 52 },
  { id: 'img-1', name: 'Mountain.jpg', type: 'file', content: 'https://picsum.photos/id/10/800/600', parentId: 'pictures', createdAt: Date.now(), updatedAt: Date.now(), size: 1024 },
  { id: 'img-2', name: 'River.png', type: 'file', content: 'https://picsum.photos/id/11/800/600', parentId: 'pictures', createdAt: Date.now(), updatedAt: Date.now(), size: 2048 },
  { id: 'img-3', name: 'Forest.jpg', type: 'file', content: 'https://picsum.photos/id/12/800/600', parentId: 'pictures', createdAt: Date.now(), updatedAt: Date.now(), size: 1500 },
];

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  items: initialItems,

  createItem: (parentId, name, type, content = '') => {
    const newItem: FileSystemItem = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      content,
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      size: content.length,
    };
    set((state) => ({ items: [...state.items, newItem] }));
    return newItem.id;
  },

  deleteItem: (id) => {
    // In a real OS, this would move to Recycle Bin first.
    // For simplicity, let's just move it to Recycle Bin folder if not already there.
    const { items } = get();
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.parentId === 'recycle-bin') {
      // Permanently delete
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    } else {
      // Move to Recycle Bin
      set((state) => ({
        items: state.items.map((i) => 
          i.id === id ? { ...i, parentId: 'recycle-bin' } : i
        ),
      }));
    }
  },

  renameItem: (id, newName) => {
    set((state) => ({
      items: state.items.map((i) => 
        i.id === id ? { ...i, name: newName } : i
      ),
    }));
  },

  moveItem: (id, newParentId) => {
    set((state) => ({
      items: state.items.map((i) => 
        i.id === id ? { ...i, parentId: newParentId } : i
      ),
    }));
  },

  updateFileContent: (id, content) => {
    set((state) => ({
      items: state.items.map((i) => 
        i.id === id ? { ...i, content, updatedAt: Date.now(), size: content.length } : i
      ),
    }));
  },

  getItem: (id) => get().items.find((i) => i.id === id),
  
  getChildren: (parentId) => get().items.filter((i) => i.parentId === parentId),
}));
