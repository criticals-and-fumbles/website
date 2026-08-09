"use client";

import { useEffect, useState } from "react";

interface ToastState {
  message: string;
  key: number;
}

let listeners: ((state: ToastState) => void)[] = [];
let counter = 0;

export function showToast(message: string) {
  const state: ToastState = { message, key: counter++ };
  listeners.forEach((listener) => listener(state));
}

export function ToastHost() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const listener = (state: ToastState) => {
      setToast(state);
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-md border border-border bg-surface px-4 py-3 font-ui text-sm text-text shadow-lg"
    >
      {toast.message}
    </div>
  );
}
