import { create } from "zustand";
import type { User, Language, CategoryCode } from "@/types";

interface AppState {
  user: User | null;
  isLoading: boolean;
  language: Language;
  categoryCode: CategoryCode;
  categoryId: string | null;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setLanguage: (language: Language) => void;
  setCategory: (code: CategoryCode, id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  language: "ru",
  categoryCode: "AB",
  categoryId: null,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setLanguage: (language) => set({ language }),
  setCategory: (categoryCode, categoryId) => set({ categoryCode, categoryId }),
}));
