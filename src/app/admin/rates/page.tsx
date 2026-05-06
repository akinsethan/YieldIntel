"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/tokens";
import { useAdminToast } from "@/components/ui/AdminToast";
import { createClient } from "@/lib/supabase/client";
import type { Carrier, Product, Rate } from "@/lib/types";

function fmt(v: number | null) { return v != null ? `${v.toFixed(2)}%` : "—"; }

function dateFreshness(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return { color: C.green, dot: C.green, label: "Today" };
  if (days <= 7)  return { color: C.amber, dot: C.amber, label: `${days}d ago` };
  return              { color: C.red,   dot: C.red,   label: `${days}d ago` };
}

const INDEX_PRESETS = [
  "S&P 500 1-yr Pt-to-Pt", "S&P 500 2-yr Pt-to-Pt", "S&P 500 Annual PTP w/ Spread",
  "Bloomberg US Dynamic Balance II", "Declared Rate", "Fixed Account",
];

export default function AdminRatesPage() {
  const { toast } = useAdminToast();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rates, setRates]       = useState<Rate[]>([]);
  const [saving, setSaving]     = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [carrierId,     setCarrierId]     = useState("");
  const [productId,     setProductId]     = useState("");
  const [indexName,     setIndexName]     = useState("");
  const [capRate,       setCapRate]       = useState("");
  const [parRate,       setParRate]       = useState("");
  const [spread,        setSpread]        = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetch("/api/carriers").then(r => r.json()).then(setCarriers);
    fetch("/api/rates").then(r => r.json()).then(setRates);
    // Get current user for updated_by
    createClient().auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    if (!carrierId) { setProducts([]); setProductId(""); return; }
    fetch(`/api/products?carrier_id=${carrierId}`).then(r => r.json()).then(setProducts);
    setProductId("");
  }, [carrierId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !indexName || !effectiveDate) {
      toast("Product, index name, and effective date are required.", "error");
      return;
    }
    setSaving(true);

    const selectedProduct = products.find(p => p.id === productId);
    const res = await fetch("/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id:     productId,
        index_name:     indexName,
        cap_rate:       capRate  ? parseFloat(capRate)  : null,
        par_rate:       parRate  ? parseFloat(parRate)  : null,
        spread:         spread   ? parseFloat(spread)   : null,
        effective_date: effectiveDate,
        updated_by:     userEmail,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast(data.error ?? "Save failed", "error");
      return;
    }

    const productName = selectedProduct?.name ?? indexName;
    const capLabel    = capRate ? ` cap now ${parseFloat(capRate).toFixed(2)}%` : "";
    toast(`Rate updated — ${productName} ${indexName}${capLabel}`);
    fetch("/api/rates").then(r => r.json()).then(setRates);
    setCapRate(""); setParRate(""); setSpread("");
    setEffectiveDate(new Date().toISOString().slice(0, 10));
  }

  const inputStyle: React.CSSProperties = {
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: C.text, width: "100%",
    fontFamily: "inherit", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 5,
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Rate Update</h1>
        <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>
          Post new cap/par/spread rates. The previous rate is automatically archived with an expiration date.
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
              <input
                list="index-presets"
                value={indexName}
                onChange={e => setIndexName(e.target.value)}
                style={inputStyle}
                placeholder="e.g. S&P 500 1-yr Pt-to-Pt"
                required
              />
              <datalist id="index-presets">
                {INDEX_PRESETS.map(p => <option key={p} value={p} />)}
              </datalist>
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

            {userEmail && (
              <div style={{ marginBottom: 16, padding: "8px 12px", background: C.surfaceHi, borderRadius: 8, fontSize: 11, color: C.textDim }}>
                Will be logged as updated by <strong style={{ color: C.textMid }}>{userEmail}</strong>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{ width: "100%", padding: "11px", background: saving ? C.border : C.teal, border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
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
                  {["Carrier", "Product", "Type", "Index / Strategy", "Cap", "Par", "Spread", "Updated", "By"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.textDim, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rates.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: C.textDim }}>No rates yet. Post the first one using the form.</td></tr>
                )}
                {rates.map((r: Rate) => {
                  const fresh = dateFreshness(r.effective_date);
                  const p = r.product as (Product & { carrier?: Carrier }) | undefined;
                  return (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHi)}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: C.text }}>{p?.carrier?.name ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: C.text }}>{p?.name ?? "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: C.blueDim, color: C.blue, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{p?.type}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: C.textMid }}>{r.index_name}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: C.navy, fontWeight: 700 }}>{fmt(r.cap_rate)}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: C.navy, fontWeight: 700 }}>{fmt(r.par_rate)}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: C.textMid }}>{fmt(r.spread)}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: fresh.color, fontSize: 11, fontWeight: 700 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: fresh.dot, display: "inline-block" }} />
                          {fresh.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: C.textDim, fontSize: 11 }}>{r.updated_by ?? "—"}</td>
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
