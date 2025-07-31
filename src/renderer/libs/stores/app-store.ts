import { create } from "zustand";

interface AppStore {
  currentYearSchool?: unknown;
  currentSchool?: unknown;
  setCurrentSchool(currentSchool?: unknown): void;
  setCurrentYeaerSchool(currentYearSchool?: unknown): void;
}

export const useAppStore = create<AppStore>()(() => ({
  currentSchool: undefined,
  currentYearSchool: undefined,
  setCurrentSchool(currentSchool) {},
  setCurrentYeaerSchool(currentYearSchool) {},
}));

localStorage.getItem;
localStorage.setItem;
localStorage.removeItem;
localStorage.clear;
localStorage.key;
