"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/tokens";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAdminToast } from "@/components/ui/AdminToast";
import type { Carrier, Product, ProductType } from "@/lib/types";

const PRODUCT_TYPES: ProductType[] = ["FIA", "MYGA", "RILA", "SPIA", "DIA"];
const RENEWAL_TYPES = ["Declared Rate", "Indexed Option", "Par Rate"];
const emptyForm = { carrier_id: "", name: "", type: "" as ProductType | "", surrender_years: "", min_premium: "", states_available: ["All"], bonus: "", mva: false, surrender_schedule: "", renewal_type: "Declared Rate", notes: "", buffer_rate: "", free_withdrawal_pct: "" };

const TYPE_COLORS: Record<string, string> = {
  FIA: C.blue, MYGA: C.teal, RILA: C.purple, SPIA: C.green, DIA: C.amber,
};

export default function AdminProductsPage() {
  const { toast } = useAdminToast();
  const [products, setProducts]           = useState<Product[]>([]);
  const [carriers, setCarriers]           = useState<Carrier[]>([]);
  const [editing, setEditing]             = useState<Product | null>(null);
  const [form, setForm]                   = useState(emptyForm);
  const [showForm, setShowForm]           = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState("");
  const [filterCarrier, setFilterCarrier] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<Product | null>(null);

  const load = () =>
    fetch("/api/products").then(r => r.json()).then(setProducts);

  useEffect(() => {
    load();
    fetch("/api/carriers").then(r => r.json()).then(setCarriers);
  }, []);

  function openNew() { setEditing(null); setForm(emptyForm); setShowForm(true); setError(""); }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      carrier_id: p.carrier_id,
      name: p.name,
      type: p.type,
      surrender_years: p.surrender_years != null ? String(p.surrender_years) : "",
      min_premium: p.min_premium != null ? String(p.min_premium) : "",
      states_available: p.states_available ?? ["All"],
      bonus: p.bonus != null ? String(p.bonus) : "",
      mva: p.mva ?? false,
      surrender_schedule: p.surrender_schedule?.join(", ") ?? "",
      renewal_type: p.renewal_type ?? "Declared Rate",
      notes: p.notes ?? "",
      buffer_rate: p.buffer_rate != null ? String(p.buffer_rate) : "",
      free_withdrawal_pct: p.free_withdrawal_pct != null ? String(p.free_withdrawal_pct) : "",
    });
    setShowForm(true); setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.carrier_id || !form.name || !form.type) { setError("Carrier, name, and type are required."); return; }
    setSaving(true); setError("");

    const body = {
      carrier_id:        form.carrier_id,
      name:              form.name,
      type:              form.type,
      surrender_years:   form.surrender_years ? parseInt(form.surrender_years) : null,
      min_premium:       form.min_premium     ? parseFloat(form.min_premium)   : null,
      states_available:  form.states_available,
      bonus:             form.bonus           ? parseFloat(form.bonus)         : 0,
      mva:               form.mva,
      surrender_schedule: form.surrender_schedule
        ? form.surrender_schedule.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
        : [],
      renewal_type:         form.renewal_type || "Declared Rate",
      notes:                form.notes || null,
      buffer_rate:          form.buffer_rate          ? parseFloat(form.buffer_rate)          : 0,
      free_withdrawal_pct:  form.free_withdrawal_pct  ? parseFloat(form.free_withdrawal_pct)  : null,
    };

    const url    = editing ? `/api/products/${editing.id}` : "/api/products";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Save failed"); toast(data.error ?? "Save failed", "error"); return; }
    setShowForm(false);
    toast(editing ? `Product updated — ${form.name}` : `Product added — ${form.name}`);
    load();
  }

  async function handleDelete(p: Product) {
    await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    setConfirmTarget(null);
    toast(`Product archived — ${p.name}`);
    load();
  }

  const filtered = filterCarrier ? products.filter(p => p.carrier_id === filterCarrier) : products;
  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, width: "100%", fontFamily: "inherit", outline: "none" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 5 };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Products</h1>
          <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={filterCarrier} onChange={e => setFilterCarrier(e.target.value)} style={{ ...inputStyle, width: 200 }}>
            <option value="">All carriers</option>
            {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={openNew} style={{ padding: "10px 20px", background: C.blue, border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            + Add Product
          </button>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surfaceHi }}>
              {["Carrier", "Product", "Type", "Surrender", "Min Premium", "States", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textDim, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: C.textDim }}>No products yet.</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "11px 16px", color: C.textMid, fontSize: 12 }}>{(p.carrier as unknown as Carrier)?.name ?? carriers.find(c => c.id === p.carrier_id)?.name ?? "—"}</td>
                <td style={{ padding: "11px 16px", fontWeight: 600, color: C.text }}>{p.name}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ background: (TYPE_COLORS[p.type] ?? C.border) + "22", color: TYPE_COLORS[p.type] ?? C.textDim, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{p.type}</span>
                </td>
                <td style={{ padding: "11px 16px", color: C.textMid }}>{p.surrender_years != null ? `${p.surrender_years} yr` : "—"}</td>
                <td style={{ padding: "11px 16px", color: C.textMid, fontFamily: "monospace", fontSize: 12 }}>
                  {p.min_premium != null ? `$${Number(p.min_premium).toLocaleString()}` : "—"}
                </td>
                <td style={{ padding: "11px 16px", color: C.textMid, fontSize: 12 }}>
                  {p.states_available?.includes("All") ? "All" : (p.states_available?.length ?? 0) + " states"}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right" }}>
                  <button onClick={() => openEdit(p)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: C.textMid, cursor: "pointer", marginRight: 6 }}>Edit</button>
                  <button onClick={() => setConfirmTarget(p)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: C.red, cursor: "pointer" }}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 32, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h2 style={{ margin: "0 0 22px", fontSize: 17, fontWeight: 700, color: C.navy }}>{editing ? "Edit Product" : "Add Product"}</h2>

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>CARRIER *</label>
                <select value={form.carrier_id} onChange={e => setForm(f => ({ ...f, carrier_id: e.target.value }))} style={inputStyle} required>
                  <option value="">Select carrier…</option>
                  {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>PRODUCT NAME *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>TYPE *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ProductType }))} style={inputStyle} required>
                    <option value="">—</option>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>SURRENDER (YR)</label>
                  <input type="number" min="1" max="20" value={form.surrender_years} onChange={e => setForm(f => ({ ...f, surrender_years: e.target.value }))} style={inputStyle} placeholder="e.g. 7" />
                </div>
                <div>
                  <label style={labelStyle}>MIN PREMIUM ($)</label>
                  <input type="number" min="0" value={form.min_premium} onChange={e => setForm(f => ({ ...f, min_premium: e.target.value }))} style={inputStyle} placeholder="10000" />
                </div>
              </div>

              {/* RILA-specific fields */}
              {form.type === "RILA" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>BUFFER RATE (%)</label>
                  <input type="number" step="1" min="0" max="30" value={form.buffer_rate} onChange={e => setForm(f => ({ ...f, buffer_rate: e.target.value }))} style={inputStyle} placeholder="e.g. 10" />
                </div>
              )}

              {/* Free withdrawal — shown for MYGA, FIA, RILA */}
              {(form.type === "MYGA" || form.type === "FIA" || form.type === "RILA") && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>FREE WITHDRAWAL (%/YR)</label>
                  <input type="number" step="0.5" min="0" max="100" value={form.free_withdrawal_pct} onChange={e => setForm(f => ({ ...f, free_withdrawal_pct: e.target.value }))} style={inputStyle} placeholder="e.g. 10" />
                </div>
              )}

              {/* MYGA-specific fields */}
              {form.type === "MYGA" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>BONUS %</label>
                      <input type="number" step="0.01" min="0" value={form.bonus} onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))} style={inputStyle} placeholder="0.00" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
                      <input type="checkbox" id="mva" checked={form.mva} onChange={e => setForm(f => ({ ...f, mva: e.target.checked }))} style={{ accentColor: C.blue, width: 16, height: 16 }} />
                      <label htmlFor="mva" style={{ fontSize: 13, color: C.text, cursor: "pointer" }}>Market Value Adjustment (MVA)</label>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>SURRENDER SCHEDULE (comma-separated %)</label>
                    <input value={form.surrender_schedule} onChange={e => setForm(f => ({ ...f, surrender_schedule: e.target.value }))} style={inputStyle} placeholder="e.g. 8, 7, 6, 5, 4" />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>RENEWAL TYPE</label>
                    <select value={form.renewal_type} onChange={e => setForm(f => ({ ...f, renewal_type: e.target.value }))} style={inputStyle}>
                      {RENEWAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>NOTES</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, height: 72, resize: "vertical" }} placeholder="Optional advisor notes…" />
              </div>

              {error && <div style={{ background: C.redDim, color: C.red, borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 14 }}>{error}</div>}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer", color: C.textMid }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 24px", background: saving ? C.border : C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmTarget && (
        <ConfirmModal
          title={`Archive "${confirmTarget.name}"?`}
          body="This will deactivate the product. Existing rate records are preserved."
          confirmLabel="Archive"
          onConfirm={() => handleDelete(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
