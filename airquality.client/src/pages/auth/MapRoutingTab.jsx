import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Map, { NavigationControl, Source, Layer } from "react-map-gl/maplibre";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend as RLegend } from "recharts";
import "ndamap-gl/dist/ndamap-gl.css";

// ─── Design tokens (shared with dashboard) ────────────────────────────────
const C = {
    green: "#0d6e4e",
    greenLight: "#22c55e",
    greenBg: "#f0fdf4",
    greenBorder: "#bbf7d0",
    text: "#1a2e1a",
    textMuted: "#5a6e5a",
    textLight: "#9ca3af",
    border: "#e5e7eb",
    bg: "#f3f4f6",
    white: "#ffffff",
    yellow: "#f59e0b",
    orange: "#f97316",
    red: "#ef4444",
    blue: "#3b82f6",
};

const NDAMAPS_STYLE = import.meta.env.VITE_NDAMAPS_STYLE || "https://nda-tiles.openmap.vn/styles/ndamap/style.json";

// ─── Geocoding via Nominatim ────────────────────────────────────────────────
function formatGeoLabel(d) {
    // Build a short, readable label from address components
    const a = d.address || {};
    const parts = [
        d.name && d.name !== a.road ? d.name : null,
        a.road,
        a.suburb || a.quarter || a.neighbourhood,
        a.city_district || a.district,
        a.city || a.town || a.county,
        a.state,
    ].filter(Boolean);
    // Deduplicate consecutive entries
    const unique = parts.filter((p, i) => i === 0 || p !== parts[i - 1]);
    return unique.length > 0 ? unique.join(", ") : d.display_name;
}

async function geocode(query) {
    if (!query.trim()) return [];
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=7&countrycodes=vn&addressdetails=1`;
    try {
        const res = await fetch(url, { headers: { "Accept-Language": "vi" } });
        const data = await res.json();
        return data.map((d) => ({
            label: formatGeoLabel(d),
            fullLabel: d.display_name,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
            type: d.type,
        }));
    } catch {
        return [];
    }
}

// ─── AQI color helper ────────────────────────────────────────────────────────
function aqiColor(aqi) {
    if (aqi <= 50) return "#22c55e";
    if (aqi <= 100) return "#f59e0b";
    if (aqi <= 150) return "#f97316";
    if (aqi <= 200) return "#ef4444";
    return "#7c3aed";
}

function aqiLabel(aqi) {
    if (aqi <= 50) return "Tốt";
    if (aqi <= 100) return "Trung bình";
    if (aqi <= 150) return "Kém";
    if (aqi <= 200) return "Xấu";
    return "Nguy hại";
}

// ─── Geocode Input Component ─────────────────────────────────────────────────
function GeoInput({ label, dotColor, value, onChange, onSelect, onClear }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef(null);

    function handleChange(e) {
        const v = e.target.value;
        onChange(v);
        clearTimeout(debounceRef.current);
        if (v.trim().length >= 2) {
            debounceRef.current = setTimeout(async () => {
                const results = await geocode(v);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            }, 400);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }

    return (
        <div style={{ position: "relative", marginBottom: 4 }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", background: "#f9fafb", borderRadius: 10,
                border: `1px solid ${C.border}`,
            }}>
                <span style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: dotColor, display: "inline-block", flexShrink: 0,
                }} />
                <input
                    placeholder={label}
                    value={value}
                    onChange={handleChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    style={{
                        flex: 1, border: "none", outline: "none",
                        background: "transparent", fontSize: 13, color: C.text,
                    }}
                />
                {value && (
                    <button
                        onClick={() => { onChange(""); onClear?.(); setSuggestions([]); }}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: C.textLight, fontSize: 14, padding: "0 2px",
                            lineHeight: 1, flexShrink: 0,
                        }}
                        title="Xóa"
                    >✕</button>
                )}
            </div>
            {showSuggestions && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0,
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    zIndex: 100, maxHeight: 200, overflowY: "auto",
                }}>
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            onMouseDown={() => {
                                onSelect(s);
                                onChange(s.label);
                                setShowSuggestions(false);
                            }}
                            style={{
                                padding: "8px 12px", cursor: "pointer", fontSize: 12.5,
                                color: C.text, borderBottom: i < suggestions.length - 1 ? `1px solid ${C.bg}` : "none",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = C.greenBg)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <div style={{ fontWeight: 600 }}>{s.label}</div>
                            {s.type && <div style={{ fontSize: 10.5, color: C.textLight, marginTop: 2 }}>{s.type}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Route Comparison Card ───────────────────────────────────────────────────
function RouteCard({ route, color, isPrimary }) {
    if (!route) return null;
    return (
        <div style={{
            background: C.white, border: `2px solid ${isPrimary ? color : C.border}`,
            borderRadius: 14, padding: "14px 16px", flex: 1,
            boxShadow: isPrimary ? `0 2px 12px ${color}30` : "none",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: color, display: "inline-block",
                }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{route.label}</span>
                {route.recommended && (
                    <span style={{
                        fontSize: 10, fontWeight: 700, background: "#dcfce7",
                        color: C.green, padding: "2px 8px", borderRadius: 999,
                        marginLeft: "auto",
                    }}>✓ Khuyên dùng</span>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[
                    { label: "Khoảng cách", value: `${route.distanceKm} km` },
                    { label: "Thời gian", value: `${route.durationMin} phút` },
                    {
                        label: "AQI TB",
                        value: route.avgAqi.toFixed(1),
                        valueColor: aqiColor(route.avgAqi),
                    },
                    { label: "PM2.5 TB", value: `${route.avgPm25.toFixed(1)} μg/m³` },
                ].map((item) => (
                    <div key={item.label}>
                        <div style={{ fontSize: 11, color: C.textLight }}>{item.label}</div>
                        <div style={{
                            fontSize: 14, fontWeight: 700,
                            color: item.valueColor || C.text,
                        }}>{item.value}</div>
                    </div>
                ))}
            </div>

            {/* AQI quality badge */}
            <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                background: `${aqiColor(route.avgAqi)}18`,
                color: aqiColor(route.avgAqi),
            }}>
                {aqiLabel(route.avgAqi)}
            </div>

            {/* Health risk score (PRO) */}
            {route.healthRiskScore != null && (
                <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Điểm rủi ro sức khỏe</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: route.healthRiskScore <= 3 ? "#dcfce7" : route.healthRiskScore <= 6 ? "#fef3c7" : "#fee2e2",
                            color: route.healthRiskScore <= 3 ? C.green : route.healthRiskScore <= 6 ? "#92400e" : C.red,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, fontWeight: 800,
                        }}>
                            {route.healthRiskScore}
                        </div>
                        <span style={{ fontSize: 11.5, color: C.textMuted }}>/ 10</span>
                    </div>
                </div>
            )}

            {route.healthAdvice && (
                <div style={{
                    marginTop: 8, padding: "8px 10px", borderRadius: 8,
                    background: isPrimary ? "#f0fdf4" : "#fffbeb",
                    border: `1px solid ${isPrimary ? C.greenBorder : "#fde68a"}`,
                    fontSize: 12, lineHeight: 1.5,
                    color: isPrimary ? "#15803d" : "#92400e",
                }}>
                    {route.healthAdvice}
                </div>
            )}
        </div>
    );
}

// ─── Main MapRoutingTab ──────────────────────────────────────────────────────
export default function MapRoutingTab({ isMobile }) {
    const { accessToken, subscriptionTier } = useAuth();
    const isPro = (subscriptionTier ?? "").toLowerCase() === "pro";
    const mapRef = useRef(null);

    // State
    const [originText, setOriginText] = useState("");
    const [destText, setDestText] = useState("");
    const [origin, setOrigin] = useState(null); // { lat, lng }
    const [dest, setDest] = useState(null);
    const [useHealth, setUseHealth] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const [viewState, setViewState] = useState({
        longitude: 106.7,
        latitude: 10.78,
        zoom: 11,
        pitch: 0,
        bearing: 0,
    });

    // ─── Fly to a location ────────────────────────────────────────────────────
    const flyTo = useCallback((lng, lat, zoom = 15) => {
        const map = mapRef.current?.getMap?.();
        if (map) {
            map.flyTo({ center: [lng, lat], zoom, duration: 1200 });
        } else {
            setViewState((v) => ({ ...v, longitude: lng, latitude: lat, zoom }));
        }
    }, []);

    // ─── Fit map to bounds (for route results) ────────────────────────────────
    const fitRouteBounds = useCallback((allCoords) => {
        if (!allCoords || allCoords.length === 0) return;
        const map = mapRef.current?.getMap?.();
        if (!map) return;

        const lngs = allCoords.map((c) => c[0]);
        const lats = allCoords.map((c) => c[1]);
        const sw = [Math.min(...lngs), Math.min(...lats)];
        const ne = [Math.max(...lngs), Math.max(...lats)];

        map.fitBounds([sw, ne], {
            padding: { top: 60, bottom: 60, left: 60, right: 60 },
            duration: 1500,
            maxZoom: 15,
        });
    }, []);

    // ─── Calculate route ──────────────────────────────────────────────────────
    const handleCalculate = useCallback(async () => {
        if (!origin || !dest) {
            setError("Vui lòng chọn cả điểm đi và điểm đến từ gợi ý.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/eco-routing/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    originLat: origin.lat,
                    originLng: origin.lng,
                    destLat: dest.lat,
                    destLng: dest.lng,
                    useHealthProfile: useHealth,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Không thể tính toán tuyến đường.");
            }

            setResult(data);

            // Zoom out to fit both routes
            const allCoords = [
                ...(data.ecoRoute?.geometry || []),
                ...(data.normalRoute?.geometry || []),
            ];
            fitRouteBounds(allCoords);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Đã xảy ra lỗi.");
        } finally {
            setLoading(false);
        }
    }, [origin, dest, useHealth, accessToken]);

    // ─── GeoJSON for route lines ──────────────────────────────────────────────
    const ecoGeoJson = useMemo(() => {
        if (!result?.ecoRoute?.geometry?.length) return null;
        return {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: result.ecoRoute.geometry,
            },
        };
    }, [result]);

    const normalGeoJson = useMemo(() => {
        if (!result?.normalRoute?.geometry?.length) return null;
        return {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: result.normalRoute.geometry,
            },
        };
    }, [result]);

    // ─── Marker GeoJSON for A/B points ────────────────────────────────────────
    const markersGeoJson = useMemo(() => {
        const features = [];
        if (origin) {
            features.push({
                type: "Feature",
                geometry: { type: "Point", coordinates: [origin.lng, origin.lat] },
                properties: { label: "A", color: C.blue },
            });
        }
        if (dest) {
            features.push({
                type: "Feature",
                geometry: { type: "Point", coordinates: [dest.lng, dest.lat] },
                properties: { label: "B", color: C.green },
            });
        }
        return { type: "FeatureCollection", features };
    }, [origin, dest]);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16, height: isMobile ? "auto" : "calc(100vh - 160px)", minHeight: 500 }}>
            {/* Left panel */}
            <div style={{
                width: isMobile ? "100%" : 340, minWidth: isMobile ? "100%" : 300, display: "flex", flexDirection: "column", gap: 12,
                background: C.white, borderRadius: 16, padding: "18px 16px",
                border: `1px solid ${C.border}`, overflowY: "auto",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>🗺️</span>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Eco-Routing</div>
                        <div style={{ fontSize: 11.5, color: C.textMuted }}>Tìm đường đi sạch nhất</div>
                    </div>
                </div>

                {/* Inputs */}
                <GeoInput
                    label="Nhập địa chỉ điểm đi (A)"
                    dotColor={C.blue}
                    value={originText}
                    onChange={setOriginText}
                    onSelect={(s) => {
                        setOrigin({ lat: s.lat, lng: s.lng });
                        flyTo(s.lng, s.lat, 15);
                    }}
                    onClear={() => setOrigin(null)}
                />

                {/* Swap + GPS row */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "-2px 0 2px" }}>
                    <button
                        onClick={() => {
                            setOriginText(destText);
                            setDestText(originText);
                            const tmpO = origin;
                            setOrigin(dest);
                            setDest(tmpO);
                        }}
                        disabled={!originText && !destText}
                        style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 8, fontSize: 11.5,
                            border: `1px solid ${C.border}`, background: C.white,
                            color: C.textMuted, cursor: "pointer",
                            opacity: !originText && !destText ? 0.4 : 1,
                        }}
                        title="Hoán đổi A ⇄ B"
                    >⇅ Hoán đổi</button>

                    <button
                        onClick={() => {
                            if (!navigator.geolocation) {
                                setError("Trình duyệt không hỗ trợ lấy vị trí.");
                                return;
                            }
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    const { latitude, longitude } = pos.coords;
                                    setOrigin({ lat: latitude, lng: longitude });
                                    setOriginText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                                    flyTo(longitude, latitude, 15);
                                    setError("");
                                },
                                () => setError("Không thể lấy vị trí. Hãy cho phép truy cập GPS.")
                            );
                        }}
                        style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 8, fontSize: 11.5,
                            border: `1px solid ${C.border}`, background: C.white,
                            color: C.blue, cursor: "pointer",
                        }}
                        title="Dùng vị trí GPS"
                    >📍 Vị trí hiện tại</button>
                </div>

                <GeoInput
                    label="Nhập địa chỉ điểm đến (B)"
                    dotColor={C.green}
                    value={destText}
                    onChange={setDestText}
                    onSelect={(s) => {
                        setDest({ lat: s.lat, lng: s.lng });
                        flyTo(s.lng, s.lat, 15);
                    }}
                    onClear={() => setDest(null)}
                />

                {/* Health checkbox */}
                <label style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    fontSize: 12.5, color: C.textMuted, cursor: "pointer",
                    padding: "8px 10px", borderRadius: 8,
                    background: useHealth ? C.greenBg : "transparent",
                    border: `1px solid ${useHealth ? C.greenBorder : "transparent"}`,
                    transition: "all 0.15s",
                }}>
                    <input
                        type="checkbox"
                        checked={useHealth}
                        onChange={(e) => {
                            if (!isPro && e.target.checked) {
                                setError("Tính năng yêu cầu tài khoản nâng cấp PRO");
                                return;
                            }
                            setUseHealth(e.target.checked);
                            setError("");
                        }}
                        style={{ accentColor: C.green, marginTop: 2 }}
                    />
                    <div>
                        <div style={{ fontWeight: 600, color: C.text }}>Áp dụng hồ sơ y tế</div>
                        <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>
                            Cá nhân hóa khuyến nghị theo bệnh lý hô hấp, tim mạch
                        </div>
                        {!isPro && (
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                marginTop: 4, fontSize: 10, fontWeight: 700,
                                color: "#92400e", background: "#fffbeb",
                                padding: "2px 8px", borderRadius: 4,
                                border: "1px solid #fde68a",
                            }}>
                                ⭐ Yêu cầu PRO
                            </div>
                        )}
                    </div>
                </label>

                {/* Calculate button */}
                <button
                    onClick={handleCalculate}
                    disabled={loading || !origin || !dest}
                    style={{
                        width: "100%", padding: "12px 0",
                        background: loading || !origin || !dest
                            ? "#d1d5db"
                            : "linear-gradient(135deg, #0d6e4e, #22c55e)",
                        color: "white", border: "none", borderRadius: 12,
                        fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                        boxShadow: origin && dest ? "0 3px 12px rgba(13,110,78,0.3)" : "none",
                        transition: "all 0.2s",
                    }}
                >
                    {loading ? "⏳ Đang tính toán..." : "🌿 Tính toán lộ trình sạch"}
                </button>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: "8px 12px", borderRadius: 8,
                        background: "#fef2f2", border: "1px solid #fecaca",
                        color: C.red, fontSize: 12.5,
                    }}>
                        {error}
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{
                            padding: "10px 12px", borderRadius: 10,
                            background: C.greenBg, border: `1px solid ${C.greenBorder}`,
                            fontSize: 12.5, color: C.green, lineHeight: 1.5,
                        }}>
                            {result.summary}
                        </div>

                        <RouteCard
                            route={result.ecoRoute}
                            color={C.greenLight}
                            isPrimary={true}
                        />
                        <RouteCard
                            route={result.normalRoute}
                            color={C.red}
                            isPrimary={false}
                        />

                        {result.healthConditions?.length > 0 && (
                            <div style={{
                                padding: "8px 10px", borderRadius: 8,
                                background: "#eff6ff", border: "1px solid #bfdbfe",
                                fontSize: 12, color: "#1d4ed8", lineHeight: 1.5,
                            }}>
                                <strong>Hồ sơ y tế đang áp dụng:</strong>{" "}
                                {result.healthConditions.join(", ")}
                            </div>
                        )}

                        {/* Legend */}
                        <div style={{
                            display: "flex", gap: 16, padding: "8px 10px",
                            background: "#f9fafb", borderRadius: 8, fontSize: 12,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 14, height: 4, borderRadius: 2, background: C.greenLight, display: "inline-block" }} />
                                <span style={{ color: C.textMuted }}>Tuyến Eco</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 14, height: 4, borderRadius: 2, background: C.red, display: "inline-block" }} />
                                <span style={{ color: C.textMuted }}>Tuyến thường</span>
                            </div>
                        </div>

                        {/* AQI Profile Chart */}
                        {(result.ecoRoute?.aqiSamples?.length > 0 || result.normalRoute?.aqiSamples?.length > 0) && (
                            <div style={{
                                background: C.white, borderRadius: 12,
                                border: `1px solid ${C.border}`, padding: "12px 8px 4px",
                            }}>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 8, paddingLeft: 8 }}>
                                    📊 Biến động AQI dọc tuyến
                                </div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <LineChart>
                                        <XAxis
                                            dataKey="distanceKm"
                                            type="number"
                                            domain={["dataMin", "dataMax"]}
                                            tickFormatter={(v) => `${v.toFixed(1)}`}
                                            tick={{ fontSize: 10 }}
                                            label={{ value: "km", position: "insideBottomRight", offset: -2, style: { fontSize: 10 } }}
                                        />
                                        <YAxis
                                            domain={[0, "dataMax"]}
                                            tick={{ fontSize: 10 }}
                                            width={30}
                                            label={{ value: "AQI", angle: -90, position: "insideLeft", style: { fontSize: 10 } }}
                                        />
                                        <Tooltip
                                            formatter={(val, name) => [val, name === "eco" ? "Tuyến sạch" : "Tuyến thường"]}
                                            labelFormatter={(v) => `${Number(v).toFixed(1)} km`}
                                            contentStyle={{ fontSize: 11, borderRadius: 8 }}
                                        />
                                        {result.ecoRoute?.aqiSamples?.length > 0 && (
                                            <Line
                                                data={result.ecoRoute.aqiSamples}
                                                dataKey="aqi"
                                                name="eco"
                                                stroke={C.greenLight}
                                                strokeWidth={2.5}
                                                dot={false}
                                                connectNulls
                                            />
                                        )}
                                        {result.normalRoute?.aqiSamples?.length > 0 && (
                                            <Line
                                                data={result.normalRoute.aqiSamples}
                                                dataKey="aqi"
                                                name="normal"
                                                stroke={C.red}
                                                strokeWidth={2}
                                                strokeDasharray="6 3"
                                                dot={false}
                                                connectNulls
                                            />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Map area */}
            <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", position: "relative", minHeight: isMobile ? 400 : "auto" }}>
                <Map
                    ref={mapRef}
                    reuseMaps
                    mapStyle={NDAMAPS_STYLE}
                    {...viewState}
                    onMove={(e) => setViewState(e.viewState)}
                    style={{ width: "100%", height: "100%" }}
                >
                    <NavigationControl position="top-right" />

                    {/* Normal route (drawn first = behind) */}
                    {normalGeoJson && (
                        <Source type="geojson" data={normalGeoJson}>
                            <Layer
                                id="normal-route-outline"
                                type="line"
                                paint={{
                                    "line-color": "#000000",
                                    "line-width": 7,
                                    "line-opacity": 0.15,
                                }}
                            />
                            <Layer
                                id="normal-route"
                                type="line"
                                paint={{
                                    "line-color": "#ef4444",
                                    "line-width": 4,
                                    "line-opacity": 0.7,
                                    "line-dasharray": [3, 2],
                                }}
                            />
                        </Source>
                    )}

                    {/* Eco route (drawn second = on top) */}
                    {ecoGeoJson && (
                        <Source type="geojson" data={ecoGeoJson}>
                            <Layer
                                id="eco-route-outline"
                                type="line"
                                paint={{
                                    "line-color": "#000000",
                                    "line-width": 8,
                                    "line-opacity": 0.12,
                                }}
                            />
                            <Layer
                                id="eco-route"
                                type="line"
                                paint={{
                                    "line-color": "#22c55e",
                                    "line-width": 5,
                                    "line-opacity": 0.9,
                                }}
                            />
                        </Source>
                    )}

                    {/* A/B markers */}
                    <Source type="geojson" data={markersGeoJson}>
                        <Layer
                            id="markers-circle"
                            type="circle"
                            paint={{
                                "circle-radius": 8,
                                "circle-color": ["get", "color"],
                                "circle-stroke-width": 3,
                                "circle-stroke-color": "#ffffff",
                            }}
                        />
                        <Layer
                            id="markers-label"
                            type="symbol"
                            layout={{
                                "text-field": ["get", "label"],
                                "text-size": 12,
                                "text-offset": [0, -1.5],
                                "text-font": ["Open Sans Bold"],
                            }}
                            paint={{
                                "text-color": "#1f2937",
                                "text-halo-color": "#ffffff",
                                "text-halo-width": 2,
                            }}
                        />
                    </Source>
                </Map>

                {/* Map watermark */}
                {!result && !loading && (
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(255,255,255,0.95)", borderRadius: 16,
                        padding: "24px 32px", textAlign: "center",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                            Tìm đường đi sạch
                        </div>
                        <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.6 }}>
                            Nhập điểm đi và điểm đến để so sánh<br />
                            tuyến đường sạch vs tuyến thường
                        </div>
                    </div>
                )}

                {loading && (
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(255,255,255,0.95)", borderRadius: 16,
                        padding: "24px 32px", textAlign: "center",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                            Đang tính toán lộ trình...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
