import { create } from "zustand";
import type { User, Language, VehicleCategory } from "@/types";

interface AppState {
  user: User | null;
  isLoading: boolean;
  language: Language;
  category: VehicleCategory;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setLanguage: (language: Language) => void;
  setCategory: (category: VehicleCategory) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  language: "ru",
  category: "B",

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setLanguage: (language) => set({ language }),
  setCategory: (category) => set({ category }),
}));
