'use client';

import { create } from 'zustand';

interface UIState {
  // Sidebar (mobile)
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  // Motivation bar collapse
  isMotivationBarCollapsed: boolean;
  toggleMotivationBar: () => void;

  // Active module (for Navbar highlighting)
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  isMotivationBarCollapsed: false,
  toggleMotivationBar: () =>
    set((s) => ({ isMotivationBarCollapsed: !s.isMotivationBarCollapsed })),

  activeModule: 'dashboard',
  setActiveModule: (activeModule) => set({ activeModule }),
}));
