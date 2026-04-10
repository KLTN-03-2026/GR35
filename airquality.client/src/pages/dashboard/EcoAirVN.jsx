import { useState } from "react";

const EcoAirVN = () => {
  const [activeNav] = useState("Bản đồ");

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f5f7fa", minHeight: "100vh", color: "#1a1a1a" }}>
      {/* HEADER */}
      <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #e8ecef", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#16a34a", fontWeight: "700", fontSize: "18px" }}>🌿 EcoAir VN</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {["Trang chủ", "Dữ liệu chất lượng không khí", "Bản đồ", "Liên hệ", "Giá gói"].map((item) => (
            <a key={item} href="#" style={{ fontSize: "14px", color: item === activeNav ? "#16a34a" : "#374151", textDecoration: "none", fontWeight: item === activeNav ? "600" : "400", borderBottom: item === activeNav ? "2px solid #16a34a" : "none", paddingBottom: "2px" }}>
              {item}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a href="#" style={{ fontSize: "14px", color: "#374151", textDecoration: "none" }}>Đăng nhập</a>
          <button style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Đăng ký</button>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e8ecef", padding: "10px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>
          <span>Việt Nam</span>
          <span>›</span>
          <span>Đà Nẵng</span>
          <span>›</span>
          <span style={{ color: "#16a34a", fontWeight: "500" }}>Quận Hải Châu</span>
        </div>
      </div>

      {/* STATION TITLE + ACTIONS */}
      <div style={{ backgroundColor: "#fff", padding: "12px 32px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8ecef" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Trạm Quan Trắc: 41 Lê Duẩn, Đà Nẵng</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151" }}>
            <span style={{ color: "#ef4444" }}>♥</span> Lưu trạm yêu thích
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151" }}>
            🔔 Cài đặt cảnh báo
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#374151" }}>⟨</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: "20px 32px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* TOP DATA SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

          {/* AQI BIG CARD */}
          <div style={{ backgroundColor: "#16a34a", borderRadius: "16px", padding: "28px 32px", color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "72px", fontWeight: "800", lineHeight: 1 }}>42</span>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>😊</div>
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>TKT</div>
                <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px" }}>Cập nhật lúc: 10:00 AM, hôm nay</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
              <div>
                <div style={{ fontSize: "11px", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>🌡 NHIỆT ĐỘ</div>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>28°C</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>💧 ĐỘ ẨM</div>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>65%</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>💨 GIÓ</div>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>12km/h</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>⚙ ÁP SUẤT</div>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>1012 hPa</div>
              </div>
            </div>
          </div>

          {/* POLLUTANTS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "PM2.5", value: "8.4 μg/m³" },
              { label: "PM10", value: "18.2 μg/m³" },
              { label: "O3", value: "12 ppb" },
              { label: "NO2", value: "4.5 ppb" },
              { label: "SO2", value: "2.1 ppb" },
              { label: "CO", value: "0.4 ppm" },
            ].map((item) => (
              <div key={item.label} style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "14px 16px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#16a34a" }}>{item.value}</div>
                <div style={{ height: "4px", backgroundColor: "#dcfce7", borderRadius: "2px", marginTop: "8px" }}>
                  <div style={{ height: "100%", width: "30%", backgroundColor: "#16a34a", borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI FORECAST */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 4px" }}>Dự báo AI & Lịch sử 7 ngày</h2>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Phân tích xu hướng không khí dựa trên dữ liệu khí tượng AI</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ border: "1px solid #d1d5db", backgroundColor: "#fff", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                ⬇ Xuất dữ liệu (CSV)
              </button>
              <button style={{ border: "none", backgroundColor: "#fef3c7", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontWeight: "600", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
                ⭐ Xuất PDF PRO
              </button>
            </div>
          </div>

          {/* Chart area */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", alignItems: "flex-end", height: "160px", position: "relative" }}>
            {[
              { day: "Thứ 2", val: 42, active: true },
              { day: "Thứ 3", val: 38, active: true },
              { day: "Thứ 4", val: null },
              { day: "Thứ 5", val: null },
              { day: "Thứ 6", val: null },
              { day: "Thứ 7", val: null },
              { day: "CN", val: null },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                {item.active ? (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "4px", color: "#16a34a" }}>{item.val}</div>
                    <div style={{ width: "44px", height: `${(item.val / 60) * 120}px`, backgroundColor: item.val === 42 ? "#16a34a" : "#86efac", borderRadius: "22px 22px 8px 8px" }} />
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>{item.day}</div>
                  </>
                ) : (
                  <>
                    <div style={{ width: "44px", flex: 1, backgroundColor: "#f3f4f6", borderRadius: "22px 22px 8px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "18px" }}>🔒</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>{item.day}</div>
                  </>
                )}
              </div>
            ))}

            {/* Upgrade overlay */}
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "68%", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{ fontSize: "28px" }}>🔒</div>
              <div style={{ fontSize: "14px", fontWeight: "600", textAlign: "center" }}>Tính năng giới hạn</div>
              <div style={{ fontSize: "13px", color: "#6b7280", textAlign: "center", maxWidth: "220px" }}>Nâng cấp tài khoản để xem chi tiết dự báo AI trong 7 ngày tới.</div>
              <button style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginTop: "4px" }}>
                Nâng cấp Pro để xem dự báo AI 7 ngày
              </button>
            </div>
          </div>
        </div>

        {/* HEALTH + MAP */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

          {/* HEALTH RECOMMENDATIONS */}
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>Khuyến nghị sức khỏe</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              {[
                { icon: "😷", label: "Không cần khẩu trang", color: "#16a34a" },
                { icon: "🪟", label: "Nên mở cửa đón gió", color: "#374151" },
                { icon: "🏃", label: "Tập thể dục lý tưởng", color: "#374151" },
                { icon: "🌬", label: "Máy lọc chưa cần thiết", color: "#9ca3af", faded: true },
              ].map((item) => (
                <div key={item.label} style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: item.faded ? 0.5 : 1 }}>
                  <span style={{ fontSize: "24px" }}>{item.icon}</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: item.color, textAlign: "center" }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Asthma advice */}
            <div style={{ backgroundColor: "#eff6ff", borderRadius: "12px", padding: "16px", border: "1px solid #dbeafe" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>📋</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Lời khuyên cho người bị Hen suyễn:</div>
                  <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>Không khí đang rất lý tưởng, bạn có thể yên tâm tập thể dục ngoài trời mà không lo kích ứng đường hô hấp.</div>
                </div>
              </div>
            </div>
          </div>

          {/* MAP */}
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "16px" }}>Bản đồ & Xếp hạng</h2>
            <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
              {/* Map placeholder */}
              <div style={{ position: "relative", backgroundColor: "#2d5a27", height: "200px", overflow: "hidden" }}>
                <svg viewBox="0 0 400 200" style={{ width: "100%", height: "100%", opacity: 0.7 }}>
                  {/* Simple city grid map */}
                  <rect width="400" height="200" fill="#1e4620" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#2d6a30" strokeWidth="12" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#2d6a30" strokeWidth="8" />
                  <line x1="0" y1="130" x2="400" y2="140" stroke="#2d6a30" strokeWidth="6" />
                  <line x1="0" y1="160" x2="400" y2="155" stroke="#2d6a30" strokeWidth="5" />
                  <line x1="60" y1="0" x2="60" y2="200" stroke="#2d6a30" strokeWidth="6" />
                  <line x1="120" y1="0" x2="120" y2="200" stroke="#2d6a30" strokeWidth="4" />
                  <line x1="180" y1="0" x2="180" y2="200" stroke="#2d6a30" strokeWidth="6" />
                  <line x1="240" y1="0" x2="240" y2="200" stroke="#2d6a30" strokeWidth="4" />
                  <line x1="300" y1="0" x2="300" y2="200" stroke="#2d6a30" strokeWidth="8" />
                  <line x1="350" y1="0" x2="350" y2="200" stroke="#2d6a30" strokeWidth="4" />
                  <rect x="65" y="65" width="50" height="30" fill="#3a7a3e" rx="2" />
                  <rect x="125" y="40" width="50" height="55" fill="#3a7a3e" rx="2" />
                  <rect x="185" y="65" width="50" height="30" fill="#3a7a3e" rx="2" />
                  <rect x="65" y="105" width="50" height="20" fill="#3a7a3e" rx="2" />
                  <rect x="185" y="105" width="50" height="20" fill="#3a7a3e" rx="2" />
                </svg>
                {/* Pin */}
                <div style={{ position: "absolute", top: "50%", left: "55%", transform: "translate(-50%, -50%)" }}>
                  <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "700", color: "#16a34a", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", border: "2px solid #16a34a" }}>
                    📍 41 LÊ DUẨN
                  </div>
                </div>
              </div>

              {/* Ranking bar */}
              <div style={{ backgroundColor: "#16a34a", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "16px" }}>5</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: "11px", opacity: 0.8, marginBottom: "2px" }}>XẾP HẠNG ĐÔ SẠCH</div>
                    <div style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}>Hạng 5/63 tỉnh thành hôm nay</div>
                  </div>
                </div>
                <span style={{ color: "#fff", fontSize: "20px" }}>↗</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#1a2e1a", color: "#d1fae5", padding: "48px 32px 24px", marginTop: "20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ color: "#4ade80", fontWeight: "700", fontSize: "18px" }}>🌿 EcoAir VN</span>
              </div>
              <p style={{ fontSize: "13px", color: "#86efac", lineHeight: "1.6", margin: 0 }}>
                Ứng dụng tiên phong sử dụng AI để giám sát và dự báo chất lượng không khí, bảo vệ sức khỏe cộng đồng Việt Nam.
              </p>
            </div>

            {/* Solutions */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#fff", marginBottom: "14px" }}>Giải pháp</h4>
              {["Dự báo AI", "Bản đồ nhiệt real-time", "Lộ trình sạch (Eco-routing)", "Thiết bị cảm biến"].map((item) => (
                <div key={item} style={{ marginBottom: "8px" }}>
                  <a href="#" style={{ fontSize: "13px", color: "#86efac", textDecoration: "none" }}>{item}</a>
                </div>
              ))}
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#fff", marginBottom: "14px" }}>Tài nguyên</h4>
              {["Tài liệu API", "Báo cáo hàng năm", "Blog sức khỏe", "Cộng đồng"].map((item) => (
                <div key={item} style={{ marginBottom: "8px" }}>
                  <a href="#" style={{ fontSize: "13px", color: "#86efac", textDecoration: "none" }}>{item}</a>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#fff", marginBottom: "14px" }}>Liên hệ</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "13px", color: "#86efac" }}>✉ support@ecoair.vn</div>
                <div style={{ fontSize: "13px", color: "#86efac" }}>📞 1900 6789</div>
                <div style={{ fontSize: "13px", color: "#86efac" }}>📍 Khu Công nghệ cao, TP. Thủ Đức, TP. HCM</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #2d5a27", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>© 2024 EcoAir VN – Người bảo hộ thanh khiết.</div>
            <div style={{ display: "flex", gap: "24px" }}>
              {["Về chúng tôi", "Điều khoản", "Bảo mật", "Liên hệ"].map((item) => (
                <a key={item} href="#" style={{ fontSize: "13px", color: "#6b7280", textDecoration: "none" }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* CHAT BUTTON */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px" }}>
        <button style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#16a34a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 4px 16px rgba(22,163,74,0.4)", color: "#fff" }}>
          💬
        </button>
      </div>
    </div>
  );
};

export default EcoAirVN;
