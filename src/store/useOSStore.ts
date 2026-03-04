import { create } from 'zustand';

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  component: string; // Key to render component
  data?: any; // For passing arguments to apps
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

interface OSStore {
  windows: WindowState[];
  activeWindowId: string | null;
  isStartMenuOpen: boolean;
  isTaskGuideOpen: boolean;
  wallpaper: string;
  volume: number;
  brightness: number;
  theme: 'light' | 'dark';
  
  // Actions
  openWindow: (appId: string, title: string, icon: string, component: string, data?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleStartMenu: () => void;
  toggleTaskGuide: () => void;
  setWallpaper: (url: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  // Notifications
  notifications: { id: string; title: string; message: string }[];
  addNotification: (title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

export const useOSStore = create<OSStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  isStartMenuOpen: false,
  isTaskGuideOpen: true, // Open by default for education
  wallpaper: 'https://picsum.photos/seed/windows11/1920/1080',
  volume: 50,
  brightness: 100,
  theme: 'light',
  notifications: [],

  addNotification: (title, message) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, title, message }],
    }));
    // Auto remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  openWindow: (appId, title, icon, component, data) => {
    const { windows } = get();
    // Check if window is already open (for single instance apps like Settings, maybe?)
    // For now, allow multiple instances unless specific logic needed.
    
    const isMobile = window.innerWidth < 768;
    const width = isMobile ? window.innerWidth * 0.95 : Math.min(1000, window.innerWidth * 0.8);
    const height = isMobile ? window.innerHeight * 0.8 : Math.min(700, window.innerHeight * 0.8);

    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      title,
      icon,
      component,
      data,
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1,
      width,
      height,
      x: isMobile ? (window.innerWidth - width) / 2 : 100 + (windows.length * 20),
      y: isMobile ? 50 : 50 + (windows.length * 20),
    };

    set({ 
      windows: [...windows, newWindow], 
      activeWindowId: newWindow.id,
      isStartMenuOpen: false 
    });
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }));
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => 
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      activeWindowId: null,
    }));
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => 
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }));
  },

  focusWindow: (id) => {
    set((state) => {
      const maxZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      return {
        activeWindowId: id,
        windows: state.windows.map((w) => 
          w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w
        ),
        isStartMenuOpen: false,
      };
    });
  },

  toggleStartMenu: () => set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),
  toggleTaskGuide: () => set((state) => ({ isTaskGuideOpen: !state.isTaskGuideOpen })),
  setWallpaper: (url) => set({ wallpaper: url }),
  
  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map((w) => 
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  },
}));
