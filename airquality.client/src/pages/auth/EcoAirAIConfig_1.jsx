export default function EcoAirAIConfig_1() {

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", display: "flex", minHeight: "100vh", background: "#f0f4f0", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select { appearance: none; -webkit-appearance: none; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: 200, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "0 0 24px 0", flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh" }}>
        {/* Logo */}
        <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, background: "#1a7a4a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M14 3C8 3 4 8 4 14s4 11 10 11 10-4.5 10-11S20 3 14 3z" fill="#c6e8d4" />
                <path d="M10 18c1-4 4-7 8-8-1 3-1 6-3 8" fill="#fff" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", lineHeight: 1.2 }}>EcoAir VN</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#1a7a4a", letterSpacing: 1, textTransform: "uppercase" }}>Quản trị môi trường</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {[
            { icon: "⊞", label: "Bảng điều khiển", active: false },
            { icon: "📊", label: "Báo cáo", active: false },
            { icon: "👤", label: "Người dùng", active: false },
            { icon: "📡", label: "Trạm quan trắc", active: false },
            { icon: "🌿", label: "Cấu hình AI", active: true },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 18px",
              cursor: "pointer", borderRadius: 0,
              background: item.active ? "#f0f9f4" : "transparent",
              borderLeft: item.active ? "3px solid #1a7a4a" : "3px solid transparent",
              fontWeight: item.active ? 700 : 500,
              fontSize: 13,
              color: item.active ? "#1a7a4a" : "#374151",
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* Bottom nav */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
          {[
            { icon: "👤", label: "Hồ sơ" },
            { icon: "↩", label: "Đăng xuất" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: 200, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 56, position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f3f4f6", borderRadius: 8, padding: "7px 14px", width: 220 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1.5"/><path d="M10 10l2.5 2.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>Tìm kiếm tham số...</span>
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ padding: "6px 16px", fontSize: 13, fontWeight: 500, color: "#6b7280", cursor: "pointer" }}>Tổng quan</div>
              <div style={{ padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#1a7a4a", borderBottom: "2px solid #1a7a4a", cursor: "pointer" }}>Phân tích AI</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z" stroke="#374151" strokeWidth="1.5"/><path d="M8 16a2 2 0 0 0 4 0" stroke="#374151" strokeWidth="1.5"/></svg>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Quản trị viên</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>Kiến trúc sư hệ thống</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👩</div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ padding: "28px 28px 40px", flex: 1 }}>

          {/* Page heading */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a7a4a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Tối ưu hóa hệ thống</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h1 style={{ fontSize: 28, fontWeight: 800 }}>Phân tích &amp; Cấu hình AI</h1>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid #d1d5db", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ⬇ Xuất Nhật ký
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 7, background: "#1a7a4a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  ▶ Triển khai Mô hình
                </button>
              </div>
            </div>
          </div>

          {/* ROW 1: Accuracy + Models */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 20 }}>

            {/* Accuracy card */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "28px 28px 20px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                Hiệu suất mô hình
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Độ chính xác Dự báo</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Xác thực thời gian thực so với dữ liệu cảm biến thực tế.</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 52, fontWeight: 800, color: "#1a7a4a", lineHeight: 1 }}>94.2<span style={{ fontSize: 28 }}>%</span></div>
                  <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                    <span>↗</span> +1.4% so với tuần trước
                  </div>
                </div>
              </div>
              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100, marginTop: 16 }}>
                {[40, 52, 46, 60, 68, 74, 80, 85, 90, 88, 92, 94].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: i === 11 ? "#1a7a4a" : "#c6ddd0", borderRadius: "4px 4px 0 0", height: `${h}%`, minWidth: 0 }} />
                ))}
              </div>
            </div>

            {/* Models panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* LSTM */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🧠</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Mạng LSTM</span>
                  </div>
                  <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>ĐANG CHẠY</span>
                </div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>
                  Dự báo chuỗi thời gian cho mức PM2.5 trên khắp vùng Đồng bằng sông Hồng.
                </p>
                <div style={{ display: "flex", gap: 32 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Epochs</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>1,250</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Mất mát</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>0.0034</div>
                  </div>
                </div>
              </div>

              {/* XGBoost */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", borderLeft: "4px solid #ef4444" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>📦</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Động cơ XGBoost</span>
                  </div>
                  <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textAlign: "center", lineHeight: 1.4 }}>ĐANG HUẤN<br/>LUYỆN LẠI</span>
                </div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>
                  Phân tích tầm quan trọng của các biến khí tượng và sản lượng công nghiệp.
                </p>
                <div style={{ height: 6, background: "#fee2e2", borderRadius: 3 }}>
                  <div style={{ width: "65%", height: "100%", background: "#ef4444", borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Params + Training log */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 20 }}>

            {/* Param tuning */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "24px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15 }}>
                  <span>⚙️</span> Tinh chỉnh Tham số
                </div>
                <button style={{ background: "none", border: "none", color: "#1a7a4a", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                  🔄 Đặt lại mặc định
                </button>
              </div>

              {/* Learning rate */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Tỷ lệ học</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a7a4a" }}>0.001</span>
                </div>
                <div style={{ height: 2, background: "#e5e7eb", borderRadius: 2 }}>
                  <div style={{ width: "30%", height: "100%", background: "#1a7a4a", borderRadius: 2 }} />
                </div>
              </div>

              {/* Two dropdowns */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Độ trễ dữ liệu (ms)</div>
                  <div style={{ position: "relative" }}>
                    <select style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "10px 36px 10px 12px", fontSize: 13, fontWeight: 500, background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "#1a1a1a" }}>
                      <option>Tiêu chuẩn (250ms)</option>
                    </select>
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }}>▾</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Tập đặc trưng</div>
                  <div style={{ position: "relative" }}>
                    <select style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "10px 36px 10px 12px", fontSize: 13, fontWeight: 500, background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "#1a1a1a" }}>
                      <option>Tất cả các biến</option>
                    </select>
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }}>▾</span>
                  </div>
                </div>
              </div>

              {/* Auto optimize toggle */}
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, background: "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Tự động tối ưu hóa (AI)</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Để hệ thống tự động điều chỉnh trọng số dựa trên độ lệch dự báo.</div>
                </div>
                {/* Toggle ON */}
                <div style={{ width: 44, height: 24, background: "#1a7a4a", borderRadius: 12, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, right: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>

            {/* Training log */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "24px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
                <span>📋</span> Nhật ký Huấn luyện
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { dot: "#10b981", title: "Hoàn tất Huấn luyện", time: "14:20:05", desc: "Mô hình LSTM hội tụ sau 1250 epoch. RMSE xác thực cuối cùng: 0.12" },
                  { dot: "#10b981", title: "Cập nhật Trọng số", time: "14:18:12", desc: "Đã điều chỉnh tỷ lệ học thành 0.0005 do sự đình trệ của hàm mất mát." },
                  { dot: "#d1d5db", title: "Đang huấn luyện lại XGBoost", time: "14:15:33", desc: "Đang phân vùng dữ liệu lịch sử cho khu vực Đồng bằng sông Hồng..." },
                  { dot: "#ef4444", title: "Bất thường Dữ liệu", time: "14:10:01", desc: "Cảm biến ID#229 báo cáo giá trị PM10 ngoài phạm vi. Đang lọc mẫu." },
                ].map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <div style={{ paddingTop: 3, flexShrink: 0 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: log.dot }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{log.title}</span>
                        <span style={{ fontSize: 11, color: "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{log.time}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{log.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3: Terminal + Data Center */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>

            {/* Terminal */}
            <div style={{ background: "#1e1e1e", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 18px", borderBottom: "1px solid #2d2d2d" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ marginLeft: 10, fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}>admin@ecoair-vn-ai-node-01:~$ model --status</span>
              </div>
              <div style={{ padding: "18px 20px", fontFamily: "monospace", fontSize: 12, lineHeight: 2, color: "#d1d5db" }}>
                <div>Đang kết nối tới mạng lưới cảm biến phân tán...</div>
                <div><span style={{ color: "#10b981" }}>[OK]</span> Đã xác thực kết nối với Hanoi_Main_Station</div>
                <div><span style={{ color: "#60a5fa" }}>[INFO]</span> Đang lấy dữ liệu thời gian 48h cho PM2.5</div>
                <div><span style={{ color: "#f59e0b" }}>[WARN]</span> Phát hiện một gói tin cao trên liên kết về tình 14B. Đang chuyển sang cáp quang dự phòng.</div>
                <div><span style={{ color: "#10b981" }}>[OK]</span> Đã tải tập dữ liệu: 144,200 điểm</div>
                <div>Khởi động động cơ suy luận v4.2.1-stable</div>
                <div style={{ color: "#6b7280" }}>----------------------------------------</div>
                <div>Tiến độ: [████████████████████] 100%</div>
              </div>
            </div>

            {/* Data center */}
            <div style={{ background: "#1a7a4a", borderRadius: 14, padding: "24px 22px", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>🗄️</span>
                <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Trung tâm<br />Dữ liệu</div>
              </div>
              <p style={{ fontSize: 12, color: "#a7d8be", lineHeight: 1.7, marginBottom: 20 }}>
                Xuất trọng số mô hình và báo cáo phân tích một cách an toàn để kiểm tra tuần thủ ngoại tuyến.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Chỉ số CSV", "Báo cáo Kiểm toán PDF", "Bản đồ JSON Mô hình"].map((label) => (
                  <button key={label} style={{ background: "#145c38", color: "#fff", border: "none", borderRadius: 8, padding: "11px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING TOAST */}
      <div style={{ position: "fixed", bottom: 24, right: 28, background: "#1e1e1e", color: "#fff", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", maxWidth: 260 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#2d2d2d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🗺️</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Lớp phủ Không gian</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Đang xem Quản Trung tâm Hà Nội</div>
        </div>
        <div style={{ width: 32, height: 32, background: "#1a7a4a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="2" y="9" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="9" width="5" height="5" rx="1" fill="#fff"/></svg>
        </div>
      </div>
    </div>
  );
}
