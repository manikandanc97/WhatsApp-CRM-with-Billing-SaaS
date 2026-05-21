import { create } from 'zustand';

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  setOnline: (status: boolean) => void;
  setSyncing: (status: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncTime: (time: Date) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingSyncCount: 0,
  lastSyncTime: null,
  setOnline: (status) => set({ isOnline: status }),
  setSyncing: (status) => set({ isSyncing: status }),
  setPendingCount: (count) => set({ pendingSyncCount: count }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
}));
