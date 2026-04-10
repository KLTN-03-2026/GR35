
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_ROUTES = {
    "Tổng quan": "/dashboard",
    "API Key": "/gif",
};


<button onClick={() => navigate(PAGE_ROUTES[page] || "/dashboard")}>
    ...
</button>

const PAGES = ["Tổng quan", "Bản đồ & Tìm đường", "Lịch sử & Xuất dữ liệu", "Cấu hình Cảnh báo", "Báo cáo điểm nóng", "API Key", "Hồ sơ & Sức khỏe"];

const NAV_ICONS = {
  "Tổng quan": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  "Bản đồ & Tìm đường": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  "Lịch sử & Xuất dữ liệu": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  "Cấu hình Cảnh báo": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  "Báo cáo điểm nóng": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  "API Key": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  "Hồ sơ & Sức khỏe": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function APIKeyPage() {
  const [active, setActive] = useState("API Key");
    const [showKey, setShowKey] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {     // ← thêm hàm này
        navigate("/login");
    };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7f5", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 14 }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 218, minWidth: 218, background: "white", borderRight: "1px solid #e9ecef", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0d6e4e,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 005.4 21C10 17 15 15 19 14c.34-2.68-1-5-2-6z"/><path d="M12 2C6 2 2 8 2 12c0 .7.07 1.38.2 2.04C4.52 9.44 9.18 6 15 5.5A10 10 0 0012 2z"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a2e1a", letterSpacing: "0.3px" }}>EcoAir VN</div>
              <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.8px", fontWeight: 600 }}>HỆ SINH THÁI XANH</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#6b7280", flexShrink: 0 }}>N</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1a2e1a" }}>Nguyen Thành Nam</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ background: "#0d6e4e", color: "white", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3 }}>PRO</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 10px" }}>
          {PAGES.map(page => (
            <button key={page} onClick={() => setActive(page)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              textAlign: "left", background: active === page ? "#e8f5ee" : "transparent",
              color: active === page ? "#0d6e4e" : "#374151",
              fontWeight: active === page ? 600 : 400, fontSize: 13, marginBottom: 2,
            }}>
              <span style={{ color: active === page ? "#0d6e4e" : "#9ca3af", flexShrink: 0 }}>{NAV_ICONS[page]}</span>
              {page}
            </button>
          ))}
        </nav>

              {/* Đăng xuất */}
              <div style={{ padding: "12px 10px", borderTop: "1px solid #f0f0f0" }}>
                  <button
                      onClick={handleLogout}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 500 }}
                  >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Đăng xuất
                  </button>
              </div>
          </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Header */}
        <header style={{ background: "white", borderBottom: "1px solid #e9ecef", padding: "14px 32px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#1a2e1a" }}>Chào buổi sáng, Nam!</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Hy vọng bạn có một ngày làm viSc hiSu quả.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 22, padding: "8px 16px", width: 240 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>Tìm kiếm tài liệu, dữ liệu...</span>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d6e4e", color: "white", border: "none", borderRadius: 22, padding: "9px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Nâng cấp Pro
          </button>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", position: "relative" }}>

          {/* Page title */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a2e1a", margin: "0 0 6px" }}>Tích hợp API EcoAir</h1>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>SX dụng dữ liSu của chúng tôi cho các ứng dụng tùy chỉnh của bạn.</p>
            </div>
            <div style={{ background: "#e8f5ee", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 14px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0d6e4e", letterSpacing: "0.5px" }}>PRO PLAN ACTIVE</span>
            </div>
          </div>

          {/* Usage + Security row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 24 }}>

            {/* Usage card */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.6px", marginBottom: 8 }}>LƯU LƯỢNG THÁNG NÀY</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 34, fontWeight: 800, color: "#1a2e1a" }}>8,450</span>
                    <span style={{ fontSize: 14, color: "#9ca3af" }}>/ 10,000 requests</span>
                  </div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #0d6e4e", borderTopColor: "transparent", animation: "spin 1.2s linear infinite" }}>
                  {/* spinner visual */}
                  <svg width="34" height="34" viewBox="0 0 34 34" style={{ position: "relative", top: -3, left: -3 }}>
                    <circle cx="17" cy="17" r="14" fill="none" stroke="#e8f5ee" strokeWidth="3"/>
                    <circle cx="17" cy="17" r="14" fill="none" stroke="#0d6e4e" strokeWidth="3" strokeDasharray="60 28" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div style={{ height: 8, background: "#f0f0f0", borderRadius: 99, margin: "16px 0 10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "84.5%", background: "linear-gradient(90deg,#22c55e,#0d6e4e)", borderRadius: 99 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#0d6e4e", fontWeight: 600 }}>84.5% đã sử dụng</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Còn lại 1,550 requests</span>
              </div>
            </div>

            {/* Security card */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>🛡️</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>Bảo mật API</span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, margin: "0 0 14px", fontStyle: "italic" }}>
                "API Key giống như mật khẩu của bạn. Tuyệt đối không chia sẻ hoặc để lộ trong mã nguồn phía người dùng."
              </p>
              <a href="#" style={{ fontSize: 13, color: "#0d6e4e", fontWeight: 600, textDecoration: "none" }}>
                Xem tài liệu bảo mật →
              </a>
            </div>
          </div>

          {/* API Keys list */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "22px 24px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1a2e1a", marginBottom: 4 }}>Danh sách API Keys</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Giới hạn: 1/3 keys đang đWc sử dụng</div>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 7, background: "#0d6e4e", color: "white", border: "none", borderRadius: 22, padding: "10px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tạo API Key mới
              </button>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  {["TÊN PROJECT", "API KEY", "NGÀY TẠO", "THAO TÁC"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "18px 12px", fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>Project Đơ án AI</td>
                  <td style={{ padding: "18px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, color: "#374151", letterSpacing: "0.5px" }}>
                        {showKey ? "ea8f12-demo-key-1234" : "ea8f12••••••••••••••"}
                      </span>
                      <button onClick={() => setShowKey(!showKey)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9ca3af" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#9ca3af" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "18px 12px", fontSize: 13, color: "#6b7280" }}>12/03/2026</td>
                  <td style={{ padding: "18px 12px" }}>
                    <button style={{ background: "#fff1f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Vô hiệu hóa
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Info box */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 20, padding: "14px 16px", background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div style={{ fontSize: 13, color: "#0369a1", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600 }}>Cần hỗ trợ kỹ thuật?</span>
                {" "}Truy cập{" "}
                <a href="#" style={{ color: "#0d6e4e", fontWeight: 600 }}>Cổng thông tin Developer</a>
                {" "}để xem mẫu code (Node.js, Python, cURL) và giới hạn Rate Limit chi tiết.
              </div>
            </div>
          </div>

          {/* Promo cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {/* Card 1 – dark green API */}
            <div style={{ borderRadius: 14, overflow: "hidden", position: "relative", minHeight: 160, background: "#0d2b1f", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "20px 22px" }}>
              {/* decorative rings */}
              <div style={{ position: "absolute", top: "50%", left: "55%", transform: "translate(-50%,-50%)", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(234,179,8,0.25)" }} />
              <div style={{ position: "absolute", top: "50%", left: "55%", transform: "translate(-50%,-50%)", width: 140, height: 140, borderRadius: "50%", border: "1px solid rgba(234,179,8,0.35)" }} />
              <div style={{ position: "absolute", top: "50%", left: "55%", transform: "translate(-50%,-50%)", width: 80, height: 80, borderRadius: "50%", border: "2px solid rgba(234,179,8,0.5)" }} />
              <div style={{ position: "absolute", top: "50%", left: "55%", transform: "translate(-50%,-60%)", fontSize: 28, fontWeight: 800, color: "#eab308", letterSpacing: "2px", fontFamily: "serif" }}>ÂPI</div>
              <div style={{ position: "relative" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "white", marginBottom: 4 }}>Dữ liệu Thời gian thực</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Cập nhật chỉ số mỗi 5 phút toàn cầu.</div>
              </div>
            </div>

            {/* Card 2 – dark servers */}
            <div style={{ borderRadius: 14, overflow: "hidden", position: "relative", minHeight: 160, background: "#1a1f2e", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "20px 22px" }}>
              {/* server rack decoration */}
              <div style={{ position: "absolute", top: 16, right: 20, display: "flex", flexDirection: "column", gap: 6, opacity: 0.5 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ width: 80, height: 14, borderRadius: 3, background: "#2d3748", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: i === 2 ? "#22c55e" : "#374151" }} />
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#374151" }} />
                  </div>
                ))}
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "white", marginBottom: 4 }}>Uptime 99.9%</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Cơ sở hạ tầng đáp ứng tiêu chuẩn doanh nghiệp.</div>
              </div>
            </div>
          </div>

          {/* Toast notification */}
          <div style={{ position: "fixed", bottom: 28, right: 28, background: "white", borderRadius: 14, border: "1px solid #e9ecef", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12, maxWidth: 280, zIndex: 100 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a2e1a", marginBottom: 4 }}>Hệ thống ổn định</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Độ trễ trung bình 45ms. Tất cả các dịch vụ đang hoạt động bình thường.</div>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer style={{ background: "white", borderTop: "1px solid #e9ecef", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>© 2024 EcoAir VN. Tất cả quyền đWc bảo lWu.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Điều khoản", "Riêng tư"].map(l => (
              <span key={l} style={{ fontSize: 12, color: "#6b7280", cursor: "pointer", textDecoration: "underline" }}>{l}</span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
