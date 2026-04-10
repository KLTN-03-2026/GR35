export default function EcoAirHistory() {
  const tableData = [
    { time: "10:00 AM", sub: "HÔM NAY", aqi: 42, aqiColor: "#4caf50", pm25: "12.5", pm10: "24.1", temp: "26°C", hum: "65%", status: "TỐT", statusColor: "#4caf50", statusBg: "#e8f5e9" },
    { time: "09:00 AM", sub: "HÔM NAY", aqi: 48, aqiColor: "#4caf50", pm25: "14.2", pm10: "28.5", temp: "25°C", hum: "68%", status: "TỐT", statusColor: "#4caf50", statusBg: "#e8f5e9" },
    { time: "08:00 AM", sub: "HÔM NAY", aqi: 65, aqiColor: "#ff9800", pm25: "22.8", pm10: "42.3", temp: "24°C", hum: "72%", status: "TRUNG BÌNH", statusColor: "#ff9800", statusBg: "#fff3e0" },
    { time: "07:00 AM", sub: "HÔM NAY", aqi: 78, aqiColor: "#ff9800", pm25: "28.4", pm10: "54.9", temp: "23°C", hum: "75%", status: "TRUNG BÌNH", statusColor: "#ff9800", statusBg: "#fff3e0" },
  ];

  const navItems = [
    { icon: "⊞", label: "Tổng quan", active: false },
    { icon: "🗺", label: "Bản đồ & Tìm đường", active: false },
    { icon: "📋", label: "Lịch sử & Xuất dữ liệu", active: true },
    { icon: "🔔", label: "Cấu hình Cảnh báo", active: false },
    { icon: "📍", label: "Báo cáo điểm nóng", active: false },
  ];

  const navBottom = [
    { icon: "</>", label: "API Key" },
    { icon: "👤", label: "Hồ sơ & Sức khỏe" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif", background: "#f5f6fa", fontSize: 14 }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: "#fff", borderRight: "1px solid #ebebeb", display: "flex", flexDirection: "column", padding: "0", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#2e7d32,#43a047)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 18 }}>🌿</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1b5e20", letterSpacing: 0.3 }}>EcoAir VN</div>
              <div style={{ fontSize: 9, color: "#888", letterSpacing: 1.2, fontWeight: 500 }}>THANH KHIẾT & MINH BẠCH</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: "14px 14px", margin: "12px 12px", background: "#f7faf7", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="https://i.pravatar.cc/40?img=12" alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#222" }}>Nguyễn Thành Nam</div>
              <div style={{ fontSize: 11, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "#666", fontWeight: 500 }}>PRO PLAN</span> <span>⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 9, cursor: "pointer",
              background: item.active ? "#e8f5e9" : "transparent",
              color: item.active ? "#2e7d32" : "#555",
              fontWeight: item.active ? 600 : 400,
              fontSize: 13.5,
            }}>
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div style={{ height: 1, background: "#f0f0f0", margin: "10px 4px" }} />

          {navBottom.map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 9, cursor: "pointer", color: "#555", fontSize: 13.5,
            }}>
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#e53935", cursor: "pointer", fontSize: 13.5, fontWeight: 500 }}>
            <span>→</span> à Ong xuất
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>Chào buổi sáng, Nam!</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f6fa", borderRadius: 20, padding: "7px 16px", width: 260 }}>
              <span style={{ color: "#aaa", fontSize: 14 }}>🔍</span>
              <span style={{ color: "#bbb", fontSize: 13 }}>Tìm trạm đo hoặc chỉ số...</span>
            </div>
            {/* Upgrade */}
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", border: "1.5px solid #e0e0e0", borderRadius: 20, background: "#fff", cursor: "pointer", fontWeight: 500, fontSize: 13, color: "#333" }}>
              ✨ Nâng cấp Pro
            </button>
            {/* Bell */}
            <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: "50%", background: "#f5f6fa", fontSize: 16 }}>🔔</div>
            {/* Settings */}
            <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: "50%", background: "#f5f6fa", fontSize: 16 }}>⚙️</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12.5, color: "#999", marginBottom: 18 }}>
            Trang chủ <span style={{ margin: "0 5px" }}>›</span> <span style={{ color: "#555" }}>Lịch sử & Xuất dữ liệu</span>
          </div>

          {/* Card */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {/* Station selector */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#aaa", letterSpacing: 1.2, marginBottom: 8 }}>TRẠM ĐO LƯỜNG</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "9px 14px", cursor: "pointer" }}>
                <span style={{ color: "#2e7d32" }}>📍</span>
                <span style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>Trạm 41 Lê Duẩn, Đà Nẵng</span>
                <span style={{ color: "#aaa", fontSize: 12 }}>⇅</span>
              </div>
            </div>

            {/* Date + Buttons */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#aaa", letterSpacing: 1.2, marginBottom: 8 }}>KHOẢNG THỜI GIAN</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px solid #e0e0e0", borderRadius: 10, padding: "9px 14px", cursor: "pointer" }}>
                  <span style={{ color: "#2e7d32", fontSize: 14 }}>📅</span>
                  <span style={{ fontWeight: 500, fontSize: 14, color: "#222" }}>15/10/2023 – 22/10/2023</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", border: "1.5px solid #e0e0e0", borderRadius: 10, background: "#fff", cursor: "pointer", fontWeight: 500, fontSize: 13.5, color: "#333" }}>
                  <span>⬇</span> Tải xuống CSV
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", border: "none", borderRadius: 10, background: "#2e7d32", cursor: "pointer", fontWeight: 600, fontSize: 13.5, color: "#fff" }}>
                  <span>📄</span> Xuất báo cáo PDF
                  <span style={{ background: "#fff", color: "#2e7d32", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 5px", marginLeft: 2 }}>PRO</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  {["THỜI GIAN", "CHỈ SỐ AQI", "PM2.5 (MG/M³)", "PM10", "NHIỆT ĐỘ", "ĐỘ HM", "TRẠNG THÁI"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f7f7f7" }}>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{row.time}</div>
                      <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{row.sub}</div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: "50%",
                        border: `2.5px solid ${row.aqiColor}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 15, color: row.aqiColor,
                        background: `${row.aqiColor}18`
                      }}>{row.aqi}</div>
                    </td>
                    <td style={{ padding: "16px 12px", color: "#333", fontWeight: 500 }}>{row.pm25}</td>
                    <td style={{ padding: "16px 12px", color: "#333", fontWeight: 500 }}>{row.pm10}</td>
                    <td style={{ padding: "16px 12px", color: "#333", fontWeight: 500 }}>{row.temp}</td>
                    <td style={{ padding: "16px 12px", color: "#333", fontWeight: 500 }}>{row.hum}</td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{
                        background: row.statusBg, color: row.statusColor,
                        padding: "4px 12px", borderRadius: 20, fontWeight: 600, fontSize: 12,
                        display: "inline-flex", alignItems: "center", gap: 5
                      }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: row.statusColor, display: "inline-block" }} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
              <div style={{ fontSize: 13, color: "#999" }}>Đang xem 1 - 10 của <strong style={{ color: "#333" }}>240</strong> bản ghi</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button style={{ width: 32, height: 32, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14, color: "#aaa" }}>‹</button>
                {[1, 2, 3].map(n => (
                  <button key={n} style={{
                    width: 32, height: 32, border: n === 1 ? "none" : "1px solid #e0e0e0",
                    borderRadius: 8, cursor: "pointer", fontSize: 13.5,
                    background: n === 1 ? "#2e7d32" : "#fff",
                    color: n === 1 ? "#fff" : "#555", fontWeight: n === 1 ? 700 : 400
                  }}>{n}</button>
                ))}
                <span style={{ color: "#ccc", fontSize: 13 }}>...</span>
                <button style={{ width: 32, height: 32, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13.5, color: "#555" }}>24</button>
                <button style={{ width: 32, height: 32, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14, color: "#aaa" }}>›</button>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✨</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 4 }}>Phân tích chuyên sâu (AI Insight)</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                  Dựa trên dữ liệu lịch sử tuần qua, chất lượng không khí tại <strong>41 Lê Duẩn</strong> bắt đầu suy giảm từ 07:15 sáng do mật độ giao thông. Hệ thống khuyến nghị bạn nên kích hoạt máy lọc không khí trước 15 phút vào khung giờ này.
                </div>
              </div>
            </div>
            <button style={{ padding: "10px 18px", border: "1.5px solid #e0e0e0", borderRadius: 10, background: "#fff", cursor: "pointer", fontWeight: 500, fontSize: 13, color: "#333", whiteSpace: "nowrap", marginLeft: 20 }}>
              Báo cáo chi tiết
            </button>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: "0 4px" }}>
            <div style={{ fontSize: 12, color: "#ccc" }}>© 2023 EcoAir VN. All rights reserved. &nbsp;·&nbsp; Phiên bản 2.4.0-pro</div>
            <div style={{ display: "flex", gap: 18, fontSize: 12, color: "#aaa" }}>
              <span style={{ cursor: "pointer" }}>Điều khoản sử dụng</span>
              <span style={{ cursor: "pointer" }}>Chính sách bảo mật</span>
              <span style={{ cursor: "pointer" }}>Hỗ trợ kỹ thuật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
