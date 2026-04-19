import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MainLayout from "../../components/layout/MainLayout";

/* ─── Design tokens ──────────────────────────────────────────── */
const T = {
    bg: "#f5f6f8",
    card: "#ffffff",
    green: "#0d6e4e",
    greenLight: "#e8f5ef",
    text: "#111827",
    textSub: "#6b7280",
    textLight: "#9ca3af",
    border: "#e5e7eb",
    shadow: "0 1px 4px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.05)",
    radius: 16,
    radiusSm: 10,
};

import { AQI_LEVELS, getLevel } from "../../utils/aqiHelper";

/* ─── Map icon ────────────────────────────────────────────────── */
function pinIcon(color) {
    return L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });
}

/* ─── Shared card wrapper ─────────────────────────────────────── */
function Card({ children, style }) {
    return (
        <div
            style={{
                background: T.card,
                borderRadius: T.radius,
                boxShadow: T.shadow,
                border: `1px solid ${T.border}`,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

/* ─── Section title ───────────────────────────────────────────── */
function SectionTitle({ children, icon }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>
                {children}
            </h2>
        </div>
    );
}

/* ─── Pollutant row ───────────────────────────────────────────── */
function PollutantRow({ label, value, unit, max }) {
    const raw = value != null ? Number(value) : null;
    const pct = raw != null ? Math.min(Math.round((raw / max) * 100), 100) : 0;
    const barColor = pct < 30 ? "#16a34a" : pct < 60 ? "#ca8a04" : pct < 80 ? "#ea580c" : "#dc2626";

    return (
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px", gap: "0 12px", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub }}>{label}</div>
            <div style={{ height: 6, borderRadius: 99, background: "#f3f4f6", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 99, transition: "width .5s ease" }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, textAlign: "right" }}>
                {raw != null ? raw.toFixed(1) : "—"}
                <span style={{ fontSize: 10, fontWeight: 400, color: T.textLight, marginLeft: 2 }}>{unit}</span>
            </div>
        </div>
    );
}

/* ─── Weather metric tiny card ────────────────────────────────── */
function WeatherItem({ icon, label, value }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "14px 8px",
                background: T.greenLight,
                borderRadius: T.radiusSm,
                flex: 1,
                minWidth: 0,
            }}
        >
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.green }}>{value}</span>
            <span style={{ fontSize: 10, color: T.textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
        </div>
    );
}

/* ─── History sparkline bar ───────────────────────────────────── */
function HistoryBar({ entry, maxAqi }) {
    const heightPct = maxAqi > 0 ? Math.max(Math.round((entry.calculatedAqi / maxAqi) * 64), 8) : 20;
    const lv = getLevel(entry.calculatedAqi);
    const ts = new Date(entry.timestamp);
    const timeLabel = `${ts.getHours().toString().padStart(2, "0")}:00`;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: "1 0 0", minWidth: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: lv.color }}>{entry.calculatedAqi}</span>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 64 }}>
                <div
                    style={{
                        width: "100%",
                        minWidth: 12,
                        height: heightPct,
                        background: lv.color,
                        borderRadius: "4px 4px 2px 2px",
                        opacity: 0.85,
                    }}
                />
            </div>
            <span style={{ fontSize: 9, color: T.textLight, whiteSpace: "nowrap" }}>{timeLabel}</span>
        </div>
    );
}

/* ─── Health icon ─────────────────────────────────────────────── */
function HealthTile({ icon, label, active }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: T.radiusSm,
                background: active ? T.greenLight : "#f9fafb",
                border: `1px solid ${active ? "#a7f3d0" : T.border}`,
            }}
        >
            <span style={{ fontSize: 22, opacity: active ? 1 : 0.35 }}>{icon}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? T.text : T.textLight }}>{label}</span>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                      */
/* ═══════════════════════════════════════════════════════════════ */
export default function StationDetailPage() {
    const { stationId } = useParams();
    const navigate = useNavigate();

    const [station, setStation] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [sRes, hRes] = await Promise.all([
                fetch(`/api/airquality/station/${stationId}`, { cache: "no-store" }),
                fetch(`/api/airquality/station/${stationId}/history?hours=24`, { cache: "no-store" }),
            ]);
            if (!sRes.ok) {
                const body = await sRes.json().catch(() => ({}));
                throw new Error(body.message || "Không tìm thấy trạm.");
            }
            const sd = await sRes.json();
            const hd = hRes.ok ? await hRes.json() : [];
            setStation(sd);
            setHistory(Array.isArray(hd) ? hd.slice().reverse() : []);
        } catch (err) {
            setError(err.message ?? "Đã có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    }, [stationId]);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── Loading ── */
    if (loading) {
        return (
            <MainLayout activePage="Du lieu chat luong khong khi">
                <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 92 }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", border: `4px solid ${T.border}`, borderTopColor: T.green, animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ color: T.textSub, fontSize: 14, margin: 0 }}>Đang tải dữ liệu trạm…</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    /* ── Error ── */
    if (error || !station) {
        return (
            <MainLayout activePage="Du lieu chat luong khong khi">
                <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: 92 }}>
                    <span style={{ fontSize: 40 }}>🔍</span>
                    <p style={{ color: T.textSub, fontSize: 15, margin: 0 }}>{error || "Không tìm thấy trạm."}</p>
                    <button onClick={() => navigate("/du-lieu")} style={{ padding: "10px 22px", borderRadius: T.radiusSm, background: T.green, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                        ← Quay lại bản đồ
                    </button>
                </div>
            </MainLayout>
        );
    }

    const aqi = station.calculatedAqi ?? 0;
    const lv = getLevel(aqi);
    const maxHistAqi = history.length ? Math.max(...history.map((h) => h.calculatedAqi)) : 1;

    const cityParts = (station.city ?? "").split(",").map((p) => p.trim()).filter(Boolean);
    const province = cityParts[cityParts.length - 1] ?? station.city ?? "";
    const district = cityParts[0] ?? "";

    const updatedAt = station.timestamp
        ? new Date(station.timestamp).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
        : "--";

    const healthTiles =
        aqi <= 50
            ? [
                { icon: "😷", label: "Không cần khẩu trang", active: false },
                { icon: "🪟", label: "Thoải mái mở cửa", active: true },
                { icon: "🏃", label: "Tập thể dục lý tưởng", active: true },
                { icon: "💨", label: "Máy lọc chưa cần thiết", active: false },
            ]
            : aqi <= 100
                ? [
                    { icon: "😷", label: "Chưa cần khẩu trang", active: false },
                    { icon: "🪟", label: "Nên mở cửa thoáng", active: true },
                    { icon: "🏃", label: "Vẫn có thể tập ngoài trời", active: true },
                    { icon: "💨", label: "Máy lọc hữu ích", active: true },
                ]
                : [
                    { icon: "😷", label: "Nên đeo khẩu trang", active: true },
                    { icon: "🏠", label: "Hạn chế ra ngoài", active: true },
                    { icon: "🚫", label: "Hạn chế tập ngoài trời", active: true },
                    { icon: "💨", label: "Dùng máy lọc không khí", active: true },
                ];

    return (
        <MainLayout activePage="Du lieu chat luong khong khi">
            <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 80, paddingBottom: 48, fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
                <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>

                    {/* ── Top nav bar ──────────────────────────── */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                        {/* Breadcrumb */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.textSub }}>
                            <button
                                onClick={() => navigate("/du-lieu")}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 99, background: T.card, border: `1px solid ${T.border}`, color: T.textSub, fontWeight: 600, cursor: "pointer", fontSize: 12, boxShadow: T.shadow }}
                            >
                                ← Bản đồ
                            </button>
                            <span style={{ color: T.border }}>·</span>
                            <Link to="/" style={{ color: T.textSub, textDecoration: "none" }}>Việt Nam</Link>
                            {province && <><span>›</span><span>{province}</span></>}
                            {district && district !== province && <><span>›</span><span style={{ color: T.text, fontWeight: 600 }}>{district}</span></>}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 8 }}>
                            {[
                                { icon: "♥", label: "Yêu thích" },
                                { icon: "🔔", label: "Cảnh báo" },
                                { icon: "↗", label: "Chia sẻ" },
                            ].map((b) => (
                                <button
                                    key={b.label}
                                    title={b.label}
                                    style={{ padding: "7px 12px", borderRadius: 99, background: T.card, border: `1px solid ${T.border}`, color: T.textSub, cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: T.shadow }}
                                >
                                    {b.icon} {b.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Station title ──────────────────────────── */}
                    <div style={{ marginBottom: 20 }}>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: T.text }}>
                            {station.stationName}
                        </h1>
                        <div style={{ marginTop: 4, fontSize: 13, color: T.textSub }}>
                            📍 {station.city} &nbsp;·&nbsp; Cập nhật: {updatedAt} &nbsp;
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════ */}
                    {/* ROW 1: AQI hero + Weather                   */}
                    {/* ═══════════════════════════════════════════ */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                        {/* AQI Hero */}
                        <Card style={{ padding: "28px 28px 24px", background: lv.bg, border: `1.5px solid ${lv.color}22` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: lv.color, marginBottom: 4 }}>
                                        Chỉ số AQI
                                    </div>
                                    <div style={{ fontSize: 80, fontWeight: 900, color: lv.color, lineHeight: 1, letterSpacing: -2 }}>
                                        {aqi}
                                    </div>
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 12,
                                            marginTop: 16,
                                            padding: "10px 24px 10px 16px",
                                            borderRadius: 99,
                                            background: lv.badge,
                                            border: `1px solid ${lv.color}33`,
                                        }}
                                    >
                                        <img src={lv.icon} alt={lv.label} style={{ width: 60, height: 60, flexShrink: 0 }} />
                                        <span style={{ fontSize: 30, fontWeight: 800, color: lv.color }}>{lv.label}</span>
                                    </div>
                                </div>

                                {/* AQI scale gauge */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                    <div style={{ fontSize: 10, color: T.textLight, fontWeight: 600, textTransform: "uppercase" }}>Thang đo</div>
                                    <div style={{ position: "relative", width: 12, height: 120, borderRadius: 99, background: "linear-gradient(to top, #16a34a, #ca8a04, #ea580c, #dc2626, #9333ea, #be123c)", overflow: "hidden" }}>
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: `${Math.min(Math.round((aqi / 500) * 100), 96)}%`,
                                                left: "50%",
                                                transform: "translate(-50%, 50%)",
                                                width: 16,
                                                height: 16,
                                                borderRadius: "50%",
                                                background: "#fff",
                                                border: `3px solid ${lv.color}`,
                                                boxShadow: `0 0 0 2px ${lv.color}44`,
                                            }}
                                        />
                                    </div>
                                    <div style={{ fontSize: 9, color: T.textLight }}>500</div>
                                </div>
                            </div>

                            {/* Health advice strip */}
                            {station.healthAdvice && (
                                <div style={{ marginTop: 20, padding: "10px 14px", borderRadius: T.radiusSm, background: "#fff8", border: `1px solid ${lv.color}22`, fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>
                                    ℹ️ {station.healthAdvice}
                                </div>
                            )}
                        </Card>

                        {/* Weather */}
                        <Card style={{ padding: "24px" }}>
                            <SectionTitle icon="🌤️">Thời tiết tại trạm</SectionTitle>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <WeatherItem icon="🌡️" label="Nhiệt độ" value={station.temperature != null ? `${Math.round(station.temperature)}°C` : "—"} />
                                <WeatherItem icon="💧" label="Độ ẩm" value={station.humidity != null ? `${Math.round(station.humidity)}%` : "—"} />
                                <WeatherItem icon="💨" label="Gió" value={station.windSpeed != null ? `${Math.round(station.windSpeed)} km/h` : "—"} />
                                <WeatherItem icon="⬇️" label="Áp suất" value={station.pressure != null ? `${Math.round(station.pressure)}` : "—"} />
                            </div>
                            {station.pressure != null && (
                                <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: T.textLight }}>áp suất đơn vị hPa</div>
                            )}

                            {/* AQI range bar */}
                            <div style={{ marginTop: 20 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: T.textLight }}>
                                    <span>0</span><span>100</span><span>200</span><span>300</span><span>500</span>
                                </div>
                                <div style={{ position: "relative", height: 8, borderRadius: 99, background: "linear-gradient(to right, #16a34a, #ca8a04, #ea580c, #dc2626, #9333ea, #be123c)" }}>
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: `${Math.min((aqi / 500) * 100, 97)}%`,
                                            top: "50%",
                                            transform: "translate(-50%, -50%)",
                                            width: 14, height: 14,
                                            borderRadius: "50%",
                                            background: "#fff",
                                            border: `3px solid ${lv.color}`,
                                            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: T.textLight }}>
                                    {["Tốt", "Trung bình", "Kém", "Xấu", "Nguy hại"].map((l) => <span key={l}>{l}</span>)}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ═══════════════════════════════════════════ */}
                    {/* ROW 2: Pollutants                           */}
                    {/* ═══════════════════════════════════════════ */}
                    <Card style={{ padding: "24px", marginBottom: 16 }}>
                        <SectionTitle icon="🧪">Chỉ số chất ô nhiễm</SectionTitle>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                            <div>
                                <PollutantRow label="PM2.5" value={station.pm25} unit="μg/m³" max={500} />
                                <PollutantRow label="PM10" value={station.pm10} unit="μg/m³" max={600} />
                                <PollutantRow label="O₃" value={station.o3} unit="μg/m³" max={200} />
                            </div>
                            <div>
                                <PollutantRow label="NO₂" value={station.no2} unit="μg/m³" max={200} />
                                <PollutantRow label="SO₂" value={station.so2} unit="μg/m³" max={200} />
                                <PollutantRow label="CO" value={station.co} unit="μg/m³" max={50} />
                            </div>
                        </div>
                    </Card>

                    {/* ═══════════════════════════════════════════ */}
                    {/* ROW 3: History + Health + Map               */}
                    {/* ═══════════════════════════════════════════ */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
                        {/* Left column */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                            {/* History */}
                            <Card style={{ padding: "24px" }}>
                                <SectionTitle icon="📈">Lịch sử 24 giờ gần nhất</SectionTitle>
                                {history.length > 0 ? (
                                    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", overflowX: "auto", paddingBottom: 4 }}>
                                        {history.map((h, i) => <HistoryBar key={i} entry={h} maxAqi={maxHistAqi} />)}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "36px 0" }}>
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>Tính năng giới hạn</div>
                                        <div style={{ fontSize: 12.5, color: T.textSub, marginBottom: 16 }}>
                                            Nâng cấp tài khoản để xem lịch sử AQI và dự báo AI 7 ngày
                                        </div>
                                        <button style={{ padding: "10px 22px", borderRadius: 99, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                                            Nâng cấp Pro
                                        </button>
                                    </div>
                                )}
                            </Card>

                            {/* Health */}
                            <Card style={{ padding: "24px" }}>
                                <SectionTitle icon="💚">Khuyến nghị sức khỏe</SectionTitle>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                    {healthTiles.map((h, i) => <HealthTile key={i} {...h} />)}
                                </div>
                            </Card>
                        </div>

                        {/* Right column: mini map */}
                        <Card style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            <div style={{ padding: "18px 18px 12px" }}>
                                <SectionTitle icon="🗺️">Vị trí trạm</SectionTitle>
                            </div>
                            <div style={{ flex: 1, minHeight: 220 }}>
                                <MapContainer
                                    center={[station.latitude, station.longitude]}
                                    zoom={14}
                                    style={{ height: "100%", minHeight: 220, width: "100%" }}
                                    zoomControl={false}
                                    attributionControl={false}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker
                                        position={[station.latitude, station.longitude]}
                                        icon={pinIcon(lv.color)}
                                    />
                                </MapContainer>
                            </div>
                            {/* AQI badge */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "14px 16px",
                                    background: lv.bg,
                                    borderTop: `1px solid ${lv.color}22`,
                                }}
                            >
                                <div
                                    style={{
                                        width: 44, height: 44, borderRadius: 10,
                                        background: lv.badge,
                                        border: `2px solid ${lv.color}44`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 22, fontWeight: 900, color: lv.color,
                                    }}
                                >
                                    {aqi}
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lv.label}</div>
                                    <div style={{ fontSize: 11, color: T.textSub, marginTop: 1 }}>{station.stationName}</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* AI PRO banner */}
                    <Card style={{ marginTop: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "linear-gradient(120deg, #f0fdf4, #fff)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Dự báo AI 7 ngày</div>
                                <div style={{ fontSize: 12, color: T.textSub, marginTop: 1 }}>Phân tích xu hướng không khí bằng trí tuệ nhân tạo</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button style={{ padding: "9px 18px", borderRadius: 99, background: "#f3f4f6", color: T.textSub, border: `1px solid ${T.border}`, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                                ⬇ Xuất CSV
                            </button>
                            <button style={{ padding: "9px 18px", borderRadius: 99, background: T.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                                ⭐ Nâng cấp Pro
                            </button>
                        </div>
                    </Card>

                </div>
            </div>
        </MainLayout>
    );
}
