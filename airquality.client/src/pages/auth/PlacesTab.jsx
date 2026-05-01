import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";

// ─── Design tokens (reuse from Dashboard) ─────────────────────────────────────
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
};

// ─── AQI color helper ─────────────────────────────────────────────────────────
function aqiColor(val) {
    if (val == null) return C.textLight;
    if (val <= 50) return "#22c55e";
    if (val <= 100) return "#f59e0b";
    if (val <= 150) return "#f97316";
    if (val <= 200) return "#ef4444";
    if (val <= 300) return "#a855f7";
    return "#7f1d1d";
}

function aqiBg(val) {
    if (val == null) return "#f3f4f6";
    if (val <= 50) return "#dcfce7";
    if (val <= 100) return "#fef9c3";
    if (val <= 150) return "#ffedd5";
    if (val <= 200) return "#fee2e2";
    if (val <= 300) return "#f3e8ff";
    return "#fecaca";
}

function formatTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " (local time)";
}

// ─── PlacesTab ────────────────────────────────────────────────────────────────
export default function PlacesTab({ isMobile }) {
    const { accessToken } = useAuth();
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [menuOpen, setMenuOpen] = useState(null);

    // Fetch favorites
    const fetchPlaces = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/favorite-places", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setPlaces(data);
            }
        } catch (e) {
            console.error("Failed to fetch places", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlaces(); }, []);

    // Remove favorite
    const handleRemove = async (item) => {
        const url = item.type === "station"
            ? `/api/favorite-places/stations/${item.id}`
            : `/api/favorite-places/cities/${item.id}`;
        try {
            await fetch(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setPlaces((prev) => prev.filter((p) => !(p.type === item.type && p.id === item.id)));
            setMenuOpen(null);
        } catch (e) {
            console.error("Failed to remove", e);
        }
    };

    // Open in new tab
    const handleOpen = (item) => {
        const url = item.type === "station"
            ? `/tram/${item.id}`
            : `/thanh-pho/${item.slug}`;
        window.open(url, "_blank");
        setMenuOpen(null);
    };

    // Filter
    const filtered = useMemo(() => {
        if (!search.trim()) return places;
        const q = search.toLowerCase();
        return places.filter(
            (p) =>
                (p.stationName || "").toLowerCase().includes(q) ||
                (p.cityName || "").toLowerCase().includes(q) ||
                (p.stateProvince || "").toLowerCase().includes(q)
        );
    }, [places, search]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    useEffect(() => { setPage(1); }, [search, perPage]);

    // Close menu on outside click
    useEffect(() => {
        const handler = () => setMenuOpen(null);
        if (menuOpen !== null) document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [menuOpen]);

    const columns = [
        { key: "stationName", label: "Trạm", width: 130 },
        { key: "cityName", label: "Thành phố", width: 130 },
        { key: "stateProvince", label: "Tỉnh/Thành phố", width: 120 },
        { key: "countryRegion", label: "Quốc gia", width: 110 },
        { key: "aqi", label: "AQI (VN)", width: 80 },
        { key: "pm25", label: "PM2.5 (µg/m³)", width: 105 },
        { key: "temperature", label: "Nhiệt độ (°C)", width: 80 },
        { key: "humidity", label: "Độ ẩm (%)", width: 95 },
        { key: "pressure", label: "Áp suất (mb)", width: 105 },
        { key: "updateTime", label: "Thời gian cập nhật", width: 120 },
    ];

    return (
        <div style={{ fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 12, marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Địa điểm</h2>
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: "8px 14px", minWidth: isMobile ? "100%" : 250,
                }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                    <input
                        placeholder="Tìm kiếm thành phố hoặc trạm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            border: "none", outline: "none", background: "transparent",
                            fontSize: 13, color: C.text, width: "100%",
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
                overflow: "hidden",
            }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: 14 }}>
                        Đang tải dữ liệu...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: 14 }}>
                        {places.length === 0
                            ? "Chưa có địa điểm yêu thích nào. Nhấn ★ trên trang chi tiết trạm hoặc thành phố để thêm."
                            : "Không tìm thấy kết quả phù hợp."}
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{
                            width: "100%", borderCollapse: "collapse", fontSize: 13,
                        }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    {columns.map((col) => (
                                        <th key={col.key} style={{
                                            textAlign: "left", padding: "12px 14px",
                                            fontWeight: 600, color: C.textMuted, fontSize: 12,
                                            whiteSpace: "nowrap", minWidth: col.width,
                                        }}>
                                            {col.label}
                                        </th>
                                    ))}
                                    <th style={{ width: 40 }} />
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((item, idx) => {
                                    const key = `${item.type}-${item.id}`;
                                    return (
                                        <tr key={key} style={{
                                            borderBottom: `1px solid ${C.border}`,
                                            transition: "background 0.15s",
                                        }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <td style={{ padding: "12px 14px", color: C.text }}>
                                                {item.stationName || "—"}
                                            </td>
                                            <td style={{ padding: "12px 14px" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                                    <span style={{ color: "#3b82f6", fontSize: 11 }}>●</span>
                                                    <span style={{ color: C.text }}>{item.cityName}</span>
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 14px", color: C.textMuted }}>{item.stateProvince}</td>
                                            <td style={{ padding: "12px 14px", color: C.textMuted }}>{item.countryRegion}</td>
                                            <td style={{ padding: "12px 14px" }}>
                                                {item.aqi != null ? (
                                                    <span style={{
                                                        display: "inline-block", padding: "3px 12px",
                                                        borderRadius: 6, fontWeight: 700, fontSize: 13,
                                                        background: aqiBg(item.aqi), color: aqiColor(item.aqi),
                                                    }}>
                                                        {item.aqi}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td style={{ padding: "12px 14px" }}>
                                                {item.pm25 != null ? (
                                                    <span style={{
                                                        display: "inline-block", padding: "3px 12px",
                                                        borderRadius: 6, fontWeight: 700, fontSize: 13,
                                                        background: aqiBg(item.pm25 > 35 ? 101 : item.pm25 > 12 ? 51 : 0),
                                                        color: aqiColor(item.pm25 > 35 ? 101 : item.pm25 > 12 ? 51 : 0),
                                                    }}>
                                                        {Math.round(item.pm25)}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td style={{ padding: "12px 14px", color: C.text }}>
                                                {item.temperature != null ? `${Math.round(item.temperature)}°C` : "—"}
                                            </td>
                                            <td style={{ padding: "12px 14px", color: C.textMuted }}>
                                                {item.humidity != null ? `${Math.round(item.humidity)}%` : "—"}
                                            </td>
                                            <td style={{ padding: "12px 14px", color: C.textMuted }}>
                                                {item.pressure != null ? Math.round(item.pressure) : "—"}
                                            </td>
                                            <td style={{ padding: "12px 14px", color: C.textMuted, fontSize: 12 }}>
                                                {formatTime(item.updateTime)}
                                            </td>
                                            <td style={{ padding: "12px 14px", position: "relative" }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpen(menuOpen === key ? null : key);
                                                    }}
                                                    style={{
                                                        background: "none", border: "none", cursor: "pointer",
                                                        fontSize: 18, color: C.textMuted, padding: "2px 6px",
                                                        borderRadius: 6,
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                                >
                                                    ⋮
                                                </button>
                                                {menuOpen === key && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            position: "absolute", right: 14, top: 40,
                                                            background: C.white, border: `1px solid ${C.border}`,
                                                            borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                                            zIndex: 100, minWidth: 160, overflow: "hidden",
                                                        }}
                                                    >
                                                        <div
                                                            onClick={() => handleOpen(item)}
                                                            style={{
                                                                padding: "10px 16px", fontSize: 13, cursor: "pointer",
                                                                color: C.text, transition: "background 0.15s",
                                                            }}
                                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                                        >
                                                            Mở tab mới
                                                        </div>
                                                        <div style={{ height: 1, background: C.border }} />
                                                        <div
                                                            onClick={() => handleRemove(item)}
                                                            style={{
                                                                padding: "10px 16px", fontSize: 13, cursor: "pointer",
                                                                color: C.red, transition: "background 0.15s",
                                                            }}
                                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
                                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                                        >
                                                            Xóa
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {filtered.length > 0 && (
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "14px 18px", borderTop: `1px solid ${C.border}`, fontSize: 13,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textMuted }}>
                            <span>Show:</span>
                            <select
                                value={perPage}
                                onChange={(e) => setPerPage(+e.target.value)}
                                style={{
                                    padding: "4px 8px", border: `1px solid ${C.border}`,
                                    borderRadius: 6, fontSize: 13, color: C.text,
                                    background: C.white, cursor: "pointer",
                                }}
                            >
                                {[10, 15, 25, 50].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textMuted }}>
                            <span>
                                {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length} items
                            </span>
                            <div style={{ display: "flex", gap: 4 }}>
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                                        background: C.white, cursor: page <= 1 ? "default" : "pointer",
                                        color: page <= 1 ? C.textLight : C.text, fontSize: 14,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >‹</button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const p = i + 1;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            style={{
                                                width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 600,
                                                border: page === p ? "none" : `1px solid ${C.border}`,
                                                background: page === p ? C.green : C.white,
                                                color: page === p ? "white" : C.text,
                                                cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                        >{p}</button>
                                    );
                                })}
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                                        background: C.white, cursor: page >= totalPages ? "default" : "pointer",
                                        color: page >= totalPages ? C.textLight : C.text, fontSize: 14,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >›</button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span>Jump</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={page}
                                    onChange={(e) => {
                                        const v = Math.max(1, Math.min(totalPages, +e.target.value || 1));
                                        setPage(v);
                                    }}
                                    style={{
                                        width: 42, padding: "4px 6px", border: `1px solid ${C.border}`,
                                        borderRadius: 6, fontSize: 13, textAlign: "center",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
