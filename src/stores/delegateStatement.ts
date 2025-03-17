import { create } from "zustand";

interface DelegateStatementStore {
  showSaveSuccess: boolean;
  setSaveSuccess: (show: boolean) => void;
}

export const useDelegateStatementStore = create<DelegateStatementStore>(
  (set) => ({
    showSaveSuccess: false,
    setSaveSuccess: (show) => set({ showSaveSuccess: show }),
  })
);
