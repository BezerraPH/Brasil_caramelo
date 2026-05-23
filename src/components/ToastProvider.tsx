"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "default" | "achievement";

type Toast = { id: number; message: string; variant: ToastVariant };

type ToastFn = (message: string, variant?: ToastVariant) => void;

const ToastContext = createContext<ToastFn | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback<ToastFn>((message, variant = "default") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, variant === "achievement" ? 4200 : 3200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-24 left-0 right-0 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8"
      >
        {toasts.map((t) => (
          <p
            key={t.id}
            className={`bc-toast bc-animate-in-up pointer-events-auto ${
              t.variant === "achievement" ? "bc-toast-achievement" : ""
            }`}
          >
            {t.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa de ToastProvider");
  return ctx;
}
