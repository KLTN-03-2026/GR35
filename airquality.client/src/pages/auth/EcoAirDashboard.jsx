import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
    green: "#0d6e4e",
    greenLight: "#22c55e",
    greenBg: "#f0fdf4",
    greenBorder: "#bbf7d0",
    darkGreen: "#0a4a32",
    text: "#1a2e1a",
    textMuted: "#5a6e5a",
    textLight: "#9ca3af",
    border: "#e5e7eb",
    bg: "#f3f4f6",
    white: "#ffffff",
    yellow: "#f59e0b",
    orange: "#f97316",
    red: "#ef4444",
    sidebarW: 220,
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function Icon({ d, size = 18, stroke = C.textMuted, fill = "none", strokeWidth = 1.8 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
        </svg>
    );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }) {
    const [hovered, setHovered] = useState(false);
    const highlighted = active || hovered;
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                background: active ? "#d1fae5" : hovered ? "#f0fdf4" : "transparent",
                color: highlighted ? C.green : C.textMuted,
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                transition: "background 0.15s",
                marginBottom: 2,
            }}
        >
            <span style={{ color: highlighted ? C.green : C.textLight, display: "flex" }}>{icon}</span>
            {label}
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, onLogout, userName }) {
    const navigate = useNavigate();

    const navItems = [
        {
            id: "overview", label: "Tổng quan",
            icon: <Icon d={["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"]} />,
        },
        {
            id: "map", label: "Bản đồ & Tim đường",
            icon: <Icon d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
        },
        {
            id: "history", label: "Lịch sử & Xuất dữ liệu",
            icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        },
        {
            id: "alert", label: "Cấu hình Cảnh báo",
            icon: <Icon d={["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 01-3.46 0"]} />,
        },
        {
            id: "report", label: "Báo cáo điểm nóng",
            icon: <Icon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
        },
        {
            id: "developer", label: "Dành cho Lập trình viên",
            icon: <Icon d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
        },
        {
            id: "profile", label: "Hồ sơ & Sức khoẻ",
            icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        },
    ];

    return (
        <aside style={{
            width: C.sidebarW, minWidth: C.sidebarW, height: "100vh", position: "fixed",
            top: 0, left: 0, background: C.white, borderRight: `1px solid ${C.border}`,
            display: "flex", flexDirection: "column", zIndex: 50,
            fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
        }}>
            {/* Logo */}
            <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "linear-gradient(135deg,#0d6e4e,#22c55e)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>EcoAir VN</div>
                        <div style={{ fontSize: 10, color: C.textLight, marginTop: -1 }}>NGƯỜI BẢO HỘ THANH KHIẾT</div>
                    </div>
                </div>
            </div>

            {/* User info */}
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg,#f59e0b,#f97316)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, fontWeight: 700, color: "white",
                    }}>
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{userName}</div>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            background: C.yellow, borderRadius: 4, padding: "1px 7px",
                            fontSize: 10, fontWeight: 700, color: "white", marginTop: 2,
                        }}>⭐ PRO</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
                {navItems.map((item) => (
                    <NavItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                    />
                ))}
            </nav>

            {/* Bottom */}
            <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.border}` }}>
                <NavItem
                    icon={<Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                    label="Cài đặt"
                    active={activeTab === "settings"}
                    onClick={() => setActiveTab("settings")}
                />
                <div
                    onClick={onLogout}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                        color: "#ef4444", fontSize: 13.5, fontWeight: 500,
                        marginTop: 2,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                    <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="#ef4444" />
                    Đăng xuất
                </div>
            </div>
        </aside>
    );
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────
function DashboardHeader({ userName }) {
    const greetings = ["Chào mừng trở lại,", "Xin chào,"];
    return (
        <header style={{
            position: "fixed", top: 0, left: C.sidebarW, right: 0, height: 60,
            background: "rgba(255,255,255,0.97)", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", padding: "0 28px",
            zIndex: 40, backdropFilter: "blur(8px)",
            fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
            gap: 16,
        }}>
            {/* Greeting */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>
                    {greetings[0]} <span style={{ color: C.green }}>{userName}!</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                    Hôm nay không khí khu vực của bạn rất trong lành.
                </div>
            </div>

            {/* Search */}
            <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#f9fafb", border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "7px 14px", minWidth: 220,
            }}>
                <Icon d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" size={15} />
                <input
                    placeholder="Tìm trạm, khu vực..."
                    style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: C.text, width: "100%" }}
                />
            </div>

            {/* Upgrade button */}
            <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px", background: C.yellow,
                color: "white", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
            }}>
                ✦ Nâng cấp Pro
            </button>

            {/* Bell */}
            <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#f9fafb", border: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
            }}>
                <Icon d={["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 01-3.46 0"]} size={16} />
            </div>
        </header>
    );
}

// ─── Dashboard Footer ─────────────────────────────────────────────────────────
function DashboardFooter() {
    const links = ["Về chúng tôi", "Điều khoản", "Quyền riêng tư", "Liên hệ"];
    return (
        <footer style={{
            borderTop: `1px solid ${C.border}`, padding: "20px 28px", background: C.white,
            fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif", textAlign: "center",
        }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 8 }}>
                {links.map((l) => (
                    <a key={l} href="#" style={{ fontSize: 12.5, color: C.textMuted, textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = C.green)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
                        {l}
                    </a>
                ))}
            </div>
            <div style={{ fontSize: 12, color: C.textLight }}>
                © 2024 EcoAir VN. Bảo vệ lá phổi của bạn.
            </div>
        </footer>
    );
}

// ─── AQI Badge ────────────────────────────────────────────────────────────────
function AqiBadge({ value, label, color }) {
    return (
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
        </div>
    );
}

// ─── Favorite Stations Card ───────────────────────────────────────────────────
function FavoriteStation({ name, district, aqi, aqiColor, aqiLabel, pm25, temp, warning, warningType }) {
    return (
        <div style={{
            flex: 1, background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "18px 20px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{district}</div>
                </div>
                <span style={{ color: C.yellow, fontSize: 18 }}>★</span>
            </div>
            <AqiBadge value={aqi} label={aqiLabel} color={aqiColor} />
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.greenLight, display: "inline-block" }} />
                    PM2.5: {pm25}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
                    Nhiệt độ: {temp}
                </div>
            </div>
            {warning && (
                <div style={{
                    marginTop: 12, padding: "8px 10px", borderRadius: 8,
                    background: warningType === "good" ? "#f0fdf4" : "#fffbeb",
                    border: `1px solid ${warningType === "good" ? "#bbf7d0" : "#fde68a"}`,
                    fontSize: 11.5, color: warningType === "good" ? "#15803d" : "#92400e",
                    lineHeight: 1.5,
                    display: "flex", alignItems: "flex-start", gap: 6,
                }}>
                    <span>{warningType === "good" ? "✓" : "⚠"}</span>
                    {warning}
                </div>
            )}
        </div>
    );
}

// ─── Simple Line Chart (SVG) ──────────────────────────────────────────────────
function SimpleLineChart() {
    const pm25 = [30, 60, 45, 80, 95, 75, 110, 90, 60, 40, 55, 70, 85, 95, 100, 110, 90, 80, 60, 50];
    const pm10 = [20, 40, 30, 55, 70, 55, 80, 65, 45, 30, 40, 50, 60, 70, 75, 80, 65, 55, 40, 35];
    const o3 = [15, 20, 18, 25, 30, 22, 28, 25, 20, 18, 22, 26, 30, 28, 25, 22, 20, 18, 15, 12];

    const W = 580, H = 150;
    const maxV = 150;
    const pts = (data) =>
        data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / maxV) * H}`).join(" ");

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
            <polyline points={pts(pm25)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
            <polyline points={pts(pm10)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
            <polyline points={pts(o3)} fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Row 1: Trạm yêu thích + Báo cáo cộng đồng */}
            <div style={{ display: "flex", gap: 16 }}>
                {/* Trạm yêu thích */}
                <div style={{ flex: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>Trạm Yêu Thích</h3>
                        <a href="#" style={{ fontSize: 13, color: C.green, textDecoration: "none", fontWeight: 500 }}>Xem tất cả</a>
                    </div>
                    <div style={{ display: "flex", gap: 14 }}>
                        <FavoriteStation
                            name="Vinhomes Central Park" district="Quận Bình Thạnh, TP.HCM"
                            aqi="18" aqiLabel="AQI TÔT" aqiColor={C.green}
                            pm25="4.2 μg/m³" temp="28°C"
                            warning="Không khí rất tốt, an toàn tuyệt đối cho người bị hen suyễn và bệnh hô hấp."
                            warningType="good"
                        />
                        <FavoriteStation
                            name="Hồ Gươm Plaza" district="Quận Hà Đông, Hà Nội"
                            aqi="62" aqiLabel="AQI TB" aqiColor={C.orange}
                            pm25="18.5 μg/m³" temp="24°C"
                            warning="Người có bệnh hô hấp nhạy cảm nên hạn chế vận động mạnh ngoài trời lâu."
                            warningType="warn"
                        />
                    </div>
                </div>

                {/* Báo cáo cộng đồng */}
                <div style={{
                    flex: 1, borderRadius: 16, overflow: "hidden",
                    background: "linear-gradient(145deg, #0a2e1e 0%, #0d4a2e 45%, #0f6e45 100%)",
                    padding: "22px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between",
                    minHeight: 200,
                }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 10 }}>Báo cáo cộng đồng</div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
                            Phát hiện nguồn ô nhiễm? Chụp và gửi báo cáo ngay để bảo vệ mọi người xung quanh.
                        </p>
                    </div>
                    <button style={{
                        marginTop: 18, display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                        padding: "10px 0", background: "rgba(255,255,255,0.9)", color: C.text,
                        border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%",
                    }}>
                        <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke={C.text} size={15} />
                        Tải lên ảnh ô nhiễm
                    </button>
                </div>
            </div>

            {/* Row 2: Dự báo 7 ngày AI + Eco-Routing */}
            <div style={{ display: "flex", gap: 16 }}>
                {/* Dự báo 7 ngày */}
                <div style={{
                    flex: 2, background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: "20px 22px",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Dự báo 7 ngày (AI)</div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
                                Dựa trên mô hình LSTM độc quyền của EcoAir
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <span style={{
                                padding: "4px 10px", background: "#f0fdf4", color: C.green,
                                border: `1px solid ${C.greenBorder}`, borderRadius: 6, fontSize: 12, fontWeight: 500,
                            }}>Lọc PM2.5/PM10</span>
                            <span style={{
                                padding: "4px 10px", background: "#f0fdf4", color: C.green,
                                border: `1px solid ${C.greenBorder}`, borderRadius: 6, fontSize: 12, fontWeight: 500,
                            }}>⬇ PDF/CSV</span>
                        </div>
                    </div>

                    {/* PRO lock */}
                    <div style={{
                        height: 120, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)",
                        borderRadius: 10,
                    }}>
                        <button style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 22px", background: C.yellow, color: "white",
                            border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                            boxShadow: "0 3px 10px rgba(245,158,11,0.35)",
                        }}>
                            🔒 Mở khoá với gói PRO
                        </button>
                    </div>
                </div>

                {/* Eco-Routing Mini */}
                <div style={{
                    flex: 1, background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: "20px 22px",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                        <span style={{ fontSize: 18 }}>🚗</span>
                        <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Eco-Routing Mini</div>
                    </div>

                    {[
                        { dot: "#3b82f6", label: "Điểm bắt đầu A" },
                        { dot: C.green, label: "Điểm đến B" },
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
                            padding: "9px 12px", background: "#f9fafb", borderRadius: 8, border: `1px solid ${C.border}`,
                        }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.dot, display: "inline-block", flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: C.textMuted }}>{item.label}</span>
                        </div>
                    ))}

                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textMuted, marginBottom: 16, cursor: "pointer" }}>
                        <input type="checkbox" style={{ accentColor: C.green }} />
                        Áp dụng hồ sơ y tế né bụi mịn
                    </label>

                    <button style={{
                        width: "100%", padding: "11px 0",
                        background: "linear-gradient(135deg, #0d6e4e, #22c55e)",
                        color: "white", border: "none", borderRadius: 10,
                        fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                        boxShadow: "0 3px 10px rgba(13,110,78,0.3)",
                    }}>
                        Tính toán lộ trình sạch
                    </button>
                </div>
            </div>

            {/* Row 3: Chart + Stats */}
            <div style={{ display: "flex", gap: 16 }}>
                {/* Chart */}
                <div style={{
                    flex: 2, background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: "20px 22px",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Phân tích Chi tiết & Xu hướng</div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
                                Dữ liệu quan trắc thời gian thực trong 24 giờ qua
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 14 }}>
                            {[["#10b981", "PM2.5"], ["#3b82f6", "PM10"], ["#8b5cf6", "O3"]].map(([color, label]) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textMuted }}>
                                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Y-axis labels + chart */}
                    <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 10, color: C.textLight, paddingBottom: 18, minWidth: 24, textAlign: "right" }}>
                            {[150, 100, 50, 0].map((v) => <span key={v}>{v}</span>)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <SimpleLineChart />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textLight, marginTop: 4 }}>
                                {["00:00", "06:00", "12:00", "18:00", "23:59"].map((t) => <span key={t}>{t}</span>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side stats */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Chỉ số trung bình ngày */}
                    <div style={{
                        background: C.white, border: `1px solid ${C.border}`,
                        borderRadius: 14, padding: "18px 20px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <span style={{ fontSize: 14 }}>📊</span>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.text }}>Chỉ số trung bình ngày</div>
                        </div>
                        {[
                            { label: "PM2.5 trung bình", value: "12.4 μg/m³", pct: 30, color: C.green },
                            { label: "PM10 trung bình", value: "28.1 μg/m³", pct: 55, color: C.orange },
                        ].map((item) => (
                            <div key={item.label} style={{ marginBottom: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted, marginBottom: 5 }}>
                                    <span>{item.label}</span>
                                    <span style={{ fontWeight: 600, color: item.color }}>{item.value}</span>
                                </div>
                                <div style={{ height: 5, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                                    <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 99, transition: "width 1s ease" }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dự báo đỉnh điểm */}
                    <div style={{
                        background: C.white, border: `1px solid ${C.border}`,
                        borderRadius: 14, padding: "18px 20px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <span style={{ fontSize: 14 }}>⏰</span>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.text }}>Dự báo đỉnh điểm</div>
                        </div>
                        {[
                            { label: "Khung giờ cao điểm", sub: "Dự kiến PM2.5 tăng mạnh do mật độ giao thông.", pct: "17%", color: C.orange },
                            { label: "Độ tin cậy mô hình", sub: "Dữ liệu được đối soát từ 12 trạm vệ tinh.", pct: "92%", color: C.green },
                        ].map((item) => (
                            <div key={item.label} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                                <span style={{ fontSize: 18, fontWeight: 800, color: item.color, minWidth: 40, textAlign: "right" }}>{item.pct}</span>
                                <div>
                                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{item.label}</div>
                                    <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>{item.sub}</div>
                                </div>
                            </div>
                        ))}
                        <button style={{
                            width: "100%", padding: "9px 0",
                            background: C.yellow, color: "white",
                            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        }}>
                            Tạo báo cáo chi tiết
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Placeholder for other tabs ───────────────────────────────────────────────
function PlaceholderTab({ title }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: 300, gap: 16, color: C.textMuted,
        }}>
            <div style={{ fontSize: 48 }}>🚧</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{title}</div>
            <div style={{ fontSize: 14 }}>Tính năng đang được phát triển.</div>
        </div>
    );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function EcoAirDashboard() {
    const { userName, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    const tabTitles = {
        overview: "Tổng quan",
        map: "Bản đồ & Tìm đường",
        history: "Lịch sử & Xuất dữ liệu",
        alert: "Cấu hình Cảnh báo",
        report: "Báo cáo điểm nóng",
        developer: "Dành cho Lập trình viên",
        profile: "Hồ sơ & Sức khoẻ",
        settings: "Cài đặt",
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif" }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userName={userName} />

            <div style={{ marginLeft: C.sidebarW, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <DashboardHeader userName={userName} />

                <main style={{ marginTop: 60, flex: 1, padding: "28px 28px 24px", overflowY: "auto" }}>
                    {/* Breadcrumb */}
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 18 }}>
                        Dashboard &rsaquo; <span style={{ color: C.green, fontWeight: 600 }}>{tabTitles[activeTab]}</span>
                    </div>

                    {activeTab === "overview" && <OverviewTab />}
                    {activeTab !== "overview" && <PlaceholderTab title={tabTitles[activeTab]} />}
                </main>

                <DashboardFooter />
            </div>
        </div>
    );
}
