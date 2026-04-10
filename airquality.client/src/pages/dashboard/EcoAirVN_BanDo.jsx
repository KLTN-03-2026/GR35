import { useState } from "react";

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

const stations = [
  { id: 1, lat: 16.054407, lng: 108.202164, aqi: 112, pm25: 38.4, label: "Trạm ĐH Duy Tân, Đà Nẵng", updated: "5 PHÚT TRƯỚC", color: "#f97316" },
  { id: 2, lat: 15.98, lng: 108.15, aqi: 45, pm25: 12.1, label: "Trạm Hội An", updated: "3 PHÚT TRƯỚC", color: "#22c55e" },
  { id: 3, lat: 15.87, lng: 108.32, aqi: 82, pm25: 24.5, label: "Trạm Tam Kỳ", updated: "8 PHÚT TRƯỚC", color: "#eab308" },
  { id: 4, lat: 15.76, lng: 108.22, aqi: 155, pm25: 55.2, label: "Trạm Núi Thành", updated: "2 PHÚT TRƯỚC", color: "#ef4444" },
];

function getAqiColor(aqi) {
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#7c3aed";
  return "#7f1d1d";
}

function getAqiLabel(aqi) {
  if (aqi <= 50) return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém";
  if (aqi <= 200) return "Xấu";
  return "Nguy hại";
}

export default function EcoAirVN() {
  const [activeMetric, setActiveMetric] = useState("AQI (Tổng hVp)");
  const [heatmap, setHeatmap] = useState(false);
  const [filters, setFilters] = useState({ good: true, medium: true, poor: true, bad: true });
  const [selectedStation, setSelectedStation] = useState(stations[0]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const metrics = ["AQI (Tổng hVp)", "PM2.5", "PM10", "O3", "CO"];
  const filterLevels = [
    { key: "good", label: "Tốt (0-50)", color: "#22c55e" },
    { key: "medium", label: "Trung bình (51-100)", color: "#eab308" },
    { key: "poor", label: "Kém (101-150)", color: "#f97316" },
    { key: "bad", label: "Xấu (151-200)", color: "#ef4444" },
  ];

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=16.054407,108.202164&zoom=10&maptype=roadmap`;

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#fff" }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── NAVBAR ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 60, background: "#fff",
        borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18, color: "#166534" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#16a34a" opacity="0.12" />
            <path d="M8 18c2-4 6-8 12-8" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="3" fill="#16a34a" />
          </svg>
          EcoAir VN
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Tính năng", "Dữ liệu chất lượng không khí", "Bản đồ", "Liên hệ"].map((item) => (
            <a key={item} href="#" style={{
              textDecoration: "none", fontSize: 14, fontWeight: 500,
              color: item === "Bản đồ" ? "#16a34a" : "#374151",
              borderBottom: item === "Bản đồ" ? "2px solid #16a34a" : "none",
              paddingBottom: 2,
            }}>{item}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "#374151" }}>Đăng nhập</a>
          <button style={{
            background: "#16a34a", color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Đăng ký</button>
        </div>
      </nav>

      {/* ── MAP SECTION ── */}
      <div style={{ display: "flex", position: "relative", height: "calc(100vh - 60px)", overflow: "hidden" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 260, background: "#fff", borderRight: "1px solid #e5e7eb",
          padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20,
          zIndex: 10, overflowY: "auto", flexShrink: 0,
        }}>
          {/* Title */}
          <div style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>Khám phá Trạm</div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input placeholder="Tìm kiếm trạm đo..." style={{
              width: "100%", padding: "9px 12px 9px 34px", border: "1px solid #d1fae5",
              borderRadius: 8, fontSize: 13, outline: "none", background: "#f9fafb",
              boxSizing: "border-box", color: "#374151",
            }} />
          </div>

          {/* Metrics */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 8 }}>THÔNG SỐ HIỂN THỊ</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {metrics.map((m) => (
                <button key={m} onClick={() => setActiveMetric(m)} style={{
                  padding: "5px 12px", borderRadius: 20, border: "1px solid",
                  fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                  background: activeMetric === m ? "#16a34a" : "#fff",
                  color: activeMetric === m ? "#fff" : "#374151",
                  borderColor: activeMetric === m ? "#16a34a" : "#d1d5db",
                }}>{m}</button>
              ))}
            </div>
          </div>

          {/* Heatmap toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Bản đồ nhiệt</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Mô phỏng mật độ ô nhiễm</div>
            </div>
            <div onClick={() => setHeatmap(!heatmap)} style={{
              width: 44, height: 24, borderRadius: 12, background: heatmap ? "#16a34a" : "#d1d5db",
              cursor: "pointer", position: "relative", transition: "background 0.2s",
            }}>
              <div style={{
                position: "absolute", top: 3, left: heatmap ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </div>
          </div>

          {/* AQI Filters */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 10 }}>BỘ LỌC CẤP ĐỘ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filterLevels.map((f) => (
                <div key={f.key} onClick={() => toggleFilter(f.key)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: filters[f.key] ? "#16a34a" : "#e5e7eb",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s",
                    }}>
                      {filters[f.key] && (
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: "#374151" }}>{f.label}</span>
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.color }} />
                </div>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Add station */}
          <button style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            border: "1.5px dashed #86efac", borderRadius: 10, padding: "12px",
            background: "#f0fdf4", color: "#16a34a", fontSize: 13, fontWeight: 600,
            cursor: "pointer", width: "100%",
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
            </svg>
            Thêm trạm đo mới
          </button>
        </div>

        {/* ── MAP AREA ── */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* Google Map iframe */}
          <iframe
            title="EcoAir Map"
            src={mapSrc}
            style={{ width: "100%", height: "100%", border: "none" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setMapLoaded(true)}
          />

          {/* Station popup */}
          {selectedStation && (
            <div style={{
              position: "absolute", top: 40, left: "50%", transform: "translateX(-20%)",
              background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              padding: "16px 20px", minWidth: 240, zIndex: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                {selectedStation.label}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, letterSpacing: "0.05em" }}>
                CẬP NHẬT: {selectedStation.updated}
              </div>
              <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>CHỈ SỐ AQI</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: getAqiColor(selectedStation.aqi) }}>
                    {selectedStation.aqi}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>PM2.5</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>
                    {selectedStation.pm25}
                  </div>
                </div>
              </div>
              <button style={{
                width: "100%", background: "#16a34a", color: "#fff", border: "none",
                borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>Xem chi tiết trạm →</button>
            </div>
          )}

          {/* Station markers overlay — visual only */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 15 }}>
            {/* We place approximate visual markers since iframe can't have overlays */}
            {/* These are positioned roughly to match the screenshot */}
            <div style={{ position: "absolute", top: "12%", left: "52%", pointerEvents: "auto" }}
              onClick={() => setSelectedStation(stations[0])}>
              <StationMarker aqi={stations[0].aqi} />
            </div>
            <div style={{ position: "absolute", top: "32%", left: "28%", pointerEvents: "auto" }}
              onClick={() => setSelectedStation(stations[1])}>
              <StationMarker aqi={stations[1].aqi} />
            </div>
            <div style={{ position: "absolute", top: "55%", left: "42%", pointerEvents: "auto" }}
              onClick={() => setSelectedStation(stations[2])}>
              <StationMarker aqi={stations[2].aqi} />
            </div>
            <div style={{ position: "absolute", top: "72%", left: "30%", pointerEvents: "auto" }}
              onClick={() => setSelectedStation(stations[3])}>
              <StationMarker aqi={stations[3].aqi} />
            </div>
          </div>

          {/* Zoom controls */}
          <div style={{
            position: "absolute", right: 16, bottom: 160, display: "flex", flexDirection: "column",
            gap: 4, zIndex: 20,
          }}>
            {["+", "−", "⊙"].map((icon, i) => (
              <button key={i} style={{
                width: 36, height: 36, background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 8, fontSize: i === 2 ? 16 : 20, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)", color: "#374151",
              }}>{icon}</button>
            ))}
          </div>

          {/* AQI Scale bar */}
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "12px 24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 20, minWidth: 380,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              {[["Tốt", "#22c55e"], ["TB", "#eab308"], ["Kém", "#f97316"], ["Xấu", "#ef4444"], ["Rất Xấu", "#dc2626"], ["Nguy hại", "#7c3aed"]].map(([label, color]) => (
                <span key={label} style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
              ))}
            </div>
            <div style={{
              height: 10, borderRadius: 5,
              background: "linear-gradient(to right, #22c55e, #86efac, #eab308, #f97316, #ef4444, #dc2626, #7c3aed)",
              position: "relative",
            }}>
              {/* Indicator */}
              <div style={{
                position: "absolute", left: "26%", top: -3, width: 16, height: 16,
                borderRadius: "50%", background: "#eab308", border: "2px solid #fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transform: "translateX(-50%)",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {["0", "50", "100", "150", "200", "300+"].map((v) => (
                <span key={v} style={{ fontSize: 10, color: "#9ca3af" }}>{v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#111827", color: "#fff", padding: "48px 80px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18, marginBottom: 14 }}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="14" fill="#16a34a" opacity="0.2" />
                <path d="M8 18c2-4 6-8 12-8" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="14" cy="14" r="3" fill="#4ade80" />
              </svg>
              <span style={{ color: "#4ade80" }}>EcoAir VN</span>
            </div>
            <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, maxWidth: 220 }}>
              Ứng dụng tiên phong sử dụng AI để giảm sát và dự báo chất lượng không khí, bảo vệ sức khỏe cộng đồng Việt Nam.
            </p>
          </div>

          {/* Giải pháp */}
          <FooterColumn title="Giải pháp" links={["Dự báo AI", "Bản đồ nhiệt real-time", "Lộ trình sạch (Eco-routing)", "Thiết bị cảm biến"]} />
          <FooterColumn title="Tài nguyên" links={["Tài liệu API", "Báo cáo hàng năm", "Blog sức khỏe", "Cộng đồng"]} />

          {/* Liên hệ */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>Liên hệ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "✉", text: "support@ecoair.vn" },
                { icon: "📞", text: "1900 6789" },
                { icon: "📍", text: "Khu Công nghS cao, TP. Thủ Đức, TP. HCM" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", gap: 8, fontSize: 13, color: "#9ca3af", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #374151", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>© 2024 EcoAir VN – Người bảo hộ thanh khiQ.</span>
          <div style={{ display: "flex", gap: 24 }}>
            {["VR chúng tôi", "à iRu khoản", "Bảo mật", "Liên hS"].map((item) => (
              <a key={item} href="#" style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}>{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function StationMarker({ aqi }) {
  const color = getAqiColor(aqi);
  return (
    <div style={{
      width: 46, height: 46, borderRadius: "50%",
      background: color, border: "3px solid rgba(255,255,255,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: 13, color: "#fff",
      boxShadow: `0 0 0 4px ${color}55, 0 4px 12px rgba(0,0,0,0.25)`,
      cursor: "pointer", transition: "transform 0.15s",
    }}
      onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.12)"}
      onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      {aqi}
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((link) => (
          <a key={link} href="#" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>{link}</a>
        ))}
      </div>
    </div>
  );
}
