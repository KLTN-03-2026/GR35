export const theme = {
  green1: "#1a7a4a",
  green2: "#22c55e",
  green3: "#4ade80",
  greenLight: "#dcfce7",
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray600: "#4b5563",
  gray700: "#374151",
  red: "#ef4444",
};

export const Icons = {
  leaf: (c = "white") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={c}>
      <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z"/>
      <line x1="12" y1="22" x2="12" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  email: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 7l10 7 10-7"/>
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  eyeOn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
    </svg>
  ),
  google: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  ),
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 4l9 8v8a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1v-8z"/>
    </svg>
  ),
  cloud: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M18 10a6 6 0 00-11.9-1A4 4 0 006 17h12a4 4 0 000-8z"/>
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  person: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

export function AuthLayout({ leftContent, rightContent }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      {/* LEFT */}
      <div style={{
        flex: "0 0 42%",
        background: "linear-gradient(145deg, #052e16 0%, #064e2e 20%, #0f6b3e 50%, #16a34a 78%, #4ade80 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "60px 52px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:320, height:320, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-70, left:-70, width:260, height:260, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"40%", right:-50, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:48, position:"relative", zIndex:1 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {Icons.leaf()}
          </div>
          <span style={{ color:"white", fontWeight:700, fontSize:20, letterSpacing:"-0.3px" }}>EcoAir VN</span>
        </div>

        <div style={{ position:"relative", zIndex:1, width:"100%" }}>
          {leftContent}
        </div>

        {/* Bottom nav */}
        <div style={{ position:"absolute", bottom:32, left:52, display:"flex", gap:14, zIndex:1 }}>
          {[Icons.home, Icons.cloud, Icons.chart, Icons.person].map((icon, i) => (
            <div key={i} style={{
              width:36, height:36, borderRadius:8,
              background: i === 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.09)",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer",
            }}>{icon}</div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 60px",
        backgroundColor: "white",
        overflowY: "auto",
      }}>
        <div style={{ width:"100%", maxWidth:400 }}>
          {rightContent}
        </div>
      </div>
    </div>
  );
}

export function LogoSmall() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
      <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#16a34a,#4ade80)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {Icons.leaf()}
      </div>
      <span style={{ fontWeight:700, fontSize:17, color:theme.green1 }}>EcoAir VN</span>
    </div>
  );
}

export function InputField({ label, type="text", placeholder, value, onChange, error, icon, rightElement }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display:"block", fontSize:13, fontWeight:500, color:theme.gray700, marginBottom:6 }}>
          {label}
        </label>
      )}
      <div style={{ position:"relative" }}>
        {icon && (
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center" }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            padding: icon ? "11px 42px 11px 40px" : "11px 14px",
            border: `1.5px solid ${error ? theme.red : theme.gray300}`,
            borderRadius: 10,
            fontSize: 14,
            color: theme.gray700,
            backgroundColor: theme.white,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = theme.green2}
          onBlur={e => e.target.style.borderColor = error ? theme.red : theme.gray300}
        />
        {rightElement && (
          <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center", cursor:"pointer" }}>
            {rightElement}
          </span>
        )}
      </div>
      {error && <p style={{ fontSize:12, color:theme.red, margin:"4px 0 0" }}>{error}</p>}
    </div>
  );
}

export function GreenButton({ children, onClick, loading, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "13px",
        background: loading ? theme.gray300 : "linear-gradient(135deg,#16a34a,#22c55e)",
        color: "white",
        border: "none",
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "0.2px",
        transition: "opacity 0.15s",
        ...style,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {loading ? "Dang xu ly..." : children}
    </button>
  );
}

export function Divider({ text = "hoac" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
      <div style={{ flex:1, height:1, background:theme.gray300 }} />
      <span style={{ fontSize:13, color:theme.gray400 }}>{text}</span>
      <div style={{ flex:1, height:1, background:theme.gray300 }} />
    </div>
  );
}

export function SocialButton({ label, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px",
        border: `1.5px solid ${theme.gray300}`,
        borderRadius: 10,
        background: "white",
        fontSize: 13,
        fontWeight: 500,
        color: theme.gray700,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = theme.gray50}
      onMouseLeave={e => e.currentTarget.style.background = "white"}
    >
      {children}
      {label}
    </button>
  );
}
