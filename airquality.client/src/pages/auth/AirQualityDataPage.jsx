import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MainLayout from "../../components/layout/MainLayout";
import theme from "../../components/layout/theme";

import { AQI_LEVELS, getLevel } from "../../utils/aqiHelper";

function createAqiIcon(aqi, colorHex) {
    return L.divIcon({
        className: "",
        html: `<div style="width:34px;height:34px;border-radius:50%;background:${colorHex};border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;">${aqi}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
    });
}

function StatCard({ title, value, sub, tone = "default" }) {
    const tones = {
        default: { bg: "#f8fafc", border: theme.border, value: theme.text },
        danger: { bg: "#fef2f2", border: "#fecaca", value: "#dc2626" },
        good: { bg: "#f0fdf4", border: "#bbf7d0", value: "#15803d" },
        brand: { bg: "#eefcf5", border: "#c7f4dc", value: theme.green },
    };
    const palette = tones[tone] || tones.default;

    return (
        <div
            style={{
                background: palette.bg,
                border: `1px solid ${palette.border}`,
                borderRadius: 14,
                padding: "12px 14px",
                minHeight: 90,
            }}
        >
            <div style={{ fontSize: 11.5, color: theme.textMuted, fontWeight: 700, textTransform: "uppercase" }}>{title}</div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800, color: palette.value, lineHeight: 1.05 }}>{value}</div>
            <div style={{ marginTop: 4, fontSize: 12.5, color: theme.textLight }}>{sub}</div>
        </div>
    );
}

function RankingList({ title, dotColor, rows, emptyText }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor }} />
                <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 700, textTransform: "uppercase" }}>
                    {title}
                </span>
            </div>

            {rows.length === 0 ? (
                <div style={{ fontSize: 13, color: theme.textLight }}>{emptyText}</div>
            ) : (
                rows.map((item, idx) => (
                    <div
                        key={`${item.city}-${idx}`}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "28px 1fr auto",
                            gap: 8,
                            alignItems: "center",
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: "#f8fafc",
                            border: `1px solid ${theme.border}`,
                            marginBottom: 6,
                        }}
                    >
                        <span style={{ fontSize: 12, color: theme.textLight }}>{String(idx + 1).padStart(2, "0")}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{item.city}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: getLevel(item.aqi).color }}>{item.aqi}</span>
                    </div>
                ))
            )}
        </div>
    );
}

function StationMarker({ station }) {
    const navigate = useNavigate();
    const map = useMap();
    const lv = getLevel(station.calculatedAqi ?? 0);

    return (
        <Marker
            position={[Number(station.latitude), Number(station.longitude)]}
            icon={createAqiIcon(station.calculatedAqi ?? "--", lv.color)}
            eventHandlers={{
                click: () => {
                    map.flyTo([Number(station.latitude), Number(station.longitude)], 14, {
                        duration: 1.2,
                    });
                },
            }}
        >
            <Popup autoPan={false}>
                <div style={{ minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <img src={lv.icon} alt={lv.label} style={{ width: 22, height: 22 }} />
                        <div style={{ fontWeight: 700 }}>{station.stationName}</div>
                    </div>
                    <div style={{ fontSize: 12, marginBottom: 8, color: "#64748b" }}>{station.city}</div>
                    <div>
                        <b>AQI:</b> {station.calculatedAqi} - <span style={{ color: lv.color, fontWeight: "bold" }}>{lv.label}</span>
                    </div>
                    <div><b>PM2.5:</b> {station.pm25 ?? "--"}</div>
                    <div><b>Nhiệt độ:</b> {station.temperature ?? "--"}°C</div>
                    <button
                        onClick={() => navigate(`/tram/${station.stationId}`)}
                        style={{
                            marginTop: 10,
                            width: "100%",
                            padding: "7px 0",
                            borderRadius: 8,
                            border: "none",
                            background: "#0d6e4e",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                        }}
                    >
                        Xem chi tiết →
                    </button>
                </div>
            </Popup>
        </Marker>
    );
}

export default function AirQualityDataPage() {
    const [activeLayer, setActiveLayer] = useState("aqi");
    const [stations, setStations] = useState([]);
    const [rankings, setRankings] = useState({ polluted: [], cleanest: [], totalCities: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [stationsResponse, rankingsResponse] = await Promise.all([
                fetch("/api/airquality/map-stations?limit=700", { cache: "no-store" }),
                fetch("/api/airquality/city-rankings?top=3", { cache: "no-store" }),
            ]);

            if (!stationsResponse.ok || !rankingsResponse.ok) {
                throw new Error("Không thể tải dữ liệu chất lượng không khí.");
            }

            const stationsData = await stationsResponse.json();
            const rankingsData = await rankingsResponse.json();

            setStations(Array.isArray(stationsData) ? stationsData : []);
            setRankings({
                polluted: rankingsData?.polluted ?? [],
                cleanest: rankingsData?.cleanest ?? [],
                totalCities: rankingsData?.totalCities ?? 0,
            });
            setLastUpdated(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
        } catch (err) {
            setStations([]);
            setRankings({ polluted: [], cleanest: [], totalCities: 0 });
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const defaultCenter = [16.3, 106.2];
    const validStations = useMemo(
        () => stations.filter((s) => Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude))),
        [stations],
    );

    const mapCenter = useMemo(() => {
        if (!validStations.length) {
            return defaultCenter;
        }

        const avgLat = validStations.reduce((sum, s) => sum + Number(s.latitude), 0) / validStations.length;
        const avgLng = validStations.reduce((sum, s) => sum + Number(s.longitude), 0) / validStations.length;
        return [avgLat, avgLng];
    }, [validStations]);

    const averageAqi = useMemo(() => {
        const list = validStations
            .map((x) => Number(x.calculatedAqi))
            .filter((v) => Number.isFinite(v));

        if (!list.length) {
            return "--";
        }

        return Math.round(list.reduce((sum, v) => sum + v, 0) / list.length);
    }, [validStations]);

    const highestAqi = useMemo(() => {
        const sorted = [...validStations].sort((a, b) => Number(b.calculatedAqi ?? 0) - Number(a.calculatedAqi ?? 0));
        return sorted[0] ?? null;
    }, [validStations]);

    const cleanestAqi = useMemo(() => {
        const sorted = [...validStations].sort((a, b) => Number(a.calculatedAqi ?? 0) - Number(b.calculatedAqi ?? 0));
        return sorted[0] ?? null;
    }, [validStations]);

    return (
        <MainLayout activePage="Du lieu chat luong khong khi">
            <section style={{ paddingTop: 92, paddingBottom: 56, background: "#f3f6f4", minHeight: "100vh" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
                    <div
                        style={{
                            marginBottom: 16,
                            background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 70%)",
                            border: `1px solid ${theme.border}`,
                            borderRadius: 16,
                            padding: "16px 18px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h1 style={{ margin: 0, color: theme.text, fontSize: 30, fontWeight: 800 }}>
                                Du lieu chat luong khong khi
                            </h1>
                            <div style={{ marginTop: 6, fontSize: 13, color: theme.textMuted }}>
                                Theo doi trạm quan trắc theo thời gian thực và bảng xếp hạng thành phố.
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {lastUpdated && (
                                <span style={{ fontSize: 12.5, color: theme.textLight }}>
                                    Cap nhat luc {lastUpdated}
                                </span>
                            )}
                            <button
                                onClick={loadData}
                                disabled={loading}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: 10,
                                    border: `1px solid ${theme.border}`,
                                    background: loading ? "#f3f4f6" : "white",
                                    color: theme.text,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                            >
                                {loading ? "Dang tai..." : "Tai lai du lieu"}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 16 }}>
                        <StatCard title="Tram dang hien thi" value={validStations.length} sub="Tram co toa do hop le" tone="brand" />
                        <StatCard title="AQI trung binh" value={averageAqi} sub="Toan bo tram quan trac" tone="default" />
                        <StatCard
                            title="O nhiem cao nhat"
                            value={highestAqi?.calculatedAqi ?? "--"}
                            sub={highestAqi?.city || "Chua co du lieu"}
                            tone="danger"
                        />
                        <StatCard
                            title="Trong lanh nhat"
                            value={cleanestAqi?.calculatedAqi ?? "--"}
                            sub={cleanestAqi?.city || "Chua co du lieu"}
                            tone="good"
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                marginBottom: 14,
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                borderRadius: 12,
                                padding: "10px 12px",
                                color: "#b91c1c",
                                fontSize: 13,
                                fontWeight: 600,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 18, alignItems: "start" }}>
                        <div style={{ background: "white", border: `1px solid ${theme.border}`, borderRadius: 16, padding: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {[
                                        { key: "aqi", label: "AQI", enabled: true },
                                        { key: "pm25", label: "PM2.5", enabled: false },
                                        { key: "temperature", label: "Nhiet do", enabled: false },
                                    ].map((tab) => {
                                        const isActive = activeLayer === tab.key;
                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => tab.enabled && setActiveLayer(tab.key)}
                                                style={{
                                                    padding: "6px 14px",
                                                    borderRadius: 999,
                                                    border: isActive ? "none" : `1px solid ${theme.border}`,
                                                    background: isActive ? theme.green : "#f8fafc",
                                                    color: isActive ? "white" : theme.textMuted,
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: tab.enabled ? "pointer" : "not-allowed",
                                                    opacity: tab.enabled ? 1 : 0.55,
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ fontSize: 12, color: theme.textLight, fontWeight: 600 }}>
                                    Marker: {validStations.length} tram
                                </div>
                            </div>

                            {activeLayer !== "aqi" && (
                                <div style={{ marginBottom: 10, fontSize: 12.5, color: theme.textMuted }}>
                                    Lop nay dang duoc phat trien, hien tai uu tien AQI.
                                </div>
                            )}

                            <div style={{ height: 560, borderRadius: 14, overflow: "hidden", border: `1px solid ${theme.border}`, position: "relative" }}>
                                <MapContainer center={mapCenter} zoom={6} style={{ height: "100%", width: "100%" }}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; OpenStreetMap contributors"
                                    />
                                    {validStations.map((station) => (
                                        <StationMarker key={station.stationId} station={station} />
                                    ))}
                                </MapContainer>

                                {loading && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: "rgba(255,255,255,0.6)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 14,
                                            color: theme.textMuted,
                                            fontWeight: 700,
                                            backdropFilter: "blur(1px)",
                                        }}
                                    >
                                        Dang tai marker AQI...
                                    </div>
                                )}

                                {!loading && !validStations.length && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: "rgba(255,255,255,0.75)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            textAlign: "center",
                                            padding: 20,
                                            color: theme.textMuted,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Khong co du lieu tram hop le de hien thi tren ban do.
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: 12, background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 10, padding: 10 }}>
                                <div style={{ display: "flex", gap: 4, height: 8, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                                    {AQI_LEVELS.map((item) => (
                                        <div key={item.label} style={{ flex: 1, background: item.color }} />
                                    ))}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: `repeat(${AQI_LEVELS.length}, minmax(0, 1fr))`, gap: 6 }}>
                                    {AQI_LEVELS.map((item, idx) => (
                                        <div key={item.label} style={{ fontSize: 10.5, color: theme.textMuted }}>
                                            {idx === 0 ? 0 : AQI_LEVELS[idx - 1].max + 1}-{item.max}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <aside style={{ background: "white", border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, position: "sticky", top: 78 }}>
                            <h3 style={{ margin: "0 0 14px", fontSize: 22, color: theme.text }}>Xep hang AQI</h3>
                            <RankingList
                                title="O nhiem nhat"
                                dotColor="#ef4444"
                                rows={rankings.polluted}
                                emptyText="Dang cap nhat du lieu o nhiem."
                            />
                            <RankingList
                                title="Trong lanh nhat"
                                dotColor="#22c55e"
                                rows={rankings.cleanest}
                                emptyText="Dang cap nhat du lieu trong lanh."
                            />
                            <div style={{
                                marginTop: 6,
                                background: "#f8fafc",
                                border: `1px solid ${theme.border}`,
                                borderRadius: 10,
                                padding: "10px 12px",
                                fontSize: 13,
                                color: theme.textMuted,
                                textAlign: "center",
                            }}>
                                Tong so thanh pho co du lieu: <b style={{ color: theme.text }}>{rankings.totalCities}</b>
                            </div>

                            <div style={{ marginTop: 12, fontSize: 12, color: theme.textLight }}>
                                {loading ? "Dang tai du lieu ban do va bang xep hang..." : "Du lieu duoc cap nhat theo ban ghi moi nhat."}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
