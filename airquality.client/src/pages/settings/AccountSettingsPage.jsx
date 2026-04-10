export default function AccountSettingsPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{
        width: 240, background: "white", borderRight: "1px solid #e9ecef",
        display: "flex", flexDirection: "column", padding: "20px 0",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #0d6e4e, #22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 005.4 21C10 17 15 15 19 14c.34-2.68-1-5-2-6z"/>
                <path d="M12 2C6 2 2 8 2 12c0 .7.07 1.38.2 2.04C4.52 9.44 9.18 6 15 5.5A10 10 0 0012 2z" opacity="0.7"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1a2e1a", lineHeight: 1.2 }}>EcoAir VN</div>
              <div style={{ fontSize: 9, color: "#9ca3af", letterSpacing: "0.8px", fontWeight: 600 }}>NGUOI BAO HO THANH KHIET</div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{
            background: "#f8faf8", borderRadius: 12, padding: "14px",
            display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
            border: "1px solid #e9ecef",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>Minh Quang</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <div style={{ background: "#f59e0b", borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: 3 }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  PRO
                </div>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Hoi vien cao cap</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ padding: "8px 12px", flex: 1 }}>
          {[
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, label: "Tong quan" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>, label: "Ban do & Tim duong" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, label: "Lich su & Xuat du lieu" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>, label: "Cau hinh Canh bao" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M8 12h8M8 8h8M8 16h5"/></svg>, label: "Bao cao diem nong" },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, label: "API Key" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, cursor: "pointer",
              color: "#6b7280", marginBottom: 2,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {item.icon}
              <span style={{ fontSize: 13.5 }}>{item.label}</span>
            </div>
          ))}

          {/* Active item */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8, cursor: "pointer",
            background: "#f0fdf4", color: "#0d6e4e", marginBottom: 2,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Ho so & Suc khoe</span>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ padding: "0 12px 16px", borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", color: "#6b7280", marginBottom: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            <span style={{ fontSize: 13.5 }}>Cai dat</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", color: "#ef4444" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>Dang xuat</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <div style={{
          background: "white", borderBottom: "1px solid #e9ecef",
          padding: "0 32px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 9,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a2e1a" }}>Chao mung tro lai, Minh Quang!</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Hom nay khong khi khu vuc cua ban rat trong lanh.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#f9fafb", border: "1px solid #e5e7eb",
              borderRadius: 10, padding: "8px 14px",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>Tim tram, khu vuc...</span>
            </div>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#f59e0b", color: "white", border: "none",
              borderRadius: 10, padding: "9px 18px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Nang cap Pro
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "1px solid #e5e7eb", background: "white",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ padding: "32px", flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a2e1a", marginBottom: 6, marginTop: 0 }}>
            Cai dat Tai khoan
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28, marginTop: 0 }}>
            Quan ly thong tin ca nhan va ho so suc khoe de AI toi uu hoa trai nghiem cua ban.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Basic Info Card */}
              <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e9ecef" }}>
                {/* Avatar + title */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: "#374151",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: 24, height: 24, borderRadius: "50%",
                      background: "#0d6e4e", border: "2px solid white",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1a2e1a", marginBottom: 4 }}>Thong tin co ban</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>Cap nhat anh va thong tin dinh danh cua ban.</div>
                  </div>
                </div>

                {/* Fields */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Ho va ten</label>
                  <input
                    readOnly
                    defaultValue="Nguyen Bao Ho"
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "1px solid #e5e7eb", borderRadius: 10,
                      fontSize: 14, color: "#1a2e1a", background: "white",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 6 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Email</label>
                  <input
                    readOnly
                    defaultValue="baoho.pro@ecoair.vn"
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "1px solid #e5e7eb", borderRadius: 10,
                      fontSize: 14, color: "#6b7280", background: "#f9fafb",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>* Email khong the thay doi sau khi xac minh.</div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>So dien thoai</label>
                  <input
                    readOnly
                    defaultValue="090 123 4567"
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "1px solid #e5e7eb", borderRadius: 10,
                      fontSize: 14, color: "#1a2e1a", background: "white",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                <button style={{
                  width: "100%", padding: "13px",
                  background: "#0d6e4e", color: "white",
                  border: "none", borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: "pointer",
                }}>
                  Luu thay doi
                </button>
              </div>

              {/* Security Card */}
              <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e9ecef" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#1a2e1a" }}>Bao mat</span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Mat khau hien tai</label>
                  <input
                    type="password"
                    defaultValue="12345678"
                    readOnly
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "1px solid #e5e7eb", borderRadius: 10,
                      fontSize: 14, color: "#1a2e1a", background: "white",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Mat khau moi</label>
                  <input
                    type="text"
                    placeholder="Toi thieu 8 ky tu"
                    style={{
                      width: "100%", padding: "11px 14px",
                      border: "1px solid #e5e7eb", borderRadius: 10,
                      fontSize: 14, color: "#9ca3af", background: "white",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                <button style={{
                  width: "100%", padding: "13px",
                  background: "white", color: "#0d6e4e",
                  border: "2px solid #0d6e4e", borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: "pointer",
                }}>
                  Cap nhat mat khau
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Health Profile Card */}
              <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e9ecef", position: "relative" }}>
                {/* PRO FEATURE badge */}
                <div style={{
                  position: "absolute", top: -1, right: -1,
                  background: "#f59e0b", color: "white",
                  borderRadius: "0 16px 0 10px",
                  padding: "6px 14px", fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  PRO FEATURE
                </div>

                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#1a2e1a" }}>Ho so suc khoe y te</span>
                    <span style={{ background: "#0d6e4e", color: "white", borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>VIP</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
                    Du lieu nay giup AI dua ra canh bao tho ca nhan hoa.
                  </p>
                </div>

                {/* Toggle row */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#f0fdf4", borderRadius: 10, padding: "14px 16px", marginBottom: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1a2e1a" }}>Kich hoat Phan tich Y te</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Tu dong dieu chinh khuyen nghi theo the trang</div>
                    </div>
                  </div>
                  {/* Toggle ON */}
                  <div style={{
                    width: 44, height: 24, borderRadius: 99, background: "#0d6e4e",
                    position: "relative", cursor: "pointer", flexShrink: 0,
                  }}>
                    <div style={{
                      position: "absolute", right: 2, top: 2,
                      width: 20, height: 20, borderRadius: "50%", background: "white",
                    }} />
                  </div>
                </div>

                {/* Conditions */}
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 500, marginBottom: 12 }}>Tinh trang can luu y:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {[
                    { label: "Hen suyen", active: true },
                    { label: "Viem xoang", active: false },
                    { label: "Benh tim mach", active: false },
                    { label: "Di ung thoi tiet", active: true },
                    { label: "Nguoi cao tuoi/Tre em", active: false },
                  ].map((item) => (
                    <div key={item.label} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", borderRadius: 99, cursor: "pointer",
                      background: item.active ? "#0d6e4e" : "white",
                      color: item.active ? "white" : "#374151",
                      border: `1.5px solid ${item.active ? "#0d6e4e" : "#e5e7eb"}`,
                      fontSize: 13, fontWeight: item.active ? 600 : 400,
                    }}>
                      {item.label}
                      {item.active && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      )}
                    </div>
                  ))}
                </div>

                <button style={{
                  width: "100%", padding: "14px",
                  background: "#1a2e1a", color: "white",
                  border: "none", borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: "pointer",
                }}>
                  Luu ho so y te
                </button>
              </div>

              {/* Linked Accounts Card */}
              <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e9ecef" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1a2e1a", marginBottom: 20 }}>Tai khoan lien ket</div>

                {/* Zalo */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px", border: "1px solid #e9ecef", borderRadius: 12, marginBottom: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "#0068ff", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "white", fontSize: 12, fontWeight: 800 }}>Z</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a2e1a" }}>Zalo OA</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>Chua ket noi</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0d6e4e", cursor: "pointer" }}>Lien ket ngay</span>
                </div>

                {/* Telegram */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px", border: "1px solid #e9ecef", borderRadius: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "#2aabee", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M21.198 2.433a2.242 2.242 0 00-1.022.215l-16.5 6.498c-1.356.53-1.347 1.276-.247 1.604l4.233 1.321 1.64 5.008c.198.608.974.843 1.482.443l2.363-1.937 4.61 3.4c.85.467 1.464.226 1.678-.787l3.044-14.327c.296-1.183-.45-1.72-1.281-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a2e1a" }}>Telegram Bot</div>
                      <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 500 }}>Da ket noi</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", cursor: "pointer" }}>Huy lien ket</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid #e9ecef", padding: "20px 32px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 8 }}>
            {["VR chung toi", "Dieu khoan", "Quyen rieng tu", "Lien he"].map(item => (
              <span key={item} style={{
                fontSize: 13, color: item === "Dieu khoan" ? "#0d6e4e" : "#6b7280",
                cursor: "pointer",
                textDecoration: item === "Dieu khoan" ? "underline" : "none",
              }}>{item}</span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>© 2024 EcoAir VN. Bao ve la phoi cua ban.</div>
        </footer>
      </div>
    </div>
  );
}
