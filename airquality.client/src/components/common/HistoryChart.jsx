import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getLevel } from "../../utils/aqiHelper";

function fmtTime(ts) {
    if (!ts) return "—";
    const tsStr = typeof ts === 'string' && !ts.endsWith('Z') ? ts + 'Z' : ts;
    return new Date(tsStr).toLocaleString("vi-VN", {
        hour: "2-digit", minute: "2-digit",
        day: "2-digit", month: "long"
    }) + " Giờ địa phương";
}

function hexToRgb(hex, a = 1) {
    if (!hex) return `rgba(0,0,0,${a})`;
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
    const n = parseInt(full, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const C = {
    card: "#161d2e",
    text: "#f1f5f9",
    textSub: "#94a3b8",
    cardBorder: "#1e2d44"
};

export default function HistoryChart({ history, title, locationName }) {
    const [layer, setLayer] = useState("aqi"); // "aqi" or "pm25"
    const [hoveredData, setHoveredData] = useState(null);

    // Prepare data
    // Usually history is sorted oldest to newest for charts (left to right)
    // The parent might have reversed it. We want chronological order on the X-axis.
    // If the first element is the newest, we reverse it. We'll simply ensure time is increasing.
    let chartData = [...history];
    if (chartData.length > 1) {
        const t0 = typeof chartData[0].timestamp === 'string' && !chartData[0].timestamp.endsWith('Z') ? chartData[0].timestamp + 'Z' : chartData[0].timestamp;
        const t1 = typeof chartData[1].timestamp === 'string' && !chartData[1].timestamp.endsWith('Z') ? chartData[1].timestamp + 'Z' : chartData[1].timestamp;
        if (new Date(t0) > new Date(t1)) {
            chartData.reverse();
        }
    }

    const maxVal = chartData.length ? Math.max(...chartData.map(h => layer === "aqi" ? (h.calculatedAqi ?? 0) : (h.pm25 ?? 0))) : 100;

    // PM2.5 breakpoints for coloring (approximate US EPA)
    function getPm25Color(val) {
        if (val <= 12) return "#16a34a"; // Good
        if (val <= 35.4) return "#ca8a04"; // Moderate
        if (val <= 55.4) return "#ea580c"; // Unhealthy for Sensitive Groups
        if (val <= 150.4) return "#dc2626"; // Unhealthy
        if (val <= 250.4) return "#9333ea"; // Very Unhealthy
        return "#be123c"; // Hazardous
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            // Update hovered state but avoid updating state in render phase, better to do it in onMouseMove of the chart.
            // Oh wait, Recharts Tooltip manages its own content. The screenshot shows this info AT THE TOP OF THE CHART, not as a floating tooltip.
            return null; // We hide standard tooltip and use a custom top-bar info
        }
        return null;
    };

    // If nothing hovered, show the latest data by default
    const displayData = hoveredData || (chartData.length > 0 ? chartData[chartData.length - 1] : null);

    let displayVal = 0;
    let color = "#aaa";
    let statusText = "Không có dữ liệu";
    let unit = "";

    if (displayData) {
        if (layer === "aqi") {
            displayVal = displayData.calculatedAqi ?? 0;
            const lv = getLevel(displayVal);
            color = lv.color;
            statusText = lv.label;
            unit = "AQI";
        } else {
            displayVal = displayData.pm25 ?? 0;
            color = getPm25Color(displayVal);
            // approximate status text
            statusText = displayVal <= 12 ? "Tốt" : displayVal <= 35.4 ? "Trung bình" : displayVal <= 55.4 ? "Không tốt cho các nhóm nhạy cảm" : displayVal <= 150.4 ? "Không tốt" : "Rất không tốt";
            unit = "µg/m³ PM2.5";
        }
    }

    const timeLabel = displayData ? fmtTime(displayData.timestamp) : "";
    const formatXAxis = (tickItem) => {
        const tsStr = typeof tickItem === 'string' && !tickItem.endsWith('Z') ? tickItem + 'Z' : tickItem;
        const d = new Date(tsStr);
        return d.getHours().toString().padStart(2, "0") + ":00";
    };

    return (
        <div style={{ background: C.card, borderRadius: 16, padding: "24px", border: `1px solid ${C.cardBorder}`, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>
                Lịch sử
            </div>
            <div style={{ fontSize: 13, color: C.textSub, marginBottom: 24 }}>
                Biểu đồ chất lượng không khí lịch sử cho {locationName}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
                {/* Selected Data Info */}
                {displayData ? (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, marginTop: 6 }} />
                        <div>
                            <div style={{ fontSize: 18, color: C.text }}>
                                <span style={{ fontWeight: 800, marginRight: 4 }}>{Math.round(displayVal)}</span>
                                <span style={{ fontWeight: 600, fontSize: 15, marginRight: 8 }}>{unit}</span>
                                <span style={{ fontSize: 15, color: C.text }}>{statusText}</span>
                            </div>
                            <div style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>
                                {timeLabel}
                            </div>
                        </div>
                    </div>
                ) : <div />}

                {/* Layer Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>hằng giờ</span>
                    <select
                        value={layer}
                        onChange={(e) => setLayer(e.target.value)}
                        style={{
                            background: "transparent",
                            border: `1px solid ${C.textSub}`,
                            color: C.text,
                            padding: "6px 24px 6px 12px",
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            appearance: "none",
                            outline: "none",
                            cursor: "pointer"
                        }}
                    >
                        <option value="aqi" style={{ color: "#000" }}>AQI</option>
                        <option value="pm25" style={{ color: "#000" }}>PM2.5</option>
                    </select>
                </div>
            </div>

            {/* Chart Area */}
            {chartData.length > 0 ? (
                <div style={{ width: "100%", height: 200 }} onMouseLeave={() => setHoveredData(null)}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                            onMouseMove={(state) => {
                                if (state.isTooltipActive) {
                                    setHoveredData(state.activePayload[0].payload);
                                } else {
                                    setHoveredData(null);
                                }
                            }}
                        >
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={formatXAxis}
                                minTickGap={30}
                                tick={{ fill: C.textSub, fontSize: 11 }}
                                axisLine={{ stroke: C.cardBorder }}
                                tickLine={false}
                            />
                            <YAxis
                                orientation="right"
                                domain={[0, maxVal => Math.ceil(maxVal * 1.2)]}
                                tick={{ fill: C.textSub, fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickCount={4}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                            <Bar
                                dataKey={layer === "aqi" ? "calculatedAqi" : "pm25"}
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={true}
                            >
                                {chartData.map((entry, index) => {
                                    const val = layer === "aqi" ? (entry.calculatedAqi ?? 0) : (entry.pm25 ?? 0);
                                    let barColor = layer === "aqi" ? getLevel(val).color : getPm25Color(val);
                                    return <Cell key={`cell-${index}`} fill={barColor} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted, fontSize: 14 }}>
                    Không có dữ liệu lịch sử
                </div>
            )}
        </div>
    );
}
