import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Activity, RefreshCcw, Search, ShieldAlert, Power, PowerOff } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const C = {
    card: '#14202e',
    cardBorder: '#1e3048',
    text: '#e8edf3',
    textMuted: '#9db0c3',
    textDim: '#6f8397',
    green: '#22c55e',
    greenSoft: 'rgba(34,197,94,0.14)',
    blue: '#3b82f6',
    blueSoft: 'rgba(59,130,246,0.14)',
    orange: '#f59e0b',
    orangeSoft: 'rgba(245,158,11,0.14)',
    red: '#ef4444',
    redSoft: 'rgba(239,68,68,0.14)',
};

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDateTime(value) {
    if (!value) return '--';
    const tsStr = typeof value === 'string' && !value.endsWith('Z') ? value + 'Z' : value;
    const date = new Date(tsStr);
    if (Number.isNaN(date.getTime())) return '--';

    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getAlertTone(severity) {
    if (severity === 'Khẩn cấp') return { fg: '#fca5a5', bg: 'rgba(239,68,68,0.12)' };
    if (severity === 'Cao') return { fg: '#fcd34d', bg: 'rgba(245,158,11,0.12)' };
    return { fg: '#93c5fd', bg: 'rgba(59,130,246,0.12)' };
}

function SummaryCard({ label, value, sub, icon, iconBg }) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>
                {label}
            </div>
            <div style={{ marginTop: 4, fontSize: 30, color: C.text, fontWeight: 800, lineHeight: 1 }}>{value}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: C.textDim }}>{sub}</div>
        </div>
    );
}

export default function GiamSatDuLieuAQI() {
    const PAGE_SIZE = 10;
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('all');
    const [minAqiFilter, setMinAqiFilter] = useState('all');
    const [reloadKey, setReloadKey] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [actingCity, setActingCity] = useState('');

    const [summary, setSummary] = useState({
        totalCities: 0,
        enabledCities: 0,
        disabledCities: 0,
        totalSnapshots24h: 0,
        freshCities: 0,
        averageAqi: 0,
        criticalAlerts: 0,
    });
    const [trend, setTrend] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [cities, setCities] = useState([]);
    const [cityRankings, setCityRankings] = useState({ polluted: [], cleanest: [] });
    const [availableCities, setAvailableCities] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let ignore = false;

        async function loadOverview() {
            setLoading(true);
            setError('');

            try {
                const params = new URLSearchParams();
                params.set('limit', '500');

                if (searchTerm) params.set('q', searchTerm);
                if (cityFilter !== 'all') params.set('city', cityFilter);
                if (minAqiFilter !== 'all') params.set('minAqi', minAqiFilter);

                const response = await fetch(`/api/admin/data-monitor/overview?${params.toString()}`, {
                    headers: {
                        ...getAuthHeaders(),
                    },
                    cache: 'no-store',
                });

                const raw = await response.text();
                let data = null;
                try {
                    data = raw ? JSON.parse(raw) : null;
                } catch {
                    data = null;
                }

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error('Bạn không có quyền truy cập trang này.');
                    }
                    throw new Error(data?.message || 'Không tải được dữ liệu giám sát AQI theo thành phố.');
                }

                if (ignore) return;

                setSummary(data?.summary ?? {
                    totalCities: 0,
                    enabledCities: 0,
                    disabledCities: 0,
                    totalSnapshots24h: 0,
                    freshCities: 0,
                    averageAqi: 0,
                    criticalAlerts: 0,
                });
                setTrend(Array.isArray(data?.trend) ? data.trend : []);
                setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
                setCities(Array.isArray(data?.cities) ? data.cities : []);
                setCityRankings({
                    polluted: data?.cityRankings?.polluted ?? [],
                    cleanest: data?.cityRankings?.cleanest ?? [],
                });
                setAvailableCities(Array.isArray(data?.availableCities) ? data.availableCities : []);
            } catch (err) {
                if (ignore) return;
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu.');
                setTrend([]);
                setAlerts([]);
                setCities([]);
                setCityRankings({ polluted: [], cleanest: [] });
                setAvailableCities([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadOverview();

        return () => {
            ignore = true;
        };
    }, [searchTerm, cityFilter, minAqiFilter, reloadKey]);

    async function handleToggleCity(cityName, isEnabled) {
        const nextState = !isEnabled;
        const confirmed = window.confirm(
            nextState
                ? `Bật giám sát cho ${cityName}?`
                : `Tắt giám sát cho ${cityName}?`
        );

        if (!confirmed) return;

        setError('');
        setActingCity(cityName);

        try {
            const response = await fetch(`/api/admin/data-monitor/city/${encodeURIComponent(cityName)}/activation`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ isEnabled: nextState }),
            });

            const raw = await response.text();
            let data = null;
            try {
                data = raw ? JSON.parse(raw) : null;
            } catch {
                data = null;
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Không thể cập nhật trạng thái tỉnh/thành phố.');
            }

            setReloadKey((v) => v + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật trạng thái thành phố.');
        } finally {
            setActingCity('');
        }
    }

    const totalPages = useMemo(() => Math.max(1, Math.ceil(cities.length / PAGE_SIZE)), [cities.length]);

    const pagedCities = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return cities.slice(start, start + PAGE_SIZE);
    }, [cities, currentPage]);

    const maxTrendValue = useMemo(() => {
        const max = Math.max(...trend.map((x) => Number(x.averageAqi ?? 0)), 0);
        return max || 1;
    }, [trend]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, cityFilter, minAqiFilter, cities.length]);

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                            AQI Data Operations Center
                        </div>
                        <h1 style={{ margin: '6px 0 0', color: C.text, fontSize: 30 }}>
                            Giám sát dữ liệu AQI theo tỉnh/thành
                        </h1>
                    </div>

                    <button
                        onClick={() => setReloadKey((v) => v + 1)}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 10,
                            border: `1px solid ${C.cardBorder}`,
                            padding: '9px 13px',
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.text,
                            background: loading ? '#101a26' : '#101c2a',
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <RefreshCcw size={14} /> {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                </div>

                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#101a26', border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '9px 12px' }}>
                        <Search size={15} color={C.textDim} />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm theo tên tỉnh/thành phố..."
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                color: C.text,
                                fontSize: 13,
                            }}
                        />
                    </div>

                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        style={{ background: '#101a26', border: `1px solid ${C.cardBorder}`, color: C.text, borderRadius: 10, padding: '9px 10px', fontSize: 13 }}
                    >
                        <option value="all">Tất cả tỉnh/thành</option>
                        {availableCities.map((cityName) => (
                            <option key={cityName} value={cityName}>{cityName}</option>
                        ))}
                    </select>

                    <select
                        value={minAqiFilter}
                        onChange={(e) => setMinAqiFilter(e.target.value)}
                        style={{ background: '#101a26', border: `1px solid ${C.cardBorder}`, color: C.text, borderRadius: 10, padding: '9px 10px', fontSize: 13 }}
                    >
                        <option value="all">Ngưỡng AQI TB</option>
                        <option value="50">AQI ≥ 50</option>
                        <option value="100">AQI ≥ 100</option>
                        <option value="150">AQI ≥ 150</option>
                        <option value="200">AQI ≥ 200</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12 }}>
                <SummaryCard
                    label="Tổng tỉnh/thành"
                    value={summary.totalCities}
                    sub={`${summary.totalSnapshots24h} snapshots / 24h`}
                    icon={<Activity size={18} color={C.blue} />}
                    iconBg={C.blueSoft}
                />
                <SummaryCard
                    label="Đang bật"
                    value={summary.enabledCities}
                    sub="Thành phố đang giám sát"
                    icon={<Power size={18} color={C.green} />}
                    iconBg={C.greenSoft}
                />
                <SummaryCard
                    label="Đang tắt"
                    value={summary.disabledCities}
                    sub="Thành phố đã tắt giám sát"
                    icon={<PowerOff size={18} color={C.red} />}
                    iconBg={C.redSoft}
                />
                <SummaryCard
                    label="AQI trung bình"
                    value={summary.averageAqi}
                    sub={`${summary.freshCities} thành phố có dữ liệu mới`}
                    icon={<Activity size={18} color={C.orange} />}
                    iconBg={C.orangeSoft}
                />
                <SummaryCard
                    label="Cảnh báo"
                    value={summary.criticalAlerts}
                    sub="Mức cảnh báo tại các thành phố"
                    icon={<ShieldAlert size={18} color={C.red} />}
                    iconBg={C.redSoft}
                />
            </div>

            {error && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 12, color: '#fca5a5', padding: '10px 12px', fontSize: 13 }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16 }}>
                <div style={{ display: 'grid', gap: 16 }}>
                    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 16 }}>
                        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                            <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>Xu hướng AQI trung bình 7 ngày</div>
                            <div style={{ color: C.textDim, fontSize: 12 }}>
                                {trend.length} điểm dữ liệu
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, trend.length)}, minmax(0, 1fr))`, gap: 10, alignItems: 'end', minHeight: 210 }}>
                            {trend.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', color: C.textDim, fontSize: 13 }}>Chưa có dữ liệu xu hướng.</div>
                            ) : trend.map((point) => {
                                const value = Number(point.averageAqi ?? 0);
                                const ratio = Math.max(8, (value / maxTrendValue) * 160);

                                return (
                                    <div key={point.label} style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
                                        <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>{value}</div>
                                        <div style={{ width: '100%', height: ratio, background: point.colorHex || '#3b82f6', borderRadius: '8px 8px 4px 4px', boxShadow: `0 0 16px ${point.colorHex || '#3b82f6'}55` }} />
                                        <div style={{ fontSize: 11, color: C.textDim }}>{point.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Danh sách tỉnh/thành phố</div>
                                <div style={{ marginTop: 4, fontSize: 12, color: C.textDim }}>
                                    {loading ? 'Đang tải dữ liệu...' : `${cities.length} tỉnh/thành phù hợp bộ lọc • Trang ${currentPage}/${totalPages}`}
                                </div>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                                <thead>
                                    <tr style={{ background: '#101a26', borderBottom: `1px solid ${C.cardBorder}` }}>
                                        {['Tỉnh/Thành phố', 'AQI TB', 'Snapshots 24h', 'Mới', 'Cũ', 'Cập nhật', 'Trạng thái', 'Hành động'].map((header) => (
                                            <th key={header} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedCities.length === 0 && (
                                        <tr>
                                            <td colSpan={8} style={{ padding: 18, textAlign: 'center', color: C.textDim }}>
                                                Không có dữ liệu theo bộ lọc hiện tại.
                                            </td>
                                        </tr>
                                    )}

                                    {pagedCities.map((item) => (
                                        <tr key={item.city} style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
                                            <td style={{ padding: '11px 12px' }}>
                                                <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>{item.city}</div>
                                            </td>
                                            <td style={{ padding: '11px 12px' }}>
                                                <span style={{ color: item.colorHex || C.text, fontWeight: 800, fontSize: 14 }}>{item.averageAqi}</span>
                                            </td>
                                            <td style={{ padding: '11px 12px', fontSize: 13, color: C.textMuted }}>{item.totalStations}</td>
                                            <td style={{ padding: '11px 12px', fontSize: 13, color: '#86efac' }}>{item.onlineStations}</td>
                                            <td style={{ padding: '11px 12px', fontSize: 13, color: '#fda4af' }}>{item.offlineStations}</td>
                                            <td style={{ padding: '11px 12px', fontSize: 12, color: C.textDim }}>{formatDateTime(item.lastObservationAt)}</td>
                                            <td style={{ padding: '11px 12px' }}>
                                                {item.isEnabled ? (
                                                    <span style={{ background: C.greenSoft, color: '#86efac', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                                                        Đang bật
                                                    </span>
                                                ) : (
                                                    <span style={{ background: C.redSoft, color: '#fda4af', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                                                        Đang tắt
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '11px 12px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleCity(item.city, item.isEnabled)}
                                                    disabled={actingCity === item.city}
                                                    style={{
                                                        border: `1px solid ${C.cardBorder}`,
                                                        background: '#101a26',
                                                        color: item.isEnabled ? '#fda4af' : '#86efac',
                                                        borderRadius: 8,
                                                        padding: '6px 10px',
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        cursor: actingCity === item.city ? 'not-allowed' : 'pointer',
                                                    }}
                                                >
                                                    {actingCity === item.city
                                                        ? 'Đang xử lý...'
                                                        : item.isEnabled ? 'Tắt' : 'Bật'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <AlertTriangle size={16} color={C.orange} />
                            <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>Cảnh báo vận hành</div>
                        </div>

                        <div style={{ display: 'grid', gap: 10, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
                            {alerts.length === 0 && (
                                <div style={{ border: `1px dashed ${C.cardBorder}`, borderRadius: 10, padding: 12, color: C.textDim, fontSize: 13 }}>
                                    Không có cảnh báo nào.
                                </div>
                            )}

                            {alerts.map((alert) => {
                                const tone = getAlertTone(alert.severity);
                                return (
                                    <div key={`${alert.city}-${alert.message}`} style={{ background: tone.bg, borderRadius: 12, padding: 11 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                            <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>{alert.city}</div>
                                            <div style={{ fontSize: 11, color: tone.fg, fontWeight: 700 }}>{alert.severity}</div>
                                        </div>
                                        <div style={{ marginTop: 6, fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{alert.message}</div>
                                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textDim }}>
                                            <span>{formatDateTime(alert.lastObservationAt)}</span>
                                            <span style={{ color: alert.colorHex || C.text }}>{alert.calculatedAqi}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 16 }}>
                        <div style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Top thành phố ô nhiễm</div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {(cityRankings.polluted ?? []).length === 0 ? (
                                <div style={{ color: C.textDim, fontSize: 13 }}>Chưa có dữ liệu.</div>
                            ) : (cityRankings.polluted ?? []).map((item, idx) => (
                                <div key={`${item.city}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 8, alignItems: 'center', background: '#101a26', border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '9px 10px' }}>
                                    <span style={{ color: C.textDim, fontSize: 12 }}>{idx + 1}</span>
                                    <span style={{ color: C.text, fontSize: 13 }}>{item.city}</span>
                                    <span style={{ color: item.colorHex || C.text, fontWeight: 800, fontSize: 13 }}>{item.aqi}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 16 }}>
                        <div style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Top thành phố trong lành</div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {(cityRankings.cleanest ?? []).length === 0 ? (
                                <div style={{ color: C.textDim, fontSize: 13 }}>Chưa có dữ liệu.</div>
                            ) : (cityRankings.cleanest ?? []).map((item, idx) => (
                                <div key={`${item.city}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 8, alignItems: 'center', background: '#101a26', border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: '9px 10px' }}>
                                    <span style={{ color: C.textDim, fontSize: 12 }}>{idx + 1}</span>
                                    <span style={{ color: C.text, fontSize: 13 }}>{item.city}</span>
                                    <span style={{ color: item.colorHex || C.text, fontWeight: 800, fontSize: 13 }}>{item.aqi}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
