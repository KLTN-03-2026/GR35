import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout, LogoSmall, InputField, GreenButton, Divider, SocialButton, Icons, theme } from "./authShared";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.email) e.email = "Vui long nhap email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email khong hop le";
    if (!form.password) e.password = "Vui long nhap mat khau";
    return e;
  }

  async function handleLogin() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    // TODO: replace with real API call
    // const res = await fetch("/api/auth/login", { method:"POST", body: JSON.stringify(form) });
    navigate("/dashboard");
  }

  const left = (
    <>
      <h1 style={{ color:"white", fontSize:36, fontWeight:800, lineHeight:1.25, marginBottom:18, marginTop:0 }}>
        Hit tho tuong lai<br />xanh cung EcoAir VN
      </h1>
      <p style={{ color:"rgba(255,255,255,0.78)", fontSize:14.5, lineHeight:1.75, maxWidth:310, marginBottom:36, marginTop:0 }}>
        Quan trac chat luong khong khi theo thoi gian thuc, bao ve suc khoe cho ban va gia dinh trong khong gian song trong lanh.
      </p>
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ background:"rgba(255,255,255,0.14)", borderRadius:12, padding:"14px 20px", textAlign:"center", minWidth:80 }}>
          <div style={{ color:"white", fontWeight:800, fontSize:22, lineHeight:1 }}>98%</div>
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12, marginTop:4 }}>Chinh xac</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.14)", borderRadius:12, padding:"14px 20px", textAlign:"center", minWidth:80 }}>
          <div style={{ color:"white", fontWeight:800, fontSize:22, lineHeight:1 }}>24/7</div>
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12, marginTop:4 }}>Theo doi</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.14)", borderRadius:12, padding:"14px 20px", textAlign:"center", minWidth:80 }}>
          <div style={{ color:"white", fontWeight:800, fontSize:22, lineHeight:1 }}>500+</div>
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12, marginTop:4 }}>Tram do</div>
        </div>
      </div>
    </>
  );

  const right = (
    <>
      <LogoSmall />
      <h2 style={{ fontSize:24, fontWeight:700, color:theme.gray700, marginBottom:6, marginTop:0 }}>
        Chao mung tro lai!
      </h2>
      <p style={{ fontSize:14, color:theme.gray400, marginBottom:28, marginTop:0 }}>
        Nhap thong tin de tiep tuc theo doi chat luong khong khi
      </p>

      <InputField
        label="Email"
        type="email"
        placeholder="Nhap dia chi email"
        value={form.email}
        onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
        error={errors.email}
        icon={Icons.email}
      />
      <InputField
        label="Mat khau"
        type={showPass ? "text" : "password"}
        placeholder="Nhap mat khau"
        value={form.password}
        onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
        error={errors.password}
        icon={Icons.lock}
        rightElement={
          <span onClick={() => setShowPass(p => !p)}>
            {showPass ? Icons.eyeOff : Icons.eyeOn}
          </span>
        }
      />

      <div style={{ textAlign:"right", marginTop:-8, marginBottom:20 }}>
        <Link to="/forgot-password" style={{ fontSize:13, color:theme.green1, textDecoration:"none", fontWeight:500 }}>
          Quen mat khau?
        </Link>
      </div>

      <GreenButton onClick={handleLogin} loading={loading}>
        Dang nhap
      </GreenButton>

      <Divider />

      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        <SocialButton label="Google" onClick={() => {}}>
          {Icons.google}
        </SocialButton>
        <SocialButton label="Facebook" onClick={() => {}}>
          {Icons.facebook}
        </SocialButton>
      </div>

      <p style={{ textAlign:"center", fontSize:14, color:theme.gray400, margin:0 }}>
        Chua co tai khoan?{" "}
        <Link to="/register" style={{ color:theme.green1, fontWeight:600, textDecoration:"none" }}>
          Dang ky ngay
        </Link>
      </p>
    </>
  );

  return <AuthLayout leftContent={left} rightContent={right} />;
}
