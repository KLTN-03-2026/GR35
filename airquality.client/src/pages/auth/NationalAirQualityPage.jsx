import { useEffect, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import Map, { NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import MainLayout from "../../components/layout/MainLayout";
import "./NationalAirQualityPage.css";

const METRICS = {
    aqi: {
        key: "aqi",
        label: "AQI",
        stationKey: "aqi",
        provinceKey: "avgAqi",
        legend: ["0", "50", "100", "150", "200", "300+"],
    },
    pm25: {
        key: "pm25",
        label: "PM2.5",
        stationKey: "pm25",
        provinceKey: "avgPm25",
        legend: ["0", "15", "35", "55", "150", "250+"],
    },
    pm10: {
        key: "pm10",
        label: "PM10",
        stationKey: "pm10",
        provinceKey: "avgPm10",
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
    longitude: 106.2,
    latitude: 16.3,
    zoom: 5.3,
    pitch: 0,
    bearing: 0,
};

const MAPBOX_TOKEN = "";

function getHeatmapRadiusPixels(zoom) {
    if (zoom <= 5) return 90;
    if (zoom <= 6) return 110;
    if (zoom <= 7) return 140;
    if (zoom <= 8) return 180;
    return 220;
}

export default function NationalAirQualityPage() {
    const [stations, setStations] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [metric, setMetric] = useState("aqi");
    const [viewMode, setViewMode] = useState("provinces");
    const [search, setSearch] = useState("");
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

    const metricConfig = METRICS[metric];
    const mapboxToken = MAPBOX_TOKEN;

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setLoading(true);
            setError("");

            try {
                const [stationsRes, provincesRes] = await Promise.all([
                    fetch("/api/airquality/stations-latest", { cache: "no-store" }),
                    fetch("/api/airquality/provinces-summary", { cache: "no-store" }),
                ]);

                if (!stationsRes.ok || !provincesRes.ok) {
                    throw new Error("Không tải được dữ liệu bản đồ toàn quốc.");
                }

                const [stationsData, provincesData] = await Promise.all([
                    stationsRes.json(),
                    provincesRes.json(),
                ]);

                if (ignore) return;

                setStations(Array.isArray(stationsData) ? stationsData : []);
                setProvinces(Array.isArray(provincesData) ? provincesData : []);
            } catch (e) {
                if (ignore) return;
                setStations([]);
                setProvinces([]);
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
                intensity: 2.5,
                threshold: 0.03,
                opacity: HEATMAP_OPACITY,
                colorRange: COLOR_RANGE,
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
                getFillColor: [255, 255, 255, 185],
                getLineColor: [17, 24, 39, 190],
                pickable: true,
            }),
        ];
    }, [provinces, stations, metricConfig, viewState.zoom]);

    const tableRows = viewMode === "stations" ? filteredAndSortedStationRows : filteredAndSortedProvinceRows;

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
                                getTooltip={({ object }) => {
                                    if (!object) return null;
                                    const value = Number(object[metricConfig.stationKey] ?? 0);
                                    return {
                                        text: `Trạm: ${object.stationName}\nTỉnh: ${object.provinceName}\n${metricConfig.label}: ${value.toFixed(1)}`,
                                    };
                                }}
                            >
                                <Map
                                    reuseMaps
                                    mapStyle="mapbox://styles/mapbox/dark-v11"
                                    mapboxAccessToken={mapboxToken}
                                >
                                    <NavigationControl position="top-right" />
                                </Map>
                            </DeckGL>

                            {!mapboxToken && (
                                <div className="national-air-mapbox-warning">
                                    Thiếu token Mapbox. Hãy cấu hình `VITE_MAPBOX_TOKEN` (hoặc `VITE_MAPBOX_ACCESS_TOKEN`) trong `airquality.client/.env.local` và khởi động lại frontend.
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

                    <aside className="national-air-table-card">
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
                    </aside>
                </div>
            </section>
        </MainLayout>
    );
}
