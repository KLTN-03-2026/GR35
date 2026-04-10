import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGES = ["Tổng quan", "Bản đồ", "Lịch sử", "Cảnh báo", "Báo cáo cộng đồng", "API Key", "Hồ sơ & Sức khỏe"];

const NAV_ICONS = {
  "Tổng quan": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  "Bản đồ": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  "Lịch sử": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  "Cảnh báo": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  "Báo cáo cộng đồng": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  "API Key": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  "Hồ sơ & Sức khỏe": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

const PAGE_ROUTES = {
  "Tổng quan": "/dashboard",
  "Bản đồ": "/dashboard/map",
  "Lịch sử": "/dashboard/history",
  "Cảnh báo": "/dashboard/alerts",
  "Báo cáo cộng đồng": "/bao-cao-cong-dong",
  "API Key": "/gif",
  "Hồ sơ & Sức khỏe": "/dashboard/profile",
};

export default function CommunityReportPage() {
  const [active, setActive] = useState("Báo cáo cộng đồng");
  const navigate = useNavigate();

  const handleNav = (page) => {
    setActive(page);
    navigate(PAGE_ROUTES[page] || "/dashboard");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7f5", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 14 }}>

      {/* Sidebar */}
      <aside style={{ width: 210, minWidth: 210, background: "white", borderRight: "1px solid #e9ecef", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0d6e4e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "white" }}>E</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a2e1a" }}>EcoAir VN</div>
              <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.6px", fontWeight: 600 }}>NGƯỜI BẢO HỘ THANH KHIẾT</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {PAGES.map(page => (
            <button key={page} onClick={() => handleNav(page)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              textAlign: "left",
              background: active === page ? "#e8f5ee" : "transparent",
              color: active === page ? "#0d6e4e" : "#374151",
              fontWeight: active === page ? 600 : 400,
              fontSize: 13, marginBottom: 2,
            }}>
              <span style={{ color: active === page ? "#0d6e4e" : "#9ca3af", flexShrink: 0 }}>{NAV_ICONS[page]}</span>
              {page}
            </button>
          ))}
        </nav>

        {/* Upgrade Banner */}
        <div style={{ margin: "0 12px 16px", background: "#0d6e4e", borderRadius: 12, padding: "14px 14px 12px" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 10, lineHeight: 1.5 }}>Trải nghiệm không giới hạn</div>
          <button style={{ width: "100%", background: "white", color: "#0d6e4e", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Nâng cấp PRO
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top nav */}
        <header style={{ background: "white", borderBottom: "1px solid #e9ecef", padding: "0 32px", display: "flex", alignItems: "center", height: 54 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1a2e1a", marginRight: 36 }}>EcoAir VN</span>
          <div style={{ display: "flex", gap: 28, flex: 1 }}>
            {["Tổ chức", "Báo cáo cộng đồng", "Hướng dẫn"].map(item => (
              <span key={item} style={{
                fontSize: 13.5, cursor: "pointer",
                color: item === "Báo cáo cộng đồng" ? "#0d6e4e" : "#6b7280",
                fontWeight: item === "Báo cáo cộng đồng" ? 600 : 400,
                borderBottom: item === "Báo cáo cộng đồng" ? "2px solid #0d6e4e" : "2px solid transparent",
                paddingBottom: 2,
              }}>{item}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <button style={{ background: "#0d6e4e", color: "white", border: "none", borderRadius: 20, padding: "7px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Gói PRO</button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, padding: "32px 32px", overflowY: "auto" }}>

          {/* Left */}
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1a2e1a", margin: "0 0 12px", lineHeight: 1.2 }}>Báo cáo điểm nóng ô nhiễm</h1>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, margin: "0 0 28px" }}>
              Giúp cộng đồng nhận biết các nguồn phát thải thực tế. Mọi đóng góp của bạn đều giúp bản đồ không khí minh bạch hơn.
            </p>

            {/* Upload */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "22px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 14 }}>Hình ảnh hiện trường (Bầu trời/Khói bụi)</div>
              <div style={{
                border: "1.5px dashed #d1d5db", borderRadius: 12, padding: "48px 24px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                background: "#fafbfa", cursor: "pointer", minHeight: 200,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Kéo thả hoặc nhấp để tải ảnh lên</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Hỗ trợ JPG, PNG (Tối đa 10MB)</div>
              </div>
            </div>

            {/* Location */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#0d6e4e", letterSpacing: "0.5px", marginBottom: 4 }}>VỊ TRÍ HIỆN TẠI</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a2e1a" }}>254 Nguyễn Văn Linh, Đà Nẵng</div>
                </div>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#e8f5ee", color: "#0d6e4e", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Lấy tọa độ GPS hiện tại
              </button>
            </div>

            {/* Description */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "18px 22px", marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 12 }}>Mô tả tình trạng</div>
              <textarea
                placeholder="Ví dụ: Phát hiện khói đen từ ống xả nhà máy, mùi khét nồng nặc khu vực cầu vượt..."
                style={{
                  width: "100%", minHeight: 100, border: "none", outline: "none",
                  background: "transparent", fontSize: 13.5, color: "#374151",
                  resize: "none", lineHeight: 1.65, boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Submit */}
            <button style={{ width: "100%", background: "#0d6e4e", color: "white", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
              Gửi báo cáo chờ duyệt
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
              Báo cáo của bạn sẽ được đội ngũ EcoAir VN xác minh trong vòng 15-30 phút.
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Guide */}
            <div style={{ background: "#0d6e4e", borderRadius: 14, padding: "22px 20px", color: "white" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Hướng dẫn báo cáo nhanh</div>
              {[
                { num: "01", title: "Chụp ảnh rõ nét", desc: "Đảm bảo thấy rõ nguồn phát thải hoặc màu sắc bầu trời." },
                { num: "02", title: "Xác nhận vị trí", desc: "Sử dụng GPS để chúng tôi khoanh vùng chính xác điểm nóng." },
                { num: "03", title: "Gửi & Theo dõi", desc: "Nhận thông báo khi báo cáo được duyệt và đưa lên bản đồ." },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < 2 ? 18 : 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.35)", flexShrink: 0, lineHeight: 1.2 }}>{step.num}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.55 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "18px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.6px", marginBottom: 14 }}>HOẠT ĐỘNG GẦN ĐÂY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { title: "Đốt rác tự phát", time: "2 giờ trước", place: "Liên Chiểu", status: "approved" },
                  { title: "Khói bụi công trình", time: "5 giờ trước", place: "Hải Châu", status: "pending" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "#e8f5ee", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1a2e1a", marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.time} • {item.place}</div>
                    </div>
                    {item.status === "approved" ? (
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    ) : (
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.6 }}>
                Dữ liệu của bạn được bảo mật và mã hóa theo tiêu chuẩn an toàn cộng đồng của EcoAir VN.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
