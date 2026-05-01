import { useEffect, useMemo, useState } from 'react';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getRoleBadge(roleKey) {
  if (roleKey === 'super-admin') {
    return { label: 'SUPER ADMIN', roleColor: { bg: '#7c3aed', color: '#fff' } };
  }

  if (roleKey === 'admin') {
    return { label: 'QUẢN TRỊ', roleColor: { bg: '#1a7a4a', color: '#fff' } };
  }

  return { label: 'NGƯỜI DÙNG', roleColor: { bg: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' } };
}

function computeSummaryFromUsers(list) {
  return {
    totalUsers: list.length,
    activeUsers: list.filter((u) => Number(u.status) === 1).length,
    onlineUsers: list.filter((u) => !!u.isOnline).length,
    lockedUsers: list.filter((u) => Number(u.status) !== 1).length,
  };
}

export default function EcoAirUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [actingUserId, setActingUserId] = useState(null);
  const [editingRoleUserId, setEditingRoleUserId] = useState(null);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    onlineUsers: 0,
    lockedUsers: 0,
  });
  const [users, setUsers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Thêm người dùng states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      setLoading(true);
      setError('');

      try {
        const query = searchTerm.trim()
          ? `?q=${encodeURIComponent(searchTerm.trim())}`
          : '';

        const response = await fetch(`/api/admin/user-management${query}`, {
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
          throw new Error(data?.message || 'Không tải được dữ liệu người dùng.');
        }

        if (ignore) return;

        const nextUsers = Array.isArray(data?.users) ? data.users : [];
        setSummary(data?.summary ?? computeSummaryFromUsers(nextUsers));
        setUsers(nextUsers);
      } catch (err) {
        if (ignore) return;
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu.');
        setUsers([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [searchTerm, reloadKey]);

  const viewUsers = useMemo(() => users.map((u) => {
    const badge = getRoleBadge(u.roleKey);
    return {
      ...u,
      badge,
    };
  }), [users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, users.length]);

  const totalPages = Math.ceil(viewUsers.length / itemsPerPage);
  const paginatedUsers = viewUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function updateLocalUser(userId, updater) {
    setUsers((prev) => {
      const next = prev.map((u) => (u.userId === userId ? updater(u) : u));
      setSummary(computeSummaryFromUsers(next));
      return next;
    });
  }

  async function handleEditRole(user, nextRole) {
    const normalizedRole = (nextRole || '').trim().toLowerCase();
    if (!['super-admin', 'admin', 'user'].includes(normalizedRole)) {
      setError('Role không hợp lệ. Chỉ chấp nhận: super-admin, admin, user.');
      return;
    }

    if ((user.roleKey || '').toLowerCase() === normalizedRole) {
      setEditingRoleUserId(null);
      return;
    }

    setError('');
    setActingUserId(user.userId);

    try {
      const response = await fetch(`/api/admin/user-management/${user.userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ roleKey: normalizedRole }),
      });

      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể cập nhật role.');
      }

      const updated = data?.user;
      if (!updated) return;

      updateLocalUser(user.userId, () => updated);
      setEditingRoleUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật role.');
    } finally {
      setActingUserId(null);
    }
  }

  async function handleToggleLock(user) {
    const isLocked = Number(user.status) !== 1;
    const nextLockState = !isLocked;
    const confirmed = window.confirm(nextLockState
      ? `Khóa tài khoản ${user.fullName || user.email}?`
      : `Mở khóa tài khoản ${user.fullName || user.email}?`);

    if (!confirmed) return;

    setError('');
    setActingUserId(user.userId);

    try {
      const response = await fetch(`/api/admin/user-management/${user.userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ isLocked: nextLockState }),
      });

      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể cập nhật trạng thái tài khoản.');
      }

      const updated = data?.user;
      if (!updated) return;

      updateLocalUser(user.userId, () => updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật trạng thái tài khoản.');
    } finally {
      setActingUserId(null);
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setAddError('');

    if (!newFullName.trim()) {
      setAddError('Tên người dùng không được để trống.');
      return;
    }
    if (!newEmail.trim()) {
      setAddError('Email không được để trống.');
      return;
    }
    if (!newPassword.trim()) {
      setAddError('Mật khẩu không được để trống.');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch('/api/admin/user-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          fullName: newFullName,
          email: newEmail,
          password: newPassword,
          roleKey: newRole,
        }),
      });

      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Không thể thêm người dùng.');
      }

      // Success
      setIsAddModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      setReloadKey(v => v + 1);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setAdding(false);
    }
  }

  const statCards = [
    { key: 'total', label: 'Tổng người dùng', value: summary.totalUsers, tone: { bg: '#eff6ff', color: '#1d4ed8' } },
    { key: 'active', label: 'Đang hoạt động', value: summary.activeUsers, tone: { bg: '#ecfdf5', color: '#047857' } },
    { key: 'online', label: 'Trực tuyến', value: summary.onlineUsers, tone: { bg: '#f0fdf4', color: '#15803d' } },
    { key: 'locked', label: 'Đã khóa', value: summary.lockedUsers, tone: { bg: '#fef2f2', color: '#b91c1c' } },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#101828' }}>Quản lý người dùng</h1>
          <div style={{ marginTop: 6, fontSize: 14, color: '#667085' }}>
            Giao diện quản trị tối giản để theo dõi quyền và trạng thái tài khoản.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e4e7ec', borderRadius: 10, padding: '10px 12px', width: 280 }}>
            <span style={{ color: '#98a2b3', fontSize: 14 }}>⌕</span>
            <input
              placeholder="Tìm kiếm theo tên, email, vai trò..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#344054' }}
            />
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((v) => v + 1)}
            style={{
              border: '1px solid #d0d5dd', background: '#fff', color: '#344054', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            Làm mới
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              border: 'none', background: '#16a34a', color: '#fff', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            + Thêm người dùng
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {statCards.map((card) => (
          <div key={card.key} style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 12, padding: 14 }}>
            <div style={{ color: '#667085', fontSize: 12 }}>{card.label}</div>
            <div style={{ marginTop: 6, display: 'inline-flex', padding: '4px 10px', borderRadius: 999, background: card.tone.bg, color: card.tone.color, fontSize: 12, fontWeight: 700 }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: '#fef3f2', border: '1px solid #fecdca', color: '#b42318', borderRadius: 12, padding: '10px 12px', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f2f4f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>Danh sách người dùng</div>
            <div style={{ marginTop: 2, fontSize: 12, color: '#667085' }}>
              {loading ? 'Đang tải dữ liệu...' : `${viewUsers.length} người dùng khớp bộ lọc hiện tại`}
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eaecf0' }}>
                {['Người dùng', 'Vai trò', 'Trạng thái', 'Email', 'Hành động'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#667085', textTransform: 'uppercase', letterSpacing: 0.7 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => (
                <tr key={u.userId} style={{ borderBottom: '1px solid #f2f4f7' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e4e7ec', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                        {(u.fullName || '?').trim().charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>{u.fullName || '--'}</div>
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{ background: u.badge.roleColor.bg, color: u.badge.roleColor.color, border: u.badge.roleColor.border || 'none', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '4px 10px' }}>
                      {u.badge.label}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999,
                      background: u.isOnline ? '#ecfdf3' : '#f2f4f7',
                      color: u.isOnline ? '#027a48' : '#667085',
                      padding: '4px 10px', fontSize: 12, fontWeight: 700,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.isOnline ? '#12b76a' : '#98a2b3' }} />
                      {u.statusText}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, color: '#475467' }}>{u.email || '--'}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setEditingRoleUserId((prev) => (prev === u.userId ? null : u.userId))}
                        disabled={actingUserId === u.userId}
                        title="Chỉnh sửa role"
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: '1px solid #d0d5dd', background: '#fff',
                          cursor: actingUserId === u.userId ? 'not-allowed' : 'pointer', color: '#1d4ed8', fontSize: 14,
                        }}
                      >
                        ✎
                      </button>

                      {editingRoleUserId === u.userId && (
                        <select
                          value={u.roleKey || 'user'}
                          disabled={actingUserId === u.userId}
                          onChange={(e) => handleEditRole(u, e.target.value)}
                          onBlur={() => {
                            if (actingUserId !== u.userId) setEditingRoleUserId(null);
                          }}
                          style={{
                            height: 30,
                            borderRadius: 8,
                            border: '1px solid #d0d5dd',
                            background: '#fff',
                            fontSize: 12,
                            color: '#344054',
                            padding: '0 8px',
                            outline: 'none',
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super-admin">Super Admin</option>
                        </select>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleLock(u)}
                        disabled={actingUserId === u.userId}
                        title={Number(u.status) === 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: '1px solid #d0d5dd', background: '#fff',
                          cursor: actingUserId === u.userId ? 'not-allowed' : 'pointer',
                          color: Number(u.status) === 1 ? '#b42318' : '#027a48', fontSize: 14,
                        }}
                      >
                        {Number(u.status) === 1 ? '🔒' : '🔓'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid #f2f4f7', display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px', border: '1px solid #d0d5dd', background: '#fff', color: currentPage === 1 ? '#98a2b3' : '#344054',
                borderRadius: 8, fontSize: 13, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Trang trước
            </button>
            <span style={{ fontSize: 13, color: '#667085' }}>
              Trang <strong>{currentPage}</strong> / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px', border: '1px solid #d0d5dd', background: '#fff', color: currentPage === totalPages ? '#98a2b3' : '#344054',
                borderRadius: 8, fontSize: 13, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Trang tiếp
            </button>
          </div>
        )}

        {!loading && viewUsers.length === 0 && (
          <div style={{ padding: 18, fontSize: 13, color: '#667085' }}>
            Không có người dùng nào phù hợp.
          </div>
        )}

        {loading && (
          <div style={{ padding: 18, fontSize: 13, color: '#667085' }}>
            Đang tải dữ liệu người dùng...
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', width: 400, borderRadius: 12, padding: 20, boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Thêm người dùng mới</h2>
            {addError && (
              <div style={{ background: '#fef3f2', border: '1px solid #fecdca', color: '#b42318', borderRadius: 8, padding: '10px', fontSize: 13, marginBottom: 16 }}>
                {addError}
              </div>
            )}
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#344054', marginBottom: 4 }}>Họ và tên</label>
                <input
                  value={newFullName} onChange={(e) => setNewFullName(e.target.value)} required
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #d0d5dd', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}
                  placeholder="Nhập họ và tên..."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#344054', marginBottom: 4 }}>Email</label>
                <input
                  type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #d0d5dd', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}
                  placeholder="Nhập email..."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#344054', marginBottom: 4 }}>Mật khẩu</label>
                <input
                  type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #d0d5dd', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}
                  placeholder="Nhập mật khẩu..." minLength={8}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#344054', marginBottom: 4 }}>Vai trò</label>
                <select
                  value={newRole} onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #d0d5dd', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={adding}
                  style={{ border: '1px solid #d0d5dd', background: '#fff', color: '#344054', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  style={{ border: 'none', background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: adding ? 'not-allowed' : 'pointer' }}
                >
                  {adding ? 'Đang lưu...' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
