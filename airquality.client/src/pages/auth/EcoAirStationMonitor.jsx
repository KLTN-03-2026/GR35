import { useState } from 'react';
import { Link } from 'react-router-dom'; // thêm dòng này
import {
    LayoutDashboard, BarChart2, Users, Wifi, Settings2,
    User, LogOut, Bell, Search, Plus, Filter, ZoomIn, ZoomOut,
    AlertTriangle, MapPin, ChevronRight, Sparkles
} from 'lucide-react';

const stations = [
    { id: 'ST-101', pin: 92, signal: -54, hoatDong: '142ng/4g', status: 'online' },
    { id: 'ST-102', pin: 84, signal: -62, hoatDong: '98ng/12g', status: 'online' },
    { id: 'ST-108', pin: 12, signal: -88, hoatDong: 'Ngoài tuyến', status: 'offline' },
    { id: 'ST-112', pin: 100, signal: -58, hoatDong: '42ng/1g', status: 'online' },
    { id: 'ST-114', pin: 76, signal: -70, hoatDong: '210ng/18g', status: 'online' },
];

const warnings = [
    { id: 'ST-108', title: 'Cần hiệu chuẩn', desc: 'Phát hiện sai số cảm biến trong mô-đun PM2.5', level: 'Khẩn cấp', levelColor: '#c0392b', bg: '#fdecea' },
    { id: 'ST-114', title: 'Chu kỳ Pin cao', desc: 'Dự kiến thay thế sau 14 ngày', level: 'Định kỳ', levelColor: '#555', bg: '#f5f5f5' },
];

const navItems = [
    { icon: LayoutDashboard, label: 'Bảng biểu hiện', path: '/admin' },
    { icon: BarChart2, label: 'Báo cáo', path: '/admin/reports' },
    { icon: Users, label: 'Người dùng', path: '/admin/user-management' },
    { icon: Wifi, label: 'Trạm quan trắc', path: '/admin/station-monitor', active: true },
    { icon: Settings2, label: 'Cấu hình AI', path: '/admin/ai-config' },
];

function PinBar({ value, offline }) {
    const color = offline ? '#ccc' : value > 50 ? '#2d7a3a' : value > 20 ? '#e67e22' : '#c0392b';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 64, height: 7, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s' }} />
            </div>
            <span style={{ fontSize: 12, color: offline ? '#aaa' : '#333', fontWeight: 500 }}>{value}%</span>
        </div>
    );
}

function CircleProgress({ value }) {
    const r = 38, circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <svg width={96} height={96} viewBox="0 0 96 96">
            <circle cx={48} cy={48} r={r} fill="none" stroke="#e8e8e8" strokeWidth={8} />
            <circle cx={48} cy={48} r={r} fill="none" stroke="#6b2d5e" strokeWidth={8}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 48 48)"
                style={{ transition: 'stroke-dashoffset 0.8s' }} />
            <text x={48} y={53} textAnchor="middle" fontSize={16} fontWeight={700} fill="#222">{value}%</text>
        </svg>
    );
}

export default function EcoAirStationMonitor() {
    const [activeNav, setActiveNav] = useState('Trạm quan trắc');
    const [activeTab, setActiveTab] = useState('Dữ liệu Vùng');

    return (
        <div>
            {/* Topbar Tab Navigation */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '6px 14px', width: 220, border: '1px solid #e8ede8' }}>
                        <Search size={14} color="#9aaa9a" />
                        <input placeholder="Tìm kiếm trạm..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#444', width: '100%' }} />
                    </div>
                    <nav style={{ display: 'flex', gap: 4, background: '#fff', padding: 4, borderRadius: 8, border: '1px solid #e8ede8' }}>
                        {['Tổng quan', 'Dữ liệu Vùng'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                                    background: activeTab === tab ? '#e8f5ec' : 'transparent',
                                    color: activeTab === tab ? '#1a6630' : '#777',
                                }}>
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Page title */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7a9a7a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Hạ tầng hệ thống</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a3c2a', margin: 0 }}>Giám sát Trạm quan trắc</h1>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid #d0ddd0', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#444', fontWeight: 500 }}>
                            <Filter size={14} /> Bộ lọc
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#1a3c2a', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 600 }}>
                            <Plus size={14} /> Triển khai Trạm
                        </button>
                    </div>
                </div>
            </div>

            {/* Top cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
                {/* Health card */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #e8ede8', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle, #e8f5ec 0%, transparent 70%)', borderRadius: '0 14px 0 100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Sức khỏe Hệ thống</span>
                        <Sparkles size={18} color="#2d7a3a" />
                    </div>
                    <div style={{ fontSize: 42, fontWeight: 900, color: '#2d7a3a', lineHeight: 1 }}>
                        98.4%
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#4caf50', marginLeft: 8 }}>+2.1%</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <span style={{ background: '#e8f5ec', color: '#2d7a3a', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>ĐANG HOẠT ĐỘNG</span>
                        <span style={{ background: '#f0f0f0', color: '#555', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>24 ĐƠN VỊ ACTIVE</span>
                    </div>
                </div>

                {/* Warning card */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e8ede8', display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <AlertTriangle size={16} color="#e67e22" />
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#333' }}>Cảnh báo Bảo trì</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {warnings.map(w => (
                                <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: w.bg, borderRadius: 8 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: w.levelColor, marginTop: 5, flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>{w.id}: {w.title}</div>
                                            <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>{w.desc}</div>
                                        </div>
                                    </div>
                                    <span style={{ background: w.levelColor, color: '#fff', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 12 }}>
                                        {w.level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <CircleProgress value={88} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#777', textTransform: 'uppercase', letterSpacing: 0.8 }}>Toàn vẹn đội ngũ</span>
                    </div>
                </div>
            </div>

            {/* Map + Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
                {/* Map */}
                <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e8ede8', position: 'relative' }}>
                    <iframe
                        src="https://www.openstreetmap.org/export/embed.html?bbox=105.7,20.95,105.95,21.1&layer=mapnik&marker=21.028511,105.804817"
                        style={{ width: '100%', height: 400, border: 'none', display: 'block', filter: 'sepia(10%) saturate(0.9)' }}
                        title="Bản đồ Hà Nội"
                    />
                    {/* Overlay popup */}
                    <div style={{ position: 'absolute', top: 16, left: 16, background: '#fff', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 180 }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: '#9aaa9a', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Sơ đồ mạng lưới</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#1a3c2a' }}>Khu vực: Hà Nội Nội thành</div>
                        <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>12 Trạm hoạt động / 2 Dự phòng</div>
                    </div>
                    {/* Zoom controls */}
                    <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[ZoomIn, ZoomOut].map((Icon, i) => (
                            <button key={i} style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                                <Icon size={15} color="#444" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Station list */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e8ede8' }}>
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1a3c2a' }}>Danh sách Trạm vật lý</div>
                        <div style={{ fontSize: 11, color: '#9aaa9a', marginTop: 2 }}>Dữ liệu kỹ thuật thời gian thực</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f4f0' }}>
                                {['Mã trạm', 'Pin', 'Tín hiệu', 'Hoạt động'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stations.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f5f7f5' }}>
                                    <td style={{ padding: '10px 8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'online' ? '#2ecc71' : '#e74c3c', flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>{s.id}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 8px' }}><PinBar value={s.pin} offline={s.status === 'offline'} /></td>
                                    <td style={{ padding: '10px 8px', fontSize: 12, color: s.status === 'offline' ? '#bbb' : '#555' }}>{s.signal} dBm</td>
                                    <td style={{ padding: '10px 8px' }}>
                                        <span style={{
                                            fontSize: 12, fontWeight: 600,
                                            color: s.status === 'offline' ? '#e74c3c' : '#2d7a3a',
                                            background: s.status === 'offline' ? '#fdecea' : '#e8f5ec',
                                            padding: '3px 8px', borderRadius: 6
                                        }}>{s.hoatDong}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button style={{ marginTop: 16, width: '100%', padding: '10px', background: '#f4f6f0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#2d7a3a', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        Xem tất cả hạ tầng <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}