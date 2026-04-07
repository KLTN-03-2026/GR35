import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthLayout, LogoSmall, GreenButton, theme } from "./authShared";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your@email.com";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function handleChange(idx, val) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError("");
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) { setError("Vui long nhap du 6 chu so"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    // TODO: replace with real API call
    // const res = await fetch("/api/auth/verify-email", { method:"POST", body: JSON.stringify({ email, otp: code }) });
    navigate("/login");
  }

  async function handleResend() {
    setResending(true);
    await new Promise(r => setTimeout(r, 800));
    setResending(false);
    setResendTimer(60);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputs.current[0]?.focus();
    // TODO: replace with real API call
    // await fetch("/api/auth/resend-otp", { method:"POST", body: JSON.stringify({ email }) });
  }

  const left = (
    <div style={{ textAlign:"center", width:"100%" }}>
      <div style={{
        width:100, height:100, borderRadius:"50%",
        background:"rgba(255,255,255,0.15)",
        display:"flex", alignItems:"center", justifyContent:"center",
        margin:"0 auto 28px",
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="3" fill="rgba(255,255,255,0.9)"/>
          <path d="M2 7l10 7 10-7" stroke="rgba(22,163,74,0.8)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h1 style={{ color:"white", fontSize:28, fontWeight:800, marginBottom:14, marginTop:0 }}>
        Xac thuc Email
      </h1>
      <p style={{ color:"rgba(255,255,255,0.78)", fontSize:14.5, lineHeight:1.75, maxWidth:290, margin:"0 auto 28px" }}>
        Ma OTP da duoc gui toi email cua ban. Kiem tra hop thu va nhap ma de xac thuc tai khoan.
      </p>
      <div style={{
        background:"rgba(255,255,255,0.12)", borderRadius:12,
        padding:"14px 20px", display:"inline-block",
      }}>
        <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginBottom:4 }}>Gui toi</div>
        <div style={{ color:"white", fontWeight:600, fontSize:14 }}>{email}</div>
      </div>
    </div>
  );

  const right = (
    <>
      <LogoSmall />
      <h2 style={{ fontSize:22, fontWeight:700, color:theme.gray700, marginBottom:6, marginTop:0 }}>
        Xac thuc Email
      </h2>
      <p style={{ fontSize:14, color:theme.gray400, marginBottom:6, marginTop:0 }}>
        Nhap ma 6 chu so da duoc gui toi
      </p>
      <p style={{ fontSize:14, fontWeight:600, color:theme.green1, marginBottom:28, marginTop:0 }}>
        {email}
      </p>

      {/* OTP Inputs */}
      <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:8 }} onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={el => inputs.current[idx] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(idx, e.target.value)}
            onKeyDown={e => handleKeyDown(idx, e)}
            style={{
              width: 48,
              height: 56,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
              border: `2px solid ${digit ? theme.green2 : error ? theme.red : theme.gray300}`,
              borderRadius: 12,
              color: theme.gray700,
              backgroundColor: digit ? "#f0fdf4" : "white",
              outline: "none",
              transition: "all 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = theme.green2}
            onBlur={e => e.target.style.borderColor = digit ? theme.green2 : error ? theme.red : theme.gray300}
          />
        ))}
      </div>

      {error && <p style={{ textAlign:"center", fontSize:13, color:theme.red, marginTop:6, marginBottom:0 }}>{error}</p>}

      <p style={{ textAlign:"center", fontSize:13, color:theme.gray400, margin:"16px 0 24px" }}>
        Moi OTP co hieu luc trong{" "}
        <span style={{ color:theme.green1, fontWeight:600 }}>5 phut</span>
      </p>

      <GreenButton onClick={handleVerify} loading={loading}>
        Xac nhan OTP
      </GreenButton>

      <div style={{ textAlign:"center", marginTop:18 }}>
        {resendTimer > 0 ? (
          <p style={{ fontSize:13, color:theme.gray400, margin:0 }}>
            Gui lai ma sau{" "}
            <span style={{ color:theme.green1, fontWeight:600 }}>{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            style={{ background:"none", border:"none", fontSize:13, color:theme.green1, fontWeight:600, cursor:"pointer", padding:0 }}
          >
            {resending ? "Dang gui..." : "Gui lai ma OTP"}
          </button>
        )}
      </div>

      <p style={{ textAlign:"center", fontSize:14, color:theme.gray400, marginTop:20, marginBottom:0 }}>
        <Link to="/login" style={{ color:theme.green1, fontWeight:500, textDecoration:"none" }}>
          Quay lai dang nhap
        </Link>
      </p>
    </>
  );

  return <AuthLayout leftContent={left} rightContent={right} />;
}
