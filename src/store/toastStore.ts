import { create } from 'zustand';

export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  pushToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
}

const TOAST_DURATION = 3000;
const MAX_TOASTS = 4;
let nextId = 0;

// Ephemeral UI feedback; deliberately not persisted.
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  pushToast: (message, type = 'success') => {
    // Avoid stacking duplicates (e.g. rapid Mark Next clicks).
    if (get().toasts.some((toast) => toast.message === message)) return;
    const id = `toast-${++nextId}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }].slice(-MAX_TOASTS),
    }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, TOAST_DURATION);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
