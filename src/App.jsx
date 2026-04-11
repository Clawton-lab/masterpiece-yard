import { useState, useEffect, useCallback } from "react";

const SB = "https://lvhqfslhcpiwshgvrnlp.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aHFmc2xoY3Bpd3NoZ3ZybmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjU5MTMsImV4cCI6MjA5MTM0MTkxM30.2KDKoJeGpiKs_7lZwxW8TAcldvzM3WhimJfQYxyZ_c0";
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };

async function api(path, opts = {}) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: H, ...opts });
  const txt = await r.text();
  if (!r.ok) throw new Error(`${r.status}: ${txt}`);
  return txt ? JSON.parse(txt) : [];
}

const UNITS = ["pcs", "SF", "LF", "bags", "boxes", "pallets", "rolls", "each"];
const ROLES = { super_admin: 4, senior_admin: 3, admin: 2, user: 1 };
const RLBL = { super_admin: "Owner", senior_admin: "Senior Admin", admin: "Admin", user: "User" };
const ST = { good: { l: "In Stock", c: "#16a34a", b: "rgba(22,163,74,0.1)" }, low: { l: "Low Stock", c: "#d97706", b: "rgba(217,119,6,0.1)" }, out: { l: "Out", c: "#dc2626", b: "rgba(220,38,38,0.08)" } };
function gSt(q, t) { return q <= 0 ? "out" : q <= t ? "low" : "good"; }
function fD(d) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
function fA(d) { const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 1) return "just now"; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

const P = { bg: "#faf8f5", card: "#fff", bdr: "#e5e0d8", bdrL: "#f0ece6", txt: "#1a1a1a", mid: "#6b6560", lt: "#9c9590", red: "#c41e2a", rBg: "rgba(196,30,42,0.06)", tan: "#c4b59a", tBg: "rgba(196,181,154,0.12)", blk: "#1a1a1a", grn: "#16a34a", gBg: "rgba(22,163,74,0.08)", amb: "#d97706", aBg: "rgba(217,119,6,0.08)" };
const Ft = { h: "'Bitter',serif", b: "'Source Sans 3',sans-serif", m: "'IBM Plex Mono',monospace" };
const iS = { width: "100%", padding: "12px 14px", background: "#fff", border: `1.5px solid ${P.bdr}`, borderRadius: 10, color: P.txt, fontSize: 15, fontFamily: Ft.b, outline: "none", boxSizing: "border-box" };

function Logo() {
  return <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg width="38" height="38" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fff" stroke={P.bdr} strokeWidth="1.5" /><path d="M30 78 C30 78,28 55,32 40 C36 25,38 20,36 15" fill="none" stroke={P.tan} strokeWidth="6" strokeLinecap="round" /><path d="M38 78 C38 78,36 50,42 35 C48 20,50 14,47 8" fill="none" stroke={P.red} strokeWidth="6.5" strokeLinecap="round" /><path d="M44 80 L44 30 L58 55 L72 22 L72 80" fill="none" stroke={P.blk} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <div><div style={{ fontFamily: Ft.h, fontSize: 15, fontWeight: 700, color: P.txt, lineHeight: 1.1 }}>Masterpiece</div><div style={{ fontSize: 8, fontFamily: Ft.m, color: P.red, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>Material Yard & Tool Checkout</div></div>
  </div>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
    <div style={{ position: "relative", background: P.card, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "auto", padding: "20px 20px 32px", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)", animation: "slideUp .3s ease" }}>
      <div style={{ width: 40, height: 4, background: P.bdr, borderRadius: 2, margin: "0 auto 16px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: Ft.h }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: P.lt, cursor: "pointer", padding: 4 }}>✕</button>
      </div>{children}
    </div>
  </div>;
}

function Fl({ label, children }) { return <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.mid, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5, fontFamily: Ft.m }}>{label}</label>{children}</div>; }
function Btn({ children, onClick, color = P.red, full, disabled, small, sx }) { return <button onClick={disabled ? undefined : onClick} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: small ? "8px 14px" : "12px 20px", borderRadius: 10, border: "none", background: color, color: "#fff", fontSize: small ? 13 : 15, fontWeight: 700, cursor: disabled ? "default" : "pointer", fontFamily: Ft.b, opacity: disabled ? 0.4 : 1, width: full ? "100%" : "auto", ...sx }}>{children}</button>; }
function Pill({ s }) { const x = ST[s]; return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: x.b, color: x.c, fontFamily: Ft.m }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: x.c }} />{x.l}</span>; }
function Toast({ m, s }) { return <div style={{ position: "fixed", bottom: 80, left: "50%", transform: `translateX(-50%) translateY(${s ? 0 : 20}px)`, background: P.red, color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: Ft.b, opacity: s ? 1 : 0, transition: "all .3s cubic-bezier(.16,1,.3,1)", pointerEvents: "none", zIndex: 9999, maxWidth: "90%", textAlign: "center" }}>{m}</div>; }

function Nav({ tab, set, alerts, admin }) {
  const ts = [{ k: "yard", l: "Yard" }, { k: "tools", l: "Tools" }, { k: "activity", l: "Activity" }, { k: "projects", l: "Projects" }, { k: "alerts", l: "Alerts", b: alerts }];
  if (admin) ts.push({ k: "admin", l: "Admin" });
  return <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 900, background: "#fff", borderTop: `2px solid ${P.tan}`, display: "flex", justifyContent: "space-around", padding: "8px 0 env(safe-area-inset-bottom,8px)" }}>
    {ts.map(t => <button key={t.k} onClick={() => set(t.k)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px", background: "none", border: "none", cursor: "pointer", color: tab === t.k ? P.red : P.lt, borderTop: tab === t.k ? `2px solid ${P.red}` : "2px solid transparent", marginTop: -2, position: "relative" }}>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: Ft.m }}>{t.l}</span>
      {t.b > 0 && <span style={{ position: "absolute", top: -2, right: 0, width: 16, height: 16, borderRadius: "50%", background: P.red, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: Ft.m }}>{t.b}</span>}
    </button>)}
  </nav>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [aName, setAN] = useState(""); const [aPin, setAP] = useState("");
  const [aEmail, setAE] = useState(""); const [aErr, setAErr] = useState("");
  const [debug, setDebug] = useState("");

  const [mats, setMats] = useState([]); const [projs, setProjs] = useState([]);
  const [txns, setTxns] = useState([]); const [tools, setTools] = useState([]);
  const [cos, setCos] = useState([]); const [cats, setCats] = useState([]);
  const [users, setUsr] = useState([]);

  const [tab, setTab] = useState("yard"); const [search, setSrch] = useState("");
  const [fCat, setFC] = useState("All");
  const [txnSh, setTxnSh] = useState({ o: false, m: "take", mat: null });
  const [matMod, setMatMod] = useState({ o: false, mat: null });
  const [toolCo, setToolCo] = useState({ o: false, tool: null });
  const [projMod, setProjMod] = useState(false);
  const [toolMod, setToolMod] = useState(false);
  const [detail, setDetail] = useState(null); const [dProj, setDP] = useState(null);
  const [delCon, setDel] = useState(null);
  const [toast, setToast] = useState({ m: "", s: false });
  const [loaded, setLoaded] = useState(false);
  const [nCat, setNC] = useState(""); const [nPN, setNPN] = useState(""); const [nPA, setNPA] = useState("");
  const [nTN, setNTN] = useState(""); const [nTS, setNTS] = useState(""); const [nTNo, setNTNo] = useState("");

  const show = useCallback(m => { setToast({ m, s: true }); setTimeout(() => setToast(t => ({ ...t, s: false })), 2800); }, []);
  const isA = user && ROLES[user.role] >= 2;
  const isS = user && ROLES[user.role] >= 3;

  const load = useCallback(async () => {
    try {
      const [a, b, c, d, e, f, g] = await Promise.all([
        api("materials?order=name"), api("projects?order=name"),
        api("transactions?order=created_at.desc&limit=200"),
        api("tools?order=name"), api("tool_checkouts?order=checked_out_at.desc&limit=200"),
        api("categories?order=sort_order"), api("yard_users?order=name"),
      ]);
      setMats(a); setProjs(b); setTxns(c); setTools(d); setCos(e); setCats(f); setUsr(g);
    } catch (e) { console.error(e); }
    setLoaded(true);
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);
  useEffect(() => { if (!user) return; const i = setInterval(load, 15000); return () => clearInterval(i); }, [user, load]);

  // ── LOGIN with debug ──
  const login = async () => {
    setAErr(""); setDebug("");
    if (!aName.trim() || aPin.length !== 4) { setAErr("Enter name and 4-digit PIN."); return; }
    try {
      const r = await fetch(`${SB}/rest/v1/yard_users?active=eq.true&select=id,name,pin,email,role,active`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
      const txt = await r.text();
      setDebug(`Status: ${r.status} | Response: ${txt.substring(0, 200)}`);
      if (!r.ok) { setAErr(`API error: ${r.status}`); return; }
      const all = JSON.parse(txt);
      if (!all || all.length === 0) { setAErr("No users found. Check RLS policies."); return; }
      const found = all.find(u => u.name.toLowerCase() === aName.trim().toLowerCase() && u.pin === aPin);
      if (!found) { setAErr(`Found ${all.length} user(s) but no match. Names: ${all.map(u => u.name).join(", ")}`); return; }
      setUser(found); show(`Welcome back, ${found.name}!`);
    } catch (e) { setAErr(`Connection error: ${e.message}`); setDebug(e.stack || e.message); }
  };

  const signup = async () => {
    setAErr("");
    if (!aName.trim() || !aEmail.trim() || aPin.length !== 4) { setAErr("Fill all fields. PIN = 4 digits."); return; }
    try {
      const ex = await api(`yard_users?email=eq.${encodeURIComponent(aEmail.toLowerCase().trim())}`);
      if (ex && ex.length > 0) { setAErr("Email already registered."); return; }
      const res = await api("yard_users", { method: "POST", body: JSON.stringify({ email: aEmail.toLowerCase().trim(), name: aName.trim(), pin: aPin, role: "user" }) });
      if (res && res[0]) { setUser(res[0]); show(`Welcome, ${res[0].name}!`); }
    } catch (e) { setAErr("Signup failed."); }
  };

  const doTxn = async ({ matId, qty, projId, note, md }) => {
    const mat = mats.find(x => x.id === matId); const proj = projs.find(x => x.id === projId);
    try {
      await api(`materials?id=eq.${matId}`, { method: "PATCH", body: JSON.stringify({ qty: Math.max(0, md === "take" ? mat.qty - qty : mat.qty + qty) }) });
      await api("transactions", { method: "POST", body: JSON.stringify({ material_id: matId, material_name: mat.name, unit: mat.unit, qty, mode: md, project_id: projId || null, project_name: proj?.name || "", note, user_name: user.name, user_id: user.id }) });
      await load(); setTxnSh({ o: false, m: "take", mat: null }); setDetail(null);
      show(md === "take" ? `Took ${qty} ${mat.unit} of ${mat.name}` : `Added ${qty} ${mat.unit}`);
    } catch (e) { show("Error"); }
  };

  const saveMat = async (mat) => {
    try {
      if (mat.id) await api(`materials?id=eq.${mat.id}`, { method: "PATCH", body: JSON.stringify(mat) });
      else await api("materials", { method: "POST", body: JSON.stringify(mat) });
      await load(); setMatMod({ o: false, mat: null }); show(`${mat.name} saved`);
    } catch (e) { show("Error"); }
  };

  const delMat = async id => { try { await api(`materials?id=eq.${id}`, { method: "DELETE" }); await load(); setDel(null); setDetail(null); show("Removed"); } catch (e) { show("Error"); } };
  const cOut = async ({ tId, tN, pId, note }) => { const p = projs.find(x => x.id === pId); try { await api("tool_checkouts", { method: "POST", body: JSON.stringify({ tool_id: tId, tool_name: tN, checked_out_by: user.name, user_id: user.id, project_id: pId, project_name: p?.name || "", note }) }); await load(); setToolCo({ o: false, tool: null }); show(`${tN} checked out`); } catch (e) { show("Error"); } };
  const retTool = async (id, n) => { try { await api(`tool_checkouts?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ returned_at: new Date().toISOString() }) }); await load(); show(`${n} returned`); } catch (e) { show("Error"); } };
  const addTool = async () => { if (!nTN.trim()) return; try { await api("tools", { method: "POST", body: JSON.stringify({ name: nTN.trim(), serial_number: nTS.trim(), notes: nTNo.trim() }) }); await load(); setToolMod(false); setNTN(""); setNTS(""); setNTNo(""); show("Tool added"); } catch (e) { show("Error"); } };
  const addCat = async () => { if (!nCat.trim()) return; try { await api("categories", { method: "POST", body: JSON.stringify({ name: nCat.trim(), sort_order: cats.length + 1 }) }); await load(); setNC(""); show("Added"); } catch (e) { show("Error"); } };
  const delCat = async (id, n) => { try { await api(`categories?id=eq.${id}`, { method: "DELETE" }); await load(); show(`"${n}" removed`); } catch (e) { show("Error"); } };
  const saveProj = async () => { if (!nPN.trim()) return; try { await api("projects", { method: "POST", body: JSON.stringify({ name: nPN.trim(), address: nPA.trim() }) }); await load(); setProjMod(false); setNPN(""); setNPA(""); show("Added"); } catch (e) { show("Error"); } };
  const togUser = async (id, a) => { try { await api(`yard_users?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ active: !a }) }); await load(); show(a ? "Deactivated" : "Activated"); } catch (e) { show("Error"); } };
  const chRole = async (id, r) => { try { await api(`yard_users?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ role: r }) }); await load(); show("Updated"); } catch (e) { show("Error"); } };

  const lowS = mats.filter(m => gSt(m.qty, m.low_threshold) !== "good");
  const aCo = cos.filter(c => !c.returned_at);
  const aN = lowS.length + aCo.filter(c => (Date.now() - new Date(c.checked_out_at)) / 86400000 > 7).length;
  const filt = mats.filter(m => { const q = search.toLowerCase(); return (!q || m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q) || (m.notes || "").toLowerCase().includes(q)) && (fCat === "All" || m.category === fCat); });

  const css = `@import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;600;700&family=Source+Sans+3:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}input:focus,select:focus{border-color:${P.red}!important}`;

  // ═══ AUTH ═══
  if (!user) return <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: Ft.b }}><style>{css}</style>
    <div style={{ width: "100%", maxWidth: 380, animation: "fadeIn .5s ease" }}>
      <div style={{ display: "flex", height: 4, borderRadius: 4, overflow: "hidden", marginBottom: 28 }}><div style={{ flex: 1, background: P.tan }} /><div style={{ flex: 1, background: P.red }} /><div style={{ flex: 1, background: P.blk }} /></div>
      <div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ display: "inline-flex" }}><Logo /></div><p style={{ fontSize: 13, color: P.mid, marginTop: 8 }}>Outdoor Living — Material Yard & Tool Checkout</p></div>
      <div style={{ display: "flex", background: P.bdrL, borderRadius: 10, padding: 3, marginBottom: 24 }}>
        {["login", "signup"].map(m => <button key={m} onClick={() => { setMode(m); setAErr(""); setDebug(""); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: mode === m ? "#fff" : "transparent", color: mode === m ? P.txt : P.lt, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: Ft.b, boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,.1)" : "none" }}>{m === "login" ? "Log In" : "Sign Up"}</button>)}
      </div>
      {mode === "signup" && <>
        <Fl label="Your Name"><input style={iS} value={aName} onChange={e => setAN(e.target.value)} placeholder="e.g. Stephen" /></Fl>
        <Fl label="Email"><input style={iS} type="email" value={aEmail} onChange={e => setAE(e.target.value)} placeholder="you@email.com" /></Fl>
        <Fl label="Create 4-digit PIN"><input style={{ ...iS, textAlign: "center", fontSize: 24, letterSpacing: 12, fontFamily: Ft.m }} maxLength={4} value={aPin} onChange={e => setAP(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="• • • •" /></Fl>
        {aErr && <div style={{ color: P.red, fontSize: 13, marginBottom: 12, fontFamily: Ft.m }}>{aErr}</div>}
        <Btn full onClick={signup}>Create Account</Btn>
      </>}
      {mode === "login" && <>
        <Fl label="Your Name"><input style={iS} value={aName} onChange={e => setAN(e.target.value)} placeholder="e.g. Stephen" onKeyDown={e => { if (e.key === "Enter") document.getElementById("pin")?.focus(); }} /></Fl>
        <Fl label="4-digit PIN"><input id="pin" style={{ ...iS, textAlign: "center", fontSize: 24, letterSpacing: 12, fontFamily: Ft.m }} maxLength={4} value={aPin} onChange={e => setAP(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="• • • •" onKeyDown={e => { if (e.key === "Enter" && aPin.length === 4) login(); }} /></Fl>
        {aErr && <div style={{ color: P.red, fontSize: 13, marginBottom: 12, fontFamily: Ft.m }}>{aErr}</div>}
        <Btn full onClick={login}>Enter the Yard</Btn>
      </>}
    </div>
  </div>;

  if (!loaded) return <div style={{ minHeight: "100vh", background: P.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: Ft.m, color: P.lt }}><style>{css}</style>Loading yard...</div>;

  // ═══ MATERIAL DETAIL ═══
  if (detail) {
    const mat = mats.find(m => m.id === detail); if (!mat) { setDetail(null); return null; }
    const st = gSt(mat.qty, mat.low_threshold);
    const mA = txns.filter(a => a.material_id === mat.id).slice(0, 20);
    return <div style={{ minHeight: "100vh", background: P.bg, fontFamily: Ft.b, paddingBottom: 80 }}><style>{css}</style>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: P.red, padding: 4 }}>←</button>
        <div style={{ flex: 1 }}><h2 style={{ fontFamily: Ft.h, fontSize: 18, fontWeight: 700, margin: 0 }}>{mat.name}</h2><span style={{ fontSize: 12, color: P.lt, fontFamily: Ft.m }}>{mat.category} · {mat.location}</span></div>
        {isA && <><button onClick={() => setMatMod({ o: true, mat })} style={{ background: P.tBg, border: "none", cursor: "pointer", color: P.blk, padding: 8, borderRadius: 8 }}>✎</button>
          <button onClick={() => setDel(mat.id)} style={{ background: P.rBg, border: "none", cursor: "pointer", color: P.red, padding: 8, borderRadius: 8 }}>🗑</button></>}
      </div>
      <div style={{ margin: "0 16px 16px", background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${P.bdr}`, borderTop: `3px solid ${P.tan}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div><div style={{ fontSize: 11, fontFamily: Ft.m, color: P.lt, textTransform: "uppercase", letterSpacing: 1 }}>On Hand</div><div style={{ fontSize: 40, fontWeight: 700, fontFamily: Ft.h, lineHeight: 1.1 }}>{mat.qty}<span style={{ fontSize: 16, color: P.mid, fontWeight: 400 }}> {mat.unit}</span></div></div>
          <Pill s={st} />
        </div>
        {mat.notes && <div style={{ fontSize: 13, color: P.mid, padding: "8px 12px", background: P.bg, borderRadius: 8, marginBottom: 8 }}>{mat.notes}</div>}
        <div style={{ fontSize: 11, fontFamily: Ft.m, color: P.lt }}>Alert at {mat.low_threshold} {mat.unit}</div>
      </div>
      <div style={{ display: "flex", gap: 10, margin: "0 16px 20px" }}>
        <Btn full color={P.red} onClick={() => setTxnSh({ o: true, m: "take", mat })} sx={{ flex: 1 }}>↓ Take</Btn>
        <Btn full color={P.grn} onClick={() => setTxnSh({ o: true, m: "add", mat })} sx={{ flex: 1 }}>↑ Add Stock</Btn>
      </div>
      <div style={{ margin: "0 16px" }}><h3 style={{ fontFamily: Ft.h, fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>Recent Activity</h3>
        {mA.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: P.lt, fontFamily: Ft.m }}>No activity yet</div>
          : mA.map(a => <div key={a.id} style={{ padding: "10px 0", borderBottom: `1px solid ${P.bdrL}` }}>
            <div style={{ fontSize: 14 }}><strong>{a.user_name}</strong> {a.mode === "take" ? "took" : "added"} <strong style={{ color: a.mode === "take" ? P.red : P.grn }}>{a.qty} {a.unit}</strong>{a.project_name && <span style={{ color: P.mid }}> → {a.project_name}</span>}</div>
            {a.note && <div style={{ fontSize: 12, color: P.lt, marginTop: 2, fontStyle: "italic" }}>"{a.note}"</div>}
            <div style={{ fontSize: 11, color: P.lt, fontFamily: Ft.m, marginTop: 2 }}>{fD(a.created_at)}</div>
          </div>)}
      </div>
      {txnSh.o && <TxnModal mat={mat} mode={txnSh.m} projs={projs} onClose={() => setTxnSh({ o: false, m: "take", mat: null })} onSubmit={doTxn} />}
      <Modal open={!!delCon} onClose={() => setDel(null)} title="Remove?"><p style={{ color: P.mid, margin: "0 0 20px" }}>Remove <strong>{mat.name}</strong>?</p><div style={{ display: "flex", gap: 10 }}><button onClick={() => setDel(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1.5px solid ${P.bdr}`, background: "#fff", color: P.mid, fontWeight: 600, cursor: "pointer" }}>Cancel</button><Btn full color={P.red} onClick={() => delMat(delCon)} sx={{ flex: 1 }}>Remove</Btn></div></Modal>
      <Modal open={matMod.o} onClose={() => setMatMod({ o: false, mat: null })} title="Edit Material"><MF mat={matMod.mat} cats={cats} onSave={saveMat} onX={() => setMatMod({ o: false, mat: null })} /></Modal>
      <Nav tab={tab} set={t => { setDetail(null); setTab(t); }} alerts={aN} admin={isA} />
    </div>;
  }

  // ═══ PROJECT DETAIL ═══
  if (dProj) {
    const proj = projs.find(p => p.id === dProj); if (!proj) { setDP(null); return null; }
    const pa = txns.filter(a => a.project_id === proj.id);
    const mu = {}; pa.forEach(a => { if (!mu[a.material_name]) mu[a.material_name] = { u: a.unit, t: 0, a: 0 }; if (a.mode === "take") mu[a.material_name].t += a.qty; else mu[a.material_name].a += a.qty; });
    return <div style={{ minHeight: "100vh", background: P.bg, fontFamily: Ft.b, paddingBottom: 80 }}><style>{css}</style>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setDP(null)} style={{ background: "none", border: "none", cursor: "pointer", color: P.red, padding: 4 }}>←</button>
        <div><h2 style={{ fontFamily: Ft.h, fontSize: 18, fontWeight: 700, margin: 0 }}>{proj.name}</h2>{proj.address && <span style={{ fontSize: 12, color: P.lt }}>{proj.address}</span>}</div>
      </div>
      <div style={{ margin: "0 16px" }}><h3 style={{ fontFamily: Ft.h, fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>Materials Used</h3>
        {Object.keys(mu).length === 0 ? <div style={{ padding: 20, textAlign: "center", color: P.lt, fontFamily: Ft.m }}>None yet</div>
          : Object.entries(mu).map(([n, d]) => <div key={n} style={{ padding: "10px 14px", background: "#fff", borderRadius: 10, border: `1px solid ${P.bdr}`, marginBottom: 8 }}><div style={{ fontWeight: 600 }}>{n}</div><div style={{ fontSize: 13, color: P.mid, fontFamily: Ft.m, marginTop: 4 }}>Taken: <strong style={{ color: P.red }}>{d.t} {d.u}</strong>{d.a > 0 && <> · Returned: <strong style={{ color: P.grn }}>{d.a} {d.u}</strong></>}</div></div>)}
      </div>
      <Nav tab={tab} set={t => { setDP(null); setTab(t); }} alerts={aN} admin={isA} />
    </div>;
  }

  // ═══ MAIN ═══
  return <div style={{ minHeight: "100vh", background: P.bg, fontFamily: Ft.b, paddingBottom: 80 }}><style>{css}</style>
    <div style={{ padding: "14px 16px", background: "#fff", borderBottom: `1px solid ${P.bdr}`, borderTop: `3px solid ${P.tan}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: P.lt, fontFamily: Ft.m }}>{user.name}</span>
        {isA && <span style={{ background: P.rBg, color: P.red, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, fontFamily: Ft.m }}>{RLBL[user.role]}</span>}
        <button onClick={() => { setUser(null); setAN(""); setAP(""); }} style={{ background: P.tBg, border: "none", cursor: "pointer", color: P.mid, padding: "6px 10px", borderRadius: 8, fontSize: 11, fontFamily: Ft.m, fontWeight: 600 }}>Log Out</button>
      </div>
    </div>
    <div style={{ padding: "16px 16px 0" }}>

      {tab === "yard" && <div style={{ animation: "fadeIn .3s ease" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[{ l: "Items", v: mats.length, c: P.blk, b: P.tan }, { l: "Low", v: lowS.filter(m => gSt(m.qty, m.low_threshold) === "low").length, c: P.amb, b: P.amb }, { l: "Out", v: lowS.filter(m => gSt(m.qty, m.low_threshold) === "out").length, c: P.red, b: P.red }].map(s =>
            <div key={s.l} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", border: `1px solid ${P.bdr}`, borderLeft: `3px solid ${s.b}` }}><div style={{ fontSize: 10, fontFamily: Ft.m, color: P.lt, textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</div><div style={{ fontSize: 24, fontWeight: 700, fontFamily: Ft.h, color: s.c }}>{s.v}</div></div>)}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ position: "relative", flex: 1 }}><span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: P.lt }}>🔍</span><input style={{ ...iS, paddingLeft: 40, fontSize: 14 }} placeholder="Search materials..." value={search} onChange={e => setSrch(e.target.value)} /></div>
          <Btn onClick={() => setMatMod({ o: true, mat: null })} sx={{ padding: "12px 14px" }}>+</Btn>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12 }}>
          {["All", ...cats.map(c => c.name)].map(c => <button key={c} onClick={() => setFC(c)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${fCat === c ? P.tan : P.bdr}`, background: fCat === c ? P.tBg : "#fff", color: fCat === c ? P.blk : P.mid, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: Ft.b }}>{c}</button>)}
        </div>
        {filt.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: P.lt, fontFamily: Ft.m }}>No materials found</div>
          : filt.map((mat, i) => { const st = gSt(mat.qty, mat.low_threshold); return <div key={mat.id} onClick={() => setDetail(mat.id)} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 8, border: `1px solid ${st === "out" ? "rgba(196,30,42,.3)" : st === "low" ? "rgba(217,119,6,.3)" : P.bdr}`, cursor: "pointer", animation: `fadeIn .3s ease ${Math.min(i * .03, .2)}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700 }}>{mat.name}</div><div style={{ fontSize: 11, color: P.lt, fontFamily: Ft.m, marginTop: 2 }}>{mat.category} · {mat.location}</div></div>
              <Pill s={st} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: Ft.h }}>{mat.qty}<span style={{ fontSize: 13, color: P.mid, fontWeight: 400 }}> {mat.unit}</span></div>
              <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setTxnSh({ o: true, m: "take", mat })} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: P.rBg, color: P.red, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Take</button>
                <button onClick={() => setTxnSh({ o: true, m: "add", mat })} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: P.gBg, color: P.grn, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add</button>
              </div>
            </div>
          </div>; })}
      </div>}

      {tab === "tools" && <div style={{ animation: "fadeIn .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h2 style={{ fontFamily: Ft.h, fontSize: 20, fontWeight: 700, margin: 0 }}>Tools</h2><Btn small onClick={() => setToolMod(true)}>+ Add Tool</Btn></div>
        {tools.map(tool => { const co = cos.find(c => c.tool_id === tool.id && !c.returned_at); const isOut = !!co;
          return <div key={tool.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 8, border: `1px solid ${isOut ? "rgba(217,119,6,.3)" : P.bdr}`, borderLeft: `3px solid ${isOut ? P.amb : P.tan}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div><div style={{ fontSize: 15, fontWeight: 700 }}>{tool.name}</div>{tool.serial_number && <div style={{ fontSize: 11, fontFamily: Ft.m, color: P.lt, marginTop: 2 }}>S/N: {tool.serial_number}</div>}</div>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: Ft.m, padding: "3px 10px", borderRadius: 20, background: isOut ? P.aBg : P.gBg, color: isOut ? P.amb : P.grn }}>{isOut ? "Out" : "Available"}</span>
            </div>
            {isOut && <div style={{ background: P.aBg, borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 13 }}><strong>{co.checked_out_by}</strong> · {co.project_name} · <span style={{ fontFamily: Ft.m, fontSize: 11 }}>{fA(co.checked_out_at)}</span></div>}
            {isOut ? <Btn small full color={P.grn} onClick={() => retTool(co.id, tool.name)}>← Return</Btn>
              : <Btn small full onClick={() => setToolCo({ o: true, tool })}>→ Check Out</Btn>}
          </div>; })}
      </div>}

      {tab === "activity" && <div style={{ animation: "fadeIn .3s ease" }}>
        <h2 style={{ fontFamily: Ft.h, fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Activity</h2>
        {[...txns.map(t => ({ ...t, tp: "m", ts: t.created_at })), ...cos.map(c => ({ ...c, tp: "t", ts: c.checked_out_at }))].sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 50).map(a =>
          <div key={a.id} style={{ padding: "12px 14px", background: "#fff", borderRadius: 12, border: `1px solid ${P.bdr}`, marginBottom: 8 }}>
            {a.tp === "m" ? <div style={{ fontSize: 14 }}><strong>{a.user_name}</strong> {a.mode === "take" ? "took" : "added"} <strong style={{ color: a.mode === "take" ? P.red : P.grn }}>{a.qty} {a.unit}</strong> of <strong>{a.material_name}</strong>{a.project_name && <span style={{ color: P.mid }}> → {a.project_name}</span>}</div>
              : <div style={{ fontSize: 14 }}><strong>{a.checked_out_by}</strong> {a.returned_at ? "returned" : "checked out"} <strong style={{ color: P.red }}>{a.tool_name}</strong>{a.project_name && <span style={{ color: P.mid }}> → {a.project_name}</span>}</div>}
            <div style={{ fontSize: 11, color: P.lt, fontFamily: Ft.m, marginTop: 4 }}>{fD(a.ts)}</div>
          </div>)}
      </div>}

      {tab === "projects" && <div style={{ animation: "fadeIn .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h2 style={{ fontFamily: Ft.h, fontSize: 20, fontWeight: 700, margin: 0 }}>Projects</h2>{isA && <Btn small onClick={() => setProjMod(true)}>+ Add Job</Btn>}</div>
        {projs.map(p => <div key={p.id} onClick={() => setDP(p.id)} style={{ padding: "14px 16px", background: "#fff", borderRadius: 12, border: `1px solid ${P.bdr}`, marginBottom: 8, cursor: "pointer" }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>{p.address && <div style={{ fontSize: 12, color: P.lt, marginTop: 2 }}>{p.address}</div>}
          <div style={{ fontSize: 11, color: P.mid, fontFamily: Ft.m, marginTop: 4 }}>{txns.filter(a => a.project_id === p.id && a.mode === "take").length} pulls</div>
        </div>)}
      </div>}

      {tab === "alerts" && <div style={{ animation: "fadeIn .3s ease" }}>
        <h2 style={{ fontFamily: Ft.h, fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Alerts</h2>
        {lowS.length > 0 && <>{lowS.map(m => { const s = gSt(m.qty, m.low_threshold); return <div key={m.id} onClick={() => setDetail(m.id)} style={{ padding: "12px 16px", background: "#fff", borderRadius: 12, marginBottom: 8, cursor: "pointer", border: `1.5px solid ${s === "out" ? "rgba(196,30,42,.4)" : "rgba(217,119,6,.4)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontWeight: 700 }}>{m.name}</div><div style={{ fontSize: 12, fontFamily: Ft.m, color: P.lt, marginTop: 2 }}>{m.qty} {m.unit} left</div></div><Pill s={s} /></div></div>; })}</>}
        {lowS.length === 0 && <div style={{ padding: 40, textAlign: "center" }}><div style={{ color: P.grn, fontWeight: 700, fontSize: 16, fontFamily: Ft.h }}>✓ All clear</div></div>}
      </div>}

      {tab === "admin" && isA && <div style={{ animation: "fadeIn .3s ease" }}>
        <h2 style={{ fontFamily: Ft.h, fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Admin</h2>
        <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.bdr}`, padding: 16, marginBottom: 16, borderTop: `3px solid ${P.red}` }}>
          <h3 style={{ fontSize: 13, fontFamily: Ft.m, margin: "0 0 12px" }}>USERS ({users.length})</h3>
          {users.map(u => { const canE = ROLES[user.role] > ROLES[u.role] || user.role === "super_admin"; const self = u.id === user.id;
            return <div key={u.id} style={{ padding: "10px 0", borderBottom: `1px solid ${P.bdrL}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 600, fontSize: 14, color: u.active ? P.txt : P.lt }}>{u.name} {self && <span style={{ fontSize: 11, color: P.lt }}>(you)</span>}</div><div style={{ fontSize: 11, fontFamily: Ft.m, color: P.lt }}>{u.email} · <span style={{ color: P.red }}>{RLBL[u.role]}</span></div></div>
              {canE && !self && <div style={{ display: "flex", gap: 6 }}>
                <select value={u.role} onChange={e => chRole(u.id, e.target.value)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: `1px solid ${P.bdr}`, fontFamily: Ft.m }}><option value="user">User</option><option value="admin">Admin</option>{isS && <option value="senior_admin">Sr Admin</option>}</select>
                <button onClick={() => togUser(u.id, u.active)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "none", background: u.active ? P.rBg : P.gBg, color: u.active ? P.red : P.grn, fontWeight: 600, cursor: "pointer", fontFamily: Ft.m }}>{u.active ? "Deactivate" : "Activate"}</button>
              </div>}
            </div>; })}
        </div>
        <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.bdr}`, padding: 16, borderTop: `3px solid ${P.tan}` }}>
          <h3 style={{ fontSize: 13, fontFamily: Ft.m, margin: "0 0 12px" }}>CATEGORIES</h3>
          {cats.map(c => <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${P.bdrL}` }}>
            <span>{c.name}</span><button onClick={() => delCat(c.id, c.name)} style={{ background: P.rBg, border: "none", color: P.red, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: Ft.m }}>Remove</button>
          </div>)}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}><input style={{ ...iS, flex: 1, fontSize: 14 }} value={nCat} onChange={e => setNC(e.target.value)} placeholder="New category" onKeyDown={e => { if (e.key === "Enter") addCat(); }} /><Btn small onClick={addCat}>+</Btn></div>
        </div>
      </div>}
    </div>

    {txnSh.o && !detail && txnSh.mat && <TxnModal mat={txnSh.mat} mode={txnSh.m} projs={projs} onClose={() => setTxnSh({ o: false, m: "take", mat: null })} onSubmit={doTxn} />}
    {toolCo.o && toolCo.tool && <TCModal tool={toolCo.tool} projs={projs} uName={user.name} onClose={() => setToolCo({ o: false, tool: null })} onSubmit={cOut} />}
    <Modal open={matMod.o} onClose={() => setMatMod({ o: false, mat: null })} title={matMod.mat ? "Edit" : "Add Material"}><MF mat={matMod.mat} cats={cats} onSave={saveMat} onX={() => setMatMod({ o: false, mat: null })} /></Modal>
    <Modal open={projMod} onClose={() => setProjMod(false)} title="Add Project"><Fl label="Name"><input style={iS} value={nPN} onChange={e => setNPN(e.target.value)} placeholder="e.g. Henderson Patio" /></Fl><Fl label="Address"><input style={iS} value={nPA} onChange={e => setNPA(e.target.value)} /></Fl><Btn full disabled={!nPN.trim()} onClick={saveProj}>Add Project</Btn></Modal>
    <Modal open={toolMod} onClose={() => { setToolMod(false); setNTN(""); setNTS(""); setNTNo(""); }} title="Add Tool"><Fl label="Name"><input style={iS} value={nTN} onChange={e => setNTN(e.target.value)} placeholder="e.g. DeWalt Impact" /></Fl><Fl label="Serial #"><input style={iS} value={nTS} onChange={e => setNTS(e.target.value)} /></Fl><Fl label="Notes"><input style={iS} value={nTNo} onChange={e => setNTNo(e.target.value)} /></Fl><Btn full disabled={!nTN.trim()} onClick={addTool}>Add Tool</Btn></Modal>

    <Nav tab={tab} set={setTab} alerts={aN} admin={isA} />
    <Toast m={toast.m} s={toast.s} />
  </div>;
}

function TxnModal({ mat, mode, projs, onClose, onSubmit }) {
  const [q, setQ] = useState(""); const [pId, setPId] = useState(""); const [nt, setNt] = useState("");
  const isTake = mode === "take"; const qn = parseInt(q) || 0;
  const ok = qn > 0 && (isTake ? qn <= mat.qty && pId : true);
  return <Modal open={true} onClose={onClose} title={isTake ? `Take ${mat.name}` : `Add ${mat.name}`}>
    <div style={{ background: isTake ? P.rBg : P.gBg, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: P.mid, fontFamily: Ft.m }}>Current stock</div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: Ft.h }}>{mat.qty} <span style={{ fontSize: 14, color: P.mid }}>{mat.unit}</span></div>
    </div>
    <Fl label={`Qty (${mat.unit})`}><div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={() => setQ(Math.max(0, qn - 1).toString())} style={{ width: 44, height: 44, borderRadius: 10, border: `1.5px solid ${P.bdr}`, background: "#fff", cursor: "pointer", fontSize: 18 }}>−</button>
      <input type="number" min="0" value={q} onChange={e => setQ(e.target.value)} placeholder="0" style={{ ...iS, textAlign: "center", fontSize: 22, fontWeight: 700, fontFamily: Ft.h, flex: 1 }} />
      <button onClick={() => setQ((qn + 1).toString())} style={{ width: 44, height: 44, borderRadius: 10, border: `1.5px solid ${P.bdr}`, background: "#fff", cursor: "pointer", fontSize: 18 }}>+</button>
    </div></Fl>
    {isTake && <Fl label="Project"><select value={pId} onChange={e => setPId(e.target.value)} style={{ ...iS, appearance: "none" }}><option value="">Select...</option>{projs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Fl>}
    <Fl label="Note"><input style={iS} value={nt} onChange={e => setNt(e.target.value)} /></Fl>
    <Btn full disabled={!ok} color={isTake ? P.red : P.grn} onClick={() => onSubmit({ matId: mat.id, qty: qn, projId: pId, note: nt, md: mode })}>{isTake ? `Take ${qn} ${mat.unit}` : `Add ${qn} ${mat.unit}`}</Btn>
  </Modal>;
}

function TCModal({ tool, projs, uName, onClose, onSubmit }) {
  const [pId, setPId] = useState(""); const [nt, setNt] = useState("");
  return <Modal open={true} onClose={onClose} title={`Check Out: ${tool.name}`}>
    <Fl label="Checking out as"><div style={{ padding: "10px 14px", background: P.bg, borderRadius: 8, fontWeight: 600 }}>{uName}</div></Fl>
    <Fl label="Project"><select value={pId} onChange={e => setPId(e.target.value)} style={{ ...iS, appearance: "none" }}><option value="">Select...</option>{projs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Fl>
    <Fl label="Note"><input style={iS} value={nt} onChange={e => setNt(e.target.value)} /></Fl>
    <Btn full disabled={!pId} onClick={() => onSubmit({ tId: tool.id, tN: tool.name, pId, note: nt })}>Check Out</Btn>
  </Modal>;
}

function MF({ mat, cats, onSave, onX }) {
  const [f, setF] = useState(mat || { name: "", category: "Hardscape", qty: 0, unit: "pcs", low_threshold: 5, location: "", notes: "" });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  return <div>
    <Fl label="Name"><input style={iS} value={f.name} onChange={e => s("name", e.target.value)} placeholder="e.g. Belgard Dublin Cobble" /></Fl>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <Fl label="Category"><select style={{ ...iS, appearance: "none" }} value={f.category} onChange={e => s("category", e.target.value)}>{cats.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></Fl>
      <Fl label="Unit"><select style={{ ...iS, appearance: "none" }} value={f.unit} onChange={e => s("unit", e.target.value)}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></Fl>
      <Fl label="Qty"><input style={iS} type="number" min="0" value={f.qty} onChange={e => s("qty", parseInt(e.target.value) || 0)} /></Fl>
      <Fl label="Low Alert"><input style={iS} type="number" min="0" value={f.low_threshold} onChange={e => s("low_threshold", parseInt(e.target.value) || 0)} /></Fl>
    </div>
    <Fl label="Location"><input style={iS} value={f.location} onChange={e => s("location", e.target.value)} placeholder="Bay A-1" /></Fl>
    <Fl label="Notes"><input style={iS} value={f.notes} onChange={e => s("notes", e.target.value)} /></Fl>
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
      <button onClick={onX} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1.5px solid ${P.bdr}`, background: "#fff", color: P.mid, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
      <Btn full disabled={!f.name.trim()} onClick={() => onSave({ ...f, id: f.id })} sx={{ flex: 1 }}>Save</Btn>
    </div>
  </div>;
}
