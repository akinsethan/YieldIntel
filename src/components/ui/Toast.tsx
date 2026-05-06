"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { C } from "@/lib/tokens";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
  exiting?: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove after 4s
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200);
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className={t.exiting ? "toast-exit" : "toast-enter"}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: t.type === "error" ? C.red : C.navy,
              color: "#fff", borderRadius: 10, padding: "12px 18px",
              fontSize: 13, fontWeight: 500, maxWidth: 380,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              pointerEvents: "auto",
            }}
          >
            <span style={{ fontSize: 16 }}>{t.type === "error" ? "✗" : "✓"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
