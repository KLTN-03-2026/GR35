import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout, LogoSmall, InputField, GreenButton, Divider, SocialButton, Icons, theme } from "./authShared";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.fullname.trim()) e.fullname = "Vui long nhap ho ten";
    if (!form.email) e.email = "Vui long nhap email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email khong hop le";
    if (!form.password) e.password = "Vui long nhap mat khau";
    else if (form.password.length < 6) e.password = "Mat khau toi thieu 6 ky tu";
    if (!form.confirm) e.confirm = "Vui long xac nhan mat khau";
    else if (form.confirm !== form.password) e.confirm = "Mat khau khong khop";
    if (!agree) e.agree = "Vui long dong y dieu khoan";
    return e;
  }

  async function handleRegister() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    // TODO: replace with real API call
    // const res = await fetch("/api/auth/register", { method:"POST", body: JSON.stringify(form) });
    navigate("/verify-email", { state: { email: form.email } });
  }

  const left = (
    <>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: "rgba(255,255,255,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 28,
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" fill="white"/>
          <path d="M12 10v10M8 14c1.5 0 2.5-1 4-1s2.5 1 4 1" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <h1 style={{ color:"white", fontSize:32, fontWeight:800, lineHeight:1.25, marginBottom:16, marginTop:0 }}>
        Tao tai khoan<br />cua ban
      </h1>
      <p style={{ color:"rgba(255,255,255,0.78)", fontSize:14.5, lineHeight:1.75, maxWidth:300, marginBottom:32, marginTop:0 }}>
        Chao don ban gia nhap cong dong EcoAir VN - cung nhau bao ve bau khong khi trong lanh.
      </p>
      {[
        "Quan trac khong khi thoi gian thuc",
        "Canh bao o nhiem tuc thi",
        "Bao cao suc khoe ca nhan",
      ].map((item, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(255,255,255,0.22)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color:"rgba(255,255,255,0.85)", fontSize:14 }}>{item}</span>
        </div>
      ))}
    </>
  );

  const right = (
    <>
      <LogoSmall />
      <h2 style={{ fontSize:22, fontWeight:700, color:theme.gray700, marginBottom:6, marginTop:0 }}>
        Tao tai khoan moi
      </h2>
      <p style={{ fontSize:14, color:theme.gray400, marginBottom:24, marginTop:0 }}>
        Dien thong tin de bat dau hanh trinh xanh cung chung toi
      </p>

      <InputField label="Ho va ten" placeholder="Nguyen Van A" value={form.fullname}
        onChange={e => set("fullname", e.target.value)} error={errors.fullname} icon={Icons.user} />
      <InputField label="Email" type="email" placeholder="example@email.com" value={form.email}
        onChange={e => set("email", e.target.value)} error={errors.email} icon={Icons.email} />
      <InputField
        label="Mat khau" type={showPass ? "text" : "password"} placeholder="Toi thieu 6 ky tu"
        value={form.password} onChange={e => set("password", e.target.value)} error={errors.password}
        icon={Icons.lock}
        rightElement={<span onClick={() => setShowPass(p => !p)}>{showPass ? Icons.eyeOff : Icons.eyeOn}</span>}
      />
      <InputField
        label="Xac nhan mat khau" type={showConfirm ? "text" : "password"} placeholder="Nhap lai mat khau"
        value={form.confirm} onChange={e => set("confirm", e.target.value)} error={errors.confirm}
        icon={Icons.lock}
        rightElement={<span onClick={() => setShowConfirm(p => !p)}>{showConfirm ? Icons.eyeOff : Icons.eyeOn}</span>}
      />

      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom: errors.agree ? 4 : 18 }}>
        <input type="checkbox" checked={agree} onChange={e => { setAgree(e.target.checked); setErrors(er => ({ ...er, agree:"" })); }}
          style={{ marginTop:3, accentColor:theme.green1, cursor:"pointer", flexShrink:0 }} />
        <span style={{ fontSize:13, color:theme.gray600, lineHeight:1.55 }}>
          Toi dong y voi{" "}
          <a href="#" style={{ color:theme.green1, textDecoration:"none", fontWeight:500 }}>Dieu khoan dich vu</a>
          {" "}va{" "}
          <a href="#" style={{ color:theme.green1, textDecoration:"none", fontWeight:500 }}>Chinh sach bao mat</a>
        </span>
      </div>
      {errors.agree && <p style={{ fontSize:12, color:theme.red, marginBottom:12, marginTop:0 }}>{errors.agree}</p>}

      <GreenButton onClick={handleRegister} loading={loading}>
        Dang ky tai khoan moi
      </GreenButton>

      <Divider />

      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        <SocialButton label="Google" onClick={() => {}}>{Icons.google}</SocialButton>
        <SocialButton label="Facebook" onClick={() => {}}>{Icons.facebook}</SocialButton>
      </div>

      <p style={{ textAlign:"center", fontSize:14, color:theme.gray400, margin:0 }}>
        Da co tai khoan?{" "}
        <Link to="/login" style={{ color:theme.green1, fontWeight:600, textDecoration:"none" }}>Dang nhap</Link>
      </p>
    </>
  );

  return <AuthLayout leftContent={left} rightContent={right} />;
}
