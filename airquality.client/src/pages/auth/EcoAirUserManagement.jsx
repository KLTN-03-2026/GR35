export default function EcoAirUserManagement() {
  const users = [
    {
      name: "Nguyen Minh Hiếu",
      email: "hieu.minh@ecoair.vn",
      role: "QUẢN TRỊ",
      roleColor: { bg: "#7c3aed", color: "#fff" },
      status: "Hoạt động",
      online: true,
      avatar: "👨‍💼",
    },
    {
      name: "Lê Thị Kim Chi",
      email: "chi.le@data-science.vn",
      role: "PRO",
      roleColor: { bg: "#1a7a4a", color: "#fff" },
      status: "Hoạt động",
      online: true,
      avatar: "👩‍💼",
    },
    {
      name: "Phạm Quang Vinh",
      email: "vinh.pq@guest.io",
      role: "FREE",
      roleColor: { bg: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" },
      status: "Ngoại tuyến",
      online: false,
      avatar: "👨",
    },
  ];

  return (
    <div>
      <style>{`
        * { box-sizing: border-box; }
      `}</style>

      {/* TOP BAR / NAVIGATION */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "7px 14px", width: 240, border: "1px solid #e5e7eb" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1.5" /><path d="M10 10l2.5 2.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input placeholder="Tìm kiếm người dùng..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 4, background: "#fff", padding: 4, borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <div style={{ padding: "6px 16px", fontSize: 13, fontWeight: 500, color: "#6b7280", cursor: "pointer" }}>Tổng quan</div>
            <div style={{ padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#1a7a4a", background: "#e8f5ec", borderRadius: 6, cursor: "pointer" }}>Dữ liệu khu vực</div>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div>
        {/* Heading row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Quản lý Người dùng</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Giám sát các mục truy cập và quyền theo dõi môi trường.</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a7a4a", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 16 }}>👤+</span> Thêm người dùng mới
          </button>
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>

          {/* Left col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* User table */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "24px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Danh sách hoạt động</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ background: "#f3f4f6", color: "#374151", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>Tổng số 34</span>
                  <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>12 Trực tuyến</span>
                </div>
              </div>

              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1.2fr 0.5fr", gap: 8, padding: "0 0 10px 0", borderBottom: "1px solid #f3f4f6", marginBottom: 4 }}>
                {["NGƯỜI DÙNG", "VAI TRÒ", "TRẠNG THÁI", "HÀNH ĐỘNG"].map((h) => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.8, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>

              {/* Table rows */}
              {users.map((u, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1.2fr 0.5fr", gap: 8, alignItems: "center", padding: "14px 0", borderBottom: i < users.length - 1 ? "1px solid #f9fafb" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, overflow: "hidden" }}>
                      {u.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.email}</div>
                    </div>
                  </div>
                  <div>
                    <span style={{ background: u.roleColor.bg, color: u.roleColor.color, border: u.roleColor.border || "none", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>
                      {u.role}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: u.online ? "#374151" : "#9ca3af" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.online ? "#10b981" : "#d1d5db", flexShrink: 0 }} />
                    {u.status}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <div style={{ cursor: "pointer", fontSize: 18, color: "#9ca3af", padding: "4px 6px" }}>⋮</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom 3 cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                {
                  icon: "🛡️",
                  title: "Kiểm tra bảo mật",
                  desc: "Lần quét toàn bộ hệ thống cuối cùng hoàn thành cách đây 4 giờ. Không có bất thường nào được phát hiện.",
                  iconColor: "#1a7a4a",
                },
                {
                  icon: "🔗",
                  title: "Webhooks đang hoạt động",
                  desc: "12 điểm cuối đang lắng nghe cảnh báo ngưỡng PM2.5 tại 4 tỉnh thành.",
                  iconColor: "#1a7a4a",
                },
                {
                  icon: "🕐",
                  title: "Nhật ký truy cập",
                  desc: "3 lần đăng nhập thất bại từ IP không xác định (192.168.1.1) đã được ghi cờ để xem xét.",
                  iconColor: "#b91c1c",
                },
              ].map((card) => (
                <div key={card.title} style={{ background: "#fff", borderRadius: 14, padding: "22px 20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{card.title}</div>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* API Key card */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "22px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Sử dụng API Key</div>
                <span style={{ fontSize: 18, color: "#9ca3af" }}>✦</span>
              </div>

              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Hạn ngạch đã dùng</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>8,450 / 10,000</span>
                </div>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4 }}>
                  <div style={{ width: "84.5%", height: "100%", background: "#1a7a4a", borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ marginTop: 18, background: "#f9fafb", borderRadius: 10, padding: "14px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>🔑</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Khóa tích hợp Master</span>
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace", background: "#f3f4f6", padding: "6px 10px", borderRadius: 6, marginBottom: 12, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  ecair_live_9a87v2b5_x900k11...
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ flex: 1, border: "1.5px solid #d1d5db", background: "#fff", borderRadius: 7, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    THU HỒI
                  </button>
                  <button style={{ flex: 1, border: "1.5px solid #d1d5db", background: "#fff", borderRadius: 7, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    ĐỔI KHÓA
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "1.5px dashed #d1d5db", borderRadius: 8, padding: "10px 0", cursor: "pointer" }}>
                <span style={{ fontSize: 16, color: "#6b7280" }}>⊕</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>TẠO KHÓA MỚI</span>
              </div>
            </div>

            {/* Optimization suggestion */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "22px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>📈</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Gợi ý tối ưu hóa</span>
              </div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 14 }}>
                Hệ thống nhận thấy 3 tài khoản PRO không hoạt động. Hạ cấp chúng có thể tối ưu hóa chi phí hạ tầng khoảng <span style={{ color: "#1a7a4a", fontWeight: 700 }}>12%</span>.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a7a4a" }}>Xem xét các tài khoản không hoạt động</span>
                <span style={{ color: "#1a7a4a", fontSize: 14 }}>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
