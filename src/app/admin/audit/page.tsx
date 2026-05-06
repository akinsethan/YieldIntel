"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/tokens";
import type { AuditLogEntry } from "@/lib/types";

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  CREATE: { bg: C.greenDim, color: C.green },
  UPDATE: { bg: C.blueDim,  color: C.blue  },
  DELETE: { bg: C.redDim,   color: C.red   },
};

const TABLE_LABELS: Record<string, string> = {
  carriers: "Carrier", products: "Product", rates: "Rate", audit_log: "Audit",
};

function timeSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return "just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function DiffBadge({ label, old: oldVal, next: newVal }: { label: string; old: unknown; next: unknown }) {
  if (oldVal === newVal || (oldVal == null && newVal == null)) return null;
  const was = oldVal != null ? String(oldVal) : "—";
  const now = newVal != null ? String(newVal) : "—";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, marginBottom: 3 }}>
      <span style={{ color: C.textDim, fontFamily: "monospace" }}>{label}:</span>
      <span style={{ color: C.red,   fontFamily: "monospace", textDecoration: "line-through" }}>{was}</span>
      <span style={{ color: C.textDim }}>→</span>
      <span style={{ color: C.green, fontFamily: "monospace" }}>{now}</span>
    </div>
  );
}

function EntryDiff({ entry }: { entry: AuditLogEntry }) {
  const old_ = entry.old_values ?? {};
  const new_ = entry.new_values ?? {};
  const keys = Array.from(new Set([...Object.keys(old_), ...Object.keys(new_)])).filter(k =>
    !["id", "created_at", "updated_at"].includes(k) && old_[k] !== new_[k]
  );
  if (keys.length === 0) return <span style={{ color: C.textDim, fontSize: 11 }}>No field changes recorded</span>;
  return (
    <div>
      {keys.slice(0, 6).map(k => <DiffBadge key={k} label={k} old={old_[k]} next={new_[k]} />)}
      {keys.length > 6 && <span style={{ color: C.textDim, fontSize: 11 }}>+{keys.length - 6} more fields</span>}
    </div>
  );
}

export default function AuditLogPage() {
  const [entries, setEntries]       = useState<AuditLogEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [expanded, setExpanded]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/audit").then(r => r.json()).then(data => {
      setEntries(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const tables  = Array.from(new Set(entries.map(e => e.table_name))).sort();
  const filtered = entries.filter(e =>
    (!filterTable  || e.table_name === filterTable) &&
    (!filterAction || e.action     === filterAction)
  );

  const selectStyle: React.CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "7px 12px", fontSize: 12, color: C.text, outline: "none", cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Audit Log</h1>
          <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
            Every create, update, and delete on carriers, products, and rates.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={filterTable} onChange={e => setFilterTable(e.target.value)} style={selectStyle}>
            <option value="">All tables</option>
            {tables.map(t => <option key={t} value={t}>{TABLE_LABELS[t] ?? t}</option>)}
          </select>
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} style={selectStyle}>
            <option value="">All actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
          {(filterTable || filterAction) && (
            <button onClick={() => { setFilterTable(""); setFilterAction(""); }}
              style={{ padding: "7px 12px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.textDim, cursor: "pointer" }}>
              Clear ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: C.textDim }}>Loading audit log…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: C.textDim }}>
            {entries.length === 0 ? "No audit entries yet. They'll appear here as data is updated." : "No entries match your filters."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surfaceHi }}>
                {["When", "Action", "Table", "Who", "Changes", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textDim, fontWeight: 600, fontSize: 11, letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const ac = ACTION_COLORS[e.action] ?? { bg: C.surfaceHi, color: C.textMid };
                const isOpen = expanded === e.id;
                const nameFromNew = (e.new_values?.name ?? e.old_values?.name) as string | undefined;
                return (
                  <>
                    <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={el => (el.currentTarget.style.background = C.surfaceHi)}
                      onMouseLeave={el => (el.currentTarget.style.background = "")}>
                      <td style={{ padding: "11px 16px", color: C.textDim, fontSize: 12, whiteSpace: "nowrap" }}>
                        <div style={{ fontFamily: "monospace", marginBottom: 2 }}>
                          {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" "}
                          {new Date(e.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div style={{ color: C.textDim, fontSize: 10 }}>{timeSince(e.created_at)}</div>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ background: ac.bg, color: ac.color, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                          {e.action}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px", color: C.textMid, fontSize: 12 }}>
                        {TABLE_LABELS[e.table_name] ?? e.table_name}
                        {nameFromNew && <div style={{ color: C.text, fontWeight: 600, fontSize: 12 }}>{nameFromNew}</div>}
                      </td>
                      <td style={{ padding: "11px 16px", color: C.textDim, fontSize: 12, fontFamily: "monospace" }}>
                        {e.user_id ?? "system"}
                      </td>
                      <td style={{ padding: "11px 16px", maxWidth: 320 }}>
                        {e.action === "UPDATE" ? <EntryDiff entry={e} /> : (
                          <span style={{ color: C.textDim, fontSize: 11 }}>
                            {e.action === "CREATE" ? "New record created" : "Record archived"}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "11px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : e.id)}
                          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.textDim, cursor: "pointer" }}
                        >
                          {isOpen ? "Hide" : "JSON"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${e.id}-detail`} style={{ background: C.surfaceHi, borderBottom: `1px solid ${C.border}` }}>
                        <td colSpan={6} style={{ padding: "12px 16px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {[["Before", e.old_values], ["After", e.new_values]].map(([label, vals]) => (
                              <div key={String(label)}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "0.08em", marginBottom: 6 }}>{label as string}</div>
                                <pre style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 11, fontFamily: "monospace", color: C.text, overflow: "auto", margin: 0, maxHeight: 200 }}>
                                  {vals ? JSON.stringify(vals, null, 2) : "null"}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p style={{ color: C.textDim, fontSize: 11, marginTop: 12 }}>
          Showing {filtered.length} of {entries.length} total entries. Audit log is append-only and cannot be modified.
        </p>
      )}
    </div>
  );
}
