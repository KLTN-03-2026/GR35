import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthLayout, LogoSmall, InputField, GreenButton, Icons, theme } from "./authShared";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function getStrength(pw) {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  const strength = getStrength(form.password);
  const strengthInfo = [
    { label: "", color: theme.gray300 },
    { label: "Rat yeu", color: "#ef4444" },
    { label: "Yeu", color: "#f97316" },
    { label: "Trung binh", color: "#eab308" },
    { label: "Manh", color: "#22c55e" },
    { label: "Rat manh", color: "#16a34a" },
  ][strength];

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.password) e.password = "Vui long nhap mat khau moi";
    else if (form.password.length < 6) e.password = "Mat khau toi thieu 6 ky tu";
    if (!form.confirm) e.confirm = "Vui long xac nhan mat khau";
    else if (form.confirm !== form.password) e.confirm = "Mat khau khong khop";
    return e;
  }

  async function handleReset() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
    // TODO: replace with real API call
    // await fetch("/api/auth/reset-password", { method:"POST", body: JSON.stringify({ email, password: form.password }) });
    setTimeout(() => navigate("/login"), 2500);
  }

  const left = (
    <>
      {/* Step progress */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            flex:1, height:4, borderRadius:2,
            background: i <= 3 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
          }} />
        ))}
      </div>
      <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginBottom:8, marginTop:0 }}>Buoc 3/3</p>
      <h1 style={{ color:"white", fontSize:30, fontWeight:800, lineHeight:1.25, marginBottom:16, marginTop:0 }}>
        Tao mat khau moi
      </h1>
      <p style={{ color:"rgba(255,255,255,0.78)", fontSize:14.5, lineHeight:1.75, maxWidth:300, marginBottom:32, marginTop:0 }}>
        Tao mat khau manh de bao ve tai khoan EcoAir VN cua ban.
      </p>

      {[
        { icon:"#", tip:"It nhat 8 ky tu" },
        { icon:"A", tip:"Co chu hoa va chu thuong" },
        { icon:"!", tip:"Co ky tu dac biet (!@#$...)" },
      ].map((item, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{
            width:26, height:26, borderRadius:6,
            background:"rgba(255,255,255,0.18)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:700, color:"white", flexShrink:0,
          }}>{item.icon}</div>
          <span style={{ color:"rgba(255,255,255,0.82)", fontSize:14 }}>{item.tip}</span>
        </div>
      ))}

      {/* Forest visual */}
      <div style={{
        marginTop:32, borderRadius:14,
        background:"linear-gradient(180deg, rgba(22,163,74,0.35) 0%, rgba(5,46,22,0.7) 100%)",
        padding:"20px", textAlign:"center",
      }}>
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none" style={{ margin:"0 auto", display:"block" }}>
          <path d="M40 5L15 35h12L10 55h60L43 35h12L40 5z" fill="rgba(255,255,255,0.15)"/>
          <path d="M40 10L18 37h11L12 54h56L44 37h11L40 10z" fill="rgba(255,255,255,0.2)"/>
          <rect x="37" y="50" width="6" height="10" rx="1" fill="rgba(255,255,255,0.3)"/>
        </svg>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginTop:10, marginBottom:0 }}>
          EcoAir VN - Bao ve moi truong
        </p>
      </div>
    </>
  );

  const right = (
    <>
      <LogoSmall />
      <h2 style={{ fontSize:22, fontWeight:700, color:theme.gray700, marginBottom:6, marginTop:0 }}>
        Tao mat khau moi
      </h2>
      <p style={{ fontSize:14, color:theme.gray400, marginBottom:28, marginTop:0 }}>
        Nhap mat khau moi cho tai khoan cua ban
      </p>

      {success ? (
        <div style={{
          background:"#f0fdf4", border:`1.5px solid ${theme.green2}`,
          borderRadius:12, padding:"28px 20px", textAlign:"center",
        }}>
          <div style={{ marginBottom:14 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin:"0 auto", display:"block" }}>
              <circle cx="12" cy="12" r="10" fill="#dcfce7"/>
              <path d="M8 12l3 3 5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ fontWeight:700, color:theme.green1, fontSize:16, marginBottom:6, marginTop:0 }}>
            Dat lai thanh cong!
          </p>
          <p style={{ fontSize:13, color:theme.gray600, margin:0 }}>
            Mat khau da duoc cap nhat. Dang chuyen den trang dang nhap...
          </p>
        </div>
      ) : (
        <>
          <InputField
            label="Mat khau moi"
            type={showPass ? "text" : "password"}
            placeholder="Nhap mat khau moi"
            value={form.password}
            onChange={e => set("password", e.target.value)}
            error={errors.password}
            icon={Icons.lock}
            rightElement={<span onClick={() => setShowPass(p => !p)}>{showPass ? Icons.eyeOff : Icons.eyeOn}</span>}
          />

          {/* Strength bar */}
          {form.password.length > 0 && (
            <div style={{ marginTop:-8, marginBottom:18 }}>
              <div style={{ display:"flex", gap:4, marginBottom:5 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    flex:1, height:3, borderRadius:2,
                    background: i <= strength ? strengthInfo.color : theme.gray100,
                    transition:"background 0.2s",
                  }} />
                ))}
              </div>
              <p style={{ fontSize:12, color:strengthInfo.color, fontWeight:500, margin:0 }}>
                {strengthInfo.label}
              </p>
            </div>
          )}

          <InputField
            label="Xac nhan mat khau moi"
            type={showConfirm ? "text" : "password"}
            placeholder="Nhap lai mat khau moi"
            value={form.confirm}
            onChange={e => set("confirm", e.target.value)}
            error={errors.confirm}
            icon={Icons.lock}
            rightElement={<span onClick={() => setShowConfirm(p => !p)}>{showConfirm ? Icons.eyeOff : Icons.eyeOn}</span>}
          />

          <GreenButton onClick={handleReset} loading={loading} style={{ marginTop:8 }}>
            Dat lai mat khau
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
