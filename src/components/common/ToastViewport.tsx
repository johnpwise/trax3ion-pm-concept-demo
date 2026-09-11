import { CircleCheckBig, TriangleAlert, X } from "lucide-react";

import { useToastStore } from "./toastStore";

export default function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg ${
            toast.tone === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary-line bg-surface text-surface-foreground"
          }`}
        >
          {toast.tone === "error" ? (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          )}
          <p className="flex-1 text-sm">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-muted-foreground transition-colors hover:text-surface-foreground"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
