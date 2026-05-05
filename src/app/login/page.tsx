"use client";

import { useState } from "react";

const USERS = [
  { email:"advisor@yieldintel.com",   password:"advisor123",   name:"J. Akins", role:"advisor" },
  { email:"assistant@yieldintel.com", password:"assistant123", name:"Assistant", role:"assistant" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("advisor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setError("");
    const user = USERS.find(u => u.email === email && u.password === password && u.role === role);
    if (user) {
      localStorage.setItem("yi_user", JSON.stringify({ name: user.name, role: user.role, email: user.email }));
      window.location.href = "/";
    } else {
      setError("Invalid email, password or role. Please try again.");
      setLoading(false);
    }
  };

  const C = {
    navy:"#0B1C2E", navyMid:"#112236", navyHi:"#1E3448",
    blue:"#2E86FF", teal:"#19C6B4", text:"#FFFFFF",
    textMid:"#94A3B8", textDim:"#475569",
  };

  return (
    <div style={{ minHeight:"100vh", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"'Geist','Outfit','Segoe UI',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:"1.5rem" }}>
            <svg width="38" height="38" viewBox="0 0 34 34" fill="none">
              <rect width="34" height="34" rx="9" fill={C.navyHi}/>
              <path d="M8 22 L13 16 L18 19 L26 10" stroke={C.teal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="26" cy="10" r="2.5" fill={C.blue}/>
              <path d="M8 26 L26 26" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            </svg>
            <div style={{ textAlign:"left" }}>
              <div style={{ color:C.text, fontWeight:700, fontSize:18, letterSpacing:"-0.04em", lineHeight:1 }}>Yield<span style={{ color:C.blue }}>Intel</span></div>
              <div style={{ color:C.textMid, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace", marginTop:2 }}>Advisor Platform</div>
            </div>
          </div>
          <div style={{ color:C.text, fontSize:20, fontWeight:500, marginBottom:6 }}>Welcome back</div>
          <div style={{ color:C.textMid, fontSize:14 }}>Sign in to your advisor account</div>
        </div>

        <div style={{ background:C.navyMid, border:`0.5px solid ${C.navyHi}`, borderRadius:14, padding:"1.75rem" }}>
          <div style={{ marginBottom:"1.25rem" }}>
            <label style={{ display:"block", fontSize:13, color:C.textMid, marginBottom:6, fontWeight:500 }}>Email address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@yourfirm.com"
              style={{ width:"100%", boxSizing:"border-box", background:C.navy, border:`1px solid ${C.navyHi}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:13, outline:"none" }}/>
          </div>

          <div style={{ marginBottom:"1rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <label style={{ fontSize:13, color:C.textMid, fontWeight:500 }}>Password</label>
            </div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
              style={{ width:"100%", boxSizing:"border-box", background:C.navy, border:`1px solid ${C.navyHi}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:13, outline:"none" }}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
          </div>

          <div style={{ marginBottom:"1.5rem" }}>
            <div style={{ fontSize:12, color:C.textMid, textAlign:"center", marginBottom:"0.75rem" }}>Sign in as</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { id:"advisor",   label:"Advisor",   sub:"Full access",    icon:"👤" },
                { id:"assistant", label:"Assistant",  sub:"Limited access", icon:"🤝" },
              ].map(r=>(
                <div key={r.id} onClick={()=>setRole(r.id)}
                  style={{ border: role===r.id ? `2px solid ${C.blue}` : `0.5px solid ${C.navyHi}`, borderRadius:10, padding:10, textAlign:"center", cursor:"pointer", background: role===r.id ? "#0F2A45" : "transparent", transition:"all 0.15s" }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{r.icon}</div>
                  <div style={{ fontSize:12, fontWeight:500, color: role===r.id ? C.blue : C.text }}>{r.label}</div>
                  <div style={{ fontSize:11, color: role===r.id ? "#5BA4FF" : C.textMid }}>{r.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background:"#2B0A0A", border:"1px solid #DC2626", borderRadius:8, padding:"10px 14px", color:"#FCA5A5", fontSize:12, marginBottom:"1rem" }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:"100%", padding:"10px 0", background:C.blue, border:"none", borderRadius:9, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", opacity:loading?0.7:1 }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:"1.25rem", display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:12, color:C.textDim }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Secured · YieldIntel Platform
        </div>
      </div>
    </div>
  );
}