"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/tokens";
import type { Carrier } from "@/lib/types";

const AM_BEST = ["A++", "A+", "A", "A-", "B++", "B+", "B", "B-"];
const US_STATES = ["All","AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const emptyForm = { name: "", am_best_rating: "", sp_rating: "", moodys_rating: "", states_available: ["All"] };

export default function AdminCarriersPage() {
  const [carriers, setCarriers]   = useState<Carrier[]>([]);
  const [editing, setEditing]     = useState<Carrier | null>(null);
  const [form, setForm]           = useState(emptyForm);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const load = () => fetch("/api/carriers").then(r => r.json()).then(setCarriers);
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(emptyForm); setShowForm(true); setError(""); }
  function openEdit(c: Carrier) {
    setEditing(c);
    setForm({ name: c.name, am_best_rating: c.am_best_rating ?? "", sp_rating: c.sp_rating ?? "", moodys_rating: c.moodys_rating ?? "", states_available: c.states_available ?? ["All"] });
    setShowForm(true); setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Carrier name is required."); return; }
    setSaving(true); setError("");

    const body = { ...form, states_available: form.states_available.length ? form.states_available : ["All"] };
    const url = editing ? `/api/carriers/${editing.id}` : "/api/carriers";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Save failed"); return; }
    setShowForm(false); load();
  }

  async function handleDelete(c: Carrier) {
    if (!confirm(`Archive carrier "${c.name}"? Their products will also be deactivated.`)) return;
    await fetch(`/api/carriers/${c.id}`, { method: "DELETE" });
    load();
  }

  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, width: "100%", fontFamily: "inherit", outline: "none" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 5 };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Carriers</h1>
          <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>{carriers.length} active carrier{carriers.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} style={{ padding: "10px 20px", background: C.blue, border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + Add Carrier
        </button>
      </div>

      {/* Carrier list */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surfaceHi }}>
              {["Carrier", "AM Best", "S&P", "Moody's", "States", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textDim, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {carriers.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: C.textDim }}>No carriers yet.</td></tr>
            )}
            {carriers.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: C.text }}>{c.name}</td>
                <td style={{ padding: "12px 16px" }}>
                  {c.am_best_rating && <span style={{ background: C.greenDim, color: C.green, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{c.am_best_rating}</span>}
                </td>
                <td style={{ padding: "12px 16px", color: C.textMid, fontSize: 12 }}>{c.sp_rating ?? "—"}</td>
                <td style={{ padding: "12px 16px", color: C.textMid, fontSize: 12 }}>{c.moodys_rating ?? "—"}</td>
                <td style={{ padding: "12px 16px", color: C.textMid, fontSize: 12 }}>
                  {c.states_available?.includes("All") ? "All states" : (c.states_available?.length ?? 0) + " states"}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <button onClick={() => openEdit(c)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: C.textMid, cursor: "pointer", marginRight: 6 }}>Edit</button>
                  <button onClick={() => handleDelete(c)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: C.red, cursor: "pointer" }}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal form */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 32, width: 480, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h2 style={{ margin: "0 0 22px", fontSize: 17, fontWeight: 700, color: C.navy }}>{editing ? "Edit Carrier" : "Add Carrier"}</h2>

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>CARRIER NAME *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>AM BEST</label>
                  <select value={form.am_best_rating} onChange={e => setForm(f => ({ ...f, am_best_rating: e.target.value }))} style={inputStyle}>
                    <option value="">—</option>
                    {AM_BEST.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>S&P</label>
                  <input value={form.sp_rating} onChange={e => setForm(f => ({ ...f, sp_rating: e.target.value }))} style={inputStyle} placeholder="e.g. AA" />
                </div>
                <div>
                  <label style={labelStyle}>MOODY&apos;S</label>
                  <input value={form.moodys_rating} onChange={e => setForm(f => ({ ...f, moodys_rating: e.target.value }))} style={inputStyle} placeholder="e.g. Aa2" />
                </div>
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>STATE AVAILABILITY</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, maxHeight: 160, overflowY: "auto" }}>
                  {US_STATES.map(s => {
                    const checked = form.states_available.includes(s);
                    return (
                      <label key={s} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer", color: checked ? C.blue : C.textMid }}>
                        <input type="checkbox" checked={checked} onChange={e => {
                          if (s === "All" && e.target.checked) { setForm(f => ({ ...f, states_available: ["All"] })); return; }
                          setForm(f => {
                            let next = e.target.checked
                              ? [...f.states_available.filter(x => x !== "All"), s]
                              : f.states_available.filter(x => x !== s);
                            if (next.length === 0) next = ["All"];
                            return { ...f, states_available: next };
                          });
                        }} style={{ accentColor: C.blue }} />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>

              {error && <div style={{ background: C.redDim, color: C.red, borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 14 }}>{error}</div>}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer", color: C.textMid }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 24px", background: saving ? C.border : C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
