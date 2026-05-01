import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar
} from 'recharts';
import { Download, Search, AlertCircle, Filter, Calendar, MapPin, Database } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const C = {
    green: "#0d6e4e",
    greenBg: "#f0fdf4",
    greenBorder: "#bbf7d0",
    text: "#1a2e1a",
    textMuted: "#5a6e5a",
    border: "#e5e7eb",
    yellow: "#f59e0b",
    orange: "#f97316",
    white: "#ffffff",
    bg: "#f9fafb"
};

export default function HistoryExportTab({ isMobile }) {
    const { subscriptionTier } = useAuth();
    const isPro = subscriptionTier?.toLowerCase() === 'pro';
    const [entityType, setEntityType] = useState('city');
    const [selectedEntity, setSelectedEntity] = useState('');
    const [dateRange, setDateRange] = useState('7d');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [minPm25, setMinPm25] = useState('');

    const [cities, setCities] = useState([]);
    const [stations, setStations] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cities and stations on mount
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [citiesRes, stationsRes] = await Promise.all([
                    fetch('/api/City'),
                    fetch('/api/AirQuality/map-stations')
                ]);
                const citiesData = await citiesRes.json();
                const stationsData = await stationsRes.json();

                citiesData.sort((a, b) => a.provinceName.localeCompare(b.provinceName));
                stationsData.sort((a, b) => a.stationName.localeCompare(b.stationName));

                setCities(citiesData);
                setStations(stationsData);

                if (citiesData.length > 0) {
                    setSelectedEntity(citiesData[0].slug);
                }
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        fetchMetadata();
    }, []);

    // Handle type toggle
    useEffect(() => {
        if (entityType === 'city' && cities.length > 0) setSelectedEntity(cities[0].slug);
        if (entityType === 'station' && stations.length > 0) setSelectedEntity(stations[0].stationId.toString());
    }, [entityType, cities, stations]);

    // Fetch historical data
    const fetchHistory = async () => {
        if (!selectedEntity) return;

        setLoading(true);
        setError(null);
        try {
            let url = '';
            let params = new URLSearchParams();

            if (dateRange === 'custom') {
                if (!isPro) throw new Error("Tính năng yêu cầu tài khoản nâng cấp PRO");
                if (customStartDate) params.append('startDate', new Date(customStartDate).toISOString());
                if (customEndDate) params.append('endDate', new Date(customEndDate).toISOString());
            } else {
                let hours = 24;
                if (dateRange === '7d') {
                    if (!isPro) throw new Error("Tính năng yêu cầu tài khoản nâng cấp PRO");
                    hours = 168; // 7 * 24
                }
                if (dateRange === '30d') {
                    if (!isPro) throw new Error("Tính năng yêu cầu tài khoản nâng cấp PRO");
                    hours = 720; // 30 * 24
                }
                params.append('hours', hours);
            }

            if (minPm25 && !isNaN(minPm25)) {
                params.append('minPm25', minPm25);
            }

            if (entityType === 'city') {
                url = `/api/City/${selectedEntity}/history?${params.toString()}`;
            } else {
                url = `/api/AirQuality/station/${selectedEntity}/history?${params.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Đã xảy ra lỗi khi tải dữ liệu.");
            }

            let parsedData = await response.json();
            parsedData.reverse();

            // map dates for chart
            parsedData = parsedData.map(d => {
                const tsStr = typeof d.timestamp === 'string' && !d.timestamp.endsWith('Z') ? d.timestamp + 'Z' : d.timestamp;
                const date = new Date(tsStr);
                return {
                    ...d,
                    formattedTime: date.toLocaleString('vi-VN', {
                        hour: '2-digit', minute: '2-digit',
                        day: '2-digit', month: '2-digit'
                    }),
                    rawDate: date
                };
            });
            setData(parsedData);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu quá khứ", err);
            setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [selectedEntity, dateRange]); // We don't auto-fetch when typing custom dates until user clicks "Fetch" if custom

    // Export to CSV
    const exportData = () => {
        if (!data || data.length === 0) return;

        // Extract headers from the first object, excluding internal/formatting properties
        const excludedKeys = ['rawDate', 'colorHex', 'formattedTime'];
        const allKeys = Object.keys(data[0]).filter(k => !excludedKeys.includes(k));

        // Put formattedTime as the first column, followed by everything else
        // We ensure raw date parsing fits Vietnamese format
        const exportKeys = ['formattedTime', ...allKeys];

        const defaultHeaders = {
            formattedTime: "Thời gian",
            timestamp: "Mốc thời gian",
            calculatedAqi: "AQI",
            level: "Mức độ",
            pm25: "PM2.5 (µg/m³)",
            pm10: "PM10 (µg/m³)",
            o3: "O3",
            co: "CO",
            no2: "NO2",
            so2: "SO2",
            nh3: "NH3",
            temperature: "Nhiệt độ (°C)",
            feelsLike: "Cảm giác (°C)",
            humidity: "Độ ẩm (%)",
            pressure: "Áp suất (hPa)",
            windSpeed: "Tốc độ gió (m/s)",
            windDeg: "Hướng gió",
            cloudCover: "Mây che phủ (%)",
            visibility: "Tầm nhìn (m)",
            weatherMain: "Thời tiết chung",
            weatherDescription: "Mô tả thời tiết",
            aqiPm25: "PM2.5 AQI",
            aqiPm10: "PM10 AQI",
            aqiCo: "CO AQI",
            aqiNo2: "NO2 AQI",
            aqiSo2: "SO2 AQI",
            aqiO3: "O3 AQI"
        };

        const headers = exportKeys.map(k => defaultHeaders[k] || k.charAt(0).toUpperCase() + k.slice(1));
        const csvRows = [headers.map(h => `"${h}"`).join(',')];

        data.forEach(row => {
            const rowData = exportKeys.map(k => {
                const val = row[k] ?? '';
                // Serialize carefully with quotes and handle inner quotes
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvRows.push(rowData.join(','));
        });

        const csvString = "\uFEFF" + csvRows.join('\n'); // adding BOM for UTF-8
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);

        let filenamePrefix = entityType === 'city' ?
            cities.find(c => c.slug === selectedEntity)?.provinceName :
            stations.find(s => s.stationId.toString() === selectedEntity)?.stationName;

        link.setAttribute("download", `EcoAir_Export_${filenamePrefix || 'Data'}_${dateRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header / Description */}
            <div style={{ background: C.white, borderRadius: 14, padding: "20px 24px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: "0 0 6px 0", display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Database size={20} color={C.green} />
                            Truy xuất dữ liệu lịch sử
                        </h2>
                        <div style={{ fontSize: 13, color: C.textMuted }}>
                            Tra cứu và tải xuống dữ liệu chất lượng không khí quá khứ của các trạm và thành phố.
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
                    {/* Type Filter */}
                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : 200 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Phân loại</label>
                        <select
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none', background: C.bg }}
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                        >
                            <option value="city">Thành phố (Trung bình chung)</option>
                            <option value="station">Trạm quan trắc chi tiết</option>
                        </select>
                    </div>

                    {/* Entity Filter */}
                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : 200 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>
                            {entityType === 'city' ? 'Thành phố' : 'Trạm quan trắc'}
                        </label>
                        <select
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none', background: C.bg }}
                            value={selectedEntity}
                            onChange={(e) => setSelectedEntity(e.target.value)}
                        >
                            {entityType === 'city' && cities.map(c => (
                                <option key={c.slug} value={c.slug}>{c.provinceName}</option>
                            ))}
                            {entityType === 'station' && stations.map(s => (
                                <option key={s.stationId} value={s.stationId}>{s.stationName} - {s.city}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Filter */}
                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : 140 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Thời gian</label>
                        <select
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none', background: C.bg }}
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="24h">24 giờ qua</option>
                            <option value="7d">7 ngày qua</option>
                            <option value="30d">30 ngày qua (PRO)</option>
                            <option value="custom">Tuỳ chỉnh (PRO)</option>
                        </select>
                    </div>

                    {/* PM2.5 Filter */}
                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : 140 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Lọc PM2.5 (≥)</label>
                        <input
                            type="number"
                            placeholder="Ngưỡng (µg/m³)"
                            value={minPm25}
                            onChange={(e) => setMinPm25(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none', background: C.bg }}
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : 120, alignSelf: 'flex-end', marginTop: isMobile ? 8 : 0 }}>
                        <button
                            onClick={fetchHistory}
                            style={{
                                width: "100%", padding: "10px 0",
                                background: C.green, color: "white",
                                border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}
                        >
                            <Search size={16} /> Truy vấn
                        </button>
                    </div>
                </div>

                {/* Custom Dates Row */}
                {dateRange === 'custom' && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'flex-end', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: isMobile ? '100%' : 150 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Từ ngày</label>
                            <input
                                type="date"
                                style={{ width: '100%', padding: '9px 14px', borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none', background: C.bg }}
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: isMobile ? '100%' : 150 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>Đến ngày</label>
                            <input
                                type="date"
                                style={{ width: '100%', padding: '9px 14px', borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none', background: C.bg }}
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: 150 }} />
                    </div>
                )}
            </div>

            {error && (
                <div style={{ padding: "14px 18px", borderRadius: 10, background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Results Section */}
            <div style={{ background: C.white, borderRadius: 14, padding: "20px 24px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 16, marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
                        Biểu đồ & Dữ liệu
                    </h3>
                    <button
                        onClick={exportData}
                        disabled={loading || data.length === 0}
                        style={{
                            padding: "8px 16px", background: (loading || data.length === 0) ? C.border : C.greenBg,
                            color: (loading || data.length === 0) ? C.textMuted : C.green,
                            border: `1px solid ${(loading || data.length === 0) ? C.border : C.greenBorder}`, borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: (loading || data.length === 0) ? 'not-allowed' : "pointer",
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: "all 0.2s"
                        }}
                    >
                        <Download size={16} /> Xuất CSV ({data.length} dòng)
                    </button>
                </div>

                {loading ? (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textLight }}>
                        Đang lấy dữ liệu...
                    </div>
                ) : data.length > 0 ? (
                    <>
                        <div style={{ height: 340, width: '100%', marginBottom: 30 }}>
                            <ResponsiveContainer>
                                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={C.green} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={C.green} stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="formattedTime"
                                        tick={{ fontSize: 11, fill: C.textMuted }}
                                        tickMargin={10}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: C.textMuted }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: 12 }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                    <Bar name="Chỉ số AQI" dataKey="calculatedAqi" fill="url(#colorAqi)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Line type="monotone" name="Bụi mịn PM2.5" dataKey="pm25" stroke={C.yellow} strokeWidth={2} dot={false} />
                                    <Line type="monotone" name="Bụi mịn PM10" dataKey="pm10" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead>
                                    <tr style={{ background: C.bg, color: C.textMuted, textAlign: 'left' }}>
                                        <th style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>Thời gian</th>
                                        <th style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>AQI</th>
                                        <th style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>Mức độ</th>
                                        <th style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>PM2.5 (µg/m³)</th>
                                        <th style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>PM10 (µg/m³)</th>
                                        <th style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>Nhiệt độ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(0, 20).map((row, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                                            <td style={{ padding: "10px 14px", color: C.textMuted }}>{row.formattedTime}</td>
                                            <td style={{ padding: "10px 14px", fontWeight: 700, color: row.colorHex || C.text }}>{row.calculatedAqi}</td>
                                            <td style={{ padding: "10px 14px" }}>
                                                <span style={{
                                                    background: `${row.colorHex}20` || C.greenBg,
                                                    color: row.colorHex || C.green,
                                                    padding: "3px 8px",
                                                    borderRadius: 4,
                                                    fontWeight: 600,
                                                    fontSize: 11
                                                }}>
                                                    {row.level || "Tốt"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px 14px", color: C.textMuted }}>{row.pm25}</td>
                                            <td style={{ padding: "10px 14px", color: C.textMuted }}>{row.pm10}</td>
                                            <td style={{ padding: "10px 14px", color: C.textMuted }}>{row.temperature ? `${row.temperature}°C` : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data.length > 20 && (
                                <div style={{ textAlign: "center", padding: "12px", color: C.textLight, fontSize: 12 }}>
                                    Đang hiển thị 20 dòng gần nhất. Xuất JSON/CSV để xem toàn bộ <b>{data.length}</b> bản ghi.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textLight, flexDirection: 'column', gap: 10 }}>
                        <Database size={32} opacity={0.3} />
                        <div>Chưa có dữ liệu. Hãy bấm "Truy vấn" hoặc chọn trạm khác.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
