/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Box, Stack, useMediaQuery } from "@mui/material";
import { MapContainer, Marker, TileLayer, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MainLayout from "../../components/layout/MainLayout";
import { getLevel, getHealthTiles } from "../../utils/aqiHelper";
import { useAuth } from "../../hooks/useAuth";
import HistoryChart from "../../components/common/HistoryChart";
import { formatDbDateTime } from "../../utils/datetime";

/* ─── Design tokens ─────────────────────────────────────────────── */
const C = {
    bg: "#0b0f19",
    surface: "#111827",
    card: "#161d2e",
    cardBorder: "#1e2d44",
    green: "#10b981",
    greenDim: "#064e3b",
    text: "#f1f5f9",
    textSub: "#94a3b8",
    textMuted: "#64748b",
    accent: "#3b82f6",
    accentDim: "#1e3a5f",
    radius: 16,
    radiusSm: 10,
};

/* ─── Utility ───────────────────────────────────────────────────── */
function hexToRgb(hex, a = 1) {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
    const n = parseInt(full, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function fmt(val, decimals = 1) {
    if (val == null) return "—";
    return Number(val).toFixed(decimals);
}

function fmtTime(ts) {
    return formatDbDateTime(ts, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function windDir(deg) {
    if (deg == null) return "—";
    const dirs = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"];
    return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

/* ─── Shared Components ─────────────────────────────────────────── */
function GlassCard({ children, style, glowColor }) {
    return (
        <div style={{
            background: C.card,
            borderRadius: C.radius,
            border: `1px solid ${glowColor ? hexToRgb(glowColor, 0.25) : C.cardBorder}`,
            boxShadow: glowColor ? `0 0 28px ${hexToRgb(glowColor, 0.08)}, inset 0 1px 0 ${hexToRgb(glowColor, 0.1)}` : "none",
            ...style,
        }}>
            {children}
        </div>
    );
}

function Pill({ label, value, unit, color }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", gap: 4,
            padding: "14px 18px", borderRadius: C.radiusSm,
            background: hexToRgb(color || C.accent, 0.08),
            border: `1px solid ${hexToRgb(color || C.accent, 0.2)}`,
        }}>
            <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: color || C.text }}>
                {value ?? "—"}
                {unit && <span style={{ fontSize: 12, fontWeight: 400, color: C.textSub, marginLeft: 3 }}>{unit}</span>}
            </span>
        </div>
    );
}

function AqiBar({ label, value, max = 300, color }) {
    const pct = value != null ? Math.min(((value / max) * 100), 100) : 0;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
            <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: C.textSub, flexShrink: 0 }}>{label}</div>
            <div style={{ flex: 1, height: 6, borderRadius: 99, background: hexToRgb("#fff", 0.06), overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width .6s ease" }} />
            </div>
            <div style={{ width: 48, fontSize: 13, fontWeight: 800, color: color ?? C.text, textAlign: "right" }}>
                {value != null ? Math.round(value) : "—"}
            </div>
        </div>
    );
}



function StationCard({ station, onNavigate }) {
    const lv = getLevel(station.calculatedAqi ?? 0);
    return (
        <div
            onClick={() => onNavigate(`/tram/${station.stationId}`)}
            style={{
                padding: "14px 16px",
                borderRadius: C.radiusSm,
                background: hexToRgb(lv.color, 0.06),
                border: `1px solid ${hexToRgb(lv.color, 0.2)}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "all .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = hexToRgb(lv.color, 0.12)}
            onMouseLeave={e => e.currentTarget.style.background = hexToRgb(lv.color, 0.06)}
        >
            {/* AQI bubble */}
            <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: hexToRgb(lv.color, 0.18),
                border: `2px solid ${hexToRgb(lv.color, 0.5)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 900, color: lv.color,
            }}>
                {station.hasData ? station.calculatedAqi : "—"}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {station.stationName}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                    {station.hasData ? lv.label : "Chưa có dữ liệu"}
                    {station.provider && !station.provider.startsWith("tedp:") && ` · ${station.provider}`}
                </div>
            </div>
            {/* PM2.5 */}
            {station.hasData && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{fmt(station.pm25)}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>µg/m³ PM2.5</div>
                </div>
            )}
        </div>
    );
}

/* ─── Loading Skeleton ───────────────────────────────────────────── */
function Skeleton({ width, height, style }) {
    return (
        <div style={{
            width: width ?? "100%", height: height ?? 20,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${C.card} 25%, ${hexToRgb("#fff", 0.04)} 50%, ${C.card} 75%)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            ...style,
        }} />
    );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                          */
/* ═══════════════════════════════════════════════════════════════════ */
export default function CityDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:600px)");
    const isTablet = useMediaQuery("(max-width:900px)");

    const [city, setCity] = useState(null);
    const [history, setHistory] = useState([]);
    const [stations, setStations] = useState(null);  // null = loading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isFav, setIsFav] = useState(false);
    const { isLoggedIn, accessToken } = useAuth();

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [cRes, hRes, sRes] = await Promise.all([
                fetch(`/api/city/${slug}`, { cache: "no-store" }),
                fetch(`/api/city/${slug}/history?hours=24`, { cache: "no-store" }),
                fetch(`/api/city/${slug}/stations`, { cache: "no-store" }),
            ]);

            if (!cRes.ok) {
                const body = await cRes.json().catch(() => ({}));
                throw new Error(body.message || "Không tìm thấy thành phố.");
            }

            const cityData = await cRes.json();
            const histData = hRes.ok ? await hRes.json() : [];
            const stData = sRes.ok ? await sRes.json() : null;

            setCity(cityData);
            setHistory(Array.isArray(histData) ? [...histData].reverse() : []);
            setStations(stData);
        } catch (err) {
            setError(err.message ?? "Đã có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // Check favorite status once city data is loaded
    useEffect(() => {
        if (!isLoggedIn || !city?.cityId) return;
        fetch(`/api/favorite-places/check?type=city&id=${city.cityId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(r => r.ok ? r.json() : { isFavorite: false })
            .then(d => setIsFav(d.isFavorite))
            .catch(() => { });
    }, [city?.cityId, isLoggedIn, accessToken]);

    const toggleFav = async () => {
        if (!isLoggedIn || !city?.cityId) return;
        const method = isFav ? "DELETE" : "POST";
        try {
            const res = await fetch(`/api/favorite-places/cities/${city.cityId}`, {
                method,
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) setIsFav(!isFav);
        } catch { /* empty */ }
    };

    useEffect(() => {
        if (loading) {
            document.title = "Đang tải thành phố | EcoAir VN";
            return;
        }

        if (error || !city) {
            document.title = "Không tìm thấy thành phố | EcoAir VN";
            return;
        }

        document.title = `${city.provinceName} | Chất lượng không khí | EcoAir VN`;
    }, [loading, error, city]);

    /* ── Loading ── */
    if (loading) {
        return (
            <MainLayout activePage="Du lieu chat luong khong khi">
                <style>{`
                    @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
                <div style={{ background: C.bg, minHeight: "100vh", paddingTop: 90, fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif" }}>
                    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                        <Skeleton height={280} style={{ borderRadius: C.radius }} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <Skeleton height={200} />
                            <Skeleton height={200} />
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    /* ── Error ── */
    if (error || !city) {
        return (
            <MainLayout activePage="Du lieu chat luong khong khi">
                <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif" }}>
                    <div style={{ fontSize: 56 }}>🏙️</div>
                    <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>Không tìm thấy thành phố</div>
                    <div style={{ color: C.textSub, fontSize: 14 }}>{error}</div>
                    <button onClick={() => navigate("/")} style={{ marginTop: 8, padding: "10px 24px", borderRadius: 99, background: C.green, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                        ← Về trang chủ
                    </button>
                </div>
            </MainLayout>
        );
    }

    const lv = getLevel(city.calculatedAqi ?? 0);
    const maxHist = history.length ? Math.max(...history.map(h => h.calculatedAqi ?? 0)) || 1 : 1;
    const stationList = stations?.stations ?? [];
    const hasStations = stations?.hasStations && stationList.length > 0;
    const weatherIcon = city.weatherIcon
        ? `https://openweathermap.org/img/wn/${city.weatherIcon}@2x.png`
        : null;

    // Dominant pollutant color mapping
    const polColors = {
        "PM2.5": "#f59e0b", "PM10": "#f97316", "CO": "#22c55e",
        "NO₂": "#8b5cf6", "SO₂": "#ec4899", "O₃": "#06b6d4", "NH₃": "#84cc16"
    };

    return (
        <MainLayout activePage="Du lieu chat luong khong khi">
            <style>{`
                @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: ${C.cardBorder}; border-radius: 99px; }
            `}</style>

            <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif", color: C.text }}>

                {/* ─── HERO HEADER ──────────────────────────────────── */}
                <div style={{
                    background: `linear-gradient(135deg, ${hexToRgb(lv.color, 0.15)} 0%, ${hexToRgb("#0b0f19", 1)} 60%)`,
                    borderBottom: `1px solid ${hexToRgb(lv.color, 0.2)}`,
                    paddingTop: 90, paddingBottom: 0,
                    position: "relative", overflow: "hidden",
                }}>
                    {/* Decorative glow */}
                    <div style={{
                        position: "absolute", top: -120, right: -80,
                        width: 400, height: 400, borderRadius: "50%",
                        background: hexToRgb(lv.color, 0.08),
                        filter: "blur(80px)", pointerEvents: "none",
                    }} />

                    <div style={{ maxWidth: 1120, margin: "0 auto", padding: isMobile ? "16px 10px 0" : "24px 20px 0" }}>

                        {/* Breadcrumb */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: C.textSub, flexWrap: "wrap" }}>
                            <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 99, background: hexToRgb("#fff", 0.06), border: `1px solid ${C.cardBorder}`, color: C.textSub, fontWeight: 600, cursor: "pointer", fontSize: 12, minHeight: 44 }}>
                                ← Trang chủ
                            </button>
                            <span style={{ color: C.textMuted }}>›</span>
                            <Link to="/du-lieu" style={{ color: C.textSub, textDecoration: "none" }}>Bản đồ</Link>
                            <span style={{ color: C.textMuted }}>›</span>
                            <span style={{ color: C.text, fontWeight: 600 }}>{city.provinceName}</span>
                            {isLoggedIn && (
                                <button
                                    onClick={toggleFav}
                                    title={isFav ? "Bỏ Yêu thích" : "Yêu thích"}
                                    style={{
                                        marginLeft: 8, padding: "8px 14px", borderRadius: 99,
                                        background: isFav ? "rgba(239,68,68,0.15)" : hexToRgb("#fff", 0.06),
                                        border: `1px solid ${isFav ? "#ef4444" : C.cardBorder}`,
                                        color: isFav ? "#ef4444" : C.textSub,
                                        cursor: "pointer", fontSize: 12, fontWeight: 600, minHeight: 44,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {isFav ? "Đã theo dõi" : "Theo dõi"}
                                </button>
                            )}
                        </div>

                        {/* Title row */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>

                            {/* Left – name + update */}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
                                    <span style={{ fontSize: 12, color: C.textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                        Dữ liệu thời gian thực · {city.region}
                                    </span>
                                </div>
                                <h1 style={{ margin: 0, fontSize: isMobile ? 26 : 36, fontWeight: 900, color: C.text, letterSpacing: -0.5 }}>
                                    {city.provinceName}
                                </h1>
                                <div style={{ marginTop: 4, fontSize: 12.5, color: C.textMuted }}>
                                    Cập nhật: {fmtTime(city.timestamp)}
                                </div>
                            </div>

                            {/* Right – AQI badge */}
                            <div style={{
                                display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6,
                                padding: "16px 24px", borderRadius: C.radius,
                                background: hexToRgb(lv.color, 0.12),
                                border: `1px solid ${hexToRgb(lv.color, 0.3)}`,
                            }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: lv.color, textTransform: "uppercase", letterSpacing: 1 }}>
                                    AQI (US) · {city.dominantPollutant ?? "—"}
                                </span>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                                    <span style={{ fontSize: isMobile ? 50 : 72, fontWeight: 900, lineHeight: 1, color: lv.color, letterSpacing: -2 }}>
                                        {city.calculatedAqi ?? "—"}
                                    </span>
                                    <img src={lv.icon} alt={lv.label} style={{ width: 52, height: 52, marginBottom: 6 }} />
                                </div>
                                <div style={{
                                    fontSize: 14, fontWeight: 800, color: lv.color,
                                    padding: "4px 14px", borderRadius: 99,
                                    background: hexToRgb(lv.color, 0.15),
                                }}>
                                    {lv.label}
                                </div>
                            </div>
                        </div>

                        {/* ── METRIC ROW ── */}
                        <div style={{ display: "flex", gap: 0, marginTop: 24, borderTop: `1px solid ${C.cardBorder}`, borderRadius: 0, overflowX: "auto" }}>
                            {[
                                { icon: "🌡️", label: "Nhiệt độ", val: city.temperature != null ? `${fmt(city.temperature, 0)}°C` : "—" },
                                { icon: "🌡 ", label: "Cảm giác", val: city.feelsLike != null ? `${fmt(city.feelsLike, 0)}°C` : "—" },
                                { icon: "💧", label: "Độ ẩm", val: city.humidity != null ? `${fmt(city.humidity, 0)}%` : "—" },
                                { icon: "📊", label: "Áp suất", val: city.pressure != null ? `${fmt(city.pressure, 0)} hPa` : "—" },
                                { icon: "💨", label: "Tốc độ gió", val: city.windSpeed != null ? `${fmt(city.windSpeed, 1)} m/s` : "—" },
                                { icon: "🧭", label: "Hướng gió", val: windDir(city.windDeg) },
                                { icon: "☁️", label: "Mây phủ", val: city.cloudCover != null ? `${fmt(city.cloudCover, 0)}%` : "—" },
                                { icon: "👁️", label: "Tầm nhìn", val: city.visibility != null ? `${(city.visibility / 1000).toFixed(1)} km` : "—" },
                            ].map((m) => (
                                <div key={m.label} style={{
                                    padding: "14px 22px", flexShrink: 0,
                                    borderRight: `1px solid ${C.cardBorder}`,
                                    display: "flex", flexDirection: "column", gap: 4,
                                }}>
                                    <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>{m.icon} {m.label}</span>
                                    <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{m.val}</span>
                                </div>
                            ))}
                            {/* Weather description */}
                            {weatherIcon && (
                                <div style={{ padding: "10px 22px", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                    <img src={weatherIcon} alt={city.weatherMain} style={{ width: 40, height: 40 }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "capitalize" }}>{city.weatherDescription ?? city.weatherMain}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── BODY ─────────────────────────────────────────── */}
                <div style={{ maxWidth: 1120, margin: "0 auto", padding: isMobile ? "16px 10px 36px" : "24px 20px 48px" }}>

                    {/* ROW 1: AQI pollutant sub-indices + Health advice */}
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>

                        {/* Pollutant sub-indices */}
                        <GlassCard style={{ flex: 1, display: "flex", flexDirection: "column", padding: "22px 24px" }} glowColor={lv.color}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Chỉ số ô nhiễm (Sub-Index AQI)</div>
                                <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, background: hexToRgb(C.accent, 0.1), padding: "4px 10px", borderRadius: 99, border: `1px solid ${hexToRgb(C.accent, 0.2)}` }}>
                                    Tiêu chuẩn EPA
                                </span>
                            </div>

                            <AqiBar label="PM2.5" value={city.aqiPm25} color="#f59e0b" max={300} />
                            <AqiBar label="PM10" value={city.aqiPm10} color="#f97316" max={300} />
                            <AqiBar label="CO" value={city.aqiCo} color="#22c55e" max={300} />
                            <AqiBar label="NO₂" value={city.aqiNo2} color="#8b5cf6" max={300} />
                            <AqiBar label="SO₂" value={city.aqiSo2} color="#ec4899" max={300} />
                            <AqiBar label="O₃" value={city.aqiO3} color="#06b6d4" max={300} />

                            <div style={{ marginTop: "auto", paddingTop: 14 }}>
                                <div style={{ padding: "10px 14px", borderRadius: C.radiusSm, background: hexToRgb(lv.color, 0.08), border: `1px solid ${hexToRgb(lv.color, 0.2)}`, fontSize: 12, color: C.textSub, lineHeight: 1.6 }}>
                                    <strong style={{ color: lv.color }}>Chất ô nhiễm chính: {city.dominantPollutant ?? "—"}</strong>
                                    {city.healthAdvice && <><br />ℹ️ {city.healthAdvice}</>}
                                </div>
                            </div>
                        </GlassCard>

                        {/* Raw pollutant concentrations */}
                        <GlassCard style={{ flex: 1, display: "flex", flexDirection: "column", padding: "22px 24px" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Nồng độ chất ô nhiễm</div>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, flex: 1, alignContent: "center" }}>
                                {[
                                    { label: "PM2.5", val: fmt(city.pm25), unit: "µg/m³", color: "#f59e0b" },
                                    { label: "PM10", val: fmt(city.pm10), unit: "µg/m³", color: "#f97316" },
                                    { label: "CO", val: fmt(city.co), unit: "µg/m³", color: "#22c55e" },
                                    { label: "NO₂", val: fmt(city.no2), unit: "µg/m³", color: "#8b5cf6" },
                                    { label: "SO₂", val: fmt(city.so2), unit: "µg/m³", color: "#ec4899" },
                                    { label: "O₃", val: fmt(city.o3), unit: "µg/m³", color: "#06b6d4" },
                                    { label: "NH₃", val: fmt(city.nh3), unit: "µg/m³", color: "#84cc16" },
                                ].map(p => <Pill key={p.label} {...p} value={p.val} />)}
                            </div>
                        </GlassCard>
                    </Stack>

                    {/* ROW 2: History + Map */}
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>

                        {/* History sparkline */}
                        {/* History sparkline replaced with HistoryChart */}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <HistoryChart history={history} locationName={city.provinceName} />
                        </Box>

                        {/* Mini map */}
                        <GlassCard style={{ width: isTablet ? "100%" : 320, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            <div style={{ padding: "18px 18px 12px", fontSize: 14, fontWeight: 700, color: C.text }}>
                                Vị trí thành phố
                            </div>
                            <div style={{ flex: 1, minHeight: 200 }}>
                                <MapContainer
                                    center={[city.latitude, city.longitude]}
                                    zoom={9}
                                    style={{ height: 200, width: "100%" }}
                                    zoomControl={false}
                                    attributionControl={false}
                                >
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                    <Circle
                                        center={[city.latitude, city.longitude]}
                                        radius={15000}
                                        pathOptions={{ color: lv.color, fillColor: lv.color, fillOpacity: 0.2, weight: 2 }}
                                    />
                                    <Marker
                                        position={[city.latitude, city.longitude]}
                                        icon={L.divIcon({
                                            className: "",
                                            html: `<div style="width:32px;height:32px;border-radius:50%;background:${lv.color};color:#0f172a;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,.5);">${city.calculatedAqi ?? "—"}</div>`,
                                            iconSize: [32, 32], iconAnchor: [16, 16],
                                        })}
                                    />
                                </MapContainer>
                            </div>
                            <div style={{ padding: "12px 16px", background: hexToRgb(lv.color, 0.08), borderTop: `1px solid ${hexToRgb(lv.color, 0.2)}` }}>
                                <div style={{ fontSize: 11, color: C.textMuted }}>Tọa độ</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                                    {city.latitude?.toFixed(4)} N, {city.longitude?.toFixed(4)} E
                                </div>
                            </div>
                        </GlassCard>
                    </Stack>

                    {/* ROW 3: Stations list */}
                    <GlassCard style={{ padding: "22px 24px", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                                    Trạm quan trắc tại {city.provinceName}
                                </div>
                                {hasStations ? (
                                    <div style={{ fontSize: 12, color: C.textMuted }}>
                                        {stationList.length} trạm · Dữ liệu từ mạng lưới cảm biến cộng đồng
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 12, color: "#f59e0b" }}>
                                        Chưa có trạm quan trắc — Hiển thị dữ liệu vệ tinh
                                    </div>
                                )}
                            </div>
                            {hasStations && (
                                <span style={{
                                    fontSize: 12, fontWeight: 700, color: C.green,
                                    padding: "5px 14px", borderRadius: 99,
                                    background: hexToRgb(C.green, 0.1), border: `1px solid ${hexToRgb(C.green, 0.3)}`,
                                }}>
                                    ● Trực tiếp
                                </span>
                            )}
                        </div>

                        {hasStations ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
                                {stationList.map(st => (
                                    <StationCard key={st.stationId} station={st} onNavigate={navigate} />
                                ))}
                            </div>
                        ) : (
                            /* No stations – satellite data summary */
                            <div style={{
                                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10,
                                padding: 20, borderRadius: C.radiusSm,
                                background: hexToRgb("#f59e0b", 0.06),
                                border: `1px dashed ${hexToRgb("#f59e0b", 0.3)}`,
                            }}>
                                <div style={{ gridColumn: "1/-1", fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>
                                    Dữ liệu vệ tinh — không có trạm mặt đất tại địa phương
                                </div>
                                {[
                                    { label: "AQI Tổng hợp", val: city.calculatedAqi ?? "—", unit: "", color: lv.color },
                                    { label: "Mức độ", val: lv.label, unit: "", color: lv.color },
                                    { label: "PM2.5", val: fmt(city.pm25), unit: "µg/m³", color: "#f59e0b" },
                                    { label: "PM10", val: fmt(city.pm10), unit: "µg/m³", color: "#f97316" },
                                    { label: "CO", val: fmt(city.co), unit: "µg/m³", color: "#22c55e" },
                                    { label: "O₃", val: fmt(city.o3), unit: "µg/m³", color: "#06b6d4" },
                                ].map(p => <Pill key={p.label} {...p} value={p.val} />)}
                            </div>
                        )}
                    </GlassCard>

                    {/* ROW 4: Health recommendations */}
                    <GlassCard style={{ padding: "22px 24px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>
                            Khuyến nghị sức khỏe
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                            {getHealthTiles(city.calculatedAqi ?? 0).map((h, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                                    borderRadius: C.radiusSm,
                                    background: h.active ? hexToRgb(lv.color, 0.08) : hexToRgb("#fff", 0.03),
                                    border: `1px solid ${h.active ? hexToRgb(lv.color, 0.25) : C.cardBorder}`,
                                }}>
                                    <span style={{ fontSize: 22, opacity: h.active ? 1 : 0.3 }}>{h.icon}</span>
                                    <span style={{ fontSize: 12.5, fontWeight: 600, color: h.active ? C.text : C.textMuted }}>
                                        {h.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                </div>
            </div>
        </MainLayout >
    );
}


