import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import "ndamap-gl/dist/ndamap-gl.css";
import MainLayout from "../../components/layout/MainLayout";
import "./NationalAirQualityPage.css";

const METRICS = {
    aqi: {
        key: "aqi",
        label: "AQI",
        stationKey: "aqi",
        provinceKey: "avgAqi",
        thresholds: [50, 100, 150, 200, 300],
        legend: ["0", "50", "100", "150", "200", "300+"],
    },
    pm25: {
        key: "pm25",
        label: "PM2.5",
        stationKey: "pm25",
        provinceKey: "avgPm25",
        thresholds: [15, 35, 55, 150, 250],
        legend: ["0", "15", "35", "55", "150", "250+"],
    },
    pm10: {
        key: "pm10",
        label: "PM10",
        stationKey: "pm10",
        provinceKey: "avgPm10",
        thresholds: [50, 100, 150, 250, 350],
        legend: ["0", "50", "100", "150", "250", "350+"],
    },
};

const COLOR_RANGE = [
    [34, 197, 94, 220],
    [250, 204, 21, 220],
    [249, 115, 22, 220],
    [239, 68, 68, 220],
    [168, 85, 247, 220],
    [120, 53, 15, 220],
];

const HEATMAP_OPACITY = 0.35;

const INITIAL_VIEW_STATE = {
    longitude: 106.0,
    latitude: 15.5,
    zoom: 4.5,
    pitch: 0,
    bearing: 0,
};

const NDAMAPS_STYLE = import.meta.env.VITE_NDAMAPS_STYLE || "https://nda-tiles.openmap.vn/styles/ndamap/style.json";

function getHeatmapRadiusPixels(zoom) {
    // Scale radius exponentially with zoom so that the geographic coverage
    // stays roughly constant (~80-100 km per point), keeping the full
    // 63-province color blanket even when zoomed in.
    const base = 90;
    const factor = Math.pow(2, Math.max(0, zoom - 4.5));
    return Math.round(base * factor);
}

function getMetricColor(metricCfg, value, alpha = 220) {
    const numericValue = Number(value ?? 0);
    const idx = metricCfg.thresholds.findIndex((threshold) => numericValue <= threshold);
    const color = idx === -1 ? COLOR_RANGE[COLOR_RANGE.length - 1] : COLOR_RANGE[idx];
    return [color[0], color[1], color[2], alpha];
}

export default function NationalAirQualityPage() {
    const isMobile = useMediaQuery("(max-width:640px)");
    const [stations, setStations] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [metric, setMetric] = useState("aqi");
    const [viewMode, setViewMode] = useState("provinces");
    const [search, setSearch] = useState("");
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const navigate = useNavigate();

    const metricConfig = METRICS[metric];

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setLoading(true);
            setError("");

            try {
                const [stationsRes, provincesRes, reportsRes] = await Promise.all([
                    fetch("/api/airquality/stations-latest", { cache: "no-store" }),
                    fetch("/api/airquality/provinces-summary", { cache: "no-store" }),
                    fetch("/api/community-reports/map", { cache: "no-store" }),
                ]);

                if (!stationsRes.ok || !provincesRes.ok) {
                    throw new Error("Không tải được dữ liệu bản đồ toàn quốc.");
                }

                const [stationsData, provincesData, reportsData] = await Promise.all([
                    stationsRes.json(),
                    provincesRes.json(),
                    reportsRes.ok ? reportsRes.json() : Promise.resolve([]),
                ]);

                if (ignore) return;

                setStations(Array.isArray(stationsData) ? stationsData : []);
                setProvinces(Array.isArray(provincesData) ? provincesData : []);
                setReports(Array.isArray(reportsData) ? reportsData : []);
            } catch (e) {
                if (ignore) return;
                setStations([]);
                setProvinces([]);
                setReports([]);
                setError(e instanceof Error ? e.message : "Đã xảy ra lỗi khi tải dữ liệu.");
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
    }, []);

    const normalizedSearch = useMemo(
        () => search.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        [search],
    );

    const filteredAndSortedStationRows = useMemo(() => {
        const stationMetricKey = metricConfig.stationKey;

        return stations
            .filter((item) => {
                if (!normalizedSearch) return true;

                const stationName = (item.stationName ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const provinceName = (item.provinceName ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                return stationName.includes(normalizedSearch) || provinceName.includes(normalizedSearch);
            })
            .sort((a, b) => Number(b[stationMetricKey] ?? 0) - Number(a[stationMetricKey] ?? 0));
    }, [stations, normalizedSearch, metricConfig]);

    const filteredAndSortedProvinceRows = useMemo(() => {
        const provinceMetricKey = metricConfig.provinceKey;

        return provinces
            .filter((item) => {
                if (!normalizedSearch) return true;

                const provinceName = (item.provinceName ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return provinceName.includes(normalizedSearch);
            })
            .sort((a, b) => Number(b[provinceMetricKey] ?? 0) - Number(a[provinceMetricKey] ?? 0));
    }, [provinces, normalizedSearch, metricConfig]);

    const reportPoints = useMemo(() => {
        if (!reports.length) return [];

        const provinceMetricKey = metricConfig.provinceKey;

        return reports.map((report) => {
            const reportLng = Number(report.longitude);
            const reportLat = Number(report.latitude);

            if (!Number.isFinite(reportLng) || !Number.isFinite(reportLat) || provinces.length === 0) {
                return {
                    ...report,
                    metricValue: null,
                    metricColor: getMetricColor(metricConfig, 0, 230),
                };
            }

            const nearestProvince = provinces.reduce(
                (nearest, province) => {
                    const provinceLng = Number(province.lng);
                    const provinceLat = Number(province.lat);

                    if (!Number.isFinite(provinceLng) || !Number.isFinite(provinceLat)) {
                        return nearest;
                    }

                    const distance = (provinceLng - reportLng) ** 2 + (provinceLat - reportLat) ** 2;

                    if (distance < nearest.distance) {
                        return { distance, province };
                    }

                    return nearest;
                },
                { distance: Number.POSITIVE_INFINITY, province: null },
            );

            const metricValue = nearestProvince.province
                ? Number(nearestProvince.province[provinceMetricKey] ?? 0)
                : null;

            return {
                ...report,
                metricValue,
                metricColor: getMetricColor(metricConfig, metricValue ?? 0, 230),
            };
        });
    }, [reports, provinces, metricConfig]);

    const layers = useMemo(() => {
        const stationMetricKey = metricConfig.stationKey;
        const provinceMetricKey = metricConfig.provinceKey;
        const radiusPixels = getHeatmapRadiusPixels(viewState.zoom);

        return [
            new HeatmapLayer({
                id: "national-air-heatmap",
                data: provinces,
                getPosition: (d) => [Number(d.lng), Number(d.lat)],
                getWeight: (d) => Number(d[provinceMetricKey] ?? 0),
                radiusPixels,
                intensity: 1.8,
                threshold: 0.01,
                opacity: HEATMAP_OPACITY,
                colorRange: COLOR_RANGE,
                aggregation: 'SUM',
                pickable: false,
            }),
            new ScatterplotLayer({
                id: "national-air-stations",
                data: stations,
                getPosition: (d) => [Number(d.lng), Number(d.lat)],
                getRadius: 6500,
                radiusMinPixels: 3,
                radiusMaxPixels: 8,
                stroked: true,
                filled: true,
                lineWidthMinPixels: 1,
                getFillColor: (d) => getMetricColor(metricConfig, d[stationMetricKey], 190),
                getLineColor: [17, 24, 39, 190],
                pickable: true,
                onClick: ({ object }) => {
                    if (object) {
                        setSelectedStation(object);
                        setViewState({
                            ...viewState,
                            longitude: Number(object.lng),
                            latitude: Number(object.lat),
                            zoom: 12,
                            transitionDuration: 800,
                        });
                    }
                },
            }),
            new ScatterplotLayer({
                id: "national-air-reports-bg",
                data: reportPoints,
                getPosition: (d) => [Number(d.longitude), Number(d.latitude)],
                getRadius: 5000,
                radiusMinPixels: 10,
                radiusMaxPixels: 20,
                getFillColor: (d) => d.metricColor,
                getLineColor: [255, 255, 255, 255],
                stroked: true,
                pickable: true,
                onClick: ({ object }) => {
                    if (object) {
                        setViewState({
                            ...viewState,
                            longitude: Number(object.longitude),
                            latitude: Number(object.latitude),
                            zoom: 14,
                            transitionDuration: 800
                        });
                    }
                }
            }),
            new IconLayer({
                id: "national-air-reports",
                data: reportPoints,
                getPosition: (d) => [Number(d.longitude), Number(d.latitude)],
                getIcon: () => ({
                    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" font-size="40" text-anchor="middle" dominant-baseline="central">🔥</text></svg>'),
                    width: 48,
                    height: 48,
                    anchorY: 24
                }),
                getSize: 40,
                pickable: true,
                onClick: ({ object }) => {
                    if (object) {
                        setViewState({
                            ...viewState,
                            longitude: Number(object.longitude),
                            latitude: Number(object.latitude),
                            zoom: 14,
                            transitionDuration: 800
                        });
                    }
                }
            }),
        ];
    }, [provinces, stations, reportPoints, metricConfig, viewState]);

    const tableRows = viewMode === "stations" ? filteredAndSortedStationRows : filteredAndSortedProvinceRows;
    const tablePanel = (
        <>
            <div className="table-head">
                <h2>{viewMode === "stations" ? "Xếp hạng trạm" : "Xếp hạng tỉnh/thành"}</h2>
                <p>
                    Sắp xếp giảm dần theo {metricConfig.label}
                    {viewMode === "provinces" ? " trung bình" : ""}
                </p>
            </div>

            <input
                type="text"
                className="table-search"
                placeholder="Tìm theo trạm hoặc tỉnh/thành..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="national-air-table-body">
                <table>
                    <thead>
                        <tr>
                            {viewMode === "stations" ? (
                                <>
                                    <th>Trạm</th>
                                    <th>Tỉnh/Thành</th>
                                    <th>{metricConfig.label}</th>
                                </>
                            ) : (
                                <>
                                    <th>Tỉnh/Thành</th>
                                    <th>{metricConfig.label} TB</th>
                                    <th>Số trạm</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.map((row, idx) => (
                            <tr key={viewMode === "stations" ? row.stationId : `${row.provinceId}-${row.provinceName}`}>
                                {viewMode === "stations" ? (
                                    <>
                                        <td>
                                            <div className="ranked-name">
                                                <span className="rank-index">#{idx + 1}</span>
                                                <span>{row.stationName}</span>
                                            </div>
                                        </td>
                                        <td>{row.provinceName}</td>
                                        <td>{Number(row[metricConfig.stationKey] ?? 0).toFixed(1)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>
                                            <div className="ranked-name">
                                                <span className="rank-index">#{idx + 1}</span>
                                                <span>{row.provinceName}</span>
                                            </div>
                                        </td>
                                        <td>{Number(row[metricConfig.provinceKey] ?? 0).toFixed(1)}</td>
                                        <td>{row.totalStations}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!loading && tableRows.length === 0 && (
                    <div className="table-empty">Không có dữ liệu phù hợp.</div>
                )}
            </div>
        </>
    );

    return (
        <MainLayout activePage="Bản đồ">
            <section className="national-air-page">
                <div className="national-air-header">
                    <h1>Bản đồ nhiệt & dữ liệu không khí toàn quốc</h1>
                    <p>Nội suy KDE từ dữ liệu trạm và xếp hạng động theo chỉ số ô nhiễm.</p>
                </div>

                {error && <div className="national-air-error">{error}</div>}

                <div className="national-air-layout">
                    <div className="national-air-map-card">
                        <div className="national-air-toolbar">
                            <div className="national-air-toggle-group">
                                {Object.values(METRICS).map((m) => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        className={metric === m.key ? "active" : ""}
                                        onClick={() => setMetric(m.key)}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            <div className="national-air-toggle-group">
                                <button
                                    type="button"
                                    className={viewMode === "provinces" ? "active" : ""}
                                    onClick={() => setViewMode("provinces")}
                                >
                                    Cấp Tỉnh/Thành
                                </button>
                                <button
                                    type="button"
                                    className={viewMode === "stations" ? "active" : ""}
                                    onClick={() => setViewMode("stations")}
                                >
                                    Cấp Trạm
                                </button>
                            </div>
                        </div>

                        <div className="national-air-map">
                            <DeckGL
                                viewState={viewState}
                                onViewStateChange={({ viewState: nextViewState }) => setViewState(nextViewState)}
                                controller={true}
                                layers={layers}
                                onClick={(info) => {
                                    if (!info.object) setSelectedStation(null);
                                }}
                                getTooltip={({ object, layer }) => {
                                    if (!object) return null;
                                    if (layer.id === "national-air-reports" || layer.id === "national-air-reports-bg") {
                                        const metricText = Number.isFinite(object.metricValue)
                                            ? `${metricConfig.label} khu vực gần nhất: ${Number(object.metricValue).toFixed(1)}`
                                            : `${metricConfig.label} khu vực gần nhất: N/A`;

                                        return {
                                            html: `
                                                <div style="font-family: 'Be Vietnam Pro', sans-serif; font-size: 13px; color: #1f2937; max-width: 240px; padding: 4px;">
                                                    <div style="color: #ef4444; font-weight: 800; text-transform: uppercase; font-size: 11px; margin-bottom: 6px; letter-spacing: 0.5px;">Báo cáo cộng đồng</div>
                                                    <div style="font-weight: 600; margin-bottom: 8px; line-height: 1.4;">${object.description}</div>
                                                    <div style="color: #6b7280; font-size: 11px; margin-bottom: ${object.imageUrl ? '10px' : '0'};">
                                                        Báo cáo bởi: ${object.userFullName || 'N/A'}<br/>
                                                        Lúc: ${new Date(typeof object.reportTime === 'string' && !object.reportTime.endsWith('Z') ? object.reportTime + 'Z' : object.reportTime).toLocaleString('vi-VN')}<br/>
                                                        ${metricText}
                                                    </div>
                                                    ${object.imageUrl ? `<img src="${object.imageUrl}" style="width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; object-fit: cover; max-height: 150px;" />` : ''}
                                                </div>
                                            `,
                                            style: {
                                                backgroundColor: '#ffffff',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                                border: '1px solid #e5e7eb',
                                                padding: '12px'
                                            }
                                        };
                                    }
                                    const value = Number(object[metricConfig.stationKey] ?? 0);
                                    return {
                                        text: `Trạm: ${object.stationName}\nTỉnh: ${object.provinceName}\n${metricConfig.label}: ${value.toFixed(1)}`,
                                    };
                                }}
                            >
                                <Map
                                    reuseMaps
                                    mapStyle={NDAMAPS_STYLE}
                                >
                                    <NavigationControl position="top-right" />
                                </Map>
                            </DeckGL>

                            {selectedStation && (
                                <div className="station-popup-overlay">
                                    <div className="station-popup">
                                        <button
                                            type="button"
                                            className="station-popup-close"
                                            onClick={() => setSelectedStation(null)}
                                            aria-label="Đóng"
                                        >
                                            ✕
                                        </button>
                                        <div className="station-popup-name">{selectedStation.stationName}</div>
                                        <div className="station-popup-province">{selectedStation.provinceName}</div>
                                        <div className="station-popup-metrics">
                                            <span className="station-popup-metric-badge" style={{ background: `rgba(${getMetricColor(metricConfig, selectedStation[metricConfig.stationKey], 255).join(',')})` }}>
                                                {metricConfig.label}: {Number(selectedStation[metricConfig.stationKey] ?? 0).toFixed(1)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="station-popup-detail-btn"
                                            onClick={() => navigate(`/tram/${selectedStation.stationId}`)}
                                        >
                                            Xem chi tiết →
                                        </button>
                                    </div>
                                </div>
                            )}


                            <div className="national-air-legend">
                                <div className="legend-title">Thang màu {metricConfig.label}</div>
                                <div className="legend-scale">
                                    {COLOR_RANGE.map((color, idx) => (
                                        <span
                                            key={idx}
                                            style={{ background: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)` }}
                                        />
                                    ))}
                                </div>
                                <div className="legend-labels">
                                    {metricConfig.legend.map((label) => (
                                        <span key={label}>{label}</span>
                                    ))}
                                </div>
                            </div>

                            {loading && <div className="national-air-overlay">Đang tải dữ liệu bản đồ…</div>}
                        </div>
                    </div>

                    {!isMobile && <aside className="national-air-table-card">{tablePanel}</aside>}
                </div>

                {isMobile && (
                    <>
                        <button
                            type="button"
                            className="mobile-sheet-trigger"
                            onClick={() => setSheetOpen(true)}
                        >
                            Xếp hạng {metricConfig.label}
                        </button>
                        <SwipeableDrawer
                            anchor="bottom"
                            open={sheetOpen}
                            onOpen={() => setSheetOpen(true)}
                            onClose={() => setSheetOpen(false)}
                            disableDiscovery={false}
                            PaperProps={{
                                sx: {
                                    borderTopLeftRadius: 16,
                                    borderTopRightRadius: 16,
                                    maxHeight: "78vh",
                                    overflow: "hidden",
                                },
                            }}
                        >
                            <Box className="mobile-sheet-handle-wrap">
                                <span className="mobile-sheet-handle" />
                            </Box>
                            <Box className="national-air-table-card mobile-sheet-card">{tablePanel}</Box>
                        </SwipeableDrawer>
                    </>
                )}
            </section>
        </MainLayout>
    );
}
