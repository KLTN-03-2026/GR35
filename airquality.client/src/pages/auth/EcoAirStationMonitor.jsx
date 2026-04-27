import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCcw, Search, Server, Wifi, WifiOff } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function getWarningStyle(severity) {
    if (severity === 'Khẩn cấp') return { fg: '#b42318', bg: '#fef3f2' };
    if (severity === 'Cao') return { fg: '#b54708', bg: '#fffaeb' };
    return { fg: '#475467', bg: '#f8fafc' };
}

function formatDateTime(dateValue) {
    if (!dateValue) return '--';
    const tsStr = typeof dateValue === 'string' && !dateValue.endsWith('Z') ? dateValue + 'Z' : dateValue;
    const date = new Date(tsStr);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function EcoAirStationMonitor() {
    const PAGE_SIZE = 10;
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [actingStationId, setActingStationId] = useState(null);
    const [summary, setSummary] = useState({
        totalStations: 0,
        activeStations: 0,
        onlineStations: 0,
        offlineStations: 0,
        noDataStations: 0,
        systemHealthPercent: 0,
    });
    const [stations, setStations] = useState([]);
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let ignore = false;

        async function loadStationData() {
            setLoading(true);
            setError('');

            try {
                const query = searchTerm.trim()
                    ? `?q=${encodeURIComponent(searchTerm.trim())}`
                    : '';

                const response = await fetch(`/api/admin/station-monitor${query}`, {
                    headers: {
                        ...getAuthHeaders(),
                    },
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
                        throw new Error('Bạn không có quyền truy cập chức năng này. Vui lòng đăng nhập tài khoản admin.');
                    }
                    throw new Error(data?.message || 'Không tải được dữ liệu giám sát trạm.');
                }

                if (ignore) return;

                setSummary(data?.summary ?? {
                    totalStations: 0,
                    activeStations: 0,
                    onlineStations: 0,
                    offlineStations: 0,
                    noDataStations: 0,
                    systemHealthPercent: 0,
                });
                setStations(Array.isArray(data?.stations) ? data.stations : []);
                setWarnings(Array.isArray(data?.warnings) ? data.warnings : []);
            } catch (err) {
                if (ignore) return;
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu.');
                setStations([]);
                setWarnings([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadStationData();

        return () => {
            ignore = true;
        };
    }, [searchTerm, reloadKey]);

    function reloadData() {
        setReloadKey((v) => v + 1);
    }

    async function handleToggleStationActivation(station) {
        const isActive = Number(station.isActive) === 1;
        const nextIsActive = !isActive;
        const confirmed = window.confirm(nextIsActive
            ? `Mở hoạt động cho trạm ${station.stationName}?`
            : `Tắt hoạt động trạm ${station.stationName}?`);

        if (!confirmed) return;

        setError('');
        setActingStationId(station.stationId);

        try {
            const response = await fetch(`/api/admin/station-monitor/${station.stationId}/activation`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ isActive: nextIsActive }),
            });

            const raw = await response.text();
            let data = null;
            try {
                data = raw ? JSON.parse(raw) : null;
            } catch {
                data = null;
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Không thể cập nhật trạng thái hoạt động của trạm.');
            }

            reloadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật trạm.');
        } finally {
            setActingStationId(null);
        }
    }

    const healthPercent = useMemo(() => {
        const value = Number(summary?.systemHealthPercent ?? 0);
        return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    }, [summary]);

    const sortedStations = useMemo(
        () => [...stations].sort((a, b) => Number(b.calculatedAqi ?? 0) - Number(a.calculatedAqi ?? 0)),
        [stations],
    );

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(sortedStations.length / PAGE_SIZE)),
        [sortedStations.length, PAGE_SIZE],
    );

    const pagedStations = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return sortedStations.slice(start, start + PAGE_SIZE);
    }, [sortedStations, currentPage, PAGE_SIZE]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, stations.length]);

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: 1 }}>
                        System Infrastructure
                    </div>
                    <h1 style={{ margin: '6px 0 0', fontSize: 30, color: '#101828' }}>Station Monitor</h1>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '9px 12px', width: 280, border: '1px solid #e4e7ec' }}>
                        <Search size={15} color="#98a2b3" />
                        <input
                            placeholder="Tìm trạm, thành phố, provider..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#344054', width: '100%' }}
                        />
                    </div>
                    <button
                        onClick={reloadData}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #d0d5dd', background: '#fff',
                            borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#344054'
                        }}
                    >
                        <RefreshCcw size={14} /> Làm mới
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
                {[
                    { key: 'total', label: 'Tổng trạm', value: summary.totalStations, icon: <Server size={18} color="#1570ef" />, bg: '#eff8ff' },
                    { key: 'online', label: 'Trực tuyến', value: summary.onlineStations, icon: <Wifi size={18} color="#12b76a" />, bg: '#ecfdf3' },
                    { key: 'offline', label: 'Ngoại tuyến', value: summary.offlineStations, icon: <WifiOff size={18} color="#f04438" />, bg: '#fef3f2' },
                    { key: 'health', label: 'Sức khỏe hệ thống', value: `${healthPercent}%`, icon: <AlertTriangle size={18} color="#f79009" />, bg: '#fffaeb' },
                ].map((card) => (
                    <div key={card.key} style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 14, padding: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {card.icon}
                        </div>
                        <div style={{ marginTop: 10, color: '#667085', fontSize: 12 }}>{card.label}</div>
                        <div style={{ marginTop: 2, color: '#101828', fontSize: 30, fontWeight: 800 }}>{card.value}</div>
                    </div>
                ))}
            </div>

            {error && (
                <div style={{ background: '#fef3f2', border: '1px solid #fecdca', color: '#b42318', borderRadius: 12, padding: '10px 12px', fontSize: 13 }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
                <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #f2f4f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>Danh sách trạm quan trắc</div>
                            <div style={{ fontSize: 12, color: '#667085' }}>
                                {loading ? 'Đang tải dữ liệu...' : `${stations.length} trạm theo bộ lọc hiện tại • Trang ${currentPage}/${totalPages}`}
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eaecf0', background: '#f9fafb' }}>
                                    {['Trạm', 'Khu vực', 'Provider', 'AQI', 'Cập nhật', 'Trạng thái', 'Hành động'].map((h) => (
                                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#667085', textTransform: 'uppercase', letterSpacing: 0.7 }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pagedStations.map((s) => (
                                    <tr key={s.stationId} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>{s.stationCode}</div>
                                            <div style={{ fontSize: 12, color: '#667085' }}>{s.stationName}</div>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: 13, color: '#344054' }}>{s.city || '--'}</td>
                                        <td style={{ padding: '12px', fontSize: 13, color: '#344054' }}>{s.provider || '--'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ fontSize: 13, fontWeight: 800, color: s.colorHex || '#101828' }}>{s.calculatedAqi ?? '--'}</span>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: 12, color: '#667085' }}>{formatDateTime(s.lastObservationAt)}</td>
                                        <td style={{ padding: '12px' }}>
                                            {Number(s.isActive) !== 1 ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999,
                                                    background: '#fffaeb', color: '#b54708', padding: '4px 10px', fontSize: 12, fontWeight: 700,
                                                }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f79009' }} />
                                                    Bảo trì
                                                </span>
                                            ) : (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999,
                                                    background: s.status === 'online' ? '#ecfdf3' : '#fef3f2',
                                                    color: s.status === 'online' ? '#027a48' : '#b42318', padding: '4px 10px', fontSize: 12, fontWeight: 700,
                                                }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.status === 'online' ? '#12b76a' : '#f04438' }} />
                                                    {s.status === 'online' ? 'Online' : 'Offline'}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStationActivation(s)}
                                                disabled={actingStationId === s.stationId}
                                                style={{
                                                    border: '1px solid #d0d5dd',
                                                    background: '#fff',
                                                    color: Number(s.isActive) === 1 ? '#b42318' : '#027a48',
                                                    borderRadius: 8,
                                                    padding: '6px 10px',
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: actingStationId === s.stationId ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {actingStationId === s.stationId
                                                    ? 'Đang xử lý...'
                                                    : Number(s.isActive) === 1 ? 'Tắt trạm' : 'Mở trạm'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                    <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 16, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <AlertTriangle size={16} color="#f79009" />
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>Cảnh báo vận hành</div>
                        </div>
                        <div style={{ display: 'grid', gap: 10, maxHeight: 380, overflow: 'auto', paddingRight: 4 }}>
                            {warnings.length === 0 && (
                                <div style={{ background: '#f8fafc', border: '1px dashed #d0d5dd', borderRadius: 10, padding: 12, fontSize: 13, color: '#667085' }}>
                                    Không có cảnh báo nào.
                                </div>
                            )}

                            {warnings.map((w) => {
                                const tone = getWarningStyle(w.severity);
                                return (
                                    <div key={`${w.stationId}-${w.type}`} style={{ background: tone.bg, borderRadius: 12, padding: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>{w.stationCode}</div>
                                            <span style={{ color: tone.fg, fontSize: 11, fontWeight: 700 }}>{w.severity}</span>
                                        </div>
                                        <div style={{ marginTop: 2, fontSize: 12, color: '#344054' }}>{w.stationName}</div>
                                        <div style={{ marginTop: 6, fontSize: 12, color: '#667085', lineHeight: 1.5 }}>{w.message}</div>
                                        <div style={{ marginTop: 8, fontSize: 11, color: '#98a2b3' }}>
                                            Cập nhật: {formatDateTime(w.lastObservationAt)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}