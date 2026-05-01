import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid } from "recharts";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
};

function Icon({ d, size = 18, stroke = D.textMuted, fill = "none", sw = 1.8 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
        </svg>
    );
}

function StatCard({ icon, iconBg, label, value, sub, badge, badgeColor, badgeBg }) {
    return (
        <div style={{
            flex: 1, background: D.card, border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column"
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
        </div>
    );
}

export default function AdminOverview() {
    const { accessToken } = useAuth();
    const [data, setData] = useState(null);
    const [mapData, setMapData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [alertsPage, setAlertsPage] = useState(1);
    const alertsPerPage = 4;

    useEffect(() => {
        const fetchData = async () => {
            if (!accessToken) return;
            try {
                const [overviewRes, mapRes] = await Promise.all([
                    fetch("/api/admin/dashboard/overview", { headers: { Authorization: `Bearer ${accessToken}` } }),
                    fetch("/api/city/map")
                ]);

                if (overviewRes.ok) {
                    setData(await overviewRes.json());
                }
                if (mapRes.ok) {
                    setMapData(await mapRes.json());
                }
            } catch (error) {
                console.error("Error fetching admin overview data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accessToken]);

    if (loading || !data) {
        return <div style={{ color: D.textMuted, padding: 20 }}>Đang tải dữ liệu tổng quan...</div>;
    }

    // API .NET mặc định trả về JSON dạng camelCase
    const summary = data.summary || data.Summary;
    const trend = data.trend || data.Trend;
    const alerts = data.alerts || data.Alerts || [];
    const cityRankings = data.cityRankings || data.CityRankings;
    const recentActivities = data.recentActivities || data.RecentActivities || {};

    const totalAlertPages = Math.ceil(alerts.length / alertsPerPage);
    const paginatedAlerts = alerts.slice((alertsPage - 1) * alertsPerPage, alertsPage * alertsPerPage);

    const formatTime = (d) => new Date(d).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* THỐNG KÊ TỔNG QUAN */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <StatCard
                    icon={<Icon d={["M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0"]} stroke={D.blue} size={20} />}
                    iconBg={D.blueBg} label="TRẠM HOẠT ĐỘNG (24H)" value={summary?.onlineStations || summary?.OnlineStations || 0} sub={`/ ${summary?.totalStations || summary?.TotalStations || 0} trạm`}
                    badge="LIVE" badgeColor={D.green} badgeBg={D.greenBg}
                />
                <StatCard
                    icon={<Icon d={["M3 8l7.89 5.26a2 2 0 002.22 0L21 8", "M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"]} stroke={D.orange} size={20} />}
                    iconBg={D.orangeBg} label="THÀNH PHỐ ĐANG GIÁM SÁT" value={summary?.enabledCities || summary?.EnabledCities || 0} sub={`/ ${summary?.totalCities || summary?.TotalCities || 0} TP`}
                    badge="ACTIVE" badgeColor={D.orange} badgeBg="rgba(249,115,22,0.12)"
                />
                <StatCard
                    icon={<Icon d={["M13 10V3L4 14h7v7l9-11h-7z"]} stroke={D.purple} size={20} />}
                    iconBg="rgba(168,85,247,0.12)" label="AQI TRUNG BÌNH" value={summary?.averageAqi || summary?.AverageAqi || 0} sub="AQI (US)"
                />
                <StatCard
                    icon={<Icon d={["M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"]} stroke={D.red} size={20} />}
                    iconBg={D.redBg} label="CẢNH BÁO KHẨN CẤP" value={summary?.criticalAlerts || summary?.CriticalAlerts || 0} sub="Alerts"
                    badge="ATTENTION" badgeColor={D.red} badgeBg={D.redBg}
                />
            </div>

            <div style={{ display: "flex", gap: 16, minHeight: 380, flexWrap: "wrap" }}>
                {/* BẢN ĐỒ */}
                <div style={{ flex: 1.5, minWidth: 400, background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.cardBorder}`, background: D.headerBg }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Bản đồ Giám sát Mạng lưới</div>
                        <div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>Trực quan hóa mức độ ô nhiễm không khí tại các thành phố toàn quốc</div>
                    </div>
                    <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                        <MapContainer
                            center={[16.047079, 108.206230]}
                            zoom={5}
                            style={{ height: "100%", width: "100%", background: "#0d1520" }}
                            zoomControl={false}
                            attributionControl={false}
                        >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            {mapData.map((c, idx) => (
                                <CircleMarker
                                    key={idx}
                                    center={[c.latitude, c.longitude]}
                                    radius={c.calculatedAqi ? Math.min(8 + (c.calculatedAqi / 20), 20) : 6}
                                    pathOptions={{ color: c.colorHex || D.textMuted, fillColor: c.colorHex || D.textMuted, fillOpacity: 0.7 }}
                                >
                                    <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                                        <div style={{ textAlign: "center" }}>
                                            <strong>{c.provinceName}</strong><br />
                                            AQI: {c.calculatedAqi || "--"}
                                        </div>
                                    </LeafletTooltip>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* BIỂU ĐỒ XU HƯỚNG */}
                <div style={{ flex: 1, minWidth: 300, background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.cardBorder}`, background: D.headerBg }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Biến động AQI Trung bình (7 ngày)</div>
                        <div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>Dựa trên các trạm quan trắc đang hoạt động</div>
                    </div>
                    <div style={{ flex: 1, padding: "20px 20px 10px 0" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={D.blue} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={D.blue} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="label" stroke={D.textDim} fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke={D.textDim} fontSize={11} tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={D.cardBorder} />
                                <RechartsTooltip
                                    contentStyle={{ background: D.headerBg, border: `1px solid ${D.cardBorder}`, borderRadius: 8, color: D.text, fontSize: 12 }}
                                    itemStyle={{ color: D.blue }}
                                />
                                <Area type="monotone" dataKey="averageAqi" stroke={D.blue} strokeWidth={3} fillOpacity={1} fill="url(#colorAqi)" name="AQI Trung bình" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "stretch" }}>
                {/* DANH SÁCH CẢNH BÁO */}
                <div style={{ flex: 2, minWidth: 350, background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14 }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.cardBorder}`, display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Cảnh báo Trạng thái Hệ thống</div>
                        <div style={{ fontSize: 12, color: D.red, fontWeight: 600, background: D.redBg, padding: "2px 8px", borderRadius: 99 }}>{alerts?.length || 0} Alerts</div>
                    </div>
                    <div>
                        {paginatedAlerts && paginatedAlerts.length > 0 ? paginatedAlerts.map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: `1px solid ${D.cardBorder}` }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.colorHex || a.ColorHex || D.red, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{a.city || a.City}</div>
                                    <div style={{ fontSize: 12, color: D.textMuted }}>{a.message || a.Message}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: a.colorHex || a.ColorHex || D.red, textTransform: "uppercase" }}>{a.severity || a.Severity}</div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: 30, textAlign: "center", color: D.textMuted, fontSize: 13 }}>Không có cảnh báo mới nào.</div>
                        )}
                    </div>
                    {totalAlertPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '12px 20px', borderTop: `1px solid ${D.cardBorder}` }}>
                            <button
                                disabled={alertsPage === 1}
                                onClick={() => setAlertsPage(p => p - 1)}
                                style={{ padding: '4px 10px', background: 'transparent', border: `1px solid ${D.cardBorder}`, color: alertsPage === 1 ? D.textDim : D.text, borderRadius: 6, cursor: alertsPage === 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}
                            >
                                Trước
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: D.textMuted }}>
                                {alertsPage} / {totalAlertPages}
                            </span>
                            <button
                                disabled={alertsPage === totalAlertPages}
                                onClick={() => setAlertsPage(p => p + 1)}
                                style={{ padding: '4px 10px', background: 'transparent', border: `1px solid ${D.cardBorder}`, color: alertsPage === totalAlertPages ? D.textDim : D.text, borderRadius: 6, cursor: alertsPage === totalAlertPages ? 'not-allowed' : 'pointer', fontSize: 12 }}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>

                {/* RANKING THÀNH PHỐ */}
                <div style={{ flex: 1, minWidth: 300, background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14 }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.cardBorder}` }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Top Ô Nhiễm Nhất</div>
                    </div>
                    {(!cityRankings?.polluted?.length && !cityRankings?.Polluted?.length) ? (
                        <div style={{ padding: 30, textAlign: "center", color: D.textMuted, fontSize: 13 }}>Không đủ dữ liệu</div>
                    ) : (
                        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                            {(cityRankings.polluted || cityRankings.Polluted).map((item, index) => {
                                const color = item.colorHex || item.ColorHex || D.textMuted;
                                const rankColor = index === 0 ? "#fbbf24" : index === 1 ? "#9ca3af" : index === 2 ? "#d97706" : D.cardBorder;
                                return (
                                    <div key={index} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: index < 3 ? `${rankColor}15` : "transparent", border: `2px solid ${index < 3 ? rankColor : D.cardBorder}`, color: index < 3 ? rankColor : D.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: D.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.city || item.City}</div>
                                                <div style={{ fontSize: 16, fontWeight: 800, color: color }}>{item.aqi || item.Aqi}</div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ flex: 1, height: 6, background: `${color}20`, borderRadius: 4, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${Math.min(((item.aqi || item.Aqi) / 300) * 100, 100)}%`, background: color, borderRadius: 4 }} />
                                                </div>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: color, width: 70, textAlign: "right" }}>
                                                    {item.level || item.Level || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* THÀNH PHỐ TRONG LÀNH NHẤT */}
                <div style={{ flex: 1, minWidth: 300, background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14 }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.cardBorder}` }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Top Trong Lành Nhất</div>
                    </div>
                    {(!cityRankings?.cleanest?.length && !cityRankings?.Cleanest?.length) ? (
                        <div style={{ padding: 30, textAlign: "center", color: D.textMuted, fontSize: 13 }}>Không đủ dữ liệu</div>
                    ) : (
                        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                            {(cityRankings.cleanest || cityRankings.Cleanest).map((item, index) => {
                                const color = item.colorHex || item.ColorHex || D.textMuted;
                                const rankColor = index === 0 ? "#fbbf24" : index === 1 ? "#9ca3af" : index === 2 ? "#d97706" : D.cardBorder;
                                return (
                                    <div key={index} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: index < 3 ? `${rankColor}15` : "transparent", border: `2px solid ${index < 3 ? rankColor : D.cardBorder}`, color: index < 3 ? rankColor : D.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: D.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.city || item.City}</div>
                                                <div style={{ fontSize: 16, fontWeight: 800, color: color }}>{item.aqi || item.Aqi}</div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ flex: 1, height: 6, background: `${color}20`, borderRadius: 4, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${Math.min(((item.aqi || item.Aqi) / 50) * 100, 100)}%`, background: color, borderRadius: 4 }} />
                                                </div>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: color, width: 70, textAlign: "right" }}>
                                                    {item.level || item.Level || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* HOẠT ĐỘNG GẦN ĐÂY */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
                {/* Báo cáo cộng đồng */}
                <div style={{ background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14 }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.cardBorder}`, display: "flex", gap: 8, alignItems: "center" }}>
                        <Icon d={["M9 12l2 2 4-4", "M12 22S5 14 5 9a7 7 0 0114 0c0 5-7 13-7 13z"]} stroke={D.orange} />
                        <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Báo cáo điểm nóng</div>
                    </div>
                    <div>
                        {(recentActivities.communityReports || recentActivities.CommunityReports || []).map((r, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, padding: "14px 20px", borderBottom: i < 4 ? `1px solid ${D.cardBorder}` : "none" }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: D.orangeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon d={["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"]} size={16} stroke={D.orange} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: D.text, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>{r.description || r.Description}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: D.textMuted }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <Icon d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]} size={12} />
                                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{r.userFullName || r.UserFullName}</span>
                                        </div>
                                        <span>{formatTime(r.reportTime || r.ReportTime)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!(recentActivities.communityReports || recentActivities.CommunityReports || []).length && (
                            <div style={{ padding: 40, textAlign: "center", color: D.textMuted, fontSize: 13 }}>Không có báo cáo nào.</div>
                        )}
                    </div>
                </div>

                {/* Người dùng mới */}
                <div style={{ background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14 }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.cardBorder}`, display: "flex", gap: 8, alignItems: "center" }}>
                        <Icon d={["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 7a4 4 0 100-8 4 4 0 000 8z", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"]} stroke={D.blue} />
                        <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Người dùng đăng ký mới</div>
                    </div>
                    <div>
                        {(recentActivities.newUsers || recentActivities.NewUsers || []).map((u, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, padding: "14px 20px", borderBottom: i < 4 ? `1px solid ${D.cardBorder}` : "none", alignItems: "center" }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                    {(u.fullName || u.FullName)?.charAt(0)?.toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: D.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.fullName || u.FullName}</div>
                                    <div style={{ fontSize: 12, color: D.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email || u.Email}</div>
                                </div>
                                <div style={{ fontSize: 11, color: D.textMuted, whiteSpace: "nowrap" }}>
                                    {formatTime(u.createdAt || u.CreatedAt)}
                                </div>
                            </div>
                        ))}
                        {!(recentActivities.newUsers || recentActivities.NewUsers || []).length && (
                            <div style={{ padding: 40, textAlign: "center", color: D.textMuted, fontSize: 13 }}>Không có người dùng mới.</div>
                        )}
                    </div>
                </div>

                {/* Hộp thư liên hệ */}
                <div style={{ background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14 }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <Icon d={["M3 8l7.89 5.26a2 2 0 002.22 0L21 8", "M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"]} stroke={D.green} />
                            <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Liên hệ chờ xử lý</div>
                        </div>
                        <div style={{ fontSize: 10, padding: "3px 8px", background: D.greenBg, color: D.green, borderRadius: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Ưu tiên</div>
                    </div>
                    <div>
                        {(recentActivities.pendingContacts || recentActivities.PendingContacts || []).map((c, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, padding: "14px 20px", borderBottom: i < 4 ? `1px solid ${D.cardBorder}` : "none" }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: D.greenBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon d={["M22 12h-4l-3 9L9 3l-3 9H2"]} size={16} stroke={D.green} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: D.text, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.subject || c.Subject}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: D.textMuted }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <Icon d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]} size={12} />
                                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{c.fullName || c.FullName}</span>
                                        </div>
                                        <span>{formatTime(c.createdAt || c.CreatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!(recentActivities.pendingContacts || recentActivities.PendingContacts || []).length && (
                            <div style={{ padding: 40, textAlign: "center", color: D.textMuted, fontSize: 13 }}>Không có liên hệ chờ.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
