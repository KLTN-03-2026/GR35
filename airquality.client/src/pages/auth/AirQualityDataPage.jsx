import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, useMediaQuery } from "@mui/material";
import ndamapgl from "ndamap-gl";
import "ndamap-gl/dist/ndamap-gl.css";
import MainLayout from "../../components/layout/MainLayout";
import theme from "../../components/layout/theme";

import { AQI_LEVELS, getLevel } from "../../utils/aqiHelper";
import { formatDbTime } from "../../utils/datetime";

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




const NDAMAPS_STYLE = import.meta.env.VITE_NDAMAPS_STYLE || "https://nda-tiles.openmap.vn/styles/ndamap/style.json";

export default function AirQualityDataPage() {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:600px)");
    const isTablet = useMediaQuery("(max-width:900px)");
    const [activeLayer, setActiveLayer] = useState("aqi");
    const [stations, setStations] = useState([]);
    const [rankings, setRankings] = useState({ polluted: [], cleanest: [], totalCities: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

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

            const stationsList = Array.isArray(stationsData) ? stationsData : [];
            setStations(stationsList);
            setRankings({
                polluted: rankingsData?.polluted ?? [],
                cleanest: rankingsData?.cleanest ?? [],
                totalCities: rankingsData?.totalCities ?? 0,
            });

            const latestTimestamp =
                stationsList
                    .map((s) => s?.timestamp ?? s?.Timestamp ?? null)
                    .find((x) => x != null) ?? null;

            setLastUpdated(latestTimestamp ? formatDbTime(latestTimestamp) : "");
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

    const defaultCenter = [106.2, 16.3]; // [lng, lat] for ndamap-gl
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
        return [avgLng, avgLat]; // [lng, lat] for ndamap-gl
    }, [validStations]);

    // Initialize the ndamap-gl map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        const map = new ndamapgl.Map({
            container: mapContainerRef.current,
            style: NDAMAPS_STYLE,
            center: [106.0, 15.5], // Center of Vietnam [lng, lat]
            zoom: 4.5,
        });
        map.addControl(new ndamapgl.NavigationControl(), "top-right");
        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update markers when stations change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        validStations.forEach((station) => {
            const lv = getLevel(station.calculatedAqi ?? 0);
            const aqi = station.calculatedAqi ?? "--";

            // Create marker element
            const el = document.createElement("div");
            el.style.cssText = `width:34px;height:34px;border-radius:50%;background:${lv.color};border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;cursor:pointer;`;
            el.textContent = String(aqi);

            // Create popup
            const popup = new ndamapgl.Popup({ offset: 20, closeButton: true, maxWidth: "260px" });
            const popupContent = document.createElement("div");
            popupContent.style.minWidth = "200px";
            popupContent.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
                    <img src="${lv.icon}" alt="${lv.label}" style="width:22px;height:22px" />
                    <div style="font-weight:700">${station.stationName}</div>
                </div>
                <div style="font-size:12px;margin-bottom:8px;color:#64748b">${station.city}</div>
                <div><b>AQI:</b> ${aqi} - <span style="color:${lv.color};font-weight:bold">${lv.label}</span></div>
                <div><b>PM2.5:</b> ${station.pm25 ?? "--"}</div>
                <div><b>Nhiệt độ:</b> ${station.temperature ?? "--"}°C</div>
            `;
            const btn = document.createElement("button");
            btn.textContent = "Xem chi tiết →";
            btn.style.cssText = "margin-top:10px;width:100%;padding:7px 0;border-radius:8px;border:none;background:#0d6e4e;color:#fff;font-weight:700;font-size:13px;cursor:pointer;";
            btn.addEventListener("click", () => navigate(`/tram/${station.stationId}`));
            popupContent.appendChild(btn);
            popup.setDOMContent(popupContent);

            const marker = new ndamapgl.Marker({ element: el })
                .setLngLat([Number(station.longitude), Number(station.latitude)])
                .setPopup(popup)
                .addTo(map);

            el.addEventListener("click", () => {
                map.flyTo({ center: [Number(station.longitude), Number(station.latitude)], zoom: 14, duration: 1200 });
            });

            markersRef.current.push(marker);
        });
    }, [validStations, navigate]);

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
        return rankings.polluted.length > 0 ? rankings.polluted[0] : null;
    }, [rankings.polluted]);

    const cleanestAqi = useMemo(() => {
        return rankings.cleanest.length > 0 ? rankings.cleanest[0] : null;
    }, [rankings.cleanest]);

    const childImpacts = [
        {
            icon: "🫁",
            title: "Các vấn đề về hô hấp",
            desc: "Tăng các trường hợp hen suyễn và viêm phế quản.",
        },
        {
            icon: "🫁",
            title: "Giảm chức năng phổi",
            desc: "Tiếp xúc lâu dài có thể làm suy yếu sự phát triển của phổi.",
        },
        {
            icon: "🧠",
            title: "Phát triển nhận thức",
            desc: "Tác động tiềm tàng đến sự phát triển của não bộ và thành tích học tập.",
        },
    ];

    const pollutantKnowledge = [
        {
            title: "PM2.5 là gì?",
            desc: "Bụi PM2.5 là vật chất dạng hạt trôi nổi trong không khí với đường kính nhỏ hơn 2.5 micromet.",
        },
        {
            title: "PM10 là gì?",
            desc: "Bụi PM10 là vật chất dạng hạt lơ lửng trong không khí với đường kính khoảng 10 micromet.",
        },
        {
            title: "Ozone là gì?",
            desc: "Ozone (O₃) là khí được hình thành bởi bức xạ cực tím và các phản ứng hóa học trong khí quyển.",
        },
    ];

    const riskFactors = [
        { rank: 1, name: "Huyết áp cao", deaths: "10.9M", relatedToAir: false },
        { rank: 2, name: "Ô nhiễm không khí (Ngoài trời & Trong nhà)", deaths: "8.1M", relatedToAir: true },
        { rank: 3, name: "Hút thuốc", deaths: "6.2M", relatedToAir: false },
        { rank: 4, name: "Đường huyết cao", deaths: "5.3M", relatedToAir: false },
        { rank: 5, name: "Ô nhiễm hạt vật chất ngoài trời", deaths: "4.7M", relatedToAir: true },
        { rank: 6, name: "Béo phì", deaths: "3.7M", relatedToAir: false },
        { rank: 7, name: "Cholesterol cao", deaths: "3.6M", relatedToAir: false },
        { rank: 8, name: "Ô nhiễm không khí trong nhà", deaths: "3.1M", relatedToAir: true },
        { rank: 9, name: "Chế độ ăn nhiều natri", deaths: "1.9M", relatedToAir: false },
        { rank: 10, name: "Sử dụng rượu", deaths: "1.8M", relatedToAir: false },
        { rank: 11, name: "Chế độ ăn ít trái cây", deaths: "1.7M", relatedToAir: false },
        { rank: 12, name: "Chế độ ăn ít ngũ cốc nguyên hạt", deaths: "1.5M", relatedToAir: false },
        { rank: 13, name: "Trẻ sơ sinh nhẹ cân", deaths: "1.5M", relatedToAir: false },
        { rank: 14, name: "Khói thuốc lá gián tiếp", deaths: "1.3M", relatedToAir: true },
    ];

    const pm25Sources = [
        { icon: "🏭", label: "Sự đốt than" },
        { icon: "⛽", label: "Sự đốt cháy xăng" },
        { icon: "🚚", label: "Đốt cháy dầu diesel" },
        { icon: "🔥", label: "Đốt gỗ" },
        { icon: "🚗", label: "Động cơ đốt trong" },
        { icon: "🏗️", label: "Quy trình công nghiệp" },
        { icon: "🌲", label: "Cháy rừng" },
        { icon: "⚗️", label: "Chuyển đổi khí thành hạt" },
    ];

    return (
        <MainLayout activePage="Dữ liệu chất lượng không khí">
            <section style={{ paddingTop: 92, paddingBottom: 56, background: "#f3f6f4", minHeight: "100vh" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "0 10px" : "0 24px" }}>
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
                            <h1 style={{ margin: 0, color: theme.text, fontSize: isMobile ? 24 : 30, fontWeight: 800 }}>
                                Dữ liệu chất lượng không khí
                            </h1>
                            <div style={{ marginTop: 6, fontSize: 13, color: theme.textMuted }}>
                                Theo dõi trạm quan trắc theo thời gian thực và bảng xếp hạng thành phố.
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            {lastUpdated && (
                                <span style={{ fontSize: 12.5, color: theme.textLight }}>
                                    Cập nhật lúc {lastUpdated}
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
                                    minHeight: 44,
                                }}
                            >
                                {loading ? "Đang tải..." : "Tải lại dữ liệu"}
                            </button>
                        </div>
                    </div>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                            gap: 1.25,
                            mb: 2,
                        }}
                    >
                        <StatCard title="Trạm đang hiển thị" value={validStations.length} sub="Trạm có toạ độ hợp lệ" tone="brand" />
                        <StatCard title="AQI trung bình" value={averageAqi} sub="Toàn bộ trạm quan trắc" tone="default" />
                        <StatCard
                            title="Ô nhiễm cao nhất"
                            value={highestAqi?.aqi ?? "--"}
                            sub={highestAqi?.city || "Chưa có dữ liệu"}
                            tone="danger"
                        />
                        <StatCard
                            title="Trong lành nhất"
                            value={cleanestAqi?.aqi ?? "--"}
                            sub={cleanestAqi?.city || "Chưa có dữ liệu"}
                            tone="good"
                        />
                    </Box>

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

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2.2} alignItems="flex-start">
                        <Box sx={{ flex: 1, width: "100%", background: "white", border: `1px solid ${theme.border}`, borderRadius: "16px", p: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {[
                                        { key: "aqi", label: "AQI", enabled: true },
                                        { key: "pm25", label: "PM2.5", enabled: false },
                                        { key: "temperature", label: "Nhiệt độ", enabled: false },
                                    ].map((tab) => {
                                        const isActive = activeLayer === tab.key;
                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => tab.enabled && setActiveLayer(tab.key)}
                                                style={{
                                                    padding: "8px 14px",
                                                    borderRadius: 999,
                                                    border: isActive ? "none" : `1px solid ${theme.border}`,
                                                    background: isActive ? theme.green : "#f8fafc",
                                                    color: isActive ? "white" : theme.textMuted,
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: tab.enabled ? "pointer" : "not-allowed",
                                                    opacity: tab.enabled ? 1 : 0.55,
                                                    minHeight: 44,
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ fontSize: 12, color: theme.textLight, fontWeight: 600 }}>
                                    Marker: {validStations.length} trạm
                                </div>
                            </div>

                            {activeLayer !== "aqi" && (
                                <div style={{ marginBottom: 10, fontSize: 12.5, color: theme.textMuted }}>
                                    Lớp này đang được phát triển, hiện tại ưu tiên AQI.
                                </div>
                            )}

                            <div style={{ height: isMobile ? 420 : 560, borderRadius: 14, overflow: "hidden", border: `1px solid ${theme.border}`, position: "relative" }}>
                                <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />

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
                                        Đang tải marker AQI...
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
                                        Không có dữ liệu trạm hợp lệ để hiển thị trên bản đồ.
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
                        </Box>

                        <aside style={{ width: isTablet ? "100%" : 320, background: "white", border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, position: isTablet ? "static" : "sticky", top: 78 }}>
                            <h3 style={{ margin: "0 0 14px", fontSize: 22, color: theme.text }}>Xếp hạng AQI</h3>
                            <RankingList
                                title="Ô nhiễm nhất"
                                dotColor="#ef4444"
                                rows={rankings.polluted}
                                emptyText="Đang cập nhật dữ liệu ô nhiễm."
                            />
                            <RankingList
                                title="Trong lành nhất"
                                dotColor="#22c55e"
                                rows={rankings.cleanest}
                                emptyText="Đang cập nhật dữ liệu trong lành."
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
                                Tổng số thành phố có dữ liệu: <b style={{ color: theme.text }}>{rankings.totalCities}</b>
                            </div>

                            <div style={{ marginTop: 12, fontSize: 12, color: theme.textLight }}>
                                {loading ? "Đang tải dữ liệu bản đồ và bảng xếp hạng..." : "Dữ liệu được cập nhật theo bản ghi mới nhất."}
                            </div>
                        </aside>
                    </Stack>

                    <Stack spacing={2} sx={{ mt: 2.75 }}>
                        <div style={{ background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 16, padding: "18px 18px 14px" }}>
                            <h2 style={{ margin: "0 0 18px", fontSize: isMobile ? 18 : 22, fontWeight: 800, color: theme.text }}>
                                Ô nhiễm không khí ảnh hưởng đến trẻ em như thế nào?
                            </h2>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 0 }}>
                                {childImpacts.map((item, idx) => (
                                    <div
                                        key={item.title}
                                        style={{
                                            padding: "8px 12px 12px",
                                            borderRight: !isMobile && idx < childImpacts.length - 1 ? `1px solid ${theme.border}` : "none",
                                            borderBottom: isMobile && idx < childImpacts.length - 1 ? `1px solid ${theme.border}` : "none",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: "50%",
                                                background: "#3b82f6",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 28,
                                                marginBottom: 12,
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: theme.text }}>{item.title}</div>
                                        <div style={{ fontSize: isMobile ? 15 : 17, color: theme.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: theme.textLight }}>
                                Nguồn: EEA (European Environment Agency)
                            </div>
                        </div>

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
                            <div style={{ background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 14, display: "flex", flexDirection: "column" }}>
                                <div style={{ padding: "18px 16px", minHeight: 220 }}>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: theme.text, marginBottom: 10 }}>99%</div>
                                    <div style={{ fontSize: 17, color: theme.text, lineHeight: 1.55 }}>
                                        Dân số thế giới sống ở những nơi có chất lượng không khí vượt quá giới hạn hướng dẫn hằng năm của WHO.
                                    </div>
                                </div>
                                <div style={{ marginTop: "auto", borderTop: `1px solid ${theme.border}`, padding: "10px 16px", fontSize: 12, color: theme.textLight }}>
                                    Nguồn: World Health Organization
                                </div>
                            </div>

                            <div style={{ background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 14, display: "flex", flexDirection: "column" }}>
                                <div style={{ padding: "18px 16px" }}>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: theme.text, marginBottom: 10 }}>8,1 triệu</div>
                                    <div style={{ fontSize: 17, color: theme.text, lineHeight: 1.5, marginBottom: 14 }}>
                                        Số ca tử vong trên toàn thế giới có thể là do ô nhiễm không khí.
                                    </div>
                                    <div style={{ background: "#f8fafc", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px 14px", display: "grid", gap: 8 }}>
                                        <div style={{ fontSize: 16, color: theme.text }}>
                                            → <b>4,7 triệu</b> do ô nhiễm không khí do các hạt vật chất ngoài trời
                                        </div>
                                        <div style={{ fontSize: 16, color: theme.text }}>
                                            → <b>3,1 triệu</b> do ô nhiễm không khí trong nhà
                                        </div>
                                        <div style={{ fontSize: 16, color: theme.text }}>
                                            → <b>0,5 triệu</b> do ô nhiễm tầng ozone ngoài trời
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: "auto", borderTop: `1px solid ${theme.border}`, padding: "10px 16px", fontSize: 12, color: theme.textLight }}>
                                    Nguồn: Health Effects Institute 2021 - Numbers for 2021
                                </div>
                            </div>

                            <div style={{ background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 14, display: "flex", flexDirection: "column" }}>
                                <div style={{ padding: "18px 16px" }}>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: theme.text, marginBottom: 10 }}>
                                        100<span style={{ fontSize: 18, color: theme.textMuted }}>/100,000</span>
                                    </div>
                                    <div style={{ fontSize: 17, color: theme.text, lineHeight: 1.5, marginBottom: 14 }}>
                                        Người dân trên toàn thế giới tử vong vì ô nhiễm không khí.
                                    </div>
                                    <div style={{ background: "#f8fafc", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px 14px", display: "grid", gap: 8 }}>
                                        <div style={{ fontSize: 16, color: theme.text }}>
                                            → <b>58</b>/100,000 từ các hạt vật chất ngoài trời
                                        </div>
                                        <div style={{ fontSize: 16, color: theme.text }}>
                                            → <b>39</b>/100,000 từ ô nhiễm không khí trong nhà
                                        </div>
                                        <div style={{ fontSize: 16, color: theme.text }}>
                                            → <b>6</b>/100,000 từ ô nhiễm ozone ngoài trời
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: "auto", borderTop: `1px solid ${theme.border}`, padding: "10px 16px", fontSize: 12, color: theme.textLight }}>
                                    Nguồn: IHME (Institute for Health Metrics and Evaluation) 2024
                                </div>
                            </div>
                        </Box>

                        <div>
                            <h3 style={{ margin: "2px 0 10px", fontSize: 22, color: theme.text }}>Hiểu rõ hơn về ô nhiễm không khí</h3>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 14 }}>
                                {pollutantKnowledge.map((item) => (
                                    <div key={item.title} style={{ background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 12, padding: "14px 14px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{item.title}</div>
                                            <span style={{ color: "#3b82f6", fontWeight: 700 }}>↗</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.45 }}>{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ margin: "6px 0 10px", fontSize: 22, color: theme.text }}>
                                Tác động đến sức khỏe và nguồn gây ô nhiễm không khí
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                                <div style={{ background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 14px 10px" }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 8 }}>
                                        Những yếu tố nguy cơ tử vong chính trên toàn thế giới là gì?
                                    </div>
                                    <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 10 }}>
                                        Trong số 62 triệu người tử vong mỗi năm (tính đến năm 2021), theo yếu tố nguy cơ:
                                    </div>

                                    <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflowX: "auto" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 120px", background: "#f8fafc", padding: "8px 10px", fontSize: 12, color: theme.textMuted, fontWeight: 700 }}>
                                            <span>#</span>
                                            <span>Các yếu tố rủi ro</span>
                                            <span style={{ textAlign: "right" }}>Tử vong</span>
                                        </div>
                                        {riskFactors.map((row) => (
                                            <div
                                                key={row.rank}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "48px 1fr 120px",
                                                    padding: "8px 10px",
                                                    fontSize: 12,
                                                    borderTop: `1px solid ${theme.border}`,
                                                    background: row.relatedToAir ? "#eff6ff" : "#fff",
                                                    color: row.relatedToAir ? "#1d4ed8" : theme.text,
                                                }}
                                            >
                                                <span style={{ fontWeight: 700 }}>{row.rank}</span>
                                                <span>{row.name}</span>
                                                <span style={{ textAlign: "right", fontWeight: 700 }}>{row.deaths}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 10, fontSize: 12, color: theme.textLight }}>
                                        Nguồn: IHME, Global Burden of Disease (2024) - with minor processing by Our World in Data
                                    </div>
                                </div>

                                <div style={{ background: "#fff", border: `1px solid ${theme.border}`, borderRadius: 14, padding: "14px 14px 10px" }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 8 }}>
                                        Nguồn chính gây ô nhiễm PM2.5
                                    </div>
                                    <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
                                        Vì PM2.5 là các hạt bụi mịn có đường kính lên đến 2,5 micromet, có thể xâm nhập sâu vào phổi và đi vào máu, chúng gây ra những rủi ro đáng kể cho sức khỏe.
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden" }}>
                                        {pm25Sources.map((item, idx) => (
                                            <div
                                                key={item.label}
                                                style={{
                                                    padding: "18px 12px",
                                                    textAlign: "center",
                                                    borderRight: idx % 2 === 0 ? `1px solid ${theme.border}` : "none",
                                                    borderBottom: idx < pm25Sources.length - 2 ? `1px solid ${theme.border}` : "none",
                                                }}
                                            >
                                                <div style={{ fontSize: 30, marginBottom: 6 }}>{item.icon}</div>
                                                <div style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>{item.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 10, fontSize: 12, color: theme.textLight }}>
                                        Nguồn: AQMD Community in Action Guidebook
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Stack>
                </div>
            </section>
        </MainLayout>
    );
}
