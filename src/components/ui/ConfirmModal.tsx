"use client";

import { C } from "@/lib/tokens";

interface ConfirmModalProps {
  title:       string;
  body?:       string;
  confirmLabel?: string;
  danger?:     boolean;
  onConfirm:  () => void;
  onCancel:   () => void;
}

export function ConfirmModal({ title, body, confirmLabel = "Confirm", danger = true, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10,35,66,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background: C.surface, borderRadius: 14, padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <h3 style={{ color: C.navy, fontSize: 16, fontWeight: 700, marginBottom: body ? 8 : 20, letterSpacing: "-0.01em" }}>{title}</h3>
        {body && <p style={{ color: C.textMid, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{body}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ padding: "9px 18px", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.textMid, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: "9px 20px", background: danger ? C.red : C.teal, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
