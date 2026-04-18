import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const D = {
    bg: "#0f1923",
    sidebar: "#0b1219",
    card: "#14202e",
    cardBorder: "#1e3048",
    headerBg: "#111c28",
    text: "#e8edf3",
    textMuted: "#7a8da0",
    textDim: "#4a5d70",
    green: "#22c55e",
    greenDark: "#15803d",
    greenBg: "rgba(34,197,94,0.12)",
    blue: "#3b82f6",
    blueBg: "rgba(59,130,246,0.12)",
    orange: "#f97316",
    orangeBg: "rgba(249,115,22,0.12)",
    red: "#ef4444",
    redBg: "rgba(239,68,68,0.12)",
    yellow: "#eab308",
    purple: "#a855f7",
    sidebarW: 240,
    font: "'Be Vietnam Pro','Segoe UI',sans-serif",
};

function Icon({ d, size = 18, stroke = D.textMuted, fill = "none", sw = 1.8 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
        </svg>
    );
}

function AdminNavItem({ icon, label, active, badge, onClick }) {
    const [hovered, setHovered] = useState(false);
    const hl = active || hovered;
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                background: active ? "rgba(34,197,94,0.15)" : hovered ? "rgba(255,255,255,0.04)" : "transparent",
                color: hl ? D.green : D.textMuted,
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                transition: "background 0.15s",
                marginBottom: 2, position: "relative",
            }}
        >
            <span style={{ display: "flex", color: hl ? D.green : D.textDim }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge && (
                <span style={{
                    background: D.red, color: "white", fontSize: 10, fontWeight: 700,
                    borderRadius: 99, padding: "1px 7px", minWidth: 18, textAlign: "center",
                }}>{badge}</span>
            )}
        </div>
    );
}

function AdminSidebar({ onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        {
            path: "/admin", label: "Tổng quan hệ thống",
            icon: <Icon d={["M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"]} />,
            exact: true
        },
        {
            path: "/admin/data", label: "Giám sát Dữ liệu AQI",
            icon: <Icon d={["M4 6h16", "M4 10h16", "M4 14h16", "M4 18h16"]} />,
        },
        {
            path: "/admin/station-monitor", label: "Hạ tầng mạng lưới (Trạm)",
            icon: <Icon d={["M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", "M15 11a3 3 0 11-6 0 3 3 0 016 0z"]} />,
        },
        {
            path: "/admin/ai-config", label: "Phân tích & Cấu hình AI",
            icon: <Icon d={["M9.75 17L9 20l-1 1h8l-1-1-.75-3", "M3 13h18", "M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"]} />,
        },
        {
            path: "/admin/reports", label: "Duyệt báo cáo Cộng đồng",
            icon: <Icon d={["M9 12l2 2 4-4", "M14.618 7.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-.382-3.016z"]} />,
            badge: "12",
        },
        {
            path: "/admin/user-management", label: "Quản lý User & API Key",
            icon: <Icon d={["M15 7a2 2 0 012 2", "M19 7a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"]} />,
        },
        {
            path: "/admin/logs", label: "Hệ thống & Logs",
            icon: <Icon d={["M8 9l3 3-3 3", "M13 12h3", "M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"]} />,
        },
    ];

    const isActive = (itemPath, exact) => {
        if (exact) return location.pathname === itemPath || location.pathname === itemPath + "/";
        return location.pathname.startsWith(itemPath);
    };

    return (
        <aside style={{
            width: D.sidebarW, minWidth: D.sidebarW, height: "100vh", position: "fixed",
            top: 0, left: 0, background: D.sidebar, borderRight: `1px solid ${D.cardBorder}`,
            display: "flex", flexDirection: "column", zIndex: 50, fontFamily: D.font,
        }}>
            <div style={{ padding: "20px 20px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/admin")}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "linear-gradient(135deg,#0d6e4e,#22c55e)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: D.text }}>EcoAir VN</div>
                        <div style={{ fontSize: 9, color: D.textDim, letterSpacing: 1.5, fontWeight: 600 }}>ADMINISTRATOR</div>
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
                {navItems.map((item) => (
                    <AdminNavItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        badge={item.badge}
                        active={isActive(item.path, item.exact)}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </nav>

            <div style={{ padding: "12px 12px", borderTop: `1px solid ${D.cardBorder}` }}>
                <AdminNavItem
                    icon={<Icon d={["M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"]} />}
                    label="Cài đặt"
                    active={false}
                    onClick={() => { }}
                />
                <div
                    onClick={onLogout}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 16px", borderRadius: 8, cursor: "pointer",
                        color: D.red, fontSize: 13.5, fontWeight: 500, marginTop: 2,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                    <Icon d={["M17 16l4-4", "M21 12l-4-4", "M21 12H7", "M13 18v1a3 3 0 01-3 3H6a3 3 0 01-3-3V5a3 3 0 013-3h4a3 3 0 013 3v1"]} stroke={D.red} />
                    Đăng xuất
                </div>
            </div>
        </aside>
    );
}

function AdminHeader({ userName }) {
    return (
        <header style={{
            position: "fixed", top: 0, left: D.sidebarW, right: 0, height: 64,
            background: D.headerBg, borderBottom: `1px solid ${D.cardBorder}`,
            display: "flex", alignItems: "center", padding: "0 28px",
            zIndex: 40, fontFamily: D.font, gap: 16,
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: D.text }}>
                    Quản trị viên Hệ thống
                </div>
            </div>

            <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 14px", background: D.card, border: `1px solid ${D.cardBorder}`,
                borderRadius: 8,
            }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: D.green, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: D.textMuted }}>Sync status: <strong style={{ color: D.green }}>OK</strong></span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{userName || "Admin_EcoAir"}</div>
                    <div style={{ fontSize: 10, color: D.textMuted }}>System Root</div>
                </div>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "white",
                }}>
                    {(userName || "A").charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout() {
    const { userName, logout } = useAuth() || {}; // Ensure fallback if context is loosely bound

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: D.bg, fontFamily: D.font, color: D.text }}>
            <AdminSidebar onLogout={logout} />

            <div style={{ marginLeft: D.sidebarW, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflowX: "hidden" }}>
                <AdminHeader userName={userName} />

                <main style={{ marginTop: 64, flex: 1, padding: "28px" }}>
                    <Outlet />
                </main>

                <footer style={{
                    borderTop: `1px solid ${D.cardBorder}`, padding: "16px 28px",
                    background: D.headerBg, textAlign: "center", mt: "auto",
                }}>
                    <div style={{ fontSize: 12, color: D.textDim }}>
                        © 2024 EcoAir VN — Admin Panel v2.1 · Powered by AI Monitoring System
                    </div>
                </footer>
            </div>
        </div>
    );
}
