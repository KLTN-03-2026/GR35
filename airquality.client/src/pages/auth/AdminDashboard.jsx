import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// ─── Design tokens (dark theme) ───────────────────────────────────────────────
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

// ─── SVG Icon Helper ──────────────────────────────────────────────────────────
function Icon({ d, size = 18, stroke = D.textMuted, fill = "none", sw = 1.8 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
        </svg>
    );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
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

// ─── Admin Sidebar ────────────────────────────────────────────────────────────
function AdminSidebar({ activeTab, setActiveTab, onLogout }) {
    const navItems = [
        {
            id: "overview", label: "Tổng quan hệ thống",
            icon: <Icon d={["M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"]} />,
        },
        {
            id: "stations", label: "Quản lý Trạm (OpenAQ)",
            icon: <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
        },
        {
            id: "ai", label: "Giám sát Mô hình AI",
            icon: <Icon d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
        },
        {
            id: "reports", label: "Duyệt báo cáo Cộng đồng",
            icon: <Icon d={["M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"]} />,
            badge: "12",
        },
        {
            id: "users", label: "Quản lý User & API Key",
            icon: <Icon d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
        },
        {
            id: "logs", label: "Hệ thống & Logs",
            icon: <Icon d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
        },
    ];

    return (
        <aside style={{
            width: D.sidebarW, minWidth: D.sidebarW, height: "100vh", position: "fixed",
            top: 0, left: 0, background: D.sidebar, borderRight: `1px solid ${D.cardBorder}`,
            display: "flex", flexDirection: "column", zIndex: 50, fontFamily: D.font,
        }}>
            {/* Logo */}
            <div style={{ padding: "20px 20px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

            {/* Nav */}
            <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
                {navItems.map((item) => (
                    <AdminNavItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        badge={item.badge}
                        active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                    />
                ))}
            </nav>

            {/* Bottom */}
            <div style={{ padding: "12px 12px", borderTop: `1px solid ${D.cardBorder}` }}>
                <AdminNavItem
                    icon={<Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
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
                    <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke={D.red} />
                    Đăng xuất
                </div>
            </div>
        </aside>
    );
}

// ─── Admin Header ─────────────────────────────────────────────────────────────
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
                <div style={{ fontSize: 12, color: D.textMuted }}>
                    Bảng điều khiển giám sát thời thực
                </div>
            </div>

            {/* Sync status */}
            <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 14px", background: D.card, border: `1px solid ${D.cardBorder}`,
                borderRadius: 8,
            }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: D.green, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: D.textMuted }}>Sync status: <strong style={{ color: D.green }}>OK</strong></span>
            </div>

            {/* User */}
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, label, value, sub, badge, badgeColor, badgeBg, progress, progressColor, actionText, actionColor }) {
    return (
        <div style={{
            flex: 1, background: D.card, border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, padding: "20px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10, background: iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>{icon}</div>
                {badge && (
                    <span style={{
                        padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                        background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}33`,
                    }}>{badge}</span>
                )}
            </div>
            <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: D.text, lineHeight: 1 }}>{value}</span>
                {sub && <span style={{ fontSize: 13, color: D.textMuted }}>{sub}</span>}
            </div>
            {progress !== undefined && (
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginTop: 12, overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: progressColor || D.green, borderRadius: 99 }} />
                </div>
            )}
            {actionText && (
                <div style={{ marginTop: 10, fontSize: 12, color: actionColor || D.orange, fontWeight: 500, cursor: "pointer" }}>
                    {actionText} →
                </div>
            )}
        </div>
    );
}

// ─── System Logs Terminal ─────────────────────────────────────────────────────
function SystemLogs() {
    const logs = [
        { time: "2024-05-24 10:15:22", text: "Initializing OpenAQ v3 synchronization...", type: "info" },
        { text: "INFO: Connected to API endpoint: api.openaq.org/v3/measurements", type: "info" },
        { text: "SUCCESS: Received 1,420 new records from Hanoi_US_Embassy", type: "success" },
        { text: "SUCCESS: Received 800 new records from HCM_US_Consulate", type: "success" },
        { time: "2024-05-24 10:15:30", text: "Processing spatial interpolation...", type: "info" },
        { text: "WARN: Station ID #99283 (Da Nang) reporting latency > 500ms", type: "warn" },
        { text: "INFO: Triggering AI model retraining cycle (RMSE: 4.2)", type: "info" },
        { text: ">> Running background garbage collection...", type: "dim" },
        { text: "SUCCESS: Cache invalidated for 12,400 keys.", type: "success" },
        { time: "2024-05-24 10:15:45", text: "Sync process completed in 23.4s", type: "info" },
    ];
    const colors = { info: D.textMuted, success: D.green, warn: D.yellow, dim: D.textDim };

    return (
        <div style={{
            background: "#0d1520", border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column",
        }}>
            {/* Terminal header */}
            <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                borderBottom: `1px solid ${D.cardBorder}`, background: "#111b27",
            }}>
                <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308" }} />
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
                </div>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: D.textDim, fontWeight: 500 }}>SYSTEM LOGS</span>
                <span style={{ fontSize: 11, color: D.green, fontWeight: 600, marginLeft: 12 }}>OPENAQ SYNC</span>
            </div>
            {/* Log content */}
            <div style={{
                flex: 1, padding: "14px 16px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
                fontSize: 11.5, lineHeight: 1.8, overflowY: "auto", color: D.textMuted,
            }}>
                {logs.map((log, i) => (
                    <div key={i}>
                        {log.time && <span style={{ color: D.textDim }}>[{log.time}] </span>}
                        <span style={{ color: colors[log.type] || D.textMuted }}>
                            {log.type === "success" && <strong style={{ color: D.green }}>SUCCESS: </strong>}
                            {log.type === "warn" && <strong style={{ color: D.yellow }}>WARN: </strong>}
                            {log.text.replace(/^(SUCCESS|WARN|INFO): /, log.type === "success" || log.type === "warn" ? "" : "$1: ")}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Vietnam Map Placeholder ──────────────────────────────────────────────────
function VietnamMap() {
    const stationDots = [
        { top: "18%", left: "55%", online: true },
        { top: "22%", left: "60%", online: true },
        { top: "28%", left: "52%", online: true },
        { top: "35%", left: "48%", online: true },
        { top: "42%", left: "55%", online: true },
        { top: "55%", left: "50%", online: false },
        { top: "65%", left: "52%", online: true },
        { top: "75%", left: "48%", online: true },
        { top: "80%", left: "53%", online: true },
        { top: "85%", left: "45%", online: true },
    ];

    return (
        <div style={{
            background: D.card, border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, overflow: "hidden", position: "relative",
            height: "100%", minHeight: 350,
        }}>
            {/* Map bg */}
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, #0b1a2a 0%, #0f2438 50%, #0b1a2a 100%)",
                opacity: 0.7,
            }} />
            {/* Station dots */}
            {stationDots.map((s, i) => (
                <div key={i} style={{
                    position: "absolute", top: s.top, left: s.left,
                    width: 10, height: 10, borderRadius: "50%",
                    background: s.online ? D.green : D.red,
                    boxShadow: `0 0 8px ${s.online ? D.green : D.red}`,
                    zIndex: 2,
                }} />
            ))}
            {/* Legend */}
            <div style={{
                position: "absolute", top: 16, left: 16, zIndex: 3,
                background: "rgba(11,18,25,0.9)", border: `1px solid ${D.cardBorder}`,
                borderRadius: 10, padding: "10px 16px",
            }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: D.text, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Trạng thái trạm quốc gia
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: D.green }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: D.green, display: "inline-block" }} />
                        Online (54)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: D.red }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: D.red, display: "inline-block" }} />
                        Offline (6)
                    </div>
                </div>
            </div>
            {/* Vietnam shape outline (simplified SVG) */}
            <svg viewBox="0 0 200 500" style={{ width: "60%", height: "100%", position: "absolute", top: 0, left: "20%", opacity: 0.25 }}>
                <path d="M100 20 C110 40 120 60 115 80 C110 100 105 120 108 140 C111 160 100 180 95 200 C90 220 88 240 92 260 C96 280 90 300 85 320 C80 340 85 360 90 380 C95 400 88 420 80 440 C85 450 95 455 100 460 C105 450 110 440 105 420 C115 400 120 380 118 360 C116 340 120 320 125 300 C130 280 125 260 120 240"
                    fill="none" stroke={D.green} strokeWidth="2" />
            </svg>
        </div>
    );
}

// ─── Community Reports Table ──────────────────────────────────────────────────
function CommunityReports() {
    const reports = [
        {
            name: "Nguyễn Huy", id: "4492", initials: "NH", color: "#6366f1",
            lat: "21.0285", lng: "105.8542", area: "Hoàn Kiếm, Hà Nội", time: "10:45 AM",
        },
        {
            name: "Trần Lan", id: "8821", initials: "TL", color: "#ec4899",
            lat: "10.8231", lng: "106.6297", area: "Quận 12, TP. HCM", time: "09:30 AM",
        },
    ];

    return (
        <div style={{
            background: D.card, border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, padding: "22px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: D.text }}>Báo cáo Cộng đồng chờ duyệt</div>
                    <div style={{ fontSize: 12, color: D.textMuted, marginTop: 3 }}>Xem xét và xác thực hình ảnh ô nhiễm từ người dùng</div>
                </div>
                <button style={{
                    padding: "8px 16px", background: "transparent", border: `1px solid ${D.cardBorder}`,
                    borderRadius: 8, color: D.textMuted, fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}>Xem tất cả lịch sử</button>
            </div>

            {/* Table header */}
            <div style={{
                display: "grid", gridTemplateColumns: "1.5fr 1fr 2fr 1fr 1.5fr",
                padding: "10px 16px", borderBottom: `1px solid ${D.cardBorder}`,
                fontSize: 11, fontWeight: 600, color: D.textDim, textTransform: "uppercase", letterSpacing: 0.5,
            }}>
                <span>Người gửi</span>
                <span>Hình ảnh</span>
                <span>Tọa độ</span>
                <span>Thời gian</span>
                <span style={{ textAlign: "right" }}>Hành động</span>
            </div>

            {/* Table rows */}
            {reports.map((r) => (
                <div key={r.id} style={{
                    display: "grid", gridTemplateColumns: "1.5fr 1fr 2fr 1fr 1.5fr",
                    padding: "14px 16px", borderBottom: `1px solid ${D.cardBorder}`,
                    alignItems: "center", fontSize: 13,
                }}>
                    {/* User */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 8, background: r.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "white",
                        }}>{r.initials}</div>
                        <div>
                            <div style={{ fontWeight: 600, color: D.text }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: D.textDim }}>ID: {r.id}</div>
                        </div>
                    </div>
                    {/* Image placeholder */}
                    <div>
                        <div style={{
                            width: 52, height: 36, borderRadius: 6,
                            background: "linear-gradient(135deg,#1a3050,#2a4a70)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" size={14} stroke={D.textDim} />
                        </div>
                    </div>
                    {/* Coords */}
                    <div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: D.text }}>
                            {r.lat}° N, {r.lng}° E
                        </div>
                        <div style={{ fontSize: 11, color: D.textDim }}>{r.area}</div>
                    </div>
                    {/* Time */}
                    <div style={{ color: D.textMuted, fontSize: 12 }}>{r.time}</div>
                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button style={{
                            padding: "6px 14px", background: D.redBg, color: D.red,
                            border: `1px solid ${D.red}33`, borderRadius: 6,
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>Từ chối</button>
                        <button style={{
                            padding: "6px 14px", background: D.green, color: "white",
                            border: "none", borderRadius: 6,
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>Duyệt</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function AdminOverviewTab() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Stat cards */}
            <div style={{ display: "flex", gap: 16 }}>
                <StatCard
                    icon={<Icon d={["M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0"]} stroke={D.blue} size={20} />}
                    iconBg={D.blueBg} label="TRẠM HOẠT ĐỘNG" value="54" sub="/60 Online"
                    badge="LIVE" badgeColor={D.green} badgeBg={D.greenBg}
                    progress={90} progressColor={D.green}
                />
                <StatCard
                    icon={<Icon d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke={D.blue} size={20} />}
                    iconBg={D.blueBg} label="RMSE MÔ HÌNH AI" value="4.2" sub="↓ 0.3%"
                    badge="v2.1Stable" badgeColor={D.green} badgeBg={D.greenBg}
                />
                <StatCard
                    icon={<Icon d="M13 10V3L4 14h7v7l9-11h-7z" stroke={D.blue} size={20} />}
                    iconBg={D.blueBg} label="API CALL USAGE" value="8,450" sub="/ 10k"
                    badge="LIMIT" badgeColor={D.yellow} badgeBg="rgba(234,179,8,0.12)"
                    progress={84.5} progressColor={D.blue}
                />
                <StatCard
                    icon={<Icon d={["M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"]} stroke={D.red} size={20} />}
                    iconBg={D.redBg} label="BÁO CÁO CHỜ DUYỆT" value="12" sub="Pending"
                    actionText="Xử lý ngay" actionColor={D.orange}
                />
            </div>

            {/* Map + Logs row */}
            <div style={{ display: "flex", gap: 16, minHeight: 360 }}>
                <div style={{ flex: 1.2 }}>
                    <VietnamMap />
                </div>
                <div style={{ flex: 1 }}>
                    <SystemLogs />
                </div>
            </div>

            {/* Community reports */}
            <CommunityReports />
        </div>
    );
}

// ─── Placeholder Tab ──────────────────────────────────────────────────────────
function AdminPlaceholderTab({ title }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: 400, gap: 16, color: D.textMuted,
        }}>
            <div style={{ fontSize: 48 }}>🚧</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: D.text }}>{title}</div>
            <div style={{ fontSize: 14 }}>Tính năng đang được phát triển.</div>
        </div>
    );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { userName, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    const tabTitles = {
        overview: "Tổng quan hệ thống",
        stations: "Quản lý Trạm (OpenAQ)",
        ai: "Giám sát Mô hình AI",
        reports: "Duyệt báo cáo Cộng đồng",
        users: "Quản lý User & API Key",
        logs: "Hệ thống & Logs",
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: D.bg, fontFamily: D.font }}>
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />

            <div style={{ marginLeft: D.sidebarW, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <AdminHeader userName={userName} />

                <main style={{ marginTop: 64, flex: 1, padding: "28px", overflowY: "auto" }}>
                    {activeTab === "overview" && <AdminOverviewTab />}
                    {activeTab !== "overview" && <AdminPlaceholderTab title={tabTitles[activeTab]} />}
                </main>

                {/* Footer */}
                <footer style={{
                    borderTop: `1px solid ${D.cardBorder}`, padding: "16px 28px",
                    background: D.headerBg, textAlign: "center",
                }}>
                    <div style={{ fontSize: 12, color: D.textDim }}>
                        © 2024 EcoAir VN — Admin Panel v2.1 · Powered by AI Monitoring System
                    </div>
                </footer>
            </div>
        </div>
    );
}
