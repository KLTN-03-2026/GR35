import { useNavigate } from "react-router-dom";

const theme = {
  green: "#0d6e4e",
  greenLight: "#1a9e6e",
  greenBtn: "#1a7a4a",
  greenBtnHover: "#15643d",
  teal: "#0f766e",
  bg: "#f0f4f0",
  bgCard: "#ffffff",
  text: "#1a2e1a",
  textMuted: "#5a6e5a",
  textLight: "#8a9e8a",
  border: "#e0ebe0",
  red: "#e53e3e",
  orange: "#dd6b20",
  blue: "#2b6cb0",
  navBg: "rgba(255,255,255,0.97)",
};

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: theme.navBg,
      borderBottom: `1px solid ${theme.border}`,
      display: "flex", alignItems: "center",
      padding: "0 48px", height: 60,
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
      boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 48, flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: "linear-gradient(135deg, #0d6e4e, #22c55e)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>EcoAir VN</span>
      </div>

      <div style={{ display: "flex", gap: 32, flex: 1 }}>
        {[
          { label: "Trang chu", active: true },
          { label: "Du lieu chat luong khong khi" },
          { label: "Ban do" },
          { label: "Lien he" },
          { label: "Goi" },
        ].map((item) => (
          <a key={item.label} href="#" style={{
            fontSize: 14, fontWeight: item.active ? 600 : 400,
            color: item.active ? theme.green : theme.textMuted,
            textDecoration: "none",
            borderBottom: item.active ? `2px solid ${theme.green}` : "2px solid transparent",
            paddingBottom: 2,
            whiteSpace: "nowrap",
          }}>{item.label}</a>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
        <a
          href="#"
          onClick={() => navigate("/login")}
          style={{ fontSize: 14, color: theme.textMuted, textDecoration: "none", fontWeight: 500 }}
        >
          Dang nhap
        </a>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "8px 20px",
            background: theme.green,
            color: "white", border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
        >
          Dang ky
        </button>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section style={{
      paddingTop: 120, paddingBottom: 60,
      background: "linear-gradient(180deg, #eaf2ea 0%, #f5f9f5 100%)",
      textAlign: "center",
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: "inline-block",
            padding: "5px 16px",
            background: "#d1fae5",
            color: theme.green,
            borderRadius: 99, fontSize: 13, fontWeight: 600,
            border: "1px solid #a7f3d0",
          }}>THE HE BAO VE MOI</span>
        </div>

        <h1 style={{
          fontSize: 52, fontWeight: 800, lineHeight: 1.15,
          color: theme.text, marginBottom: 12,
          letterSpacing: "-1px",
        }}>
          Bao ve la phoi cua ban
        </h1>
        <h1 style={{
          fontSize: 52, fontWeight: 800, lineHeight: 1.15,
          color: theme.green, marginBottom: 20,
          letterSpacing: "-1px",
        }}>
          voi Du lieu AI.
        </h1>

        <p style={{
          fontSize: 17, color: theme.textMuted, lineHeight: 1.7,
          maxWidth: 520, margin: "0 auto 36px",
        }}>
          Theo doi chat luong khong khi thoi gian thuc voi do chinh xac tuyet doi
          tu ve tinh va mang luoi cam bien cong dong.
        </p>

        <div style={{
          display: "flex", maxWidth: 520, margin: "0 auto",
          background: "white", borderRadius: 12,
          border: `1.5px solid ${theme.border}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 16px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Nhap thanh pho hoac tram (VD: Chu Lai, Da Nang...)"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 14, color: theme.text, padding: "14px 0",
              background: "transparent",
            }}
          />
          <button style={{
            padding: "12px 22px", background: theme.green,
            color: "white", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 600, borderRadius: 0,
          }}>Tim kiem</button>
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "center", gap: 16,
        maxWidth: 760, margin: "48px auto 0", padding: "0 24px",
      }}>
        {[
          {
            city: "Ha Noi", region: "THU DO", badge: "Kem", badgeColor: "#e53e3e", badgeBg: "#fff5f5",
            aqi: "156", aqiColor: "#e53e3e",
            desc: "PM2.5 cao. Hay deo khau trang. N05 khi ra ngoai.",
          },
          {
            city: "Chu Lai", region: "QUANG NAM", badge: "Tot", badgeColor: "#0d6e4e", badgeBg: "#f0fff4",
            aqi: "24", aqiColor: "#0d6e4e",
            desc: "Trong lanh. Thoi diem tuyet voi cho cac hoat dong ngoai troi.",
          },
          {
            city: "TP. HCM", region: "MIEN NAM", badge: "TB", badgeColor: "#dd6b20", badgeBg: "#fffaf0",
            aqi: "78", aqiColor: "#dd6b20",
            desc: "Trung binh. Nguoi nhay cam nen han che van dong manh.",
          },
        ].map((item) => (
          <div key={item.city} style={{
            flex: 1, background: "white", borderRadius: 14,
            padding: "22px 20px",
            border: `1px solid ${theme.border}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            textAlign: "left",
            fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: theme.text }}>{item.city}</div>
                <div style={{ fontSize: 11, color: theme.textLight, fontWeight: 500, letterSpacing: "0.5px" }}>{item.region}</div>
              </div>
              <span style={{
                padding: "3px 10px", borderRadius: 99,
                background: item.badgeBg, color: item.badgeColor,
                fontSize: 12, fontWeight: 600,
                border: `1px solid ${item.badgeColor}22`,
              }}>{item.badge}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: item.aqiColor, lineHeight: 1 }}>{item.aqi}</span>
              <span style={{ fontSize: 13, color: item.aqiColor, fontWeight: 500, marginLeft: 4 }}>AQI</span>
            </div>
            <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TechSection() {
  const navigate = useNavigate();
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      title: "Ban do nhiet thoi gian thuc",
      desc: "Truc quan hoa muc do o nhiem tren ban do tuong tac voi do tre duoi 5 phut.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 12h4l3-9 4 18 3-9h6"/>
        </svg>
      ),
      title: "Du bao AI 7 ngay",
      desc: "Du doan xu huong chat luong khong khi tuan toi bang thuat toan Deep Learning.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
        </svg>
      ),
      title: "Tim duong sinh thai (Eco-Routing)",
      desc: "Goi y lo trinh di chuyen co nong do o nhiem thap nhat cho nguoi di bo va di xe dap.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
      title: "Canh bao tu dong",
      desc: "Nhan thong bao ngay lap tuc tren dien thoai khi chat luong khong khi tai noi ban o vuot nguong.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      title: "Tro ly ao AI Gemini",
      desc: "Hoi dap truc tiep ve suc khoe va cach cai thien chat luong song trong moi truong o nhiem.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
      ),
      title: "API cho Nha phat trien",
      desc: "Tich hop du lieu khong khi sach vao ung dung cua ban mot cach de dang va tin cay.",
    },
  ];

  return (
    <section style={{
      padding: "80px 48px",
      background: "white",
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 48 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: theme.text, marginBottom: 10, marginTop: 0 }}>
              Cong nghe bao ho tien tien
            </h2>
            <p style={{ fontSize: 15, color: theme.textMuted, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
              Chung toi ket hop tri tue nhan tao va mang luoi du lieu ve tinh de mang lai cai
              nhin minh bach nhat ve bau khi quyen.
            </p>
          </div>
          <button style={{
            padding: "11px 22px",
            background: theme.text, color: "white",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>Kham pha tat ca &rsaquo;</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {features.map((f) => (
            <div
              key={f.title}
              onClick={f.title === "Tro ly ao AI Gemini" ? () => navigate("/ai-chat") : undefined}
              style={{
                background: "#fafcfa", borderRadius: 14,
                border: `1px solid ${theme.border}`,
                padding: "28px 24px",
                transition: "box-shadow 0.2s",
                cursor: f.title === "Tro ly ao AI Gemini" ? "pointer" : "default",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 8, marginTop: 0 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.65, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section style={{
      padding: "80px 48px",
      background: "#f5f9f5",
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 64, alignItems: "center" }}>
        <div style={{ flex: "0 0 320px", position: "relative" }}>
          <div style={{
            background: "linear-gradient(145deg, #0a2e1e 0%, #0d4a2e 40%, #0f6e45 100%)",
            borderRadius: 20, overflow: "hidden", aspectRatio: "4/5",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: 28, position: "relative",
          }}>
            <div style={{ position: "absolute", top: "30%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <svg width="200" height="80" viewBox="0 0 200 80" fill="none" opacity="0.4">
                <path d="M0 40 Q25 10 50 40 Q75 70 100 40 Q125 10 150 40 Q175 70 200 40" stroke="#4ade80" strokeWidth="2" fill="none"/>
                <path d="M0 40 Q25 20 50 40 Q75 60 100 40 Q125 20 150 40 Q175 60 200 40" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.6"/>
              </svg>
            </div>
            <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 4 }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z"/></svg>
                </div>
                <span style={{ color: "white", fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>EC AIR</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 3 }}>EC0NY2S</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500 }}>He thong Dang hoat dong</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: theme.text }}>98.4%</div>
              <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.5 }}>
                Do chinh xac du lieu tu trung tam duoc kiem chung boi AI
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: theme.text, marginBottom: 32, marginTop: 0, lineHeight: 1.2 }}>
            Tai sao chon<br />EcoAir VN?
          </h2>
          {[
            {
              num: "1",
              title: "Du lieu minh bach",
              desc: "Thong tin duoc tong hop tu hon 500 tram do cong dong va du lieu ve tinh NASA/ESA.",
            },
            {
              num: "2",
              title: "Tu van suc khoe ca nhan hoa",
              desc: "Khong chi la con so, chung toi dua ra hanh dong cu the cho tung ca nhan dua tren do tuoi va benh nen.",
            },
            {
              num: "3",
              title: "Cong dong bao ve loi cuon",
              desc: "Tham gia bao cao cac diem nong o nhiem va cung chung tay cai thien moi truong song.",
            },
          ].map((item) => (
            <div key={item.num} style={{ display: "flex", gap: 18, marginBottom: 28 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: theme.green, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, flexShrink: 0,
              }}>{item.num}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 5, marginTop: 4 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const navigate = useNavigate();
  return (
    <footer style={{
      background: "white",
      borderTop: `1px solid ${theme.border}`,
      padding: "48px 48px 24px",
      fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg,#0d6e4e,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z"/>
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>EcoAir VN</span>
            </div>
            <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7, margin: 0, maxWidth: 240 }}>
              Ung dung tien phong su dung AI de giam sat va du bao chat luong khong khi, bao ve suc khoe cong dong Viet Nam.
            </p>
          </div>

          {/* Giai phap */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 14, marginTop: 0 }}>Giai phap</h4>
            {["Du bao AI", "Ban do nhiet real-time", "Lo trinh sach (Eco-routing)", "Thiet bi cam bien"].map(item => (
              <a key={item} href="#" style={{ display: "block", fontSize: 13, color: theme.textMuted, textDecoration: "none", marginBottom: 8 }}>{item}</a>
            ))}
          </div>

          {/* Tai nguyen */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 14, marginTop: 0 }}>Tai nguyen</h4>
            {["Tai lieu API", "Bao cao hang nam", "Blog suc khoe", "Cong dong"].map(item => (
              <a key={item} href="#" style={{ display: "block", fontSize: 13, color: theme.textMuted, textDecoration: "none", marginBottom: 8 }}>{item}</a>
            ))}
          </div>

          {/* Lien he */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 14, marginTop: 0 }}>Lien he</h4>
            {[
              { icon: "✉", text: "support@ecoair.vn" },
              { icon: "✆", text: "1900 6789" },
              { icon: "⊙", text: "Khu Cong nghe Cao, TP. Thu Duc, TP. HCM" },
            ].map(item => (
              <div key={item.text} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 13, color: theme.textMuted, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${theme.border}`, paddingTop: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, color: theme.textLight }}>
            © 2024 EcoAir VN - Nguoi bao ho thanh khiet.
          </span>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {["Ve chung toi", "a Tai khoan", "Bao mat"].map(item => (
              <a key={item} href="#" style={{ fontSize: 13, color: theme.textMuted, textDecoration: "none" }}>{item}</a>
            ))}
            <div
              onClick={() => navigate("/ai-chat")}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: theme.green, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
      <Navbar />
      <HeroSection />
      <TechSection />
      <WhySection />
      <Footer />
    </div>
  );
}
