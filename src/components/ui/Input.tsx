"use client";

import { C } from "@/lib/tokens";

const inputStyle: React.CSSProperties = {
  width: "100%", background: C.bg, border: `1.5px solid ${C.border}`,
  borderRadius: 8, color: C.text, padding: "9px 12px", fontSize: 13,
  fontFamily: "monospace", outline: "none", boxSizing: "border-box",
};

interface InputProps {
  type?: string;
  value: number | string;
  onChange: (v: number | string) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Input({ type = "number", value, onChange, min, max, step = 1 }: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      min={min} max={max} step={step}
      style={inputStyle}
      onFocus={e => (e.target.style.borderColor = C.blue)}
      onBlur={e  => (e.target.style.borderColor = C.border)}
    />
  );
}

interface SelectProps {
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
}

export function Select({ value, onChange, options }: SelectProps) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
