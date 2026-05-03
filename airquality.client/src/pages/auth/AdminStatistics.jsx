import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, CartesianGrid, PieChart, Pie, Legend,
} from "recharts";

// ─── Dark Design Tokens (matches AdminLayout) ─────────────────────────────────
const D = {
    bg: "#0f1923",
    card: "#14202e",
    cardBorder: "#1e3048",
    text: "#e8edf3",
    textMuted: "#7a8da0",
    textDim: "#4a5d70",
    green: "#22c55e",
    greenBg: "rgba(34,197,94,0.12)",
    blue: "#3b82f6",
    blueBg: "rgba(59,130,246,0.12)",
    orange: "#f97316",
    orangeBg: "rgba(249,115,22,0.12)",
    red: "#ef4444",
    redBg: "rgba(239,68,68,0.12)",
    yellow: "#eab308",
    purple: "#a855f7",
    purpleBg: "rgba(168,85,247,0.12)",
    font: "'Be Vietnam Pro','Segoe UI',sans-serif",
};

function Icon({ d, size = 18, stroke = D.textMuted, fill = "none", sw = 1.8 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
        </svg>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, label, value, sub, accent = D.green }) {
    return (
        <div style={{
            background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14,
            padding: "20px", flex: 1, minWidth: 200,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontSize: 12, color: D.textMuted, marginBottom: 8 }}>{label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
                    {sub && <div style={{ fontSize: 12, color: D.textMuted, marginTop: 8 }}>{sub}</div>}
                </div>
                <div style={{
                    width: 44, height: 44, borderRadius: 12, background: iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ title, subtitle, action, children, style = {} }) {
    return (
        <div style={{
            background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14,
            padding: "20px 22px", ...style,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: D.text }}>{title}</div>
                    {subtitle && <div style={{ fontSize: 12, color: D.textMuted, marginTop: 3 }}>{subtitle}</div>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

// ─── Formatted currency ───────────────────────────────────────────────────────
function fmt(n) {
    return new Intl.NumberFormat("vi-VN").format(n);
}
function fmtDate(d) {
    if (!d) return "—";
    const date = new Date(typeof d === "string" && !d.endsWith("Z") ? `${d}Z` : d);
    return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, suffix = "" }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#0b1219", border: `1px solid ${D.cardBorder}`, borderRadius: 8,
            padding: "10px 14px", fontSize: 12, color: D.text,
        }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name}: <strong>{fmt(p.value)}{suffix}</strong>
                </div>
            ))}
        </div>
    );
}

// ─── Pie Label ────────────────────────────────────────────────────────────────
function renderPieLabel({ name, percent }) {
    return `${name} ${(percent * 100).toFixed(0)}%`;
}

const PIE_COLORS = [D.green, D.blue, D.orange];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminStatistics() {
    const { accessToken } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [days, setDays] = useState(30);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        let ignore = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/admin/statistics/summary?days=${days}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (!res.ok) throw new Error("Lỗi tải thống kê");
                const json = await res.json();
                if (!ignore) setData(json);
            } catch (e) {
                if (!ignore) setError(e.message);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        load();
        return () => { ignore = true; };
    }, [accessToken, days]);

    async function handleExport() {
        setExporting(true);
        try {
            const res = await fetch("/api/admin/statistics/export-csv", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `EcoAir_Statistics_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            alert("Không thể xuất báo cáo. Vui lòng thử lại.");
        } finally {
            setExporting(false);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center", color: D.textMuted, fontFamily: D.font }}>
                ⏳ Đang tải dữ liệu thống kê...
            </div>
        );
    }
    if (error) {
        return (
            <div style={{
                padding: 20, background: D.redBg, border: `1px solid ${D.red}`,
                borderRadius: 12, color: D.red, fontFamily: D.font,
            }}>
                ❌ {error}
            </div>
        );
    }
    if (!data) return null;

    const tierData = [
        { name: "Free", value: data.users?.byTier?.free ?? 0 },
        { name: "Pro", value: data.users?.byTier?.pro ?? 0 },
        { name: "Hết hạn", value: data.users?.byTier?.expired ?? 0 },
    ].filter(d => d.value > 0);

    const aqiDist = data.aqi?.distribution ?? [];

    return (
        <div style={{ fontFamily: D.font, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* ── Header ── */}
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 12,
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: D.text }}>
                        📊 Thống kê & Báo cáo
                    </h2>
                    <div style={{ fontSize: 13, color: D.textMuted, marginTop: 4 }}>
                        Tổng hợp doanh thu, người dùng, dữ liệu AQI và báo cáo cộng đồng
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* Time filter */}
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            style={{
                                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                border: "none", cursor: "pointer",
                                background: days === d ? D.green : D.card,
                                color: days === d ? "white" : D.textMuted,
                            }}
                        >
                            {d} ngày
                        </button>
                    ))}
                    {/* Export */}
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        style={{
                            padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            border: `1px solid ${D.blue}`, cursor: "pointer",
                            background: D.blueBg, color: D.blue,
                            opacity: exporting ? 0.6 : 1,
                        }}
                    >
                        {exporting ? "Đang xuất..." : "📥 Xuất CSV"}
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <StatCard
                    label="Tổng doanh thu"
                    value={`${fmt(data.revenue?.total ?? 0)}₫`}
                    sub={`Tháng này: ${fmt(data.revenue?.thisMonth ?? 0)}₫`}
                    accent={D.green}
                    iconBg={D.greenBg}
                    icon={<span style={{ fontSize: 20 }}>💰</span>}
                />
                <StatCard
                    label="Tổng người dùng"
                    value={fmt(data.users?.total ?? 0)}
                    sub={`Mới tháng này: +${fmt(data.users?.thisMonth ?? 0)}`}
                    accent={D.blue}
                    iconBg={D.blueBg}
                    icon={<span style={{ fontSize: 20 }}>👥</span>}
                />
                <StatCard
                    label="Dữ liệu AQI"
                    value={fmt(data.aqi?.totalObservations ?? 0)}
                    sub={`AQI TB toàn quốc: ${data.aqi?.avgAqi ?? "—"}`}
                    accent={D.orange}
                    iconBg={D.orangeBg}
                    icon={<span style={{ fontSize: 20 }}>📈</span>}
                />
                <StatCard
                    label="Báo cáo cộng đồng"
                    value={fmt(data.reports?.total ?? 0)}
                    sub={`Đã duyệt: ${data.reports?.approved ?? 0} · Chờ: ${data.reports?.pending ?? 0}`}
                    accent={D.purple}
                    iconBg={D.purpleBg}
                    icon={<span style={{ fontSize: 20 }}>📝</span>}
                />
            </div>

            {/* ── Row 1: Revenue + User Growth ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Section title="Doanh thu theo thời gian" subtitle={`${days} ngày gần nhất (VNĐ)`}>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenue?.trend ?? []}>
                                <defs>
                                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={D.green} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={D.green} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: D.textDim }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: D.textDim }} tickLine={false} axisLine={false} width={55}
                                    tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                                <Tooltip content={<ChartTooltip suffix="₫" />} />
                                <Area type="monotone" dataKey="amount" name="Doanh thu" stroke={D.green} fill="url(#revFill)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Section>

                <Section title="Người dùng mới" subtitle={`${days} ngày gần nhất`}>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.users?.growth ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: D.textDim }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: D.textDim }} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="count" name="Đăng ký mới" fill={D.blue} radius={[4, 4, 0, 0]} barSize={14} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Section>
            </div>

            {/* ── Row 2: Subscription Pie + AQI Distribution ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Section title="Phân bổ gói đăng ký" subtitle="Free / Pro / Hết hạn">
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={tierData}
                                    cx="50%" cy="50%"
                                    innerRadius={55} outerRadius={90}
                                    dataKey="value"
                                    label={renderPieLabel}
                                    labelLine={{ stroke: D.textDim }}
                                >
                                    {tierData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend
                                    wrapperStyle={{ fontSize: 12, color: D.textMuted }}
                                    formatter={(val) => <span style={{ color: D.textMuted }}>{val}</span>}
                                />
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Section>

                <Section title="Phân bổ mức AQI toàn quốc" subtitle="Dựa trên snapshot mới nhất các thành phố">
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aqiDist} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: D.textDim }} tickLine={false} axisLine={false} allowDecimals={false} />
                                <YAxis type="category" dataKey="level" tick={{ fontSize: 11, fill: D.textMuted }} tickLine={false} axisLine={false} width={110} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="count" name="Số TP" radius={[0, 6, 6, 0]} barSize={18}>
                                    {aqiDist.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Section>
            </div>

            {/* ── Row 3: Recent Payments Table + Top Polluted ── */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Section title="Giao dịch gần đây" subtitle="10 thanh toán mới nhất">
                    <div style={{ overflowX: "auto" }}>
                        <table style={{
                            width: "100%", borderCollapse: "collapse", fontSize: 13,
                            color: D.text,
                        }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${D.cardBorder}` }}>
                                    {["Người dùng", "Số tiền", "Trạng thái", "NCC", "Thời gian"].map(h => (
                                        <th key={h} style={{
                                            padding: "10px 12px", textAlign: "left",
                                            fontSize: 11, fontWeight: 600, color: D.textMuted,
                                            textTransform: "uppercase", letterSpacing: 0.5,
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(data.recentPayments ?? []).map((p, i) => (
                                    <tr key={i} style={{
                                        borderBottom: `1px solid ${D.cardBorder}`,
                                        transition: "background 0.15s",
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "10px 12px", fontWeight: 500 }}>{p.userName}</td>
                                        <td style={{ padding: "10px 12px", fontWeight: 700, color: D.green }}>
                                            {fmt(p.amountVnd)}₫
                                        </td>
                                        <td style={{ padding: "10px 12px" }}>
                                            <span style={{
                                                display: "inline-block", padding: "2px 10px", borderRadius: 6,
                                                fontSize: 11, fontWeight: 600,
                                                background: p.status === "Success" ? D.greenBg : p.status === "Pending" ? D.orangeBg : D.redBg,
                                                color: p.status === "Success" ? D.green : p.status === "Pending" ? D.orange : D.red,
                                            }}>
                                                {p.status === "Success" ? "✓ Đã TT" : p.status === "Pending" ? "⏳ Chờ" : "✗ Lỗi"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "10px 12px", color: D.textMuted }}>{p.provider}</td>
                                        <td style={{ padding: "10px 12px", color: D.textMuted, fontSize: 12 }}>
                                            {fmtDate(p.paidAt || p.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                                {!(data.recentPayments?.length) && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 20, textAlign: "center", color: D.textDim }}>
                                            Chưa có giao dịch nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Section>

                <Section title="Top thành phố ô nhiễm" subtitle="AQI cao nhất hiện tại">
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(data.topPolluted ?? []).map((c, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "10px 14px", background: "rgba(255,255,255,0.02)",
                                borderRadius: 10, border: `1px solid ${D.cardBorder}`,
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: c.color, display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0,
                                }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{c.city}</div>
                                    <div style={{ fontSize: 11, color: D.textMuted }}>{c.level}</div>
                                </div>
                                <div style={{
                                    fontSize: 20, fontWeight: 800, color: c.color,
                                }}>
                                    {c.aqi}
                                </div>
                            </div>
                        ))}
                        {!(data.topPolluted?.length) && (
                            <div style={{ textAlign: "center", color: D.textDim, padding: 20, fontSize: 13 }}>
                                Không có dữ liệu
                            </div>
                        )}
                    </div>
                </Section>
            </div>
        </div>
    );
}
