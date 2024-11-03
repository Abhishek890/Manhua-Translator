import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'warn' | 'error';
  category: 'OCR' | 'Translation' | 'Image' | 'System';
  message: string;
}

interface LogStore {
  logs: LogEntry[];
  addLog: (type: LogEntry['type'], category: LogEntry['category'], message: string) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (type, category, message) => set((state) => ({
    logs: [...state.logs, {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      category,
      message
    }].slice(-100) // Keep last 100 logs
  })),
  clearLogs: () => set({ logs: [] })
}));