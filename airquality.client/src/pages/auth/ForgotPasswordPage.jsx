import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout, LogoSmall, InputField, GreenButton, theme } from "./authShared";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  function validate() {
    if (!email) return "Vui lòng nhập email.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Email không hợp lệ.";
    return "";
  }

  async function handleSubmit() {
    const e = validate();
    if (e) { setError(e); return; }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
        return;
      }

      setMessage(result.message || "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.");
      setSent(true);
    } catch {
      setError("Không kết nối được tới máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  const left = (
    <>
      <div style={{
        width:80, height:80, borderRadius:"50%",
        background:"rgba(255,255,255,0.15)",
        display:"flex", alignItems:"center", justifyContent:"center",
        marginBottom:28,
      }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" fill="rgba(255,255,255,0.9)"/>
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1.5" fill="#16a34a"/>
        </svg>
      </div>
      <h1 style={{ color:"white", fontSize:30, fontWeight:800, lineHeight:1.25, marginBottom:16, marginTop:0 }}>
        Quen mat khau?
      </h1>
      <p style={{ color:"rgba(255,255,255,0.78)", fontSize:14.5, lineHeight:1.75, maxWidth:300, marginBottom:36, marginTop:0 }}>
        Dung lo lang! Nhap email da dang ky, chung toi se gui huong dan dat lai mat khau ngay cho ban.
      </p>
      <div style={{
        background:"rgba(255,255,255,0.1)", borderRadius:14, padding:"18px 20px",
      }}>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginBottom:8, marginTop:0, fontStyle:"italic" }}>
          Trich dan cua ngay
        </p>
        <p style={{ color:"white", fontSize:14, fontStyle:"italic", lineHeight:1.65, margin:0 }}>
          "Hit tho khong khi sach la quyen co ban cua moi nguoi."
        </p>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, marginTop:10, marginBottom:0 }}>
          - EcoAir VN Team
        </p>
      </div>
    </>
  );

  const right = (
    <>
      <LogoSmall />
      <h2 style={{ fontSize:22, fontWeight:700, color:theme.gray700, marginBottom:6, marginTop:0 }}>
        Quen mat khau
      </h2>
      <p style={{ fontSize:14, color:theme.gray400, marginBottom:28, marginTop:0 }}>
        Nhap email da dang ky de nhan lien ket dat lai mat khau
      </p>

      {sent ? (
        <div style={{
          background:"#f0fdf4", border:`1.5px solid ${theme.green2}`,
          borderRadius:12, padding:"22px 20px", textAlign:"center", marginBottom:24,
        }}>
          <div style={{ marginBottom:12 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin:"0 auto", display:"block" }}>
              <rect x="2" y="4" width="20" height="16" rx="3" fill="#dcfce7"/>
              <path d="M2 7l10 7 10-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="6" r="5" fill="#16a34a"/>
              <path d="M15.5 6l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ fontWeight:600, color:theme.green1, marginBottom:6, marginTop:0, fontSize:15 }}>
            Email da duoc gui!
          </p>
          <p style={{ fontSize:13, color:theme.gray600, margin:0 }}>
            {message}
          </p>
          <p style={{ fontSize:13, color:theme.gray600, margin:"8px 0 0" }}>
            Kiem tra hop thu <strong>{email}</strong> va mo lien ket de dat lai mat khau.
          </p>
        </div>
      ) : (
        <>
          <InputField
            label="Dia chi Email"
            type="email"
            placeholder="Nhap email da dang ky"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            error={error}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
            }
          />

          <div style={{
            background:"#fffbeb", border:"1.5px solid #fcd34d",
            borderRadius:10, padding:"12px 14px", marginBottom:24,
            display:"flex", gap:10, alignItems:"flex-start",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:1 }}>
              <circle cx="12" cy="12" r="10" fill="#fcd34d"/>
              <path d="M12 8v4M12 16h.01" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize:13, color:"#92400e", margin:0, lineHeight:1.55 }}>
              Kiem tra ca thu muc Spam neu khong thay email trong hop thu den.
            </p>
          </div>

          <GreenButton onClick={handleSubmit} loading={loading}>
            Gui lien ket dat lai mat khau
          </GreenButton>
        </>
      )}

      <p style={{ textAlign:"center", fontSize:14, color:theme.gray400, marginTop:24, marginBottom:0 }}>
        <Link to="/login" style={{ color:theme.green1, fontWeight:500, textDecoration:"none" }}>
          Quay lai dang nhap
        </Link>
      </p>
    </>
  );

  return <AuthLayout leftContent={left} rightContent={right} />;
}
