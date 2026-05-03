import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";

/* ── Design Tokens (shared dark theme) ─────────────────────────────── */
const D = {
    bg: "#0f1923", card: "#14202e", cardBorder: "#1e3048",
    text: "#e8edf3", textMuted: "#7a8da0", textDim: "#4a5d70",
    green: "#22c55e", greenBg: "rgba(34,197,94,0.12)",
    blue: "#3b82f6", blueBg: "rgba(59,130,246,0.12)",
    orange: "#f97316", orangeBg: "rgba(249,115,22,0.12)",
    red: "#ef4444", redBg: "rgba(239,68,68,0.12)",
    yellow: "#eab308", purple: "#a855f7",
    font: "'Be Vietnam Pro','Segoe UI',sans-serif",
};

function Icon({ d, size = 18, stroke = D.textMuted, fill = "none", sw = 1.8 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
            {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
        </svg>
    );
}

/* ── Status Badge ──────────────────────────────────────────────────── */
function StatusBadge({ status }) {
    const map = {
        Running: { bg: D.blueBg, color: D.blue, label: "Đang chạy", pulse: true },
        Success: { bg: D.greenBg, color: D.green, label: "Thành công" },
        Failed: { bg: D.redBg, color: D.red, label: "Lỗi" },
        Idle: { bg: "rgba(122,141,160,0.12)", color: D.textMuted, label: "Chờ" },
    };
    const s = map[status] || map.Idle;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: s.bg, color: s.color, fontSize: 12, fontWeight: 600,
            padding: "4px 12px", borderRadius: 99,
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: "50%", background: s.color,
                animation: s.pulse ? "pulse 1.5s infinite" : "none",
            }} />
            {s.label}
        </span>
    );
}

/* ── KPI Card ──────────────────────────────────────────────────────── */
function KpiCard({ icon, iconBg, label, value, sub }) {
    return (
        <div style={{
            background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 12,
            padding: "20px 22px", flex: "1 1 180px", minWidth: 170,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, background: iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>{icon}</div>
                <span style={{ fontSize: 12, color: D.textMuted, fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: D.text }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: D.textDim, marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

/* ── Helpers ───────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
    if (!dateStr) return "—";
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return `${Math.round(diff)}s trước`;
    if (diff < 3600) return `${Math.round(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.round(diff / 3600)} giờ trước`;
    return `${Math.round(diff / 86400)} ngày trước`;
}

function formatMs(ms) {
    if (!ms || ms <= 0) return "—";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)} phút`;
}

function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* ── Main Component ────────────────────────────────────────────────── */
export default function AdminSystemLogs() {
    const { accessToken } = useAuth();
    const [data, setData] = useState(null);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorFilter, setErrorFilter] = useState("");
    const [expandedError, setExpandedError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchData = useCallback(async () => {
        if (!accessToken) return;
        try {
            const headers = { Authorization: `Bearer ${accessToken}` };

            const [jobsRes, errorsRes] = await Promise.all([
                fetch("/api/admin/system-logs/jobs", { headers }),
                fetch(`/api/admin/system-logs/errors?count=50${errorFilter ? `&job=${errorFilter}` : ""}`, { headers }),
            ]);

            if (jobsRes.ok) {
                const j = await jobsRes.json();
                setData(j);
            }
            if (errorsRes.ok) {
                const e = await errorsRes.json();
                setErrors(e.errors || e.Errors || []);
            }
        } catch (err) {
            console.error("Failed to load system logs:", err);
        } finally {
            setLoading(false);
        }
    }, [accessToken, errorFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh every 30s
    useEffect(() => {
        if (!autoRefresh) return;
        const id = setInterval(fetchData, 30000);
        return () => clearInterval(id);
    }, [autoRefresh, fetchData]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400, fontFamily: D.font }}>
                <div style={{ textAlign: "center", color: D.textMuted }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                    <div>Đang tải dữ liệu hệ thống...</div>
                </div>
            </div>
        );
    }

    const summary = data?.summary || data?.Summary || {};
    const jobs = data?.jobs || data?.Jobs || [];

    return (
        <div style={{ fontFamily: D.font, color: D.text }}>
            {/* Pulse animation */}
            <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>

            {/* ── Header ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
                        <Icon d={["M8 9l3 3-3 3", "M13 12h3", "M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"]} size={22} stroke={D.green} />{" "}
                        Hệ thống & Logs
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: D.textMuted }}>
                        Giám sát Background Services, lịch chạy, trạng thái và lỗi Exception
                    </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: D.textMuted, cursor: "pointer" }}>
                        <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)}
                            style={{ accentColor: D.green }} />
                        Tự động làm mới (30s)
                    </label>
                    <button onClick={fetchData} style={{
                        background: D.greenBg, color: D.green, border: `1px solid rgba(34,197,94,0.3)`,
                        borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 6,
                    }}>
                        <Icon d={["M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"]} size={14} stroke={D.green} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
                <KpiCard
                    icon={<Icon d={["M4 6h16", "M4 10h16", "M4 14h16", "M4 18h16"]} stroke={D.blue} />}
                    iconBg={D.blueBg} label="Tổng Background Jobs" value={summary.totalJobs || 0}
                    sub="Số services đã đăng ký"
                />
                <KpiCard
                    icon={<Icon d={["M13 10V3L4 14h7v7l9-11h-7z"]} stroke={D.green} />}
                    iconBg={D.greenBg} label="Đang chạy" value={summary.running || 0}
                    sub="Jobs đang xử lý"
                />
                <KpiCard
                    icon={<Icon d={["M9 12l2 2 4-4"]} stroke={D.green} />}
                    iconBg={D.greenBg} label="Thành công" value={summary.success || 0}
                    sub="Lần chạy cuối thành công"
                />
                <KpiCard
                    icon={<Icon d={["M12 9v2m0 4h.01", "M10.29 3.86l1.71-1.71 1.71 1.71", "M2 12a10 10 0 1020 0 10 10 0 00-20 0z"]} stroke={D.red} />}
                    iconBg={D.redBg} label="Thất bại" value={summary.failed || 0}
                    sub="Lần chạy cuối lỗi"
                />
                <KpiCard
                    icon={<Icon d={["M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"]} stroke={D.purple} />}
                    iconBg="rgba(168,85,247,0.12)" label="Tổng bản ghi xử lý" value={(summary.totalRecords || 0).toLocaleString()}
                    sub="Từ khi khởi động server"
                />
            </div>

            {/* ── Job Status Table ─────────────────────────────────────── */}
            <div style={{
                background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14,
                padding: "20px 0", marginBottom: 28, overflow: "hidden",
            }}>
                <div style={{ padding: "0 22px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon d={["M5 12h14", "M12 5l7 7-7 7"]} stroke={D.green} size={20} />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Trạng thái Background Services</h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${D.cardBorder}` }}>
                                {["Service", "Mô tả", "Tần suất", "Trạng thái", "Lần chạy cuối", "Thời lượng", "Bản ghi", "Thành công/Lỗi", "Lỗi gần nhất"].map(h => (
                                    <th key={h} style={{
                                        padding: "12px 14px", textAlign: "left",
                                        color: D.textMuted, fontWeight: 600, fontSize: 11.5,
                                        textTransform: "uppercase", letterSpacing: 0.5,
                                        whiteSpace: "nowrap", background: "rgba(0,0,0,0.15)",
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: 40, textAlign: "center", color: D.textDim }}>
                                        Chưa có service nào đăng ký. Các background services sẽ tự đăng ký khi khởi động.
                                    </td>
                                </tr>
                            ) : jobs.map((job, i) => (
                                <tr key={job.jobName} style={{
                                    borderBottom: i < jobs.length - 1 ? `1px solid ${D.cardBorder}` : "none",
                                    transition: "background 0.15s",
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "14px", fontWeight: 700, color: D.text, whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{
                                                width: 8, height: 8, borderRadius: "50%",
                                                background: job.status === "Running" ? D.blue : job.status === "Success" ? D.green : job.status === "Failed" ? D.red : D.textDim,
                                            }} />
                                            {job.jobName.replace("Service", "")}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px", color: D.textMuted, fontSize: 12, maxWidth: 250 }}>{job.description}</td>
                                    <td style={{ padding: "14px", color: D.textMuted, whiteSpace: "nowrap" }}>
                                        <span style={{ background: "rgba(59,130,246,0.1)", color: D.blue, padding: "2px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>
                                            ⏱ {job.interval}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px" }}><StatusBadge status={job.status} /></td>
                                    <td style={{ padding: "14px", color: D.textMuted, whiteSpace: "nowrap", fontSize: 12 }}>
                                        {job.lastRunAt ? (
                                            <span title={formatDateTime(job.lastRunAt)}>{timeAgo(job.lastRunAt)}</span>
                                        ) : "Chưa chạy"}
                                    </td>
                                    <td style={{ padding: "14px", color: D.text, whiteSpace: "nowrap", fontWeight: 600 }}>
                                        {formatMs(job.lastDurationMs)}
                                    </td>
                                    <td style={{ padding: "14px", color: D.text, fontWeight: 700 }}>
                                        {job.recordsProcessed.toLocaleString()}
                                    </td>
                                    <td style={{ padding: "14px", whiteSpace: "nowrap" }}>
                                        <span style={{ color: D.green, fontWeight: 700 }}>{job.successCount}</span>
                                        <span style={{ color: D.textDim, margin: "0 4px" }}>/</span>
                                        <span style={{ color: job.errorCount > 0 ? D.red : D.textDim, fontWeight: 700 }}>{job.errorCount}</span>
                                    </td>
                                    <td style={{ padding: "14px", color: D.red, fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {job.lastError || <span style={{ color: D.textDim }}>—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Error Logs Section ───────────────────────────────────── */}
            <div style={{
                background: D.card, border: `1px solid ${D.cardBorder}`, borderRadius: 14,
                padding: 22, marginBottom: 28,
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Icon d={["M12 9v2m0 4h.01", "M10.29 3.86l1.71-1.71 1.71 1.71", "M2 12a10 10 0 1020 0 10 10 0 00-20 0z"]} stroke={D.red} size={20} />
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Exception Logs</h3>
                        <span style={{
                            background: D.redBg, color: D.red, fontSize: 11, fontWeight: 700,
                            padding: "2px 10px", borderRadius: 99,
                        }}>{errors.length}</span>
                    </div>
                    <select
                        value={errorFilter}
                        onChange={e => setErrorFilter(e.target.value)}
                        style={{
                            background: D.bg, color: D.text, border: `1px solid ${D.cardBorder}`,
                            borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer", outline: "none",
                        }}
                    >
                        <option value="">Tất cả services</option>
                        {jobs.map(j => <option key={j.jobName} value={j.jobName}>{j.jobName}</option>)}
                    </select>
                </div>

                {errors.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: D.textDim }}>
                        <div style={{ fontSize: 38, marginBottom: 8 }}>✅</div>
                        <div style={{ fontSize: 14 }}>Không có lỗi nào được ghi nhận</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Tất cả background services đang hoạt động bình thường</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {errors.map((err, idx) => {
                            const isExpanded = expandedError === idx;
                            return (
                                <div key={idx} style={{
                                    background: D.bg, border: `1px solid ${D.cardBorder}`, borderRadius: 10,
                                    overflow: "hidden", transition: "border 0.15s",
                                    borderColor: isExpanded ? "rgba(239,68,68,0.4)" : D.cardBorder,
                                }}>
                                    <div
                                        onClick={() => setExpandedError(isExpanded ? null : idx)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span style={{
                                            background: D.redBg, color: D.red, fontSize: 10, fontWeight: 700,
                                            padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap",
                                        }}>
                                            {err.exceptionType || "Exception"}
                                        </span>
                                        <span style={{
                                            background: D.blueBg, color: D.blue, fontSize: 10, fontWeight: 600,
                                            padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap",
                                        }}>
                                            {err.jobName?.replace("Service", "")}
                                        </span>
                                        <span style={{ flex: 1, fontSize: 12.5, color: D.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {err.message}
                                        </span>
                                        <span style={{ fontSize: 11, color: D.textDim, whiteSpace: "nowrap" }}>
                                            {formatDateTime(err.timestamp)}
                                        </span>
                                        <span style={{ color: D.textDim, fontSize: 16, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▼</span>
                                    </div>
                                    {isExpanded && err.stackTrace && (
                                        <div style={{
                                            padding: "12px 16px", borderTop: `1px solid ${D.cardBorder}`,
                                            background: "rgba(0,0,0,0.2)",
                                        }}>
                                            <div style={{ fontSize: 11, color: D.textDim, marginBottom: 6, fontWeight: 600 }}>Stack Trace:</div>
                                            <pre style={{
                                                margin: 0, fontSize: 11, color: D.textMuted,
                                                whiteSpace: "pre-wrap", wordBreak: "break-all",
                                                lineHeight: 1.6, fontFamily: "'JetBrains Mono','Cascadia Code',monospace",
                                            }}>{err.stackTrace}</pre>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Info Banner ──────────────────────────────────────────── */}
            <div style={{
                background: D.blueBg, border: `1px solid rgba(59,130,246,0.2)`,
                borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10,
                fontSize: 12.5, color: D.blue,
            }}>
                <Icon d={["M13 16h-1v-4h-1m1-4h.01", "M21 12a9 9 0 11-18 0 9 9 0 0118 0z"]} stroke={D.blue} size={18} />
                <span>
                    Dữ liệu giám sát được lưu tạm trong bộ nhớ (in-memory). Khi server khởi động lại, lịch sử sẽ bị reset.
                    Các background services sẽ tự đăng ký khi được kích hoạt trong <code style={{ background: "rgba(0,0,0,0.2)", padding: "1px 5px", borderRadius: 4 }}>Program.cs</code>.
                </span>
            </div>
        </div>
    );
}
