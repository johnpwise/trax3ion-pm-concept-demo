import { create } from "zustand";

export type ToastTone = "success" | "error";

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message, tone = "success") => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, 3200);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
