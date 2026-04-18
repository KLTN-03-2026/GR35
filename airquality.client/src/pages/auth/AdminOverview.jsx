const D = {
    bg: "#0f1923",
    sidebar: "#0b1219",
    card: "#14202e",
    cardBorder: "#1e3048",
    headerBg: "#111c28",
    text: "#e8edf3",
    textMuted: "#7a8da0",
    textDim: "#4a5d70",
    green: "#22c55e",
    greenDark: "#15803d",
    greenBg: "rgba(34,197,94,0.12)",
    blue: "#3b82f6",
    blueBg: "rgba(59,130,246,0.12)",
    orange: "#f97316",
    orangeBg: "rgba(249,115,22,0.12)",
    red: "#ef4444",
    redBg: "rgba(239,68,68,0.12)",
    yellow: "#eab308",
    purple: "#a855f7",
};

function Icon({ d, size = 18, stroke = D.textMuted, fill = "none", sw = 1.8 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
        </svg>
    );
}

function StatCard({ icon, iconBg, label, value, sub, badge, badgeColor, badgeBg, progress, progressColor, actionText, actionColor }) {
    return (
        <div style={{
            flex: 1, background: D.card, border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, padding: "20px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10, background: iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>{icon}</div>
                {badge && (
                    <span style={{
                        padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                        background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}33`,
                    }}>{badge}</span>
                )}
            </div>
            <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: D.text, lineHeight: 1 }}>{value}</span>
                {sub && <span style={{ fontSize: 13, color: D.textMuted }}>{sub}</span>}
            </div>
            {progress !== undefined && (
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginTop: 12, overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: progressColor || D.green, borderRadius: 99 }} />
                </div>
            )}
            {actionText && (
                <div style={{ marginTop: 10, fontSize: 12, color: actionColor || D.orange, fontWeight: 500, cursor: "pointer" }}>
                    {actionText} →
                </div>
            )}
        </div>
    );
}

function SystemLogs() {
    const logs = [
        { time: "2024-05-24 10:15:22", text: "Initializing OpenAQ v3 synchronization...", type: "info" },
        { text: "INFO: Connected to API endpoint: api.openaq.org/v3/measurements", type: "info" },
        { text: "SUCCESS: Received 1,420 new records from Hanoi_US_Embassy", type: "success" },
        { text: "SUCCESS: Received 800 new records from HCM_US_Consulate", type: "success" },
        { time: "2024-05-24 10:15:30", text: "Processing spatial interpolation...", type: "info" },
        { text: "WARN: Station ID #99283 (Da Nang) reporting latency > 500ms", type: "warn" },
        { text: "INFO: Triggering AI model retraining cycle (RMSE: 4.2)", type: "info" },
        { text: ">> Running background garbage collection...", type: "dim" },
        { text: "SUCCESS: Cache invalidated for 12,400 keys.", type: "success" },
        { time: "2024-05-24 10:15:45", text: "Sync process completed in 23.4s", type: "info" },
    ];
    const colors = { info: D.textMuted, success: D.green, warn: D.yellow, dim: D.textDim };

    return (
        <div style={{
            background: "#0d1520", border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column",
        }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                borderBottom: `1px solid ${D.cardBorder}`, background: "#111b27",
            }}>
                <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308" }} />
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
                </div>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: D.textDim, fontWeight: 500 }}>SYSTEM LOGS</span>
                <span style={{ fontSize: 11, color: D.green, fontWeight: 600, marginLeft: 12 }}>OPENAQ SYNC</span>
            </div>
            <div style={{
                flex: 1, padding: "14px 16px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
                fontSize: 11.5, lineHeight: 1.8, overflowY: "auto", color: D.textMuted,
            }}>
                {logs.map((log, i) => (
                    <div key={i}>
                        {log.time && <span style={{ color: D.textDim }}>[{log.time}] </span>}
                        <span style={{ color: colors[log.type] || D.textMuted }}>
                            {log.type === "success" && <strong style={{ color: D.green }}>SUCCESS: </strong>}
                            {log.type === "warn" && <strong style={{ color: D.yellow }}>WARN: </strong>}
                            {log.text.replace(/^(SUCCESS|WARN|INFO): /, log.type === "success" || log.type === "warn" ? "" : "$1: ")}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VietnamMap() {
    const stationDots = [
        { top: "18%", left: "55%", online: true },
        { top: "22%", left: "60%", online: true },
        { top: "28%", left: "52%", online: true },
        { top: "35%", left: "48%", online: true },
        { top: "42%", left: "55%", online: true },
        { top: "55%", left: "50%", online: false },
        { top: "65%", left: "52%", online: true },
        { top: "75%", left: "48%", online: true },
        { top: "80%", left: "53%", online: true },
        { top: "85%", left: "45%", online: true },
    ];

    return (
        <div style={{
            background: D.card, border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, overflow: "hidden", position: "relative",
            height: "100%", minHeight: 350,
        }}>
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, #0b1a2a 0%, #0f2438 50%, #0b1a2a 100%)",
                opacity: 0.7,
            }} />
            {stationDots.map((s, i) => (
                <div key={i} style={{
                    position: "absolute", top: s.top, left: s.left,
                    width: 10, height: 10, borderRadius: "50%",
                    background: s.online ? D.green : D.red,
                    boxShadow: `0 0 8px ${s.online ? D.green : D.red}`,
                    zIndex: 2,
                }} />
            ))}
            <div style={{
                position: "absolute", top: 16, left: 16, zIndex: 3,
                background: "rgba(11,18,25,0.9)", border: `1px solid ${D.cardBorder}`,
                borderRadius: 10, padding: "10px 16px",
            }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: D.text, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Trạng thái trạm quốc gia
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: D.green }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: D.green, display: "inline-block" }} />
                        Online (54)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: D.red }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: D.red, display: "inline-block" }} />
                        Offline (6)
                    </div>
                </div>
            </div>
            <svg viewBox="0 0 200 500" style={{ width: "60%", height: "100%", position: "absolute", top: 0, left: "20%", opacity: 0.25 }}>
                <path d="M100 20 C110 40 120 60 115 80 C110 100 105 120 108 140 C111 160 100 180 95 200 C90 220 88 240 92 260 C96 280 90 300 85 320 C80 340 85 360 90 380 C95 400 88 420 80 440 C85 450 95 455 100 460 C105 450 110 440 105 420 C115 400 120 380 118 360 C116 340 120 320 125 300 C130 280 125 260 120 240"
                    fill="none" stroke={D.green} strokeWidth="2" />
            </svg>
        </div>
    );
}

function CommunityReports() {
    const reports = [
        {
            name: "Nguyễn Huy", id: "4492", initials: "NH", color: "#6366f1",
            lat: "21.0285", lng: "105.8542", area: "Hoàn Kiếm, Hà Nội", time: "10:45 AM",
        },
        {
            name: "Trần Lan", id: "8821", initials: "TL", color: "#ec4899",
            lat: "10.8231", lng: "106.6297", area: "Quận 12, TP. HCM", time: "09:30 AM",
        },
    ];

    return (
        <div style={{
            background: D.card, border: `1px solid ${D.cardBorder}`,
            borderRadius: 14, padding: "22px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: D.text }}>Báo cáo Cộng đồng chờ duyệt</div>
                    <div style={{ fontSize: 12, color: D.textMuted, marginTop: 3 }}>Xem xét và xác thực hình ảnh ô nhiễm từ người dùng</div>
                </div>
                <button style={{
                    padding: "8px 16px", background: "transparent", border: `1px solid ${D.cardBorder}`,
                    borderRadius: 8, color: D.textMuted, fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}>Xem tất cả lịch sử</button>
            </div>
            <div style={{
                display: "grid", gridTemplateColumns: "1.5fr 1fr 2fr 1fr 1.5fr",
                padding: "10px 16px", borderBottom: `1px solid ${D.cardBorder}`,
                fontSize: 11, fontWeight: 600, color: D.textDim, textTransform: "uppercase", letterSpacing: 0.5,
            }}>
                <span>Người gửi</span>
                <span>Hình ảnh</span>
                <span>Tọa độ</span>
                <span>Thời gian</span>
                <span style={{ textAlign: "right" }}>Hành động</span>
            </div>
            {reports.map((r) => (
                <div key={r.id} style={{
                    display: "grid", gridTemplateColumns: "1.5fr 1fr 2fr 1fr 1.5fr",
                    padding: "14px 16px", borderBottom: `1px solid ${D.cardBorder}`,
                    alignItems: "center", fontSize: 13,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 8, background: r.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "white",
                        }}>{r.initials}</div>
                        <div>
                            <div style={{ fontWeight: 600, color: D.text }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: D.textDim }}>ID: {r.id}</div>
                        </div>
                    </div>
                    <div>
                        <div style={{
                            width: 52, height: 36, borderRadius: 6,
                            background: "linear-gradient(135deg,#1a3050,#2a4a70)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Icon d={["M4 16l4.586-4.586a2 2 0 012.828 0L16 16", "M14 14l1.586-1.586a2 2 0 012.828 0L20 14", "M14 8h.01", "M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"]} size={14} stroke={D.textDim} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: D.text }}>
                            {r.lat}° N, {r.lng}° E
                        </div>
                        <div style={{ fontSize: 11, color: D.textDim }}>{r.area}</div>
                    </div>
                    <div style={{ color: D.textMuted, fontSize: 12 }}>{r.time}</div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button style={{
                            padding: "6px 14px", background: D.redBg, color: D.red,
                            border: `1px solid ${D.red}33`, borderRadius: 6,
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>Từ chối</button>
                        <button style={{
                            padding: "6px 14px", background: D.green, color: "white",
                            border: "none", borderRadius: 6,
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>Duyệt</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminOverview() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 16 }}>
                <StatCard
                    icon={<Icon d={["M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0"]} stroke={D.blue} size={20} />}
                    iconBg={D.blueBg} label="TRẠM HOẠT ĐỘNG" value="54" sub="/60 Online"
                    badge="LIVE" badgeColor={D.green} badgeBg={D.greenBg}
                    progress={90} progressColor={D.green}
                />
                <StatCard
                    icon={<Icon d={["M9.75 17L9 20l-1 1h8l-1-1-.75-3", "M3 13h18", "M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"]} stroke={D.blue} size={20} />}
                    iconBg={D.blueBg} label="RMSE MÔ HÌNH AI" value="4.2" sub="↓ 0.3%"
                    badge="v2.1Stable" badgeColor={D.green} badgeBg={D.greenBg}
                />
                <StatCard
                    icon={<Icon d={["M13 10V3L4 14h7v7l9-11h-7z"]} stroke={D.blue} size={20} />}
                    iconBg={D.blueBg} label="API CALL USAGE" value="8,450" sub="/ 10k"
                    badge="LIMIT" badgeColor={D.yellow} badgeBg="rgba(234,179,8,0.12)"
                    progress={84.5} progressColor={D.blue}
                />
                <StatCard
                    icon={<Icon d={["M3 8l7.89 5.26a2 2 0 002.22 0L21 8", "M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"]} stroke={D.red} size={20} />}
                    iconBg={D.redBg} label="BÁO CÁO CHỜ DUYỆT" value="12" sub="Pending"
                    actionText="Xử lý ngay" actionColor={D.orange}
                />
            </div>
            <div style={{ display: "flex", gap: 16, minHeight: 360 }}>
                <div style={{ flex: 1.2 }}>
                    <VietnamMap />
                </div>
                <div style={{ flex: 1 }}>
                    <SystemLogs />
                </div>
            </div>
            <CommunityReports />
        </div>
    );
}
