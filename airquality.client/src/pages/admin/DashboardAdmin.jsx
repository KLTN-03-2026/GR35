import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Be Vietnam Pro', sans-serif;
    background: #f0f2f5;
    color: #1a1a2e;
  }

  .layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  /* SIDEBAR */
  .sidebar {
    width: 240px;
    min-width: 240px;
    background: #0f1923;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-logo {
    padding: 20px 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .logo-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 38px;
    height: 38px;
    background: #22c55e;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .logo-text h2 {
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .logo-text p {
    color: #64748b;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .sidebar-nav {
    flex: 1;
    padding: 12px 0;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 0;
    position: relative;
    color: #94a3b8;
    font-size: 13.5px;
    font-weight: 500;
  }

  .nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: #fff;
  }

  .nav-item.active {
    background: rgba(34,197,94,0.12);
    color: #22c55e;
  }

  .nav-item.active::left {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #22c55e;
    border-radius: 0 2px 2px 0;
  }

  .nav-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .sidebar-bottom {
    padding: 12px 0;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .nav-danger {
    color: #f87171 !important;
  }

  /* MAIN */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    background: #f0f2f5;
  }

  /* HEADER */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .page-header h1 {
    font-size: 22px;
    font-weight: 700;
    color: #0f1923;
    margin-bottom: 3px;
  }

  .page-header p {
    font-size: 12.5px;
    color: #64748b;
    font-weight: 400;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .sync-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 12.5px;
    color: #374151;
    font-weight: 500;
  }

  .sync-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
  }

  .admin-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 6px 12px 6px 6px;
    cursor: pointer;
  }

  .admin-avatar {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .admin-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .admin-info h4 {
    font-size: 13px;
    font-weight: 600;
    color: #0f1923;
  }

  .admin-info p {
    font-size: 11px;
    color: #64748b;
    font-weight: 400;
  }

  /* STAT CARDS */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 18px 20px;
    border: 1px solid #e8ecf0;
    position: relative;
    overflow: hidden;
  }

  .stat-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .stat-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .stat-icon-wrap.green { background: #f0fdf4; }
  .stat-icon-wrap.blue { background: #eff6ff; }
  .stat-icon-wrap.purple { background: #faf5ff; }
  .stat-icon-wrap.red { background: #fef2f2; }

  .stat-badges {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .badge-num {
    background: #ef4444;
    color: #fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .badge-live {
    background: #22c55e;
    color: #fff;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .badge-stable {
    background: #3b82f6;
    color: #fff;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 9px;
    font-weight: 700;
  }

  .badge-limit {
    background: #a855f7;
    color: #fff;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 9px;
    font-weight: 700;
  }

  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
  }

  .stat-label {
    font-size: 10px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 26px;
    font-weight: 700;
    color: #0f1923;
    line-height: 1.1;
  }

  .stat-value span {
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
    margin-left: 3px;
  }

  .stat-sub {
    font-size: 11.5px;
    color: #64748b;
    margin-top: 2px;
  }

  .stat-sub.green { color: #22c55e; }

  .stat-progress {
    height: 4px;
    background: #f1f5f9;
    border-radius: 2px;
    margin-top: 14px;
    overflow: hidden;
  }

  .stat-progress-bar {
    height: 100%;
    border-radius: 2px;
  }

  .stat-action {
    font-size: 11.5px;
    color: #ef4444;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    display: block;
  }

  /* BOTTOM SECTION */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  /* MAP */
  .map-card {
    background: #1a2332;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    min-height: 320px;
  }

  .map-overlay-header {
    position: absolute;
    top: 14px;
    left: 14px;
    background: rgba(255,255,255,0.92);
    border-radius: 8px;
    padding: 8px 14px;
    z-index: 2;
  }

  .map-overlay-header h4 {
    font-size: 11px;
    font-weight: 700;
    color: #374151;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .map-legend {
    display: flex;
    gap: 14px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #374151;
    font-weight: 500;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .map-bg {
    width: 100%;
    height: 320px;
    background: linear-gradient(135deg, #1e3a5f 0%, #0d2137 50%, #162032 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .vietnam-map {
    position: relative;
    width: 160px;
    height: 260px;
  }

  .map-shape {
    width: 100%;
    height: 100%;
    background: rgba(52,211,153,0.15);
    border: 1.5px solid rgba(52,211,153,0.4);
    border-radius: 40% 30% 40% 35% / 20% 20% 50% 55%;
    position: relative;
  }

  .map-pin {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pin-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
  }

  .pin-dot.online { background: #22c55e; }
  .pin-dot.offline { background: #ef4444; }

  .pin-label {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.9);
    color: #0f1923;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    margin-bottom: 3px;
  }

  /* LOGS */
  .logs-card {
    background: #1a1a2e;
    border-radius: 14px;
    overflow: hidden;
  }

  .logs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #141428;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .logs-title {
    font-size: 10px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .logs-dots {
    display: flex;
    gap: 5px;
  }

  .dot-r { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; }
  .dot-y { width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; }
  .dot-g { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; }

  .logs-body {
    padding: 14px;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    line-height: 1.8;
    overflow-y: auto;
    height: 290px;
  }

  .log-line { color: #94a3b8; }
  .log-info { color: #60a5fa; }
  .log-success { color: #34d399; }
  .log-warn { color: #fbbf24; }
  .log-time { color: #64748b; }

  /* COMMUNITY REPORTS */
  .reports-card {
    background: #fff;
    border-radius: 14px;
    padding: 22px 24px;
    border: 1px solid #e8ecf0;
  }

  .reports-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .reports-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: #0f1923;
    margin-bottom: 3px;
  }

  .reports-header p {
    font-size: 12px;
    color: #64748b;
  }

  .btn-history {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
  }

  .reports-table {
    width: 100%;
    border-collapse: collapse;
  }

  .reports-table th {
    text-align: left;
    font-size: 10.5px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    padding: 0 0 10px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .reports-table td {
    padding: 14px 0;
    border-bottom: 1px solid #f8fafc;
    vertical-align: middle;
  }

  .reports-table tr:last-child td {
    border-bottom: none;
  }

  .reporter {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reporter-avatar {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .reporter-info h5 {
    font-size: 13px;
    font-weight: 600;
    color: #0f1923;
  }

  .reporter-info p {
    font-size: 11px;
    color: #94a3b8;
  }

  .report-img {
    width: 44px;
    height: 38px;
    border-radius: 7px;
    object-fit: cover;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .coord-cell h5 {
    font-size: 12.5px;
    font-weight: 600;
    color: #0f1923;
  }

  .coord-cell p {
    font-size: 11px;
    color: #64748b;
  }

  .time-cell {
    font-size: 12.5px;
    font-weight: 500;
    color: #374151;
  }

  .action-btns {
    display: flex;
    gap: 7px;
  }

  .btn-reject {
    border: 1px solid #fca5a5;
    background: #fff5f5;
    color: #ef4444;
    border-radius: 7px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-approve {
    background: #22c55e;
    color: #fff;
    border: none;
    border-radius: 7px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  /* FOOTER */
  .footer {
    background: #fff;
    border-top: 1px solid #e8ecf0;
    padding: 12px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer p {
    font-size: 11.5px;
    color: #94a3b8;
  }

  .footer-links {
    display: flex;
    gap: 20px;
  }

  .footer-links a {
    font-size: 11.5px;
    color: #64748b;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
  }

  .footer-links a:hover { color: #22c55e; }
`;

const navItems = [
  { icon: "⊞", label: "Tổng quan hệ thống", active: true },
  { icon: "⚙", label: "Quản lý Trạm (OpenAQ)" },
  { icon: "📈", label: "Giám sát Mô hình AI" },
  { icon: "📢", label: "Duyệt báo cáo Cộng đồng" },
  { icon: "🔑", label: "Quản lý User & API Key" },
  { icon: "🖥", label: "HS thống & Logs" },
];

const logLines = [
  { type: "time", text: "[2024-05-24 10:15:22] Initializing OpenAQ v3 synchronization..." },
  { type: "info", text: "INFO: Connected to API endpoint: api.openaq.org/v3/measurements" },
  { type: "success", text: "SUCCESS: Received 1,420 new records from Hanoi_US_Embassy" },
  { type: "success", text: "SUCCESS: Received 890 new records from HCM_US_Consulate" },
  { type: "time", text: "[2024-05-24 10:15:30] Processing spatial data interpolation..." },
  { type: "warn", text: "WARN: Station ID #99283 (Da Nang) reporting latency > 500ms" },
  { type: "info", text: "INFO: Triggering AI model retraining cycle (RMSE: 4.2)" },
  { type: "time", text: ">> Running background garbage collection..." },
  { type: "success", text: "SUCCESS: Cache invalidated for 12,400 keys." },
  { type: "time", text: "[2024-05-24 10:15:45] Sync process completed in 23.4s" },
];

const reporters = [
  {
    initials: "NH",
    color: "#3b82f6",
    name: "Nguyễn Huy",
    id: "4492",
    imgBg: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    imgIcon: "🌅",
    coord: "21.0285° N, 105.8542° E",
    loc: "Hoàn Kiếm, Hà Nội",
    time: "10:15 AM",
  },
  {
    initials: "TL",
    color: "#8b5cf6",
    name: "Trần Lan",
    id: "8821",
    imgBg: "linear-gradient(135deg, #f97316, #ef4444)",
    imgIcon: "🌆",
    coord: "10.8231° N, 106.6297° E",
    loc: "Quận 12, TP. HCM",
    time: "09:30 AM",
  },
  {
    initials: "LM",
    color: "#22c55e",
    name: "Lê Minh",
    id: "3105",
    imgBg: "linear-gradient(135deg, #34d399, #059669)",
    imgIcon: "🏔",
    coord: "16.0544° N, 108.2022° E",
    loc: "Hải Châu, Đà Nẵng",
    time: "08:15 AM",
  },
];

export default function dashboardAdmin() {
  return (
    <>
      <style>{styles}</style>
      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-box">
              <div className="logo-icon">🌿</div>
              <div className="logo-text">
                <h2>EcoAir VN</h2>
                <p>Administrator</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item, i) => (
              <div key={i} className={`nav-item ${item.active ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="nav-item">
              <span className="nav-icon">⚙</span>
              <span>Cài đặt</span>
            </div>
            <div className="nav-item nav-danger">
              <span className="nav-icon">→</span>
              <span>Đăng xuất</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="main-content">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1>Quản trị viên Hệ thống</h1>
                <p>Bảng điều khiển giám sát thời thực</p>
              </div>
              <div className="header-right">
                <div className="sync-badge">
                  <span className="sync-dot"></span>
                  Sync status: OK
                </div>
                <div className="admin-profile">
                  <div className="admin-avatar">
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>A</div>
                  </div>
                  <div className="admin-info">
                    <h4>Admin_EcoAir</h4>
                    <p>System Root</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
              {/* Card 1 - Trạm */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrap green">📡</div>
                  <div className="stat-badges">
                    <span className="badge-live">LIVE</span>
                  </div>
                </div>
                <div className="stat-label">Trạm Hoạt Động</div>
                <div className="stat-value">54/60 <span>Online</span></div>
                <div className="stat-progress">
                  <div className="stat-progress-bar" style={{ width: "90%", background: "#22c55e" }}></div>
                </div>
              </div>

              {/* Card 2 - RMSE */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrap blue">🎯</div>
                  <div className="stat-badges">
                    <span className="badge-stable">v2.1 Stable</span>
                  </div>
                </div>
                <div className="stat-label">RMSE Mô Hình AI</div>
                <div className="stat-value">4.2 <span style={{ fontSize: 12, color: "#22c55e" }}>↓ 0.3%</span></div>
                <div className="stat-sub">Prediction Error (Last 24h)</div>
              </div>

              {/* Card 3 - API */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrap purple">⚡</div>
                  <div className="stat-badges">
                    <span className="badge-limit">LIMIT</span>
                  </div>
                </div>
                <div className="stat-label">API Call Usage</div>
                <div className="stat-value">8,450 <span>/ 10k</span></div>
                <div className="stat-progress">
                  <div className="stat-progress-bar" style={{ width: "84.5%", background: "#a855f7" }}></div>
                </div>
              </div>

              {/* Card 4 - Báo cáo */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrap red">📋</div>
                  <div className="stat-badges">
                    <span className="badge-dot"></span>
                  </div>
                </div>
                <div className="stat-label">Báo Cáo Chờ Duyệt</div>
                <div className="stat-value" style={{ fontSize: 22 }}>
                  <span style={{ fontSize: 28, color: "#0f1923", marginLeft: 0 }}>12</span>{" "}
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>Pending</span>
                </div>
                <a className="stat-action">XX lý ngay →</a>
              </div>
            </div>

            {/* Map + Logs */}
            <div className="bottom-grid">
              {/* Vietnam Map */}
              <div className="map-card">
                <div className="map-bg">
                  {/* Map overlay legend */}
                  <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(255,255,255,0.93)", borderRadius: 8, padding: "8px 14px", zIndex: 2 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>Trạng Thái Trạm Quốc Gia</div>
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#374151", fontWeight: 500 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                        Online (54)
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#374151", fontWeight: 500 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }}></span>
                        Offline (6)
                      </div>
                    </div>
                  </div>

                  {/* SVG Vietnam shape */}
                  <svg viewBox="0 0 120 300" width="120" height="300" style={{ opacity: 0.9 }}>
                    <defs>
                      <radialGradient id="mapGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(34,197,94,0.25)" />
                        <stop offset="100%" stopColor="rgba(34,197,94,0.05)" />
                      </radialGradient>
                    </defs>
                    {/* Simplified Vietnam silhouette */}
                    <path
                      d="M 60 10 C 72 12 80 18 78 30 C 82 38 85 44 80 52 C 78 60 74 65 70 72 C 72 80 74 88 72 96 C 70 104 66 110 68 118 C 70 126 72 132 70 140 C 68 148 64 154 60 160 C 58 166 56 172 54 178 C 52 186 50 192 48 198 C 46 208 44 218 46 228 C 48 238 52 244 50 252 C 48 260 44 264 42 270 C 44 278 46 282 44 288 C 42 293 38 296 36 298 L 32 290 C 34 282 36 276 34 268 C 32 260 28 254 30 244 C 32 234 36 228 34 218 C 32 208 28 202 30 192 C 32 182 36 174 38 166 C 40 158 40 150 38 142 C 36 134 32 126 34 118 C 36 110 42 104 44 96 C 46 88 44 80 46 72 C 48 64 52 58 50 50 C 48 42 44 36 46 28 C 48 20 54 14 60 10Z"
                      fill="url(#mapGrad)"
                      stroke="rgba(52,211,153,0.5)"
                      strokeWidth="1.5"
                    />
                    {/* Station pins */}
                    <circle cx="66" cy="42" r="5" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="52" cy="42" r="4" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                    <text x="42" y="38" fontSize="8" fill="rgba(255,255,255,0.8)" fontWeight="600">16</text>
                    <circle cx="60" cy="88" r="5" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="58" cy="140" r="5" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="48" cy="190" r="5" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="42" cy="240" r="5" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    {/* labels */}
                    <rect x="52" y="60" width="26" height="13" rx="3" fill="rgba(255,255,255,0.9)" />
                    <text x="54" y="70" fontSize="7" fill="#0f1923" fontWeight="700">○15</text>
                    <rect x="52" y="108" width="28" height="13" rx="3" fill="rgba(255,255,255,0.9)" />
                    <text x="54" y="118" fontSize="7" fill="#0f1923" fontWeight="700">14</text>
                  </svg>
                </div>
              </div>

              {/* System Logs */}
              <div className="logs-card">
                <div className="logs-header">
                  <div className="logs-dots">
                    <span className="dot-r"></span>
                    <span className="dot-y"></span>
                    <span className="dot-g"></span>
                  </div>
                  <span className="logs-title">System Logs · OpenAQ Sync</span>
                  <span style={{ fontSize: 11, color: "#475569", cursor: "pointer" }}>⬜ ✕</span>
                </div>
                <div className="logs-body">
                  {logLines.map((line, i) => (
                    <div key={i} className={`log-line ${line.type === "info" ? "log-info" : line.type === "success" ? "log-success" : line.type === "warn" ? "log-warn" : "log-time"}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Community Reports */}
            <div className="reports-card">
              <div className="reports-header">
                <div>
                  <h3>Báo cáo Cộng đồng chờ duyệt</h3>
                  <p>Xem xét và xác thực hình ảnh ô nhiễm từ người dùng</p>
                </div>
                <button className="btn-history">Xem tất cả lịch sử</button>
              </div>

              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Người Gửi</th>
                    <th>Hình Ảnh</th>
                    <th>Tọa Độ</th>
                    <th>Thời Gian</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {reporters.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <div className="reporter">
                          <div className="reporter-avatar" style={{ background: r.color }}>
                            {r.initials}
                          </div>
                          <div className="reporter-info">
                            <h5>{r.name}</h5>
                            <p>ID: {r.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="report-img" style={{ background: r.imgBg }}>
                          {r.imgIcon}
                        </div>
                      </td>
                      <td>
                        <div className="coord-cell">
                          <h5>{r.coord}</h5>
                          <p>{r.loc}</p>
                        </div>
                      </td>
                      <td>
                        <span className="time-cell">{r.time}</span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-reject">Từ chối</button>
                          <button className="btn-approve">Duyệt</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <footer className="footer">
            <p>© 2024 EcoAir VN Admin Portal. Toàn bộ dữ liệu được bảo mật theo tiêu chuẩn ISO 27001.</p>
            <div className="footer-links">
              <a>Tài liệu API</a>
              <a>Liên hệ Kỹ thuật</a>
              <a>Phản hồi Lỗi</a>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
