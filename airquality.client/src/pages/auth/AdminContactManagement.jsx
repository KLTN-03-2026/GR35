import { useEffect, useState } from 'react';

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function getStatusBadge(status) {
    if (status === 0) return { label: 'Chờ xử lý', bg: '#fef3f2', color: '#b42318' };
    if (status === 1) return { label: 'Đang xử lý', bg: '#fff7ed', color: '#b45309' };
    if (status === 2) return { label: 'Đã giải quyết', bg: '#ecfdf5', color: '#047857' };
    return { label: 'Chưa rõ', bg: '#f2f4f7', color: '#667085' };
}

export default function AdminContactManagement() {
    const [contacts, setContacts] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, resolved: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        let ignore = false;
        async function loadData() {
            setLoading(true);
            setError('');
            try {
                const queryParams = new URLSearchParams({ page: '1', pageSize: '100' });
                if (searchTerm.trim()) queryParams.set('search', searchTerm.trim());
                if (statusFilter !== '') queryParams.set('status', statusFilter);

                const listRes = await fetch(`/api/contact?${queryParams.toString()}`, { headers: getAuthHeaders() });
                if (!listRes.ok) throw new Error('Không tải được danh sách liên hệ. Vui lòng kiểm tra quyền admin.');
                const listData = await listRes.json();

                const statsRes = await fetch('/api/contact/stats', { headers: getAuthHeaders() });
                const statsData = statsRes.ok ? await statsRes.json() : null;

                if (!ignore) {
                    setContacts(listData.data || []);
                    if (statsData) setStats(statsData);
                }
            } catch (err) {
                if (!ignore) setError(err.message);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        loadData();
        return () => { ignore = true; };
    }, [reloadKey, searchTerm, statusFilter]);

    async function handleStatusChange(id, newStatus) {
        try {
            const response = await fetch(`/api/contact/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error('Lỗi cập nhật trạng thái.');
            setReloadKey(k => k + 1);
            if (selectedContact && selectedContact.id === id) {
                setSelectedContact(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) return;
        try {
            const response = await fetch(`/api/contact/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!response.ok) throw new Error('Xóa liên hệ thất bại.');
            setReloadKey(k => k + 1);
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleReply() {
        if (!replyMessage.trim()) {
            alert('Vui lòng nhập nội dung');
            return;
        }
        setReplying(true);
        try {
            const response = await fetch(`/api/contact/${selectedContact.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ replyMessage: replyMessage.trim() }),
            });

            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Gửi phản hồi thất bại');

            setReplyMessage('');
            setSelectedContact(null);
            setReloadKey(k => k + 1);
            alert('Gửi phản hồi thành công và đã cập nhật trạng thái thành Đã giải quyết!');
        } catch (err) {
            alert(err.message);
        } finally {
            setReplying(false);
        }
    }

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#e8edf3' }}>Hộp thư Liên hệ</h1>
                    <div style={{ marginTop: 6, fontSize: 14, color: '#7a8da0' }}>
                        Quản lý, tìm kiếm và phản hồi yêu cầu từ người dùng.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 8, background: '#14202e', color: '#e8edf3', border: '1px solid #1e3048', outline: 'none' }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="0">Chờ xử lý</option>
                        <option value="1">Đang xử lý</option>
                        <option value="2">Đã giải quyết</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Tìm kiếm tên, email, tiêu đề..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 8, background: '#14202e', color: '#e8edf3', border: '1px solid #1e3048', outline: 'none', width: 260 }}
                    />

                    <button
                        onClick={() => setReloadKey(k => k + 1)}
                        style={{ border: '1px solid #1e3048', background: '#14202e', color: '#e8edf3', borderRadius: 8, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div style={{ background: '#14202e', border: '1px solid #1e3048', borderRadius: 12, padding: 14 }}>
                    <div style={{ color: '#7a8da0', fontSize: 12 }}>Tổng số liên hệ</div>
                    <div style={{ marginTop: 6, display: 'inline-flex', padding: '4px 10px', borderRadius: 999, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', fontSize: 13, fontWeight: 700 }}>
                        {stats.total}
                    </div>
                </div>
                <div style={{ background: '#14202e', border: '1px solid #1e3048', borderRadius: 12, padding: 14 }}>
                    <div style={{ color: '#7a8da0', fontSize: 12 }}>Chờ xử lý</div>
                    <div style={{ marginTop: 6, display: 'inline-flex', padding: '4px 10px', borderRadius: 999, background: '#fef3f2', color: '#b42318', fontSize: 13, fontWeight: 700 }}>
                        {stats.pending}
                    </div>
                </div>
                <div style={{ background: '#14202e', border: '1px solid #1e3048', borderRadius: 12, padding: 14 }}>
                    <div style={{ color: '#7a8da0', fontSize: 12 }}>Đang xử lý</div>
                    <div style={{ marginTop: 6, display: 'inline-flex', padding: '4px 10px', borderRadius: 999, background: '#fff7ed', color: '#b45309', fontSize: 13, fontWeight: 700 }}>
                        {stats.processing}
                    </div>
                </div>
                <div style={{ background: '#14202e', border: '1px solid #1e3048', borderRadius: 12, padding: 14 }}>
                    <div style={{ color: '#7a8da0', fontSize: 12 }}>Đã giải quyết</div>
                    <div style={{ marginTop: 6, display: 'inline-flex', padding: '4px 10px', borderRadius: 999, background: '#ecfdf5', color: '#047857', fontSize: 13, fontWeight: 700 }}>
                        {stats.resolved}
                    </div>
                </div>
            </div>

            {error && <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid #ef4444' }}>{error}</div>}

            <div style={{ background: '#14202e', border: '1px solid #1e3048', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#111c28', borderBottom: '1px solid #1e3048' }}>
                                {['Họ tên', 'Email', 'Tiêu đề', 'Ngày gửi', 'Trạng thái', 'Thao tác'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#7a8da0', textTransform: 'uppercase' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#7a8da0' }}>Không có dữ liệu liên hệ</td>
                                </tr>
                            )}
                            {contacts.map(c => {
                                const b = getStatusBadge(c.status);
                                return (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #1e3048' }}>
                                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#e8edf3', fontWeight: 600 }}>{c.fullName}</td>
                                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#7a8da0' }}>{c.email}</td>
                                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#7a8da0' }}>
                                            <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {c.subject}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#7a8da0' }}>{new Date(c.createdAt).toLocaleString('vi-VN')}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ background: b.bg, color: b.color, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                                                {b.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    onClick={() => setSelectedContact(c)}
                                                    style={{ border: '1px solid #1e3048', background: 'transparent', color: '#3b82f6', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    style={{ border: '1px solid #1e3048', background: 'transparent', color: '#ef4444', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {loading && <div style={{ padding: 16, color: '#7a8da0' }}>Đang tải danh sách...</div>}
            </div>

            {/* Modal */}
            {selectedContact && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#14202e', width: 600, maxWidth: '90%', borderRadius: 16, padding: 24, border: '1px solid #1e3048', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h2 style={{ margin: 0, fontSize: 20, color: '#e8edf3' }}>Chi tiết Liên hệ</h2>
                            <button
                                onClick={() => setSelectedContact(null)}
                                style={{ border: 'none', background: 'transparent', color: '#7a8da0', cursor: 'pointer', fontSize: 18 }}
                            >✖</button>
                        </div>

                        <div style={{ display: 'grid', gap: 10, fontSize: 14, color: '#7a8da0', marginBottom: 20 }}>
                            <div><strong style={{ color: '#e8edf3' }}>Người gửi:</strong> {selectedContact.fullName} ({selectedContact.email})</div>
                            <div><strong style={{ color: '#e8edf3' }}>Ngày gửi:</strong> {new Date(selectedContact.createdAt).toLocaleString('vi-VN')}</div>
                            <div><strong style={{ color: '#e8edf3' }}>Tiêu đề:</strong> {selectedContact.subject}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <strong style={{ color: '#e8edf3' }}>Trạng thái hiện tại: </strong>
                                <select
                                    value={selectedContact.status}
                                    onChange={(e) => handleStatusChange(selectedContact.id, parseInt(e.target.value))}
                                    style={{ padding: '6px 12px', borderRadius: 8, background: '#0b1219', color: '#e8edf3', border: '1px solid #1e3048', outline: 'none' }}
                                >
                                    <option value={0}>Chờ xử lý</option>
                                    <option value={1}>Đang xử lý</option>
                                    <option value={2}>Đã giải quyết</option>
                                </select>
                            </div>
                            <div style={{ background: '#0b1219', padding: 16, borderRadius: 8, marginTop: 8, border: '1px solid #1e3048', color: '#e8edf3', whiteSpace: 'pre-wrap' }}>
                                {selectedContact.message}
                            </div>
                        </div>

                        {selectedContact.status !== 2 && (
                            <div style={{ borderTop: '1px solid #1e3048', paddingTop: 20 }}>
                                <h3 style={{ fontSize: 15, marginBottom: 10, color: '#e8edf3' }}>Phản hồi & Giải quyết</h3>
                                <textarea
                                    rows={5}
                                    value={replyMessage}
                                    onChange={e => setReplyMessage(e.target.value)}
                                    placeholder="Viết nội dung phản hồi tại đây (Sẽ được gửi trực tiếp qua email của khách hàng) ..."
                                    style={{ width: '100%', padding: 12, borderRadius: 8, background: '#0b1219', border: '1px solid #1e3048', color: '#e8edf3', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                                    <button
                                        onClick={handleReply}
                                        disabled={replying}
                                        style={{ background: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: replying ? 'not-allowed' : 'pointer' }}
                                    >
                                        {replying ? 'Đang gửi Email...' : 'Gửi phản hồi email & Đóng'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedContact.status === 2 && (
                            <div style={{ padding: 16, background: 'rgba(34,197,94,0.12)', color: '#22c55e', borderRadius: 8, textAlign: 'center', fontWeight: 600, border: '1px solid rgba(34,197,94,0.3)' }}>
                                Yêu cầu này đã được đánh dấu là "Đã giải quyết".
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
