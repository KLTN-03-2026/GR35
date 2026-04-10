import { useState } from "react";

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#e8f5ee" />
    <path d="M6 10l3 3 5-5" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="5" y="9" width="10" height="8" rx="2" stroke="#9ca3af" strokeWidth="1.5" />
    <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="#9ca3af" strokeWidth="1.5" />
  </svg>
);

const LeafLogo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 3C8 3 4 8 4 14s4 11 10 11 10-4.5 10-11S20 3 14 3z" fill="#e8f5ee" />
    <path d="M10 18c1-4 4-7 8-8-1 3-1 6-3 8" fill="#2d9e63" />
    <path d="M14 6c0 0-5 4-5 9" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const basicFeatures = [
  { text: "Xem bản đồ nhiệt", locked: false },
  { text: "Dự báo 24h", locked: false },
  { text: "Tìm đường A* cơ bản", locked: false },
  { text: "Lưu 2 trạm", locked: false },
  { text: "DY báo AI 7 ngày", locked: true },
  { text: "Eco-Routing theo Bệnh lý", locked: true },
  { text: "API Key & Cảnh báo Zalo/SMS", locked: true },
];

const proFeatures = [
  "Mở khóa toàn bộ chức năng AI",
  "Dự báo chi tiết 7 ngày",
  "Tìm đường né bụi mịn theo bệnh lý",
  "Cảnh báo tự động qua Zalo/Email",
  "Hỗ trợ API cho Developer",
];

export default function EcoAirPricing() {
  const [billing, setBilling] = useState("monthly");

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", background: "#f0f4f0", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        a { text-decoration: none; }
      `}</style>

      {/* NAV */}
      <nav style={{
        background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 60, borderBottom: "1px solid #e5e7eb",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 17, color: "#1a7a4a" }}>
          <LeafLogo />
          EcoAir VN
        </div>

        <ul style={{ display: "flex", alignItems: "center", gap: 32, listStyle: "none" }}>
          {["Trang chủ", "Dữ liệu chất lượng không khí", "Bản đồ", "Liên hệ"].map(item => (
            <li key={item}>
              <a href="#" style={{ color: "#1a1a1a", fontSize: 14, fontWeight: 500, fontFamily: "inherit" }}>{item}</a>
            </li>
          ))}
          <li>
            <a href="#" style={{ color: "#1a7a4a", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>Giá gói</a>
          </li>
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: "none", border: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#1a1a1a" }}>
            Đăng nhập
          </button>
          <button style={{ background: "#1a7a4a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Đăng ký
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "72px 20px 0" }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
          Đầu tư cho <span style={{ color: "#1a7a4a", fontStyle: "italic" }}>lá phổi</span> của bạn.
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 420, margin: "0 auto" }}>
          Mở khóa sức mạnh của Trí tuệ nhân tạo để bảo vệ sức khỏe gia đình bạn 24/7.
        </p>
      </section>

      {/* BILLING TOGGLE */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, margin: "40px auto 48px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 4, width: "fit-content" }}>
        <button
          onClick={() => setBilling("monthly")}
          style={{
            background: billing === "monthly" ? "#fff" : "none",
            border: "none", fontFamily: "inherit", fontSize: 14,
            fontWeight: billing === "monthly" ? 600 : 500,
            padding: "8px 20px", borderRadius: 7, cursor: "pointer",
            color: billing === "monthly" ? "#1a1a1a" : "#6b7280",
            boxShadow: billing === "monthly" ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
          }}
        >
          Hàng tháng
        </button>
        <button
          onClick={() => setBilling("yearly")}
          style={{
            background: billing === "yearly" ? "#fff" : "none",
            border: "none", fontFamily: "inherit", fontSize: 14,
            fontWeight: billing === "yearly" ? 600 : 500,
            padding: "8px 20px", borderRadius: 7, cursor: "pointer",
            color: billing === "yearly" ? "#1a1a1a" : "#6b7280",
            boxShadow: billing === "yearly" ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
          }}
        >
          Hàng năm
        </button>
        <span style={{ background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginLeft: 4 }}>
          Tiết kiệm 20%
        </span>
      </div>

      {/* PRICING CARDS */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

        {/* Basic Card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px 32px", border: "2px solid transparent" }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Gói Cơ Bản</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
            0 VNĐ <span style={{ fontSize: 15, fontWeight: 500, color: "#6b7280" }}>/ tháng</span>
          </div>

          <ul style={{ listStyle: "none", margin: "24px 0 32px", display: "flex", flexDirection: "column", gap: 14 }}>
            {basicFeatures.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: f.locked ? "#9ca3af" : "#1a1a1a" }}>
                {f.locked ? <LockIcon /> : <CheckIcon />}
                {f.text}
              </li>
            ))}
          </ul>

          <button style={{ width: "100%", border: "1.5px solid #e5e7eb", background: "#fff", color: "#1a1a1a", fontFamily: "inherit", fontSize: 15, fontWeight: 500, padding: 14, borderRadius: 10, cursor: "pointer" }}>
            Gói hiện tại
          </button>
        </div>

        {/* Pro Card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px 32px", border: "2px solid #1a7a4a", position: "relative" }}>
          <div style={{
            position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
            background: "#1a7a4a", color: "#fff", fontSize: 12, fontWeight: 700,
            padding: "5px 16px", borderRadius: 20, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            🔥 PHỔ BIẾN NHẤT
          </div>

          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Gói Pro AI</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#1a7a4a", marginBottom: 4 }}>
            49.000 VNĐ <span style={{ fontSize: 15, fontWeight: 500, color: "#6b7280" }}>/ tháng</span>
          </div>
          <div style={{ fontSize: 14, color: "#9ca3af", textDecoration: "line-through", marginBottom: 24 }}>60.000 VNĐ</div>

          <ul style={{ listStyle: "none", margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 14 }}>
            {proFeatures.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#1a1a1a" }}>
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>

          <button style={{ width: "100%", border: "none", background: "#1a7a4a", color: "#fff", fontFamily: "inherit", fontSize: 15, fontWeight: 700, padding: 16, borderRadius: 10, cursor: "pointer" }}>
            Nâng cấp Pro ngay
          </button>
        </div>
      </div>

      {/* TRUST */}
      <div style={{ textAlign: "center", padding: "0 20px 60px" }}>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>Thanh toán bảo mật 100%. Hủy bất cứ lúc nào.</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#003087", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="#003087" /></svg>
            VNPay
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#ae2070", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="#ae2070" /></svg>
            MoMo
          </div>
          <div style={{ background: "#1a1f71", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", fontSize: 15, fontWeight: 800, color: "#fff", fontStyle: "italic" }}>
            VISA
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center" }}>
            <svg width="36" height="22" viewBox="0 0 36 22">
              <circle cx="13" cy="11" r="10" fill="#eb001b" />
              <circle cx="23" cy="11" r="10" fill="#f79e1b" />
              <path d="M18 3.5a10 10 0 0 1 0 15A10 10 0 0 1 18 3.5z" fill="#ff5f00" />
            </svg>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "60px 60px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1.5fr", gap: 40, paddingBottom: 48 }}>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 17, color: "#1a7a4a", marginBottom: 14 }}>
              <LeafLogo /> EcoAir VN
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 220 }}>
              Ứng dụng tiên phong sử dụng AI để giám sát và dự báo chất lượng không khí, bảo vệ sức khỏe cộng đồng Việt Nam.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Giải pháp</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Dự báo AI", "Bản đồ nhiệt real-time", "Lộ trình sạch (Eco-routing)", "Thiết bị cảm biến"].map(item => (
                <li key={item}><a href="#" style={{ fontSize: 13, color: "#6b7280" }}>{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Tài nguyên</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Tài liệu API", "Báo cáo hàng năm", "Blog sức khỏe", "Cộng đồng"].map(item => (
                <li key={item}><a href="#" style={{ fontSize: 13, color: "#6b7280" }}>{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Liên hệ</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "✉", text: "support@ecoair.vn" },
                { icon: "📞", text: "1900 6789" },
                { icon: "📍", text: "Khu Công nghệ cao, TP. Thủ Đức, TP. HCM" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#6b7280" }}>
                  <span>{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12.5, color: "#9ca3af" }}>© 2024 EcoAir VN - Người bảo hộ thanh khiết.</span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Về chúng tôi", "Điều khoản", "Bảo mật", "Liên hệ"].map(item => (
              <a key={item} href="#" style={{ color: "#9ca3af", fontSize: 12.5 }}>{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
