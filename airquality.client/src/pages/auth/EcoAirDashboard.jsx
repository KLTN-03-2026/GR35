import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import PlacesTab from "./PlacesTab";
import ReportTab from "./ReportTab";
import ProfileHealthTab from "./ProfileHealthTab";
import DeveloperApiTab from "./DeveloperApiTab";
import AlertConfigTab from "./AlertConfigTab";
import HistoryExportTab from "./HistoryExportTab";
import MapRoutingTab from "./MapRoutingTab";
import NotificationBell from "../../components/common/NotificationBell";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
    green: "#0d6e4e",
    greenLight: "#22c55e",
    greenBg: "#f0fdf4",
    greenBorder: "#bbf7d0",
    darkGreen: "#0a4a32",
    emerald: "#10b981",
    blue: "#3b82f6",
    blueBg: "#eff6ff",
    blueBorder: "#bfdbfe",
    purple: "#8b5cf6",
    purpleBg: "#f5f3ff",
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

function getAqiMeta(value) {
    const aqi = Number(value ?? 0);
    if (aqi <= 50) return { label: "Tốt", color: C.green, bg: "#dcfce7", advice: "Không khí an toàn cho hầu hết hoạt động ngoài trời." };
    if (aqi <= 100) return { label: "Trung bình", color: C.yellow, bg: "#fef3c7", advice: "Nhóm nhạy cảm nên theo dõi thêm trước khi vận động mạnh." };
    if (aqi <= 150) return { label: "Kém", color: C.orange, bg: "#ffedd5", advice: "Nên hạn chế ở ngoài lâu, đặc biệt nếu có bệnh hô hấp." };
    if (aqi <= 200) return { label: "Xấu", color: C.red, bg: "#fee2e2", advice: "Hạn chế ra ngoài và cân nhắc đeo khẩu trang lọc bụi." };
    return { label: "Nguy hại", color: "#7c3aed", bg: "#f3e8ff", advice: "Nên ở trong nhà và tránh vận động ngoài trời." };
}

function formatHour(value) {
    if (!value) return "--:--";
    const date = new Date(typeof value === "string" && !value.endsWith("Z") ? `${value}Z` : value);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(value) {
    if (!value) return "Chưa có dữ liệu";
    const date = new Date(typeof value === "string" && !value.endsWith("Z") ? `${value}Z` : value);
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    });
}

function normalizeHistory(items) {
    return [...(Array.isArray(items) ? items : [])]
        .map((item) => ({
            ...item,
            aqi: item.calculatedAqi ?? item.aqi ?? 0,
            pm25: item.pm25 ?? 0,
            timestamp: item.timestamp,
            shortTime: formatHour(item.timestamp),
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function getHealthTips(conditions, latestAqi) {
    const list = Array.isArray(conditions) ? conditions : [];
    const meta = getAqiMeta(latestAqi);
    if (!list.length) return [
        "Hoàn thiện hồ sơ sức khỏe để nhận khuyến nghị cá nhân hóa chính xác hơn.",
        meta.advice,
    ];

    const tips = [];
    if (list.some((x) => x.toLowerCase().includes("hen") || x.toLowerCase().includes("copd"))) {
        tips.push(`Với nhóm hô hấp nhạy cảm, AQI ${latestAqi ?? "--"} hiện tại nên được theo dõi sát trước khi ra ngoài.`);
    }
    if (list.some((x) => x.toLowerCase().includes("tim mạch"))) {
        tips.push("Ưu tiên ra ngoài vào các khung giờ AQI thấp hơn và tránh tuyến đường đông xe.");
    }
    if (list.some((x) => x.toLowerCase().includes("trẻ") || x.toLowerCase().includes("mang thai") || x.toLowerCase().includes("cao tuổi"))) {
        tips.push("Nhóm nhạy cảm nên giới hạn thời gian ngoài trời khi chất lượng không khí suy giảm.");
    }
    tips.push(meta.advice);
    return tips.slice(0, 3);
}

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
function Sidebar({ activeTab, setActiveTab, onLogout, userName, isPro, isMobile, isOpen, onClose }) {
    const navigate = useNavigate();

    if (isMobile && !isOpen) return null;

    const navItems = [
        {
            id: "overview", label: "Tổng quan",
            icon: <Icon d={["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"]} />,
        },
        {
            id: "places", label: "Địa điểm",
            icon: <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
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
            id: "developer", label: "API Key",
            icon: <Icon d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
        },
        {
            id: "profile", label: "Hồ sơ & Sức khoẻ",
            icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        },
    ];

    return (
        <>
            {isMobile && isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.4)", zIndex: 99
                    }}
                />
            )}
            <aside style={{
                width: C.sidebarW, minWidth: C.sidebarW, height: "100vh", position: "fixed",
                top: 0, left: isMobile && !isOpen ? -C.sidebarW : 0,
                background: C.white, borderRight: `1px solid ${C.border}`,
                display: "flex", flexDirection: "column", zIndex: 100,
                transition: "left 0.3s ease",
                fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
            }}>
                {/* Logo */}
                <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${C.border}` }}>
                    <div
                        onClick={() => navigate('/')}
                        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                    >
                        <img
                            src="/logoecoair.png"
                            alt="EcoAir Logo"
                            style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }}
                        />
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
                            {isPro && (
                                <div style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    background: C.yellow, borderRadius: 4, padding: "1px 7px",
                                    fontSize: 10, fontWeight: 700, color: "white", marginTop: 2,
                                }}>⭐ PRO</div>
                            )}
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
                            onClick={() => { setActiveTab(item.id); if (isMobile) onClose(); }}
                        />
                    ))}
                </nav>

                {/* Bottom */}
                <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.border}` }}>
                    <NavItem
                        icon={<Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                        label="Cài đặt"
                        active={activeTab === "settings"}
                        onClick={() => { setActiveTab("settings"); if (isMobile) onClose(); }}
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
        </>
    );
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────
function DashboardHeader({ userName, isMobile }) {
    const navigate = useNavigate();
    const greetings = ["Chào mừng trở lại,", "Xin chào,"];
    return (
        <header style={{
            position: "fixed", top: 0, left: isMobile ? 0 : C.sidebarW, right: 0, height: 60,
            background: "rgba(255,255,255,0.97)", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", padding: isMobile ? "0 16px" : "0 28px",
            zIndex: 40, backdropFilter: "blur(8px)",
            fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
            gap: isMobile ? 12 : 16,
        }}>
            {/* Greeting */}
            {!isMobile && (
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>
                        {greetings[0]} <span style={{ color: C.green }}>{userName}!</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>
                        Hôm nay không khí khu vực của bạn rất trong lành.
                    </div>
                </div>
            )}
            {isMobile && (
                <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: C.green }}>
                    EcoAir VN
                </div>
            )}

            {/* Search */}
            {!isMobile && (
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
            )}

            {/* Upgrade button */}
            <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: isMobile ? "8px 12px" : "8px 18px", background: C.yellow,
                color: "white", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
            }} onClick={() => navigate('/goi')}>
                ✦ {isMobile ? "Pro" : "Nâng cấp Pro"}
            </button>

            {/* Bell */}
            <div style={{ marginLeft: 8 }}>
                <NotificationBell />
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

function Card({ children, style = {} }) {
    return (
        <div style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 20,
            ...style,
        }}>
            {children}
        </div>
    );
}

function SectionTitle({ title, subtitle, action }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
            <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</div>
                {subtitle ? <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{subtitle}</div> : null}
            </div>
            {action}
        </div>
    );
}

function KpiCard({ label, value, subtext, accent, icon }) {
    return (
        <div style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "16px",
            minWidth: 140,
            flex: 1,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{label}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: accent, marginTop: 8, lineHeight: 1.1 }}>{value}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{subtext}</div>
                </div>
                <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${accent}14`,
                    color: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    flexShrink: 0,
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FavoritePlaceCard({ place, highlighted }) {
    const meta = getAqiMeta(place.aqi);
    return (
        <div style={{
            border: `1px solid ${highlighted ? meta.color : C.border}`,
            borderRadius: 14,
            padding: 16,
            background: highlighted ? meta.bg : C.white,
            flex: 1,
            minWidth: 220,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                        {place.stationName || place.cityName || "Địa điểm yêu thích"}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                        {[place.cityName, place.stateProvince].filter(Boolean).join(", ") || "Đang theo dõi"}
                    </div>
                </div>
                <div style={{ fontSize: 18, color: C.yellow }}>★</div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: meta.color, lineHeight: 1 }}>{place.aqi ?? "--"}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>AQI {meta.label.toUpperCase()}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 14 }}>
                <div style={{ background: "rgba(255,255,255,0.55)", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 11, color: C.textLight }}>PM2.5</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{place.pm25 != null ? `${Math.round(place.pm25)} μg/m3` : "--"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.55)", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 11, color: C.textLight }}>Cập nhật</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{formatHour(place.updateTime)}</div>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ title, desc, accent, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                border: `1px solid ${accent}33`,
                background: C.white,
                borderRadius: 14,
                padding: "16px 18px",
                cursor: "pointer",
                textAlign: "left",
                minWidth: 180,
                flex: 1,
            }}
        >
            <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{title}</div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, marginTop: 8 }}>{desc}</div>
        </button>
    );
}

function OverviewTab({ accessToken, subscriptionTier, userName, setActiveTab, isMobile }) {
    const isPro = (subscriptionTier ?? "").toLowerCase() === "pro";
    const [overview, setOverview] = useState({
        loading: true,
        error: "",
        places: [],
        cities: [],
        history: [],
        source: null,
        sourceType: "city",
        alertSummary: null,
        profile: null,
        reports: [],
        apiKeys: [],
    });
    const [historySourceType, setHistorySourceType] = useState("city");

    useEffect(() => {
        let ignore = false;

        async function loadOverview() {
            setOverview((prev) => ({ ...prev, loading: true, error: "" }));

            try {
                const authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
                const requests = await Promise.allSettled([
                    fetch("/api/favorite-places", { headers: authHeaders }),
                    fetch("/api/City"),
                    fetch("/api/auth/profile-health", { headers: authHeaders }),
                    fetch("/api/community-reports/my-reports", { headers: authHeaders }),
                    fetch("/api/auth/api-keys", { headers: authHeaders }),
                    isPro ? fetch("/api/alert-config", { headers: authHeaders }) : Promise.resolve(null),
                ]);

                const [placesRes, citiesRes, profileRes, reportsRes, apiKeysRes, alertRes] = requests;

                const places = placesRes.status === "fulfilled" && placesRes.value?.ok ? await placesRes.value.json() : [];
                const cities = citiesRes.status === "fulfilled" && citiesRes.value?.ok ? await citiesRes.value.json() : [];
                const profile = profileRes.status === "fulfilled" && profileRes.value?.ok ? await profileRes.value.json() : null;
                const reports = reportsRes.status === "fulfilled" && reportsRes.value?.ok ? await reportsRes.value.json() : [];
                const apiKeys = apiKeysRes.status === "fulfilled" && apiKeysRes.value?.ok ? await apiKeysRes.value.json() : [];
                const alertSummary = alertRes && alertRes.status === "fulfilled" && alertRes.value?.ok ? await alertRes.value.json() : null;

                const favoriteStation = (Array.isArray(places) ? places : []).find((item) => item.type === "station");
                const firstCity = Array.isArray(cities) && cities.length > 0 ? cities[0] : null;
                const preferredType = favoriteStation ? "station" : "city";
                const chosenSource = preferredType === "station"
                    ? { type: "station", id: favoriteStation.id, label: favoriteStation.stationName || favoriteStation.cityName || "Trạm yêu thích" }
                    : firstCity
                        ? { type: "city", slug: firstCity.slug, label: firstCity.provinceName || "Thành phố" }
                        : null;

                let history = [];
                if (chosenSource) {
                    const historyUrl = chosenSource.type === "station"
                        ? `/api/AirQuality/station/${chosenSource.id}/history?hours=24`
                        : `/api/City/${chosenSource.slug}/history?hours=24`;

                    const historyRes = await fetch(historyUrl, { headers: authHeaders });
                    if (historyRes.ok) {
                        history = normalizeHistory(await historyRes.json());
                    }
                }

                if (!ignore) {
                    setHistorySourceType(preferredType);
                    setOverview({
                        loading: false,
                        error: "",
                        places: Array.isArray(places) ? places : [],
                        cities: Array.isArray(cities) ? cities : [],
                        history,
                        source: chosenSource,
                        sourceType: preferredType,
                        alertSummary,
                        profile,
                        reports: Array.isArray(reports) ? reports : [],
                        apiKeys: Array.isArray(apiKeys) ? apiKeys : [],
                    });
                }
            } catch {
                if (!ignore) {
                    setOverview((prev) => ({
                        ...prev,
                        loading: false,
                        error: "Không thể tải dữ liệu tổng quan lúc này.",
                    }));
                }
            }
        }

        loadOverview();
        return () => {
            ignore = true;
        };
    }, [accessToken, isPro]);

    useEffect(() => {
        async function switchSource() {
            const targetSource = historySourceType === "station"
                ? overview.places.find((item) => item.type === "station")
                : overview.cities[0];

            if (!targetSource) return;

            const nextSource = historySourceType === "station"
                ? { type: "station", id: targetSource.id, label: targetSource.stationName || targetSource.cityName || "Trạm yêu thích" }
                : { type: "city", slug: targetSource.slug, label: targetSource.provinceName || "Thành phố" };

            const historyUrl = nextSource.type === "station"
                ? `/api/AirQuality/station/${nextSource.id}/history?hours=24`
                : `/api/City/${nextSource.slug}/history?hours=24`;

            try {
                const res = await fetch(historyUrl, {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
                });
                const history = res.ok ? normalizeHistory(await res.json()) : [];
                setOverview((prev) => ({ ...prev, history, source: nextSource, sourceType: historySourceType }));
            } catch {
                setOverview((prev) => ({ ...prev, history: [], source: nextSource, sourceType: historySourceType }));
            }
        }

        if (!overview.loading && overview.cities.length) {
            switchSource();
        }
    }, [accessToken, historySourceType, overview.cities, overview.loading, overview.places]);

    const latest = useMemo(() => overview.history[overview.history.length - 1] || null, [overview.history]);
    const aqiMeta = getAqiMeta(latest?.aqi ?? 0);
    const avgPm25 = useMemo(() => {
        if (!overview.history.length) return 0;
        return overview.history.reduce((sum, item) => sum + (item.pm25 ?? 0), 0) / overview.history.length;
    }, [overview.history]);
    const riskWindows = useMemo(() => {
        return [...overview.history]
            .sort((a, b) => (b.pm25 ?? 0) - (a.pm25 ?? 0))
            .slice(0, 3)
            .map((item) => ({
                time: formatHour(item.timestamp),
                value: Math.round(item.pm25 ?? 0),
                aqi: Math.round(item.aqi ?? 0),
            }));
    }, [overview.history]);
    const worstFavorite = useMemo(() => {
        return [...overview.places]
            .filter((item) => item.aqi != null)
            .sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0))[0];
    }, [overview.places]);
    const activeAlerts = overview.alertSummary?.alertConfigs?.filter((item) => item.isActive).length ?? 0;
    const healthConditions = overview.profile?.healthConditions || [];
    const healthTips = getHealthTips(healthConditions, latest?.aqi ?? 0);

    if (overview.loading) {
        return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>Đang tải dashboard tổng quan...</div>;
    }

    if (overview.error) {
        return <Card style={{ color: C.red }}>{overview.error}</Card>;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
                borderRadius: 20,
                padding: "24px 24px",
                background: "linear-gradient(135deg, #0b3f2d 0%, #0d6e4e 45%, #22c55e 100%)",
                color: "white",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
                    <div style={{ flex: 2, minWidth: 280 }}>
                        <div style={{ fontSize: 13, opacity: 0.82 }}>Bức tranh tổng thể hôm nay</div>
                        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
                            {userName}, {aqiMeta.label === "Tốt" ? "hôm nay không khí khá ổn." : "hãy chú ý chất lượng không khí khu vực của bạn."}
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.92, marginTop: 12, maxWidth: 760 }}>
                            Theo dõi nhanh AQI hiện tại, xu hướng 24 giờ, cảnh báo cá nhân và những hành động nên thực hiện ngay trong một màn hình.
                        </div>
                    </div>
                    <div style={{
                        minWidth: 260,
                        background: "rgba(255,255,255,0.14)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        borderRadius: 18,
                        padding: "18px 18px",
                        backdropFilter: "blur(8px)",
                    }}>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>Nguồn dữ liệu hiện tại</div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{overview.source?.label || "Chưa xác định"}</div>
                        <div style={{ fontSize: 12, opacity: 0.82, marginTop: 6 }}>
                            Cập nhật lúc {formatDateTime(latest?.timestamp)}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                            <button
                                onClick={() => setHistorySourceType("city")}
                                style={{
                                    border: "none",
                                    background: historySourceType === "city" ? "white" : "rgba(255,255,255,0.15)",
                                    color: historySourceType === "city" ? C.green : "white",
                                    borderRadius: 999,
                                    padding: "7px 12px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                Thành phố
                            </button>
                            <button
                                onClick={() => setHistorySourceType("station")}
                                disabled={!overview.places.some((item) => item.type === "station")}
                                style={{
                                    border: "none",
                                    background: historySourceType === "station" ? "white" : "rgba(255,255,255,0.15)",
                                    color: historySourceType === "station" ? C.green : "white",
                                    opacity: overview.places.some((item) => item.type === "station") ? 1 : 0.5,
                                    borderRadius: 999,
                                    padding: "7px 12px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: overview.places.some((item) => item.type === "station") ? "pointer" : "not-allowed",
                                }}
                            >
                                Trạm yêu thích
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <KpiCard
                    label="AQI hiện tại"
                    value={latest ? Math.round(latest.aqi) : "--"}
                    subtext={aqiMeta.label}
                    accent={aqiMeta.color}
                    icon="AQ"
                />
                <KpiCard
                    label="PM2.5 hiện tại"
                    value={latest?.pm25 != null ? Math.round(latest.pm25) : "--"}
                    subtext="ug/m3"
                    accent={C.blue}
                    icon="PM"
                />
                <KpiCard
                    label="Địa điểm yêu thích"
                    value={overview.places.length}
                    subtext={worstFavorite ? `Điểm cần lưu ý: ${worstFavorite.stationName || worstFavorite.cityName}` : "Chưa có địa điểm được ghim"}
                    accent={C.yellow}
                    icon="★"
                />
                <KpiCard
                    label="Cảnh báo đang bật"
                    value={activeAlerts}
                    subtext={overview.alertSummary?.telegramConnected ? "Telegram đã kết nối" : "Chưa kết nối Telegram"}
                    accent={C.purple}
                    icon="!"
                />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 2fr) minmax(280px, 1fr)", gap: 16 }}>
                <Card>
                    <SectionTitle
                        title="Xu hướng chất lượng không khí"
                        subtitle="Dữ liệu 24 giờ gần nhất cho AQI và PM2.5"
                        action={
                            <button
                                onClick={() => setActiveTab("history")}
                                style={{ border: "none", background: C.greenBg, color: C.green, borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                            >
                                Xem lịch sử đầy đủ
                            </button>
                        }
                    />
                    {overview.history.length ? (
                        <>
                            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 999, background: C.green, display: "inline-block" }} />
                                    AQI
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 999, background: C.blue, display: "inline-block" }} />
                                    PM2.5
                                </div>
                            </div>
                            <div style={{ width: "100%", height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={overview.history}>
                                        <defs>
                                            <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={C.green} stopOpacity={0.24} />
                                                <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="pmFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={C.blue} stopOpacity={0.18} />
                                                <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                                        <XAxis dataKey="shortTime" tick={{ fontSize: 11, fill: C.textLight }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: C.textLight }} tickLine={false} axisLine={false} width={32} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}` }}
                                            formatter={(value, name) => [Math.round(value), name === "aqi" ? "AQI" : "PM2.5"]}
                                            labelFormatter={(value) => `Thời gian: ${value}`}
                                        />
                                        <Area type="monotone" dataKey="aqi" stroke={C.green} fill="url(#aqiFill)" strokeWidth={2.5} />
                                        <Area type="monotone" dataKey="pm25" stroke={C.blue} fill="url(#pmFill)" strokeWidth={2.5} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
                                <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px" }}>
                                    <div style={{ fontSize: 11, color: C.textLight }}>AQI trung bình 24h</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 6 }}>
                                        {Math.round(overview.history.reduce((sum, item) => sum + (item.aqi ?? 0), 0) / overview.history.length)}
                                    </div>
                                </div>
                                <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px" }}>
                                    <div style={{ fontSize: 11, color: C.textLight }}>PM2.5 trung bình</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 6 }}>
                                        {avgPm25 ? avgPm25.toFixed(1) : "0.0"}
                                    </div>
                                </div>
                                <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px" }}>
                                    <div style={{ fontSize: 11, color: C.textLight }}>Mức cảnh báo</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: aqiMeta.color, marginTop: 6 }}>
                                        {aqiMeta.label}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: 30, textAlign: "center", color: C.textMuted }}>Chưa có dữ liệu lịch sử để hiển thị biểu đồ.</div>
                    )}
                </Card>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Card>
                        <SectionTitle title="Cảnh báo cá nhân" subtitle="Trạng thái thông báo và ngưỡng theo dõi" />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 13, color: C.textMuted }}>Kênh nhận cảnh báo</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginTop: 6 }}>
                                    {overview.alertSummary?.telegramConnected ? "Telegram đã sẵn sàng" : "Chưa kết nối"}
                                </div>
                            </div>
                            <span style={{
                                padding: "6px 10px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                background: overview.alertSummary?.telegramConnected ? C.greenBg : "#fff7ed",
                                color: overview.alertSummary?.telegramConnected ? C.green : C.orange,
                            }}>
                                {activeAlerts} cấu hình bật
                            </span>
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 12, lineHeight: 1.6 }}>
                            {overview.alertSummary?.suggestedThresholds?.aqiThreshold
                                ? `Ngưỡng đề xuất hiện tại: AQI ${overview.alertSummary.suggestedThresholds.aqiThreshold}.`
                                : "Bạn có thể cấu hình ngưỡng AQI phù hợp với hồ sơ sức khỏe của mình."}
                        </div>
                        <button
                            onClick={() => setActiveTab("alert")}
                            style={{ marginTop: 16, width: "100%", border: "none", background: C.green, color: "white", borderRadius: 10, padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}
                        >
                            Mở cấu hình cảnh báo
                        </button>
                    </Card>

                    <Card>
                        <SectionTitle title="Mẹo hôm nay" subtitle="Gợi ý dựa trên hồ sơ sức khỏe và AQI hiện tại" />
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {healthTips.map((tip, index) => (
                                <div key={index} style={{
                                    display: "flex",
                                    gap: 10,
                                    padding: "10px 12px",
                                    background: index === 0 ? aqiMeta.bg : C.bg,
                                    borderRadius: 12,
                                }}>
                                    <span style={{ color: aqiMeta.color, fontWeight: 700 }}>{index + 1}</span>
                                    <span style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>{tip}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="Tài khoản của bạn" subtitle="Trạng thái gói và hệ sinh thái chức năng" />
                        <div style={{ fontSize: 26, fontWeight: 800, color: isPro ? C.yellow : C.text }}>
                            {overview.profile?.subscriptionTier || subscriptionTier || "Free"}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 1.6 }}>
                            {isPro
                                ? "Bạn đang có quyền truy cập vào cảnh báo Telegram, lịch sử nâng cao và cá nhân hóa sâu hơn."
                                : "Nâng cấp Pro để mở khóa cảnh báo Telegram, truy xuất lịch sử dài ngày và nhiều tiện ích nâng cao."}
                        </div>
                        {!isPro ? (
                            <button
                                onClick={() => window.location.href = "/goi"}
                                style={{ marginTop: 16, width: "100%", border: "none", background: C.yellow, color: "white", borderRadius: 10, padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}
                            >
                                Nâng cấp Pro
                            </button>
                        ) : null}
                    </Card>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: 16 }}>
                <Card>
                    <SectionTitle
                        title="Địa điểm yêu thích"
                        subtitle="Những nơi bạn đang theo dõi thường xuyên"
                        action={
                            <button
                                onClick={() => setActiveTab("places")}
                                style={{ border: "none", background: C.greenBg, color: C.green, borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                            >
                                Quản lý địa điểm
                            </button>
                        }
                    />
                    {overview.places.length ? (
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {overview.places.slice(0, 3).map((place, index) => (
                                <FavoritePlaceCard key={`${place.type}-${place.id}`} place={place} highlighted={index === 0} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
                            Bạn chưa có địa điểm yêu thích nào. Hãy thêm trạm hoặc thành phố để dashboard cá nhân hóa tốt hơn.
                        </div>
                    )}
                </Card>

                <Card>
                    <SectionTitle title="Điểm cần chú ý" subtitle="Các tín hiệu nổi bật hôm nay" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ background: worstFavorite ? getAqiMeta(worstFavorite.aqi).bg : C.bg, borderRadius: 12, padding: "12px 14px" }}>
                            <div style={{ fontSize: 11, color: C.textLight }}>Địa điểm xấu nhất trong danh sách</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 6 }}>
                                {worstFavorite ? `${worstFavorite.stationName || worstFavorite.cityName} • AQI ${worstFavorite.aqi}` : "Chưa đủ dữ liệu"}
                            </div>
                        </div>
                        <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px" }}>
                            <div style={{ fontSize: 11, color: C.textLight }}>Báo cáo cộng đồng của bạn</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 6 }}>
                                {overview.reports.length} báo cáo đã gửi
                            </div>
                        </div>
                        <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px" }}>
                            <div style={{ fontSize: 11, color: C.textLight }}>API key đang hoạt động</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 6 }}>
                                {overview.apiKeys.length} khóa
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
                <Card>
                    <SectionTitle title="Hành động nhanh" subtitle="Đi tới các tính năng bạn hay dùng nhất" />
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <QuickAction title="Địa điểm" desc="Xem và quản lý danh sách yêu thích." accent={C.green} onClick={() => setActiveTab("places")} />
                        <QuickAction title="Cảnh báo" desc="Thiết lập Telegram và ngưỡng AQI." accent={C.purple} onClick={() => setActiveTab("alert")} />
                        <QuickAction title="Lịch sử" desc="Phân tích và tải dữ liệu quá khứ." accent={C.blue} onClick={() => setActiveTab("history")} />
                        <QuickAction title="Báo cáo" desc="Gửi phản ánh điểm nóng ô nhiễm." accent={C.orange} onClick={() => setActiveTab("report")} />
                        <QuickAction title="API Key" desc="Tạo khóa cho tích hợp kỹ thuật." accent={C.yellow} onClick={() => setActiveTab("developer")} />
                        <QuickAction title="Tuyến đường sạch" desc="So sánh lộ trình ít phơi nhiễm hơn." accent={C.emerald} onClick={() => setActiveTab("map")} />
                    </div>
                </Card>

                <Card>
                    <SectionTitle title="Khung giờ rủi ro cao" subtitle="3 thời điểm PM2.5 cao nhất trong 24 giờ qua" />
                    {riskWindows.length ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {riskWindows.map((item, index) => (
                                <div key={`${item.time}-${index}`} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 14px",
                                    borderRadius: 12,
                                    background: index === 0 ? "#fff7ed" : C.bg,
                                }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.time}</div>
                                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>AQI {item.aqi}</div>
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: index === 0 ? C.orange : C.text }}>
                                        {item.value} μg/m3
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ fontSize: 13, color: C.textMuted }}>Chưa đủ dữ liệu để tính các khung giờ rủi ro cao.</div>
                    )}
                </Card>
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

// ─── Mobile Bottom Navigation ──────────────────────────────────────────────────
function BottomNav({ activeTab, setActiveTab, onOpenMenu }) {
    const tabs = [
        { id: "overview", label: "Tổng quan", icon: <Icon d={["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"]} size={22} /> },
        { id: "places", label: "Địa điểm", icon: <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" size={22} strokeWidth={1.5} /> },
        { id: "map", label: "Bản đồ", icon: <Icon d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" size={22} strokeWidth={1.5} /> },
        { id: "profile", label: "Hồ sơ", icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={22} strokeWidth={1.5} /> },
        { id: "menu", label: "Menu", icon: <Icon d="M4 6h16M4 12h16M4 18h16" size={22} strokeWidth={1.5} /> },
    ];

    return (
        <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, height: 60,
            background: C.white, borderTop: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-around", alignItems: "center",
            zIndex: 90, paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
            {tabs.map(t => {
                const isActive = t.id === "menu" ? false : activeTab === t.id;
                const targetColor = isActive ? C.green : C.textLight;
                return (
                    <div key={t.id} onClick={() => t.id === "menu" ? onOpenMenu() : setActiveTab(t.id)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", flex: 1 }}>
                        <span style={{ color: targetColor, display: "flex", transition: "color 0.2s" }}>
                            {t.icon}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color: targetColor, transition: "color 0.2s" }}>
                            {t.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function EcoAirDashboard() {
    const { userName, logout, subscriptionTier, accessToken } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [displayName, setDisplayName] = useState(userName || "");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setIsDrawerOpen(false);
        };
        handleResize(); // trigger once to be sure
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isPro = (subscriptionTier ?? "").toLowerCase() === "pro";
    const tabTitles = {
        overview: "Tổng quan",
        places: "Địa điểm",
        map: "Bản đồ & Tìm đường",
        history: "Lịch sử & Xuất dữ liệu",
        alert: "Cấu hình Cảnh báo",
        report: "Báo cáo điểm nóng",
        developer: "Dành cho Lập trình viên",
        profile: "Hồ sơ & Sức khoẻ",
        settings: "Cài đặt",
    };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg, fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif" }}>
            <Sidebar
                activeTab={activeTab} setActiveTab={setActiveTab}
                onLogout={logout} userName={displayName} isPro={isPro}
                isMobile={isMobile} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}
            />

            <div style={{ marginLeft: isMobile ? 0 : C.sidebarW, flex: 1, display: "flex", flexDirection: "column", height: "100vh", minWidth: 0, overflowX: "hidden" }}>
                <DashboardHeader userName={displayName} isMobile={isMobile} />

                <main style={{ marginTop: 60, marginBottom: isMobile ? 60 : 0, flex: 1, padding: isMobile ? "20px 16px" : "28px 28px 24px", overflowY: "auto", overflowX: "hidden" }}>
                    {/* Breadcrumb */}
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 18 }}>
                        Dashboard &rsaquo; <span style={{ color: C.green, fontWeight: 600 }}>{tabTitles[activeTab]}</span>
                    </div>

                    {activeTab === "overview" && (
                        <OverviewTab
                            accessToken={accessToken}
                            subscriptionTier={subscriptionTier}
                            userName={displayName}
                            setActiveTab={setActiveTab}
                            isMobile={isMobile}
                        />
                    )}
                    {activeTab === "places" && <PlacesTab isMobile={isMobile} />}
                    {activeTab === "report" && <ReportTab isMobile={isMobile} />}
                    {activeTab === "developer" && <DeveloperApiTab isMobile={isMobile} />}
                    {activeTab === "alert" && <AlertConfigTab isMobile={isMobile} />}
                    {activeTab === "profile" && <ProfileHealthTab onProfileUpdated={setDisplayName} isMobile={isMobile} />}
                    {activeTab === "history" && <HistoryExportTab isMobile={isMobile} />}
                    {activeTab === "map" && <MapRoutingTab isMobile={isMobile} />}
                    {activeTab !== "overview" && activeTab !== "places" && activeTab !== "report" && activeTab !== "developer" && activeTab !== "alert" && activeTab !== "profile" && activeTab !== "history" && activeTab !== "map" && <PlaceholderTab title={tabTitles[activeTab]} />}
                </main>

                {!isMobile && <DashboardFooter />}
            </div>

            {isMobile && (
                <BottomNav
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenMenu={() => setIsDrawerOpen(true)}
                />
            )}
        </div>
    );
}
