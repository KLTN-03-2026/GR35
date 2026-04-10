import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGES = ["Tổng quan", "Bản đồ & Tìm đường", "Lịch sử & Xuất dữ liệu", "Cấu hình Cảnh báo", "Báo cáo điểm nóng", "API Key", "Hồ sơ & Sức khỏe"];

const PAGE_ROUTES = {
    "Tổng quan": "/dashboard",
    "Bản đồ & Tìm đường": "/dashboard/map",
    "Lịch sử & Xuất dữ liệu": "/dashboard/history",
    "Cấu hình Cảnh báo": "/dashboard/alerts",
    "Báo cáo điểm nóng": "/community",
    "API Key": "/gif",
    "Hồ sơ & Sức khỏe": "/dashboard/profile",
};

const NAV_ICONS = {
    "Tổng quan": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    "Bản đồ & Tìm đường": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>,
    "Lịch sử & Xuất dữ liệu": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    "Cấu hình Cảnh báo": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
    "Báo cáo điểm nóng": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M14.4 6.6A4 4 0 0119 11c0 .85-.26 1.64-.7 2.3" /><path d="M6.53 6.53A9.93 9.93 0 002 12s4 7 10 7a9.9 9.9 0 004.47-1.08" /><path d="M12 5c4.97 0 9 5 9 7 0 .7-.16 1.36-.44 1.96" /></svg>,
    "API Key": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>,
    "Hồ sơ & Sức khỏe": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
};

function MiniChart() {
    const w = 420, h = 140;
    const pm25 = [20, 35, 45, 30, 42, 55, 60, 58, 52, 48, 42, 55, 65, 72, 80, 88, 82, 76, 70, 65, 60, 52, 45, 38];
    const pm10 = [30, 45, 55, 40, 50, 62, 70, 68, 62, 58, 52, 65, 75, 82, 90, 96, 92, 86, 80, 75, 70, 62, 55, 48];
    const o3 = [5, 6, 5, 4, 6, 7, 6, 8, 9, 10, 8, 7, 6, 5, 4, 3, 4, 5, 6, 7, 8, 7, 6, 5];
    const maxVal = 150;
    const area = (arr, color) => {
        const p = arr.map((v, i) => `${(i / (arr.length - 1)) * w},${h - (v / maxVal) * h}`);
        return <polyline points={p.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />;
    };
    const xLabels = ["00:00", "06:00", "12:00", "18:00", "23:59"];
    const yLabels = [0, 50, 100, 150];
    return (
        <div style={{ position: "relative" }}>
            <svg width="100%" viewBox={`0 0 ${w} ${h + 30}`} style={{ overflow: "visible" }}>
                {yLabels.map(v => (
                    <g key={v}>
                        <line x1={0} y1={h - (v / maxVal) * h} x2={w} y2={h - (v / maxVal) * h} stroke="#e5e7eb" strokeWidth="0.5" />
                        <text x={-8} y={h - (v / maxVal) * h + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
                    </g>
                ))}
                {area(pm10, "#1d9e75")}
                {area(pm25, "#22c55e")}
                {area(o3, "#3b82f6")}
                {xLabels.map((l, i) => (
                    <text key={l} x={(i / (xLabels.length - 1)) * w} y={h + 18} textAnchor="middle" fontSize="10" fill="#9ca3af">{l}</text>
                ))}
                <circle cx={(8 / 23) * w} cy={h - (42 / maxVal) * h} r="5" fill="white" stroke="#1d9e75" strokeWidth="2" />
                <g transform={`translate(${(8 / 23) * w - 30}, ${h - (42 / maxVal) * h - 28})`}>
                    <rect rx="4" width="60" height="20" fill="#1a2e1a" />
                    <text x="30" y="13" textAnchor="middle" fontSize="10" fill="white" fontWeight="600">42.5 µg/m³</text>
                </g>
            </svg>
            <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 4 }}>THỜI GIAN (GIỜ)</div>
        </div>
    );
}

export default function EcoAirDashboard() {
    const [active, setActive] = useState("Tổng quan");
    const navigate = useNavigate();

    const handleNav = (page) => {
        setActive(page);
        navigate(PAGE_ROUTES[page] || "/dashboard");
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7f5", fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: 14 }}>
            {/* Sidebar */}
            <aside style={{ width: 220, minWidth: 220, background: "white", borderRight: "1px solid #e9ecef", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
                <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0d6e4e,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 005.4 21C10 17 15 15 19 14c.34-2.68-1-5-2-6z" /><path d="M12 2C6 2 2 8 2 12c0 .7.07 1.38.2 2.04C4.52 9.44 9.18 6 15 5.5A10 10 0 0012 2z" /></svg>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a2e1a", letterSpacing: "0.3px" }}>EcoAir VN</div>
                            <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.8px", fontWeight: 600 }}>NGƯỜI BẢO HỘ THANH KHIẾT</div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>MQ</div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1a2e1a" }}>Minh Quang</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <span style={{ background: "#f59e0b", color: "white", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>PRO</span>
                            <span style={{ fontSize: 11, color: "#6b7280" }}>Hội viên cao cấp</span>
                        </div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: "10px 10px" }}>
                    {PAGES.map(page => (
                        <button key={page} onClick={() => handleNav(page)} style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px",
                            borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
                            background: active === page ? "#e8f5ee" : "transparent",
                            color: active === page ? "#0d6e4e" : "#374151",
                            fontWeight: active === page ? 600 : 400,
                            fontSize: 13, marginBottom: 2, transition: "all 0.15s",
                        }}>
                            <span style={{ color: active === page ? "#0d6e4e" : "#9ca3af", flexShrink: 0 }}>{NAV_ICONS[page]}</span>
                            {page}
                        </button>
                    ))}
                </nav>

                <div style={{ padding: "12px 10px", borderTop: "1px solid #f0f0f0" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: "#374151", fontSize: 13, marginBottom: 2 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93A10 10 0 105 19" /><path d="M19.07 4.93L12 12" /></svg>
                        Cài đặt
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 500 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <header style={{ background: "white", borderBottom: "1px solid #e9ecef", padding: "14px 28px", display: "flex", alignItems: "center", gap: 20, position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 18, color: "#1a2e1a" }}>Chào mừng trở lại, Minh Quang!</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Hôm nay không khí khu vực của bạn rất trong lành.</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 14px", width: 220 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <span style={{ fontSize: 13, color: "#9ca3af" }}>Tìm trạm, khu vực...</span>
                    </div>
                    <button style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#f59e0b,#ef8c00)", color: "white", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        Nâng cấp Pro
                    </button>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                    </div>
                </header>

                <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: 16, marginBottom: 16 }}>
                        <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>Trạm Yêu Thích</div>
                            <span style={{ color: "#0d6e4e", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Xem tất cả</span>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: 16, marginBottom: 16, alignItems: "start" }}>
                        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "18px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>Vinhomes Central Park</div>
                                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Quận Bình Thạnh, TP.HCM</div>
                                </div>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontSize: 30, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>18</div>
                                    <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 600, marginTop: 2 }}>AQI TỐT</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                                        <span style={{ fontSize: 12, color: "#374151" }}>PM2.5: <b>4.2 µg/m³</b></span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                                        <span style={{ fontSize: 12, color: "#374151" }}>Nhiệt độ: <b>28°C</b></span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                <span style={{ fontSize: 11.5, color: "#15803d", lineHeight: 1.5 }}>Không khí rất tốt, an toàn tuyệt đối cho người hen suyễn và bệnh hô hấp.</span>
                            </div>
                        </div>

                        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "18px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>Hồ Gươm Plaza</div>
                                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Quận Hà Đông, Hà Nội</div>
                                </div>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontSize: 30, fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>62</div>
                                    <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600, marginTop: 2 }}>AQI TB</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                                        <span style={{ fontSize: 12, color: "#374151" }}>PM2.5: <b>18.5 µg/m³</b></span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                                        <span style={{ fontSize: 12, color: "#374151" }}>Nhiệt độ: <b>24°C</b></span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                <span style={{ fontSize: 11.5, color: "#92400e", lineHeight: 1.5 }}>Người có bệnh hô hấp nhạy cảm cần hạn chế vận động mạnh ngoài trời lâu.</span>
                            </div>
                        </div>

                        <div style={{ background: "#0d6e4e", borderRadius: 14, padding: "22px 20px", color: "white", position: "relative", overflow: "hidden", minHeight: 190 }}>
                            <div style={{ position: "absolute", right: -30, bottom: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                            <div style={{ position: "absolute", right: 10, top: 10, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, position: "relative" }}>Báo cáo cộng đồng</div>
                            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", marginBottom: 18, position: "relative" }}>Phát hiện nguồn ô nhiễm? Chụp và gửi báo cáo ngay để bảo vệ mọi người xung quanh.</div>
                            <button style={{ display: "flex", alignItems: "center", gap: 8, background: "white", color: "#0d6e4e", border: "none", borderRadius: 9, padding: "10px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", width: "100%", justifyContent: "center" }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                Tải lên ảnh ô nhiễm
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 16 }}>
                        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "18px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>Dự báo 7 ngày (AI)</div>
                                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Dựa trên mô hình LSTM độc quyền của EcoAir</div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <span style={{ background: "#e8f5ee", color: "#0d6e4e", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>Lưc PM2.5/PM10</span>
                                    <span style={{ background: "#e8f5ee", color: "#0d6e4e", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                        PDF/CSV
                                    </span>
                                </div>
                            </div>
                            <div style={{ position: "relative", marginTop: 16, minHeight: 120 }}>
                                <div style={{ filter: "blur(6px)", opacity: 0.4 }}>
                                    <svg width="100%" height="100" viewBox="0 0 400 100">
                                        <polyline points="0,80 60,60 120,70 180,40 240,50 300,30 360,45" fill="none" stroke="#22c55e" strokeWidth="2" />
                                        <polyline points="0,90 60,75 120,80 180,55 240,65 300,45 360,60" fill="none" stroke="#1d9e75" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #e9ecef", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Mở khóa với gói PRO</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
                                    <span key={d} style={{ fontSize: 11, color: "#9ca3af" }}>{d}</span>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "18px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>Eco-Routing Mini</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                                    <div style={{ flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#9ca3af" }}>Điểm bắt đầu A</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                                    <div style={{ flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#9ca3af" }}>Điểm đến B</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #d1d5db", background: "white", flexShrink: 0 }} />
                                <span style={{ fontSize: 13, color: "#374151" }}>Áp dụng hồ sơ y tế né bụi mịn</span>
                            </div>
                            <button style={{ width: "100%", background: "#0d6e4e", color: "white", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                                Tính toán lộ trình sạch
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
                        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "18px 20px" }}>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>Phân tích Chi tiết & Xu hướng</div>
                                <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 4, lineHeight: 1.5 }}>Dữ liệu quan trắc thời gian thực trong<br />24 giờ qua</div>
                            </div>
                            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                                {[{ c: "#22c55e", l: "PM2.5" }, { c: "#1d9e75", l: "PM10" }, { c: "#3b82f6", l: "O3" }].map(x => (
                                    <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: x.c }} />
                                        <span style={{ fontSize: 12, color: "#374151" }}>{x.l}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <div style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>Bpi M0k (MG/M³)</div>
                                <div style={{ flex: 1 }}><MiniChart /></div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e9ecef", padding: "16px 18px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                                    <span style={{ fontWeight: 600, fontSize: 13, color: "#1a2e1a" }}>Chỉ số trung bình ngày</span>
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>PM2.5 trung bình</span>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1a2e1a" }}>12.4 µg/m³</span>
                                    </div>
                                    <div style={{ height: 5, background: "#f0f0f0", borderRadius: 99 }}>
                                        <div style={{ height: "100%", width: "40%", background: "#22c55e", borderRadius: 99 }} />
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>PM10 trung bình</span>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1a2e1a" }}>28.1 µg/m³</span>
                                    </div>
                                    <div style={{ height: 5, background: "#f0f0f0", borderRadius: 99 }}>
                                        <div style={{ height: "100%", width: "62%", background: "#22c55e", borderRadius: 99 }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: "#fffbeb", borderRadius: 14, border: "1px solid #fde68a", padding: "16px 18px", flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span style={{ fontWeight: 600, fontSize: 13, color: "#92400e" }}>Dự báo đỉnh điểm</span>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                        <span style={{ background: "#f59e0b", color: "white", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 5, flexShrink: 0 }}>17h</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>Khung giờ cao điểm</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#b45309", lineHeight: 1.5 }}>Dự kiến PM2.5 tăng mạnh do mật độ giao thông.</div>
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                        <span style={{ background: "#0d6e4e", color: "white", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 5, flexShrink: 0 }}>92%</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>Độ tin cậy mô hình</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#b45309", lineHeight: 1.5 }}>Dữ liệu được đối soát từ 12 trạm về tính.</div>
                                </div>
                                <button style={{ width: "100%", background: "#f59e0b", color: "white", border: "none", borderRadius: 8, padding: "10px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                                    Tạo báo cáo chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <footer style={{ background: "white", borderTop: "1px solid #e9ecef", padding: "14px 28px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 6 }}>
                        {["VR chúng tôi", "Điều khoản", "Quyền riêng tư", "Liên hệ"].map(l => (
                            <span key={l} style={{ fontSize: 12, color: "#6b7280", cursor: "pointer", textDecoration: "underline" }}>{l}</span>
                        ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>© 2024 EcoAir VN. Bảo vệ là sứ mệnh của bạn.</div>
                </footer>
            </div>
        </div>
    );
}