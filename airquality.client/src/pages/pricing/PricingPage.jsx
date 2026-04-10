import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PricingPage() {
  const [billing, setBilling] = useState("thang");
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf8", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "white", borderBottom: "1px solid #e9ecef", padding: "0 48px", display: "flex", alignItems: "center", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 48 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 005.4 21C10 17 15 15 19 14c.34-2.68-1-5-2-6z" fill="#0d6e4e"/><path d="M12 2C6 2 2 8 2 12c0 .7.07 1.38.2 2.04C4.52 9.44 9.18 6 15 5.5A10 10 0 0012 2z" fill="#22c55e"/></svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>EcoAir VN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32, flex: 1 }}>
          {["Trang chủ", "Dữ liệu chất lượng không khí", "Bản đồ", "Liên hệ"].map(item => (
            <span key={item} style={{ fontSize: 13.5, color: "#374151", cursor: "pointer" }}>{item}</span>
          ))}
          <span style={{ fontSize: 13.5, color: "#0d6e4e", fontWeight: 700, cursor: "pointer", borderBottom: "2px solid #0d6e4e", paddingBottom: 2 }}>Giá gói</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13.5, color: "#374151", cursor: "pointer" }}>Đăng nhập</span>
          <button style={{ background: "#0d6e4e", color: "white", border: "none", borderRadius: 22, padding: "9px 22px", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Đăng ký</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "72px 24px 48px" }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: "#1a2e1a", margin: "0 0 16px", lineHeight: 1.15 }}>
          Đầu tư cho <span style={{ color: "#0d6e4e" }}>lá phổi</span> của bạn.
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.65 }}>
          Mở khóa sức mạnh của Trí tuệ nhân tạo để bảo vệ sức khỏe gia đình bạn 24/7.
        </p>

        {/* Toggle */}
        <div style={{ display: "inline-flex", alignItems: "center", background: "white", border: "1px solid #e5e7eb", borderRadius: 99, padding: 4, gap: 2 }}>
          <button onClick={() => setBilling("thang")} style={{
            padding: "8px 22px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
            background: billing === "thang" ? "white" : "transparent",
            color: billing === "thang" ? "#1a2e1a" : "#9ca3af",
            boxShadow: billing === "thang" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
          }}>Hàng tháng</button>
          <button onClick={() => setBilling("nam")} style={{
            padding: "8px 22px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
            background: billing === "nam" ? "white" : "transparent",
            color: billing === "nam" ? "#1a2e1a" : "#9ca3af",
            boxShadow: billing === "nam" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
          }}>Hàng năm</button>
          <div style={{ background: "#ef4444", color: "white", borderRadius: 99, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>Tiết kiệm 20%</div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{ display: "flex", justifyContent: "center", gap: 0, maxWidth: 860, margin: "0 auto", padding: "0 24px 60px", alignItems: "stretch" }}>

        {/* Free Card */}
        <div style={{ flex: 1, background: "white", borderRadius: "16px 0 0 16px", border: "1px solid #e9ecef", padding: "36px 36px 36px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: "#374151", fontWeight: 500 }}>Gói Cơ Bản</div>
          <div style={{ marginBottom: 28 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#1a2e1a" }}>0 VNĐ</span>
            <span style={{ fontSize: 14, color: "#9ca3af" }}> / tháng</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, marginBottom: 32 }}>
            {[
              { text: "Xem bản đồ nhiệt", active: true },
              { text: "Dự báo 24h", active: true },
              { text: "Tìm đường A* cơ bản", active: true },
              { text: "Lưu 2 trạm", active: true },
              { text: "DY báo AI 7 ngày", active: false },
              { text: "Eco-Routing theo Bệnh lý", active: false },
              { text: "API Key & Cảnh báo Zalo/SMS", active: false },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {item.active ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" fill="#0d6e4e"/><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><rect x="3" y="11" width="18" height="11" rx="2" stroke="#d1d5db" strokeWidth="1.5"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#d1d5db" strokeWidth="1.5"/></svg>
                )}
                <span style={{ fontSize: 13.5, color: item.active ? "#374151" : "#9ca3af", fontStyle: item.active ? "normal" : "italic" }}>{item.text}</span>
              </div>
            ))}
          </div>

          <button style={{ width: "100%", background: "transparent", color: "#374151", border: "1.5px solid #d1d5db", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Gói hiện tại
          </button>
        </div>

        {/* Pro Card */}
        <div style={{ flex: 1, background: "white", borderRadius: "0 16px 16px 0", border: "2px solid #0d6e4e", padding: "36px 36px 36px", display: "flex", flexDirection: "column", position: "relative" }}>
          {/* Badge */}
          <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#0d6e4e", color: "white", borderRadius: 99, padding: "5px 16px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            PHỔ BIẾN NHẤT
          </div>

          <div style={{ marginBottom: 8, fontSize: 14, color: "#374151", fontWeight: 500 }}>Gói Pro AI</div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#0d6e4e" }}>49.000 VNĐ</span>
            <span style={{ fontSize: 14, color: "#9ca3af" }}> / tháng</span>
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", marginBottom: 24 }}>60.000 VNĐ</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, marginBottom: 32 }}>
            {[
              "Mở khóa toàn bộ chức năng AI",
              "Dự báo chi tiết 7 ngày",
              "Tìm đường né bụi mịn theo bệnh lý",
              "Cảnh báo tự động qua Zalo/Email",
              "Hỗ trợ API cho Developer",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" fill="#0d6e4e"/><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 13.5, color: "#374151" }}>{text}</span>
              </div>
            ))}
          </div>

          <button style={{ width: "100%", background: "#0d6e4e", color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Nâng cấp Pro ngay
          </button>
        </div>
      </div>

      {/* Payment */}
      <div style={{ textAlign: "center", padding: "0 24px 80px" }}>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>Thanh toán bảo mật 100%. Hủy bất cứ lúc nào.</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
          {/* VNPay */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px" }}>
            <div style={{ width: 20, height: 20, background: "#1a56db", borderRadius: 4 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>VNPay</span>
          </div>
          {/* MoMo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px" }}>
            <div style={{ width: 20, height: 20, background: "#ae2070", borderRadius: 4 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>MoMo</span>
          </div>
          {/* Visa */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px" }}>
            <div style={{ width: 32, height: 20, background: "#1a1f71", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 9, fontWeight: 800, letterSpacing: "0.5px" }}>VISA</span>
            </div>
          </div>
          {/* Mastercard */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ display: "flex" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#eb001b" }} />
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#f79e1b", marginLeft: -8 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "white", borderTop: "1px solid #e9ecef", padding: "56px 80px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 005.4 21C10 17 15 15 19 14c.34-2.68-1-5-2-6z" fill="#0d6e4e"/><path d="M12 2C6 2 2 8 2 12c0 .7.07 1.38.2 2.04C4.52 9.44 9.18 6 15 5.5A10 10 0 0012 2z" fill="#22c55e"/></svg>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>EcoAir VN</span>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Ứng dụng tiên phong sử dụng AI để giám sát và dự báo chất lượng không khí, bảo vệ sức khỏe cộng đồng Việt Nam.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a", marginBottom: 16 }}>Giải pháp</div>
            {["Dự báo AI", "Bản đồ nhiệt real-time", "Lộ trình sạch (Eco-routing)", "Thiết bị cảm biến"].map(l => (
              <div key={l} style={{ fontSize: 13.5, color: "#6b7280", marginBottom: 10, cursor: "pointer" }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a", marginBottom: 16 }}>Tài nguyên</div>
            {["Tài liệu API", "Báo cáo hàng năm", "Blog sức khỏe", "Cộng đồng"].map(l => (
              <div key={l} style={{ fontSize: 13.5, color: "#6b7280", marginBottom: 10, cursor: "pointer" }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a", marginBottom: 16 }}>Liên hệ</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span style={{ fontSize: 13, color: "#6b7280" }}>support@ecoair.vn</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.8 6.8l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              <span style={{ fontSize: 13, color: "#6b7280" }}>1900 6789</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>Khu Công nghệ cao, TP. Thủ Đức, TP. HCM</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>© 2024 EcoAir VN - Người bảo hộ thanh khiết.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["VR chúng tôi", "à iRu khoản", "Bảo mật", "Liên hệ"].map(l => (
              <span key={l} style={{ fontSize: 12, color: "#9ca3af", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
