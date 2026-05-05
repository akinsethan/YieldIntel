"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/tokens";
import type { Carrier, Product, Rate } from "@/lib/types";

function fmt(v: number | null) {
  return v != null ? `${v.toFixed(2)}%` : "—";
}

function dateFreshness(dateStr: string): { color: string; label: string } {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return { color: C.green,  label: "Today" };
  if (days <= 7)  return { color: C.amber,  label: `${days}d ago` };
  return              { color: C.red,    label: `${days}d ago` };
}

export default function AdminRatesPage() {
  const [carriers, setCarriers]   = useState<Carrier[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [rates, setRates]         = useState<Rate[]>([]);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");

  // Form state
  const [carrierId,  setCarrierId]  = useState("");
  const [productId,  setProductId]  = useState("");
  const [indexName,  setIndexName]  = useState("S&P 500 1-yr Pt-to-Pt");
  const [capRate,    setCapRate]     = useState("");
  const [parRate,    setParRate]     = useState("");
  const [spread,     setSpread]      = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetch("/api/carriers").then(r => r.json()).then(setCarriers);
    fetch("/api/rates").then(r => r.json()).then(setRates);
  }, []);

  useEffect(() => {
    if (!carrierId) { setProducts([]); setProductId(""); return; }
    fetch(`/api/products?carrier_id=${carrierId}`)
      .then(r => r.json()).then(setProducts);
    setProductId("");
  }, [carrierId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !indexName || !effectiveDate) {
      setError("Product, index name, and effective date are required.");
      return;
    }
    setSaving(true); setError(""); setSuccess("");

    const res = await fetch("/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id:     productId,
        index_name:     indexName,
        cap_rate:       capRate    ? parseFloat(capRate)    : null,
        par_rate:       parRate    ? parseFloat(parRate)    : null,
        spread:         spread     ? parseFloat(spread)     : null,
        effective_date: effectiveDate,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error ?? "Save failed"); return; }

    setSuccess(`Rate saved for ${indexName}. Previous rate archived.`);
    // Refresh rate table
    fetch("/api/rates").then(r => r.json()).then(setRates);
    // Reset product fields but keep carrier
    setCapRate(""); setParRate(""); setSpread("");
    setEffectiveDate(new Date().toISOString().slice(0, 10));
  }

  const inputStyle = {
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: C.text, width: "100%",
    fontFamily: "inherit", outline: "none",
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 5 };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Rate Update</h1>
        <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
          Enter new cap/par/spread rates. The previous rate is automatically archived with an expiration date.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 28, alignItems: "start" }}>
        {/* Form */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: "0 0 20px" }}>Post New Rate</h2>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>CARRIER</label>
              <select value={carrierId} onChange={e => setCarrierId(e.target.value)} style={inputStyle} required>
                <option value="">Select carrier…</option>
                {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>PRODUCT</label>
              <select value={productId} onChange={e => setProductId(e.target.value)} style={inputStyle} required disabled={!carrierId}>
                <option value="">Select product…</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>INDEX / STRATEGY</label>
              <input value={indexName} onChange={e => setIndexName(e.target.value)} style={inputStyle} placeholder="e.g. S&P 500 1-yr Pt-to-Pt" required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>CAP RATE %</label>
                <input type="number" step="0.01" min="0" value={capRate} onChange={e => setCapRate(e.target.value)} style={inputStyle} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>PAR RATE %</label>
                <input type="number" step="0.01" min="0" value={parRate} onChange={e => setParRate(e.target.value)} style={inputStyle} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>SPREAD %</label>
                <input type="number" step="0.01" min="0" value={spread} onChange={e => setSpread(e.target.value)} style={inputStyle} placeholder="0.00" />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>EFFECTIVE DATE</label>
              <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} style={inputStyle} required />
            </div>

            {error   && <div style={{ background: C.redDim,   color: C.red,   borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 14 }}>{error}</div>}
            {success && <div style={{ background: C.greenDim, color: C.green, borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 14 }}>{success}</div>}

            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%", padding: "11px", background: saving ? C.border : C.blue,
                border: "none", borderRadius: 9, color: "#fff", fontSize: 14,
                fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              {saving ? "Saving…" : "Save Rate"}
            </button>
          </form>
        </div>

        {/* Current rates table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: 0 }}>Current Rates</h2>
            <p style={{ fontSize: 12, color: C.textDim, margin: "3px 0 0" }}>{rates.length} active rate{rates.length !== 1 ? "s" : ""}</p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surfaceHi }}>
                  {["Carrier", "Product", "Type", "Index / Strategy", "Cap", "Par", "Spread", "Updated"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.textDim, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rates.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: C.textDim }}>No rates yet. Add the first one above.</td></tr>
                )}
                {rates.map((r: Rate) => {
                  const fresh = dateFreshness(r.created_at);
                  const p = r.product as (Product & { carrier?: Carrier }) | undefined;
                  return (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: C.text }}>{p?.carrier?.name ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: C.text }}>{p?.name ?? "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: C.blueDim, color: C.blue, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{p?.type}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: C.textMid }}>{r.index_name}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: C.text }}>{fmt(r.cap_rate)}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: C.text }}>{fmt(r.par_rate)}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: C.text }}>{fmt(r.spread)}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ color: fresh.color, fontFamily: "monospace", fontSize: 11, fontWeight: 600 }}>{fresh.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
