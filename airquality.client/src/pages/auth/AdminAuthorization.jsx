import { useEffect, useMemo, useState } from 'react';

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const AVAILABLE_MODULES = [
    { id: '/admin/data', label: 'Giám sát Dữ liệu AQI' },
    { id: '/admin/station-monitor', label: 'Hạ tầng mạng lưới' },
    { id: '/admin/ai-config', label: 'Phân tích & Cấu hình AI' },
    { id: '/admin/reports', label: 'Duyệt báo cáo' },
    { id: '/admin/contacts', label: 'Hộp thư Liên hệ' },
    { id: '/admin/user-management', label: 'Quản lý User & API Key' },
    { id: '/admin/logs', label: 'Hệ thống & Logs' },
];

export default function AdminAuthorization() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let ignore = false;
        async function loadUsers() {
            setLoading(true);
            setError('');
            try {
                const query = searchTerm.trim() ? `?q=${encodeURIComponent(searchTerm.trim())}` : '';
                const response = await fetch(`/api/admin/user-management${query}`, {
                    headers: { ...getAuthHeaders() }
                });

                const raw = await response.text();
                let data = null;
                try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }

                if (!response.ok) {
                    throw new Error(data?.message || 'Không tải được dữ liệu.');
                }

                if (ignore) return;
                // Only filter users that are admin or super-admin, or show all? 
                // "phân quyền chức năng trong hệ thống cho role admin"
                const list = Array.isArray(data?.users) ? data.users : [];
                // Filtering only admins for this view
                setUsers(list.filter(u => u.roleKey === 'admin' || u.roleKey === 'super-admin'));
            } catch (err) {
                if (ignore) return;
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu.');
                setUsers([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        loadUsers();
        return () => { ignore = true; };
    }, [searchTerm]);

    const handleOpenEdit = (user) => {
        if (user.roleKey === 'super-admin') return; // Cannot edit super admin permissions
        setEditingUserId(user.userId);
        try {
            const perms = JSON.parse(user.permissions || '[]');
            setSelectedPermissions(Array.isArray(perms) ? perms : []);
        } catch {
            setSelectedPermissions([]);
        }
    };

    const handleTogglePermission = (moduleId) => {
        setSelectedPermissions(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleSavePermissions = async () => {
        if (!editingUserId) return;
        setSaving(true);
        setError('');
        try {
            const permissionsJson = JSON.stringify(selectedPermissions);
            const response = await fetch(`/api/admin/user-management/${editingUserId}/permissions`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ permissions: permissionsJson })
            });

            const raw = await response.text();
            let data = null;
            try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }

            if (!response.ok) throw new Error(data?.message || 'Lỗi khi lưu phân quyền.');

            const updatedUser = data?.user;
            if (updatedUser) {
                setUsers(prev => prev.map(u => u.userId === editingUserId ? updatedUser : u));
            }
            setEditingUserId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
                <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#101828' }}>Phân quyền chức năng</h1>
                <div style={{ marginTop: 6, fontSize: 14, color: '#667085' }}>
                    Thiết lập quyền truy cập các module quản lý cho tài khoản Admin. Trọng tài Super Admin có toàn quyền mặc định.
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e4e7ec', borderRadius: 10, padding: '10px 12px', width: 300 }}>
                    <span style={{ color: '#98a2b3', fontSize: 14 }}>⌕</span>
                    <input
                        placeholder="Tìm kiếm quản trị viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#344054' }}
                    />
                </div>
            </div>

            {error && (
                <div style={{ background: '#fef3f2', border: '1px solid #fecdca', color: '#b42318', borderRadius: 12, padding: '10px 12px', fontSize: 13 }}>
                    {error}
                </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eaecf0' }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#667085', textTransform: 'uppercase' }}>Tài khoản</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#667085', textTransform: 'uppercase' }}>Vai trò</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#667085', textTransform: 'uppercase' }}>Quyền hiện tại</th>
                            <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 12, color: '#667085', textTransform: 'uppercase' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && users.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#667085' }}>Đang tải...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#667085' }}>Không có tài khoản quản trị nào.</td></tr>
                        ) : users.map(u => {
                            let perms = [];
                            try { perms = JSON.parse(u.permissions || '[]'); } catch { }
                            const isSuper = u.roleKey === 'super-admin';

                            return (
                                <tr key={u.userId} style={{ borderBottom: '1px solid #f2f4f7' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{u.fullName}</div>
                                        <div style={{ fontSize: 12, color: '#475467' }}>{u.email}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            background: isSuper ? '#f5f3ff' : '#ecfdf5',
                                            color: isSuper ? '#6d28d9' : '#047857',
                                            padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600
                                        }}>
                                            {isSuper ? 'Super Admin' : 'Admin'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {isSuper ? (
                                            <span style={{ color: '#667085', fontSize: 13, fontStyle: 'italic' }}>Toàn quyền hệ thống</span>
                                        ) : (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {perms.length === 0 ? (
                                                    <span style={{ color: '#b42318', fontSize: 12 }}>Chưa có quyền nào</span>
                                                ) : perms.map(p => {
                                                    const m = AVAILABLE_MODULES.find(mod => mod.id === p);
                                                    return (
                                                        <span key={p} style={{ background: '#f2f4f7', color: '#344054', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
                                                            {m ? m.label : p}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        {!isSuper && (
                                            <button
                                                onClick={() => handleOpenEdit(u)}
                                                style={{ border: '1px solid #d0d5dd', background: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#344054' }}
                                            >
                                                Cập nhật quyền
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Phân quyền */}
            {editingUserId && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', width: 450, borderRadius: 12, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Cấp quyền truy cập Module</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>
                            {AVAILABLE_MODULES.map(m => (
                                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', border: '1px solid #eaecf0', borderRadius: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(m.id)}
                                        onChange={() => handleTogglePermission(m.id)}
                                        style={{ width: 16, height: 16 }}
                                    />
                                    <span style={{ fontSize: 14, color: '#344054', fontWeight: 500 }}>{m.label}</span>
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button
                                onClick={() => setEditingUserId(null)}
                                disabled={saving}
                                style={{ border: '1px solid #d0d5dd', background: '#fff', color: '#344054', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSavePermissions}
                                disabled={saving}
                                style={{ border: 'none', background: '#16a34a', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
