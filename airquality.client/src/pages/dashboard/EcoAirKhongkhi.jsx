import { useState } from "react";

const MapMarker = ({ value, color, top, left, size = "md" }) => {
  const sizes = { sm: 36, md: 44, lg: 52 };
  const s = sizes[size];
  const bgColors = {
    red: "#e53e3e",
    orange: "#dd6b20",
    yellow: "#d69e2e",
    green: "#38a169",
    teal: "#319795",
  };
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: s,
        height: s,
        borderRadius: "50%",
        backgroundColor: bgColors[color] || bgColors.red,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "700",
        fontSize: s === 44 ? 13 : s === 52 ? 15 : 11,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        zIndex: 10,
        cursor: "pointer",
      }}
    >
      {value}
    </div>
  );
};

export default function EcoAirVN() {
  const [activeTab, setActiveTab] = useState("AQI");

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fff", minHeight: "100vh", color: "#1a202c" }}>
      {/* NAVBAR */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, borderBottom: "1px solid #e2e8f0", background: "#fff", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: "700", fontSize: 18, color: "#276749" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#276749"/></svg>
          EcoAir VN
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 14 }}>
          <span style={{ cursor: "pointer", color: "#4a5568" }}>Trang chủ</span>
          <span style={{ cursor: "pointer", color: "#276749", fontWeight: 600, borderBottom: "2px solid #276749", paddingBottom: 2 }}>Dữ liệu chất lượng không khí</span>
          <span style={{ cursor: "pointer", color: "#4a5568" }}>Bản đồ</span>
          <span style={{ cursor: "pointer", color: "#4a5568" }}>Liên hệ</span>
          <div style={{ position: "relative", cursor: "pointer" }}>
            <span style={{ color: "#4a5568" }}>Giá gói</span>
            <span style={{ position: "absolute", top: -8, right: -10, background: "#e53e3e", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>1</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#4a5568", padding: "6px 12px" }}>Đăng nhập</button>
          <button style={{ background: "#276749", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Đăng ký</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* TOP 3 CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Card 1: Trạng thái chung VN */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-5h2v2h-2zm0-8h2v6h-2z" fill="#d97706"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>TRẠNG THÁI CHUNG VN</div>
              <div style={{ fontSize: 28, fontWeight: "800", color: "#d97706" }}>74</div>
              <div style={{ fontSize: 13, color: "#718096" }}>Trung bình</div>
            </div>
          </div>

          {/* Card 2: Phân tích chuyên sâu AI */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, background: "#e0f2fe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#0284c7" strokeWidth="2"/><path d="M12 8v4l3 3" stroke="#0284c7" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>PHÂN TÍCH CHUYÊN SÂU AI</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a202c" }}>Phát hiện 3 điểm nóng ô nhiễm mới</div>
              <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>Xu hướng miền Bắc giảm 5% trong 24h</div>
            </div>
          </div>

          {/* Card 3: Điểm nóng cộng đồng */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 52, height: 52, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#dc2626"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>ĐIỂM NÓNG CỘNG ĐỒNG</div>
                <span style={{ background: "#276749", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>★ PRO</span>
              </div>
              <div style={{ fontSize: 13, color: "#1a202c" }}>15 báo cáo: Hà Nội, Bắc Ninh, Nghệ An</div>
              <div style={{ fontSize: 12, color: "#276749", fontWeight: 500, marginTop: 2 }}>Bản đồ chi tiết dành cho tài khoản Pro</div>
            </div>
          </div>
        </div>

        {/* MAP + RANKING */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 24 }}>
          {/* MAP */}
          <div style={{ background: "#f0f4f0", borderRadius: 12, overflow: "hidden", position: "relative" }}>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: 0, padding: "10px 14px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
              {["AQI", "PM2.5", "Nhiệt độ"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "5px 16px",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeTab === tab ? "#276749" : "transparent",
                    color: activeTab === tab ? "#fff" : "#4a5568",
                    marginRight: 4,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Map image / simulated */}
            <div style={{ position: "relative", height: 420, background: "linear-gradient(135deg, #c8dfc8 0%, #b8d4c0 30%, #a8c8b0 60%, #98bca0 100%)", overflow: "hidden" }}>
              {/* Roads simulation */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }} viewBox="0 0 640 420" preserveAspectRatio="none">
                <path d="M0 200 Q160 180 320 210 Q480 240 640 220" stroke="#fff" strokeWidth="3" fill="none"/>
                <path d="M0 260 Q200 250 400 265 Q520 275 640 270" stroke="#fff" strokeWidth="2" fill="none"/>
                <path d="M250 0 Q260 100 255 200 Q250 300 260 420" stroke="#fff" strokeWidth="2" fill="none"/>
                <path d="M320 0 Q330 80 325 200 Q318 310 330 420" stroke="#fff" strokeWidth="2.5" fill="none"/>
                {/* Area labels */}
                <text x="60" y="130" fill="#555" fontSize="11" fontWeight="600">HAI YANG</text>
                <text x="30" y="180" fill="#555" fontSize="10">Nhà thờ tin lành bông hiột</text>
                <text x="130" y="310" fill="#555" fontSize="11" fontWeight="600">Mang Yang</text>
                <text x="270" y="230" fill="#555" fontSize="10">KON RUNG</text>
                <text x="360" y="340" fill="#555" fontSize="10">CHAU KHE</text>
                <text x="270" y="370" fill="#555" fontSize="10">ĐÁK YA</text>
                <text x="430" y="175" fill="#555" fontSize="10">TRAI CÁI TẠO GIA TRUNG</text>
                <text x="310" y="100" fill="#555" fontSize="10">TRAI T15</text>
                <text x="40" y="395" fill="#555" fontSize="9">Cần</text>
                <text x="30" y="415" fill="#555" fontSize="9">Nhà Nguyên Plei Trek</text>
                <text x="450" y="395" fill="#555" fontSize="9">Mý Vân</text>
                <text x="200" y="350" fill="#555" fontSize="9">ĐÁK TROI</text>
                <text x="430" y="310" fill="#555" fontSize="9">CH RONG 1</text>
                <text x="430" y="330" fill="#555" fontSize="9">CH RONG 2</text>
                <text x="540" y="350" fill="#555" fontSize="9">ĐÁK ROT K RET</text>
                <text x="130" y="380" fill="#555" fontSize="9">PLEI HEREL</text>
                <text x="50" y="360" fill="#555" fontSize="9">LINH NHÂN</text>
                <text x="290" y="148" fill="#555" fontSize="9">TRAM LÂM SINH</text>
                <text x="350" y="270" fill="#555" fontSize="9">QL519</text>
                <text x="185" y="250" fill="#555" fontSize="9">QL190</text>
                <text x="250" y="295" fill="#555" fontSize="9">QL19</text>
                {/* Shop icons */}
                <circle cx="408" cy="215" r="12" fill="#3182ce" opacity="0.85"/>
                <text x="402" y="220" fill="#fff" fontSize="11">🛒</text>
                <circle cx="290" cy="202" r="12" fill="#3182ce" opacity="0.85"/>
                <text x="284" y="207" fill="#fff" fontSize="11">🛒</text>
                <circle cx="345" cy="102" r="12" fill="#3182ce" opacity="0.85"/>
                <text x="339" y="107" fill="#fff" fontSize="11">🛒</text>
              </svg>

              {/* Markers */}
              <MapMarker value={155} color="red" top="120px" left="245px" size="lg" />
              <MapMarker value={112} color="red" top="155px" left="300px" size="md" />
              <MapMarker value={68} color="yellow" top="248px" left="310px" size="md" />
              <MapMarker value={32} color="teal" top="340px" left="390px" size="sm" />

              {/* Zoom controls */}
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <button style={{ width: 30, height: 30, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>+</button>
                <button style={{ width: 30, height: 30, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>−</button>
              </div>

              {/* Location btn */}
              <button style={{ position: "absolute", top: 12, right: 52, width: 30, height: 30, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#4a5568" strokeWidth="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#4a5568" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>

              {/* Tạp hóa Dũng Hoa label */}
              <div style={{ position: "absolute", top: 28, left: 240, fontSize: 11, color: "#2d3748", fontWeight: 500, background: "rgba(255,255,255,0.85)", padding: "2px 6px", borderRadius: 4 }}>Tạp hóa Dũng Hoa</div>
              {/* Cửa Hàng label */}
              <div style={{ position: "absolute", top: 165, left: 245, fontSize: 10, color: "#2d3748", background: "rgba(255,255,255,0.85)", padding: "2px 5px", borderRadius: 4 }}>Cửa Hàng Thanh Q...</div>
              {/* PLEI BONG */}
              <div style={{ position: "absolute", top: 82, left: 310, fontSize: 10, color: "#555" }}>PLEI BONG</div>

              {/* Legend */}
              <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
                <div style={{ color: "#718096", marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>BẢNG MỨC ĐỘ Ô NHIỄM</div>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <div style={{ width: 200, height: 10, borderRadius: 4, background: "linear-gradient(to right, #38a169, #84cc16, #ecc94b, #ed8936, #e53e3e, #9b2335, #4a1020)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: 200, fontSize: 9, color: "#718096", marginTop: 2 }}>
                  <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300</span><span>500+</span>
                </div>
                <div style={{ fontSize: 9, color: "#718096", marginTop: 4 }}>Nguồn: Real-time AQI</div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* AQI Ranking */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Xếp hạng AQI</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="10" width="4" height="12" rx="1" fill="#276749"/><rect x="9" y="6" width="4" height="16" rx="1" fill="#276749"/><rect x="16" y="2" width="4" height="20" rx="1" fill="#276749"/></svg>
              </div>

              {/* Ô nhiễm nhất */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e53e3e", display: "inline-block" }}></span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#718096", letterSpacing: "0.05em" }}>Ô NHIỄM NHẤT</span>
              </div>
              {[{ rank: "01", city: "Hà Nội", val: 155, color: "#e53e3e" }, { rank: "02", city: "Bắc Ninh", val: 142, color: "#e53e3e" }, { rank: "03", city: "Hải Dương", val: 138, color: "#dd6b20" }].map(item => (
                <div key={item.city} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#718096", width: 20 }}>{item.rank}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.city}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: item.color, fontSize: 15 }}>{item.val}</span>
                </div>
              ))}

              {/* Trong lành nhất */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#38a169", display: "inline-block" }}></span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#718096", letterSpacing: "0.05em" }}>TRONG LÀNH NHẤT</span>
              </div>
              {[{ rank: "01", city: "Đà Lạt", val: 12, color: "#38a169" }, { rank: "02", city: "Gia Nghĩa", val: 15, color: "#38a169" }, { rank: "03", city: "Phú Quốc", val: 18, color: "#38a169" }].map(item => (
                <div key={item.city} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#718096", width: 20 }}>{item.rank}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.city}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: item.color, fontSize: 15 }}>{item.val}</span>
                </div>
              ))}

              {/* View all */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f7fafc", borderRadius: 8, padding: "10px 14px", marginTop: 8, cursor: "pointer" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Xem toàn bộ 63 tỉnh thành</span>
                <span style={{ fontSize: 16, color: "#276749" }}>›</span>
              </div>
            </div>

            {/* Lời khuyên hôm nay */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#319795" strokeWidth="2"/><path d="M12 8h.01M11 12h1v4h1" stroke="#319795" strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Lời khuyên hôm nay</span>
              </div>
              <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.6, margin: 0 }}>
                Chất lượng không khí tại miền Bắc đang ở mức kém do hiện tượng nghịch nhiệt. Hãy hạn chế các hoạt động ngoài trời vào sáng sớm và đeo khẩu trang N95 khi di chuyển.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Chart + Region overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
          {/* Chart */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>XU HƯỚNG AQI QUỐC GIA (24H)</span>
              <span style={{ fontSize: 12, color: "#38a169", fontWeight: 500, background: "#f0fff4", padding: "3px 10px", borderRadius: 20 }}>Thời gian thực</span>
            </div>
            <svg viewBox="0 0 400 120" style={{ width: "100%", height: 120 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#276749" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#276749" stopOpacity="0.02"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[20, 50, 80].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e2e8f0" strokeWidth="1"/>
              ))}
              {/* Area */}
              <path d="M0 85 Q40 75 80 65 Q120 55 160 50 Q200 48 240 52 Q280 58 320 65 Q360 70 400 68 L400 120 L0 120 Z" fill="url(#chartGrad)"/>
              {/* Line */}
              <path d="M0 85 Q40 75 80 65 Q120 55 160 50 Q200 48 240 52 Q280 58 320 65 Q360 70 400 68" stroke="#276749" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Dots */}
              {[[0,85],[80,65],[160,50],[240,52],[320,65],[400,68]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="3.5" fill="#276749"/>
              ))}
              {/* X labels */}
              {[["00:00",0],["06:00",96],["12:00",192],["18:00",288],["23:59",385]].map(([label, x]) => (
                <text key={label} x={x} y="115" fill="#718096" fontSize="10" textAnchor="middle">{label}</text>
              ))}
            </svg>
          </div>

          {/* Regional overview */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, textAlign: "center" }}>TỔNG QUAN THEO VÙNG MIỀN</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "MIỀN BẮC", val: 124, status: "Kém", statusColor: "#e53e3e", bg: "#fff5f5", border: "#feb2b2" },
                { label: "MIỀN TRUNG", val: 62, status: "TB", statusColor: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                { label: "MIỀN NAM", val: 38, status: "Tốt", statusColor: "#276749", bg: "#f0fff4", border: "#9ae6b4" },
              ].map(item => (
                <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 10, padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: item.statusColor, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    {item.val > 100 ? "!" : item.val > 50 ? "~" : "✓"}
                  </div>
                  <div style={{ fontSize: 10, color: "#718096", fontWeight: 600, letterSpacing: "0.03em", marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: item.statusColor, lineHeight: 1 }}>{item.val}</div>
                  <div style={{ fontSize: 12, color: item.statusColor, fontWeight: 600, marginTop: 4 }}>{item.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#1a202c", color: "#e2e8f0", padding: "48px 40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18, color: "#68d391", marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#68d391"/></svg>
                EcoAir VN
              </div>
              <p style={{ fontSize: 13, color: "#a0aec0", lineHeight: 1.7, maxWidth: 220 }}>
                Ứng dụng tiên phong sử dụng AI để giám sát và dự báo chất lượng không khí, bảo vệ sức khỏe cộng đồng Việt Nam.
              </p>
            </div>

            {/* Giải pháp */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Giải pháp</div>
              {["Dự báo AI", "Bản đồ nhiệt real-time", "Lộ trình sạch (Eco-routing)", "Thiết bị cảm biến"].map(item => (
                <div key={item} style={{ fontSize: 13, color: "#a0aec0", marginBottom: 8, cursor: "pointer" }}>{item}</div>
              ))}
            </div>

            {/* Tài nguyên */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Tài nguyên</div>
              {["Tài liệu API", "Báo cáo hàng năm", "Blog sức khỏe", "Cộng đồng"].map(item => (
                <div key={item} style={{ fontSize: 13, color: "#a0aec0", marginBottom: 8, cursor: "pointer" }}>{item}</div>
              ))}
            </div>

            {/* Liên hệ */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Liên hệ</div>
              <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span>✉</span> support@ecoair.vn
              </div>
              <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span>📞</span> 1900 6789
              </div>
              <div style={{ fontSize: 13, color: "#a0aec0", display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span>📍</span> Khu Công nghệ cao, TP. Thủ Đức, TP. HCM
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #2d3748", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#718096" }}>© 2024 EcoAir VN – Người bảo hộ Thanh khíQ.</span>
            <div style={{ display: "flex", gap: 20 }}>
              {["VR chúng tôi", "à iRu khoản", "Bảo mật", "Liên hS"].map(link => (
                <span key={link} style={{ fontSize: 12, color: "#718096", cursor: "pointer" }}>{link}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
