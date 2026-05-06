"use client";

import { useState, useRef } from "react";
import { C } from "@/lib/tokens";

const REQUIRED_COLS = ["carrier_name", "product_name", "product_type", "index_name", "effective_date"];
const ALL_COLS      = [...REQUIRED_COLS, "surrender_years", "min_premium", "cap_rate", "par_rate", "spread", "buffer_rate"];

const TEMPLATE_CSV = [
  ALL_COLS.join(","),
  "Allianz Life,360 RILA,RILA,S&P 500 1-Year Point-to-Point,2025-05-01,6,10000,12.50,,0.25,10",
  "American Equity,AssetShield FIA,FIA,S&P 500 Annual Point-to-Point,2025-05-01,7,10000,9.00,100,,0",
].join("\n");

interface ParsedRow {
  [key: string]: string | number | undefined;
  carrier_name: string;
  product_name: string;
  product_type: string;
  index_name: string;
  effective_date: string;
  surrender_years?: number;
  min_premium?: number;
  cap_rate?: number;
  par_rate?: number;
  spread?: number;
  buffer_rate?: number;
}

interface ImportResult {
  row: number;
  status: "ok" | "error";
  message?: string;
}

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[]; errors: string[] } {
  const lines  = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [], errors: ["CSV must have a header row and at least one data row."] };

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const errors: string[] = [];
  const missing = REQUIRED_COLS.filter(c => !headers.includes(c));
  if (missing.length > 0) errors.push(`Missing required columns: ${missing.join(", ")}`);
  if (errors.length > 0) return { headers, rows: [], errors };

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",");
    const row: Record<string, string | number | undefined> = {};
    headers.forEach((h, idx) => {
      const raw = vals[idx]?.trim() ?? "";
      if (["surrender_years", "min_premium", "cap_rate", "par_rate", "spread", "buffer_rate"].includes(h)) {
        row[h] = raw !== "" ? parseFloat(raw) : undefined;
      } else {
        row[h] = raw !== "" ? raw : undefined;
      }
    });
    rows.push(row as ParsedRow);
  }
  return { headers, rows, errors };
}

function downloadTemplate() {
  const blob = new URL("data:text/csv;charset=utf-8," + encodeURIComponent(TEMPLATE_CSV));
  const a = document.createElement("a");
  a.href = blob.href;
  a.download = "yieldintel_import_template.csv";
  a.click();
}

export default function AdminImportPage() {
  const [csv, setCsv]           = useState("");
  const [parsed, setParsed]     = useState<ParsedRow[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults]   = useState<{ ok: number; errors: number; results: ImportResult[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputStyle = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, width: "100%", fontFamily: "inherit", outline: "none" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", display: "block", marginBottom: 5 };

  function handleParse() {
    const { rows, errors } = parseCSV(csv);
    setParseErrors(errors);
    setParsed(errors.length === 0 ? rows : null);
    setResults(null);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setCsv(text);
      const { rows, errors } = parseCSV(text);
      setParseErrors(errors);
      setParsed(errors.length === 0 ? rows : null);
      setResults(null);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!parsed || parsed.length === 0) return;
    setImporting(true);
    setResults(null);
    const res  = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: parsed }),
    });
    const data = await res.json();
    setResults(data);
    setImporting(false);
  }

  function reset() {
    setCsv(""); setParsed(null); setParseErrors([]); setResults(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const headers = parsed && parsed.length > 0 ? Object.keys(parsed[0]) : [];

  return (
    <div style={{ padding: "36px 40px", maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Bulk Import</h1>
          <p style={{ color: C.textMid, fontSize: 13, marginTop: 4 }}>Import products and rates from a CSV file</p>
        </div>
        <button onClick={downloadTemplate} style={{ padding: "10px 20px", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 9, color: C.textMid, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ↓ Download Template
        </button>
      </div>

      {/* Required columns info */}
      <div style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>
        <strong style={{ color: C.text }}>Required columns:</strong>{" "}
        {REQUIRED_COLS.map(c => <code key={c} style={{ background: C.bg, borderRadius: 4, padding: "1px 6px", marginRight: 4, fontFamily: "monospace", color: C.blue }}>{c}</code>)}
        <br />
        <strong style={{ color: C.text }}>Optional:</strong>{" "}
        {["surrender_years", "min_premium", "cap_rate", "par_rate", "spread", "buffer_rate"].map(c =>
          <code key={c} style={{ background: C.bg, borderRadius: 4, padding: "1px 6px", marginRight: 4, fontFamily: "monospace", color: C.textMid }}>{c}</code>
        )}
        <br />
        <span style={{ color: C.textDim, fontSize: 11 }}>Carrier names must match exactly with existing carriers in the database. Products will be created if they don't exist.</span>
      </div>

      {/* File upload */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>UPLOAD CSV FILE</label>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileUpload} style={{ ...inputStyle, padding: "7px 12px" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ color: C.textDim, fontSize: 12 }}>or paste CSV below</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>PASTE CSV</label>
          <textarea
            value={csv}
            onChange={e => { setCsv(e.target.value); setParsed(null); setParseErrors([]); setResults(null); }}
            style={{ ...inputStyle, height: 160, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
            placeholder={`carrier_name,product_name,product_type,index_name,effective_date,...\nAllianz Life,360 RILA,RILA,S&P 500,2025-05-01,...`}
          />
        </div>

        {parseErrors.length > 0 && (
          <div style={{ background: "#ff000015", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
            {parseErrors.map((e, i) => <div key={i} style={{ color: C.red, fontSize: 12 }}>{e}</div>)}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleParse} disabled={!csv.trim()} style={{ padding: "10px 24px", background: csv.trim() ? C.blue : C.border, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: csv.trim() ? "pointer" : "not-allowed" }}>
            Preview
          </button>
          {(parsed || parseErrors.length > 0) && (
            <button onClick={reset} style={{ padding: "10px 18px", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMid, fontSize: 13, cursor: "pointer" }}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Preview table */}
      {parsed && parsed.length > 0 && !results && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>Preview — {parsed.length} row{parsed.length !== 1 ? "s" : ""}</span>
            <button onClick={handleImport} disabled={importing} style={{ padding: "10px 24px", background: importing ? C.border : C.green, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: importing ? "not-allowed" : "pointer" }}>
              {importing ? "Importing…" : `Import ${parsed.length} Row${parsed.length !== 1 ? "s" : ""}`}
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.surfaceHi, borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: "8px 14px", color: C.textDim, fontWeight: 600, textAlign: "left", fontFamily: "monospace", fontSize: 11 }}>#</th>
                  {headers.map(h => (
                    <th key={h} style={{ padding: "8px 14px", color: REQUIRED_COLS.includes(h) ? C.blue : C.textDim, fontWeight: 600, textAlign: "left", fontFamily: "monospace", fontSize: 11, whiteSpace: "nowrap" }}>
                      {h}{REQUIRED_COLS.includes(h) ? " *" : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.map((row, i) => {
                  const hasEmpty = REQUIRED_COLS.some(c => !row[c]);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: hasEmpty ? "#ff000008" : undefined }}>
                      <td style={{ padding: "9px 14px", color: C.textDim, fontFamily: "monospace" }}>{i + 1}</td>
                      {headers.map(h => (
                        <td key={h} style={{ padding: "9px 14px", color: REQUIRED_COLS.includes(h) && !row[h] ? C.red : C.textMid, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                          {row[h] !== undefined && row[h] !== "" ? String(row[h]) : <span style={{ color: C.border }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ background: C.green + "18", border: `1px solid ${C.green}`, borderRadius: 10, padding: "14px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.green, fontFamily: "monospace" }}>{results.ok}</div>
              <div style={{ fontSize: 12, color: C.textMid }}>Imported</div>
            </div>
            <div style={{ background: results.errors > 0 ? C.red + "18" : C.surfaceHi, border: `1px solid ${results.errors > 0 ? C.red : C.border}`, borderRadius: 10, padding: "14px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: results.errors > 0 ? C.red : C.textDim, fontFamily: "monospace" }}>{results.errors}</div>
              <div style={{ fontSize: 12, color: C.textMid }}>Errors</div>
            </div>
          </div>

          {results.results.filter(r => r.status === "error").length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, letterSpacing: "0.06em" }}>ERRORS</div>
              {results.results.filter(r => r.status === "error").map(r => (
                <div key={r.row} style={{ background: "#ff000010", borderRadius: 6, padding: "8px 12px", marginBottom: 6, fontSize: 12, color: C.red }}>
                  Row {r.row + 2}: {r.message}
                </div>
              ))}
            </div>
          )}

          <button onClick={reset} style={{ marginTop: 16, padding: "10px 20px", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMid, fontSize: 13, cursor: "pointer" }}>
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
