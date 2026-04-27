import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
    green: "#0d6e4e", greenLight: "#22c55e", greenSoft: "#dcfce7",
    emerald: "#10b981", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
    blueBg: "#eff6ff", blueBorder: "#bfdbfe", blueText: "#1d4ed8",
    amber: "#f59e0b", amberBg: "#fffbeb", amberBorder: "#fde68a", amberText: "#92400e",
    text: "#1a2e1a", textMuted: "#5a6e5a", textLight: "#9ca3af",
    border: "#e5e7eb", bg: "#f8fafc", white: "#ffffff",
    red: "#ef4444", redBg: "#fef2f2", redBorder: "#fecaca",
    telegram: "#0088cc",
};

const STEPS = [
    {
        title: "Bước 1: Kích hoạt Bot cảnh báo",
        content: [
            "Mở ứng dụng Telegram trên điện thoại hoặc máy tính.",
            "Tìm kiếm bot @EcoAirVN_AlertBot.",
            "Nhấn nút Start hoặc gửi lệnh /start để bắt đầu."
        ]
    },
    {
        title: "Bước 2: Lấy thông tin Chat ID",
        content: [
            "Tìm và nhắn tin cho bot @userinfobot trên Telegram.",
            "Bot sẽ trả về thông tin gồm Id – đây chính là Chat ID của bạn.",
            "Sao chép dải số Chat ID này."
        ]
    },
    {
        title: "Bước 3: Lưu và Kiểm tra",
        content: [
            "Dán Chat ID vào ô 'Kết nối Telegram' bên dưới và nhấn Lưu.",
            "Nhấn 'Gửi test' để kiểm tra hệ thống.",
            "Nếu nhận được thông báo trên Telegram, bạn đã cấu hình thành công!"
        ]
    }
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AlertConfigTab() {
    const { accessToken, subscriptionTier } = useAuth();
    const isPro = subscriptionTier?.toLowerCase() === "pro";
    const [loading, setLoading] = useState(isPro);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [expandedStep, setExpandedStep] = useState(null);

    // Data
    const [healthConditions, setHealthConditions] = useState([]);
    const [suggestedThresholds, setSuggestedThresholds] = useState(null);
    const [telegramChatId, setTelegramChatId] = useState("");
    const [telegramConnected, setTelegramConnected] = useState(false);
    const [alertConfigs, setAlertConfigs] = useState([]);
    const [favoriteStations, setFavoriteStations] = useState([]);
    const [history, setHistory] = useState([]);

    // Form for new alert
    const [newStationId, setNewStationId] = useState("");
    const [newThreshold, setNewThreshold] = useState(100);
    const [chatIdInput, setChatIdInput] = useState("");

    const headers = useMemo(() => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    }), [accessToken]);

    const load = useCallback(async () => {
        if (!isPro) return;
        setLoading(true);
        setErr("");
        try {
            const [configRes, historyRes] = await Promise.all([
                fetch("/api/alert-config", { headers }),
                fetch("/api/alert-config/history", { headers }),
            ]);

            // If backend blocked us due to non-pro status
            if (configRes.status === 403) {
                setErr("Tính năng này yêu cầu tài khoản Pro.");
                setLoading(false);
                return;
            }

            const configData = await configRes.json();
            const historyData = await historyRes.json();

            if (configRes.ok) {
                setHealthConditions(configData.healthConditions || []);
                setSuggestedThresholds(configData.suggestedThresholds);
                setTelegramChatId(configData.telegramChatId || "");
                setChatIdInput(configData.telegramChatId || "");
                setTelegramConnected(configData.telegramConnected);
                setAlertConfigs(configData.alertConfigs || []);
                setFavoriteStations(configData.favoriteStations || []);
                if (configData.suggestedThresholds) {
                    setNewThreshold(configData.suggestedThresholds.aqiThreshold);
                }
            }
            if (historyRes.ok) {
                setHistory(Array.isArray(historyData) ? historyData : []);
            }
        } catch {
            setErr("Không thể tải dữ liệu cấu hình cảnh báo.");
        } finally {
            setLoading(false);
        }
    }, [headers, isPro]);

    useEffect(() => { load(); }, [load]);

    // ── Telegram Link ─────────────────────────────────────────────────────────
    async function handleLinkTelegram() {
        if (!chatIdInput.trim()) { setErr("Chat ID không được để trống."); return; }
        setSaving(true); setErr(""); setMsg("");
        try {
            const res = await fetch("/api/alert-config/telegram/link", {
                method: "POST", headers, body: JSON.stringify({ chatId: chatIdInput.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi");
            setTelegramChatId(chatIdInput.trim());
            setTelegramConnected(true);
            setMsg(data.message);
        } catch (e) { setErr(e.message); } finally { setSaving(false); }
    }

    // ── Telegram Test ─────────────────────────────────────────────────────────
    async function handleTestTelegram() {
        setTesting(true); setErr(""); setMsg("");
        try {
            const res = await fetch("/api/alert-config/telegram/test", { method: "POST", headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi");
            setMsg(data.message);
            load();
        } catch (e) { setErr(e.message); } finally { setTesting(false); }
    }

    // ── Create Alert Config ───────────────────────────────────────────────────
    async function handleCreateConfig() {
        if (!newStationId) { setErr("Vui lòng chọn trạm quan trắc."); return; }
        setSaving(true); setErr(""); setMsg("");
        try {
            const res = await fetch("/api/alert-config", {
                method: "POST", headers,
                body: JSON.stringify({ stationId: parseInt(newStationId), aqiThreshold: newThreshold, isActive: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi");
            setMsg(data.message);
            setNewStationId("");
            load();
        } catch (e) { setErr(e.message); } finally { setSaving(false); }
    }

    // ── Delete Alert Config ───────────────────────────────────────────────────
    async function handleDeleteConfig(configId) {
        if (!window.confirm("Bạn chắc chắn muốn xóa cấu hình cảnh báo này?")) return;
        setErr(""); setMsg("");
        try {
            const res = await fetch(`/api/alert-config/${configId}`, { method: "DELETE", headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Lỗi");
            setMsg(data.message);
            load();
        } catch (e) { setErr(e.message); }
    }

    // ── Toggle Active ─────────────────────────────────────────────────────────
    async function handleToggleActive(config) {
        try {
            const res = await fetch("/api/alert-config", {
                method: "POST", headers,
                body: JSON.stringify({ configId: config.configId, stationId: config.stationId, aqiThreshold: config.aqiThreshold, isActive: !config.isActive }),
            });
            if (res.ok) load();
        } catch { /* silent */ }
    }

    if (!isPro) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "80px 20px", background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
                textAlign: "center", minHeight: 400
            }}>
                <div style={{
                    width: 72, height: 72, background: "linear-gradient(135deg, #0d6e4e 0%, #10b981 100%)",
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, marginBottom: 24, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)"
                }}>
                    ⭐
                </div>
                <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 700, color: C.text }}>
                    Tính năng Cảnh báo dành riêng cho gói Pro
                </h2>
                <p style={{ margin: "0 0 32px", fontSize: 15, color: C.textMuted, maxWidth: 480, lineHeight: 1.6 }}>
                    Cấu hình cảnh báo không khí qua Telegram giúp bạn theo dõi các chỉ số ô nhiễm vượt ngưỡng một cách chủ động theo thời gian thực mà không cần mở Website.
                </p>
                <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textMuted, background: C.bg, padding: "8px 16px", borderRadius: 99 }}>
                        <span style={{ color: C.green }}>✓</span> Cảnh báo theo trạm
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textMuted, background: C.bg, padding: "8px 16px", borderRadius: 99 }}>
                        <span style={{ color: C.green }}>✓</span> Thông báo tự động mỗi ngày
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = "/goi"}
                    style={{
                        background: "linear-gradient(135deg, #0d6e4e 0%, #10b981 100%)",
                        color: "white", padding: "12px 28px", borderRadius: 999, border: "none",
                        fontSize: 15, fontWeight: 600, cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
                    }}
                >
                    Nâng cấp Pro ngay
                </button>
            </div>
        );
    }

    if (loading) {
        return <div style={{ color: C.textMuted, fontSize: 14, padding: 40, textAlign: "center" }}>Đang tải cấu hình cảnh báo...</div>;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ── Header Banner ──────────────────────────────────────────── */}
            <div style={{
                background: "linear-gradient(135deg, #0d6e4e 0%, #10b981 50%, #34d399 100%)",
                borderRadius: 16, color: "white", padding: "20px 22px",
                display: "flex", alignItems: "center", gap: 16,
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>🔔</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Cấu hình Cảnh báo Chất lượng Không khí</div>
                    <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 2 }}>
                        Nhận cảnh báo qua Telegram khi AQI vượt ngưỡng an toàn — cá nhân hóa theo hồ sơ sức khỏe của bạn.
                    </div>
                </div>
                {telegramConnected && (
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "rgba(255,255,255,0.2)", borderRadius: 999,
                        padding: "6px 14px", fontSize: 12, fontWeight: 600,
                    }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
                        Telegram đã kết nối
                    </div>
                )}
            </div>

            {/* ── Status Message ──────────────────────────────────────────── */}
            {(err || msg) && (
                <div style={{
                    padding: "10px 14px", borderRadius: 10,
                    border: `1px solid ${err ? C.redBorder : C.greenBorder}`,
                    background: err ? C.redBg : C.greenBg,
                    color: err ? C.red : C.green, fontSize: 13,
                }}>
                    {err || msg}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* ── Telegram Setup Guide ───────────────────────────── */}
                    <Card title="📱 Hướng dẫn cấu hình Telegram Bot" subtitle="Làm theo 4 bước để nhận cảnh báo qua Telegram">
                        {STEPS.map((step, i) => (
                            <div key={i} style={{ borderBottom: i < STEPS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                                <div
                                    onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "10px 0", cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.text,
                                    }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{
                                            width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                                            background: expandedStep === i ? C.green : C.bg, color: expandedStep === i ? "white" : C.textMuted,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>{i + 1}</span>
                                        {step.title}
                                    </span>
                                    <span style={{ color: C.textLight, fontSize: 16, transition: "transform 0.2s", transform: expandedStep === i ? "rotate(180deg)" : "none" }}>▾</span>
                                </div>
                                {expandedStep === i && (
                                    <div style={{ padding: "0 0 12px 32px" }}>
                                        <ol style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: C.textMuted, lineHeight: 1.8 }}>
                                            {step.content.map((line, j) => <li key={j}>{line}</li>)}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        ))}
                    </Card>

                    {/* ── Telegram Connect ────────────────────────────────── */}
                    <Card title="🔗 Kết nối Telegram" subtitle="Nhập Chat ID để nhận cảnh báo">
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                            <input
                                value={chatIdInput}
                                onChange={(e) => setChatIdInput(e.target.value)}
                                placeholder="Nhập Telegram Chat ID (ví dụ: 123456789)"
                                style={{
                                    flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
                                    padding: "9px 11px", fontSize: 13, outline: "none",
                                }}
                            />
                            <button onClick={handleLinkTelegram} disabled={saving} style={btnStyle(C.telegram, saving)}>
                                {saving ? "Đang lưu..." : "💾 Lưu"}
                            </button>
                        </div>
                        {telegramConnected && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8,
                                    background: C.greenBg, border: `1px solid ${C.greenBorder}`,
                                    fontSize: 12, color: C.green,
                                }}>
                                    ✅ Đã kết nối Chat ID: <b>{telegramChatId}</b>
                                </div>
                                <button onClick={handleTestTelegram} disabled={testing} style={btnStyle(C.emerald, testing)}>
                                    {testing ? "Đang gửi..." : "📨 Gửi test"}
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* ── Notification History ────────────────────────────── */}
                    <Card title="📜 Lịch sử thông báo gần đây" subtitle="10 cảnh báo mới nhất">
                        {history.length === 0 ? (
                            <div style={{ fontSize: 13, color: C.textLight, textAlign: "center", padding: 18 }}>
                                Chưa có thông báo nào.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {history.map((h) => (
                                    <div key={h.notificationId} style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "8px 10px", borderRadius: 8, background: C.bg,
                                    }}>
                                        <span style={{
                                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                                            background: h.status === "sent" ? C.greenLight : C.red,
                                        }} />
                                        <div style={{ flex: 1, fontSize: 12.5, color: C.text }}>{h.messageContent}</div>
                                        <div style={{ fontSize: 11, color: C.textLight, whiteSpace: "nowrap" }}>
                                            {new Date(h.sentAt + (!h.sentAt.endsWith("Z") ? "Z" : "")).toLocaleString("vi-VN")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* ── Personalized Thresholds ─────────────────────────── */}
                    <Card title="🎯 Gợi ý ngưỡng cảnh báo cá nhân hóa" subtitle="Dựa trên hồ sơ sức khỏe của bạn">
                        {/* Health conditions */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Tình trạng sức khỏe đang chọn:</div>
                            {healthConditions.length === 0 ? (
                                <div style={{
                                    padding: "10px 12px", borderRadius: 8,
                                    background: C.amberBg, border: `1px solid ${C.amberBorder}`,
                                    fontSize: 12, color: C.amberText,
                                }}>
                                    ⚠️ Bạn chưa chọn hồ sơ sức khỏe. Vào tab <b>"Hồ sơ & Sức khoẻ"</b> để cập nhật.
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {healthConditions.map((c) => (
                                        <span key={c} style={{
                                            padding: "5px 10px", borderRadius: 999, fontSize: 12,
                                            background: C.blueBg, border: `1px solid ${C.blueBorder}`, color: C.blueText,
                                        }}>{c}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Suggested threshold */}
                        {suggestedThresholds && (
                            <div style={{
                                padding: "14px 16px", borderRadius: 12,
                                background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                                border: `1px solid ${C.greenBorder}`,
                            }}>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 28, fontWeight: 800, color: C.green }}>{suggestedThresholds.aqiThreshold}</span>
                                    <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>AQI</span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                                    {suggestedThresholds.label}
                                </div>
                                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                                    {suggestedThresholds.description}
                                </div>
                                <button
                                    onClick={() => setNewThreshold(suggestedThresholds.aqiThreshold)}
                                    style={{
                                        marginTop: 10, padding: "7px 14px", border: `1px solid ${C.greenBorder}`,
                                        borderRadius: 8, background: C.white, color: C.green,
                                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    }}
                                >
                                    ✓ Áp dụng ngưỡng gợi ý
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* ── Alert Rules CRUD ─────────────────────────────────── */}
                    <Card title="⚙️ Quy tắc cảnh báo" subtitle="Thêm hoặc quản lý quy tắc theo trạm giám sát">
                        {/* Add form */}
                        <div style={{
                            padding: "12px 14px", borderRadius: 10,
                            background: C.bg, border: `1px solid ${C.border}`, marginBottom: 12,
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>Thêm quy tắc mới</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 3 }}>Trạm quan trắc</label>
                                    <select
                                        value={newStationId}
                                        onChange={(e) => setNewStationId(e.target.value)}
                                        style={{
                                            width: "100%", border: `1px solid ${C.border}`,
                                            borderRadius: 8, padding: "8px 10px", fontSize: 12.5,
                                            background: C.white, color: C.text,
                                        }}
                                    >
                                        <option value="">Chọn trạm...</option>
                                        {favoriteStations.map((s) => (
                                            <option key={s.stationId} value={s.stationId}>
                                                {s.stationName} ({s.city})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 11, color: C.textMuted, display: "block", marginBottom: 3 }}>Ngưỡng AQI</label>
                                    <input
                                        type="number" min={0} max={500}
                                        value={newThreshold}
                                        onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                                        style={{
                                            width: "100%", border: `1px solid ${C.border}`,
                                            borderRadius: 8, padding: "8px 10px", fontSize: 12.5,
                                        }}
                                    />
                                </div>
                                <button onClick={handleCreateConfig} disabled={saving} style={btnStyle(C.green, saving)}>
                                    + Thêm
                                </button>
                            </div>
                            {favoriteStations.length === 0 && (
                                <div style={{ marginTop: 8, fontSize: 11.5, color: C.amberText }}>
                                    💡 Thêm trạm yêu thích ở tab "Địa điểm" để chọn ở đây.
                                </div>
                            )}
                        </div>

                        {/* Existing rules */}
                        {alertConfigs.length === 0 ? (
                            <div style={{ fontSize: 13, color: C.textLight, textAlign: "center", padding: 16 }}>
                                Chưa có quy tắc cảnh báo nào. Thêm quy tắc đầu tiên ở trên.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {alertConfigs.map((c) => (
                                    <div key={c.configId} style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 12px", borderRadius: 10,
                                        border: `1px solid ${c.isActive ? C.greenBorder : C.border}`,
                                        background: c.isActive ? C.greenBg : C.bg,
                                    }}>
                                        {/* Toggle */}
                                        <div
                                            onClick={() => handleToggleActive(c)}
                                            style={{
                                                width: 36, height: 20, borderRadius: 99, cursor: "pointer",
                                                background: c.isActive ? C.greenLight : C.textLight,
                                                position: "relative", transition: "background 0.2s", flexShrink: 0,
                                            }}
                                        >
                                            <div style={{
                                                width: 16, height: 16, borderRadius: "50%", background: "white",
                                                position: "absolute", top: 2,
                                                left: c.isActive ? 18 : 2, transition: "left 0.2s",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                            }} />
                                        </div>
                                        {/* Info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.stationName}</div>
                                            <div style={{ fontSize: 11.5, color: C.textMuted }}>{c.stationCity}</div>
                                        </div>
                                        {/* Threshold badge */}
                                        <div style={{
                                            padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                                            background: getAqiColor(c.aqiThreshold).bg,
                                            color: getAqiColor(c.aqiThreshold).text,
                                            border: `1px solid ${getAqiColor(c.aqiThreshold).border}`,
                                        }}>
                                            AQI ≥ {c.aqiThreshold}
                                        </div>
                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDeleteConfig(c.configId)}
                                            style={{
                                                border: "none", background: "transparent",
                                                color: C.textLight, cursor: "pointer", fontSize: 16,
                                                padding: "4px 6px", borderRadius: 6,
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = C.red)}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = C.textLight)}
                                            title="Xóa quy tắc"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function Card({ title, subtitle, children }) {
    return (
        <div style={{
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: 18,
            boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
        }}>
            <h3 style={{ margin: "0 0 2px", fontSize: 14, color: C.text }}>{title}</h3>
            {subtitle && <p style={{ margin: "0 0 14px", color: C.textLight, fontSize: 12 }}>{subtitle}</p>}
            {children}
        </div>
    );
}

function btnStyle(bg, disabled) {
    return {
        border: "none", borderRadius: 8, padding: "9px 16px",
        background: bg, color: "white",
        fontSize: 12.5, fontWeight: 600, cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1, whiteSpace: "nowrap",
    };
}

function getAqiColor(aqi) {
    if (aqi <= 50) return { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" };
    if (aqi <= 100) return { bg: "#fffbeb", text: "#92400e", border: "#fde68a" };
    if (aqi <= 150) return { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" };
    return { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" };
}
