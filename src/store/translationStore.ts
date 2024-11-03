import { create } from 'zustand';
import { TranslationState } from '../types/translation';

interface TranslationStore {
  translations: Record<string, TranslationState>;
  updateTranslation: (id: string, update: Partial<TranslationState>) => void;
  removeTranslation: (id: string) => void;
  clearTranslations: () => void;
}

export const useTranslationStore = create<TranslationStore>((set) => ({
  translations: {},
  updateTranslation: (id, update) =>
    set((state) => ({
      translations: {
        ...state.translations,
        [id]: { ...state.translations[id], ...update },
      },
    })),
  removeTranslation: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.translations;
      return { translations: rest };
    }),
  clearTranslations: () => set({ translations: {} }),
}));