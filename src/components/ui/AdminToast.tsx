"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { C } from "@/lib/tokens";

interface Toast { id: string; message: string; type: "success" | "error"; }
interface Ctx   { toast: (msg: string, type?: "success" | "error") => void; }

const Ctx = createContext<Ctx>({ toast: () => {} });
export function useAdminToast() { return useContext(Ctx); }

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-enter" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: t.type === "error" ? C.red : C.navy,
            color: "#fff", borderRadius: 10, padding: "12px 18px",
            fontSize: 13, fontWeight: 500, maxWidth: 400,
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)", pointerEvents: "auto",
          }}>
            <span>{t.type === "error" ? "✗" : "✓"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
