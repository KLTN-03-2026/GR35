export default function EcoAirAlertConfig() {
  const navItems = [
    { icon: "⊞", label: "Tổng quan", active: false },
    { icon: "🗺", label: "Bản đồ & Tìm đường", active: false },
    { icon: "🕐", label: "Lịch sử & Xuất dữ liệu", active: false },
    { icon: "🔔", label: "Cấu hình Cảnh báo", active: true },
    { icon: "⚠", label: "Báo cáo điểm nóng", active: false },
    { icon: "</>", label: "APi Key", active: false },
    { icon: "👤", label: "Hồ sơ & Sức khỏe", active: false },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif", background: "#f5f6fa", fontSize: 14, color: "#222" }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 232, background: "#fff", borderRight: "1px solid #ebebeb", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative" }}>

        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#2e7d32,#43a047)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 17 }}>🌿</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#1b5e20", letterSpacing: 0.3 }}>EcoAir VN</div>
            <div style={{ fontSize: 8.5, color: "#aaa", letterSpacing: 1.1, fontWeight: 600 }}>THANH KHIẾT & MINH BẠCH</div>
          </div>
        </div>

        {/* User card */}
        <div style={{ margin: "14px 12px", background: "#f7faf7", borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ffb300", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#222" }}>Nguyễn Thành Nam</div>
            <div style={{ fontSize: 11, color: "#2e7d32", fontWeight: 700, letterSpacing: 0.5 }}>THÀNH VIÊN PRO</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "6px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
          {navItems.map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 9, cursor: "pointer",
              background: item.active ? "#2e7d32" : "transparent",
              color: item.active ? "#fff" : "#555",
              fontWeight: item.active ? 600 : 400,
              fontSize: 13.5,
            }}>
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* PRO banner */}
        <div style={{ margin: "0 12px 12px", background: "#1b5e20", borderRadius: 12, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -10, bottom: -14, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ background: "#ffb300", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>⭐</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 0.8 }}>ĐANG Sx DpNG PRO</span>
          </div>
          <div style={{ fontSize: 12, color: "#a5d6a7", lineHeight: 1.5 }}>
            Gói của bạn sẽ hết hạn sau <span style={{ color: "#ffb300", fontWeight: 700 }}>145 ngày</span>.
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: "12px 22px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#e53935", cursor: "pointer", fontSize: 13.5, fontWeight: 500 }}>
            <span>→</span> Đăng xuất
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1a1a" }}>Chào buổi sáng, Nam! 👋</div>
            <div style={{ fontSize: 12.5, color: "#999", marginTop: 2 }}>Hôm nay không khí rất trong lành, hãy tận hưởng nhé.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e0e0e0", borderRadius: 22, padding: "8px 16px", width: 240 }}>
              <span style={{ color: "#bbb", fontSize: 14 }}>🔍</span>
              <span style={{ color: "#ccc", fontSize: 13 }}>Tìm kiếm tính năng, tài liệu...</span>
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", border: "none", borderRadius: 22, background: "#2e7d32", cursor: "pointer", fontWeight: 600, fontSize: 13.5, color: "#fff" }}>
              ✨ Nâng cấp Pro
            </button>
            <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: "50%", background: "#f5f6fa", fontSize: 17 }}>🔔</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px" }}>Cấu hình Cảnh báo Ô nhiễm</h1>
            <p style={{ fontSize: 14, color: "#777", margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
              Thiết lập các thông báo thông minh để bảo vệ sức khỏe gia đình bạn ngay khi chất<br />lượng không khí có dấu hiệu suy giảm.
            </p>
          </div>

          {/* Two plan cards */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

            {/* ── Basic card ── */}
            <div style={{ flex: 1, background: "#fff", borderRadius: 16, border: "1.5px solid #e8e8e8", padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22, color: "#bbb" }}>🔒</span>
                  <span style={{ fontWeight: 700, fontSize: 17, color: "#333" }}>Gói Cơ bản</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", border: "1.5px solid #e0e0e0", borderRadius: 6, padding: "3px 10px", letterSpacing: 0.8 }}>MIỄN PHÍ</span>
              </div>

              {/* AQI threshold */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#aaa", letterSpacing: 1.2, marginBottom: 10 }}>NGƯỠNG AQI KÍCH HOẠT</div>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ flex: 1, padding: "11px 16px", fontSize: 15, fontWeight: 600, color: "#333" }}>150</div>
                  <div style={{ padding: "11px 14px", background: "#f5f5f5", fontSize: 11.5, fontWeight: 700, color: "#aaa", borderLeft: "1.5px solid #e0e0e0", letterSpacing: 0.5 }}>MĐC ĐỊNH</div>
                </div>
                <div style={{ fontSize: 12, color: "#bbb", marginTop: 8, fontStyle: "italic" }}>Cố định cho tài khoản miễn phí</div>
              </div>

              {/* Notification method */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#aaa", letterSpacing: 1.2, marginBottom: 10 }}>PHƯƠNG THỨC NHẬN TIN</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Website */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "2px solid #43a047", borderRadius: 10, padding: "13px 16px", background: "#f0faf0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 17, color: "#2e7d32" }}>💳</span>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#2e7d32" }}>Thông báo Website</span>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 13 }}>✓</span>
                    </div>
                  </div>
                  {/* Email */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "13px 16px", background: "#fafafa" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 17, color: "#ccc" }}>✉</span>
                      <span style={{ fontSize: 14, color: "#bbb" }}>Gửi Email</span>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: 5, border: "1.5px solid #e0e0e0", background: "#fff" }} />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button style={{ width: "100%", padding: "13px", border: "none", borderRadius: 10, background: "#e0e0e0", color: "#999", fontWeight: 700, fontSize: 13.5, letterSpacing: 0.8, cursor: "default", marginTop: 4 }}>
                ĐANG SỬ DỤNG
              </button>
            </div>

            {/* ── Pro card ── */}
            <div style={{ flex: 1, background: "#fff", borderRadius: 16, border: "2.5px solid #2e7d32", padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
              {/* Recommended badge */}
              <div style={{ position: "absolute", top: -13, left: 22 }}>
                <span style={{ background: "#2e7d32", color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "4px 14px", letterSpacing: 0.8 }}>KHUYÊN DÙNG</span>
              </div>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: 18 }}>✓</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: "#1a1a1a" }}>Gói Nâng cao (Pro)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2e7d32", display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32", letterSpacing: 0.8 }}>ĐANG KÍCH HOẠT</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: "#2e7d32" }}>59.000đ</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>/ tháng</div>
                </div>
              </div>

              {/* PM2.5 slider */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: "#444", fontWeight: 500 }}>Ngưỡng PM2.5 tùy chỉnh</span>
                  <span style={{ background: "#2e7d32", color: "#fff", fontWeight: 700, fontSize: 14, borderRadius: 8, padding: "5px 14px" }}>55 μg/m³</span>
                </div>
                <div style={{ position: "relative", height: 6, background: "#e0e0e0", borderRadius: 10, margin: "4px 0 12px" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, width: "36%", height: "100%", background: "#2e7d32", borderRadius: 10 }} />
                  <div style={{ position: "absolute", left: "calc(36% - 8px)", top: -5, width: 16, height: 16, borderRadius: "50%", background: "#2e7d32", border: "2.5px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa" }}>
                  <span style={{ color: "#2e7d32", fontWeight: 600 }}>TỐT (0)</span>
                  <span>TRUNG BÌNH (35)</span>
                  <span style={{ color: "#e53935", fontWeight: 600 }}>NGUY HẠI (150+)</span>
                </div>
              </div>

              {/* Notification channels */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#aaa", letterSpacing: 1.2, marginBottom: 12 }}>KÊNH NHẬN THÔNG BÁO TỨC THỜI</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Email */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>✉</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "#222" }}>Gửi Email</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>nguyenvan@ecoair.vn</div>
                      </div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 13 }}>✓</span>
                    </div>
                  </div>
                  {/* SMS */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>📱</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "#222" }}>Gửi SMS/Zalo</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>0901234xxx</div>
                      </div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 13 }}>✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <button style={{ width: "100%", padding: "15px", border: "none", borderRadius: 12, background: "#2e7d32", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span>💾</span> Lưu cấu hình cảnh báo
              </button>
            </div>
          </div>

          {/* Advice box */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e8e8e8", padding: "24px 28px", marginTop: 20, display: "flex", alignItems: "flex-start", gap: 18 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#e8f5e9", border: "2px solid #c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🛡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 8 }}>Lời khuyên từ Người bảo hộ</div>
              <div style={{ fontSize: 13.5, color: "#555", lineHeight: 1.7 }}>
                "Không khí rất tốt, hãy mở cửa sổ đón gió nội khu." Việc thiết lập cảnh báo giúp bạn chủ động hơn trong việc bảo vệ hệ hô hấp cho người già và trẻ nhỏ trong các khung giờ cao điểm ô nhiễm.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 36, paddingTop: 20, borderTop: "1px solid #e8e8e8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, background: "#2e7d32", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 14 }}>🌿</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1b5e20" }}>EcoAir VN</span>
              <span style={{ color: "#ddd", margin: "0 6px" }}>|</span>
              <span style={{ fontSize: 12.5, color: "#aaa" }}>© 2026 EcoAir Việt Nam. Bảo lưu mọi quyền.</span>
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: 12.5, color: "#999" }}>
              <span style={{ cursor: "pointer" }}>Điều khoản dịch vụ</span>
              <span style={{ cursor: "pointer", fontWeight: 700, color: "#333" }}>Chính sách bảo mật</span>
              <span style={{ cursor: "pointer" }}>Trung tâm hỗ trợ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
