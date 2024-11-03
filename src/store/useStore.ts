import { create } from 'zustand';
import { ProcessedImage } from '../types';

interface Store {
  images: ProcessedImage[];
  addImage: (image: ProcessedImage) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<ProcessedImage>) => void;
}

export const useStore = create<Store>((set) => ({
  images: [],
  addImage: (image) => 
    set((state) => ({ 
      images: [...state.images, image] 
    })),
  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id)
    })),
  updateImage: (id, updates) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      )
    }))
}));