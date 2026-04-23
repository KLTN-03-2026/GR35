import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const C = {
    green: "#0d6e4e",
    greenLight: "#22c55e",
    greenBg: "#f0fdf4",
    greenBorder: "#bbf7d0",
    text: "#1a2e1a",
    textMuted: "#5a6e5a",
    textLight: "#9ca3af",
    border: "#e5e7eb",
    white: "#ffffff",
    red: "#ef4444",
    blue: "#2f80ed",
    blueSoft: "#eff6ff",
    shadow: "0 8px 20px rgba(15,23,42,0.08)",
};

function maskApiKey(value) {
    if (!value) return "";
    if (value.length <= 12) return "••••••";
    return `${value.slice(0, 8)}••••••••••${value.slice(-6)}`;
}

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export default function DeveloperApiTab() {
    const navigate = useNavigate();
    const { accessToken, subscriptionTier } = useAuth();

    const [projectName, setProjectName] = useState("");
    const [expireDays, setExpireDays] = useState(90);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [apiKeys, setApiKeys] = useState([]);
    const [openActionId, setOpenActionId] = useState(null);

    const planName = useMemo(() => {
        const normalized = (subscriptionTier || "Free").trim();
        if (!normalized) return "Free";
        return normalized;
    }, [subscriptionTier]);

    const callsPerMonth = planName.toLowerCase() === "pro" ? 3000000 : 10000;

    useEffect(() => {
        async function fetchKeys() {
            setLoading(true);
            try {
                const res = await fetch("/api/auth/api-keys", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setApiKeys(data);
                }
            } catch (e) {
                console.error("Failed to load API keys", e);
            } finally {
                setLoading(false);
            }
        }
        if (accessToken) {
            fetchKeys();
        }
    }, [accessToken]);

    async function handleCreateApiKey() {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/api-keys", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ projectName, expireDays }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Không thể tạo API Key.");
            }

            setApiKey(result.apiKey || "");
            setExpiresAt(result.expiresAt || "");
            setMessage(result.message || "Tạo API Key thành công.");
            setApiKeys((prev) => [
                {
                    id: result.id,
                    projectName: projectName.trim(),
                    apiKey: result.apiKey || "",
                    expiresAt: result.expiresAt,
                    createdAt: new Date().toISOString(),
                    callsUsed: 0,
                },
                ...prev,
            ]);
            setShowCreateForm(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Đã xảy ra lỗi.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCopyApiKey(value = apiKey) {
        if (!value) return;
        await navigator.clipboard.writeText(value);
        setMessage("Đã sao chép API Key.");
    }

    async function handleRename(itemId) {
        const current = apiKeys.find((x) => x.id === itemId);
        if (!current) return;
        const nextName = window.prompt("Đổi tên API Key", current.projectName);
        if (!nextName || !nextName.trim() || nextName.trim() === current.projectName) {
            setOpenActionId(null);
            return;
        }

        try {
            const res = await fetch(`/api/auth/api-keys/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ projectName: nextName.trim() }),
            });
            if (res.ok) {
                setApiKeys((prev) =>
                    prev.map((x) => (x.id === itemId ? { ...x, projectName: nextName.trim() } : x)),
                );
                setMessage("Cập nhật tên thành công.");
            } else {
                const errorData = await res.json();
                setError(errorData.message || "Không thể cập nhật API Key.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Đã xảy ra lỗi.");
        } finally {
            setOpenActionId(null);
        }
    }

    async function handleDelete(itemId) {
        if (!window.confirm("Bạn có chắc chắn muốn xóa API Key này không?")) {
            setOpenActionId(null);
            return;
        }

        try {
            const res = await fetch(`/api/auth/api-keys/${itemId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (res.ok) {
                setApiKeys((prev) => prev.filter((x) => x.id !== itemId));
                setMessage("Xóa API Key thành công.");
            } else {
                const errorData = await res.json();
                setError(errorData.message || "Không thể xóa API Key.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Đã xảy ra lỗi.");
        } finally {
            setOpenActionId(null);
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                background: C.white,
                padding: 18,
                boxShadow: C.shadow,
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 18 }}>
                    <div>
                        <h3 style={{ margin: 0, color: C.text, fontSize: 40, lineHeight: 1.1 }}>Air Quality API</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button
                            type="button"
                            onClick={() => navigate("/tai-lieu-api")}
                            style={{
                                border: "none",
                                background: "transparent",
                                color: C.blue,
                                borderRadius: 8,
                                padding: "8px 10px",
                                fontWeight: 600,
                                fontSize: 18,
                                cursor: "pointer",
                            }}
                        >
                            Tài liệu API ↗
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowCreateForm((s) => !s)}
                            style={{
                                border: "none",
                                background: C.blue,
                                color: "white",
                                borderRadius: 12,
                                padding: "12px 20px",
                                fontWeight: 700,
                                fontSize: 18,
                                cursor: "pointer",
                            }}
                        >
                            Tạo API Key
                        </button>
                    </div>
                </div>

                {(error || message) && (
                    <div style={{
                        marginBottom: 12,
                        border: `1px solid ${error ? "#fecaca" : C.greenBorder}`,
                        background: error ? "#fff1f2" : C.greenBg,
                        color: error ? C.red : C.green,
                        borderRadius: 8,
                        padding: "9px 11px",
                        fontSize: 12.5,
                    }}>
                        {error || message}
                    </div>
                )}

                {showCreateForm && (
                    <div style={{
                        marginBottom: 14,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        padding: 12,
                        background: C.blueSoft,
                    }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: 10, alignItems: "end" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.textMuted }}>Tên project</label>
                                <input
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Ví dụ: weather-widget-prod"
                                    maxLength={100}
                                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 10px", fontSize: 13 }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: C.textMuted }}>Hết hạn (ngày)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={expireDays}
                                    onChange={(e) => setExpireDays(Number(e.target.value || 90))}
                                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 10px", fontSize: 13 }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleCreateApiKey}
                                disabled={loading || !projectName.trim()}
                                style={{
                                    border: "none",
                                    background: C.green,
                                    color: "white",
                                    borderRadius: 8,
                                    padding: "10px 14px",
                                    fontWeight: 700,
                                    fontSize: 12.5,
                                    cursor: loading || !projectName.trim() ? "default" : "pointer",
                                    opacity: loading || !projectName.trim() ? 0.7 : 1,
                                }}
                            >
                                {loading ? "Đang tạo..." : "Tạo API Key"}
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ border: `1px solid ${C.border}`, borderRadius: 10 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}` }}>
                                {[
                                    "API Key",
                                    "Key",
                                    "Gói",
                                    "Số lượt/tháng",
                                    "Ngày hết hạn",
                                    "Ngày tạo",
                                    "",
                                ].map((h, i, arr) => (
                                    <th key={h} style={{ textAlign: "left", padding: "12px 12px", fontSize: 12, color: C.textMuted, fontWeight: 700, borderTopLeftRadius: i === 0 ? 10 : 0, borderTopRightRadius: i === arr.length - 1 ? 10 : 0 }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {apiKeys.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: "14px 12px", fontSize: 13, color: C.textLight }}>
                                        Chưa có API Key. Hãy bấm <b>Create an API key</b> để tạo mới.
                                    </td>
                                </tr>
                            ) : (
                                apiKeys.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: "14px 12px", fontSize: 14, color: C.text, fontWeight: 600 }}>{item.projectName}</td>
                                        <td style={{ padding: "14px 12px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <code style={{ fontSize: 12.5, color: C.text }}>{showKey ? item.apiKey : maskApiKey(item.apiKey)}</code>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowKey((s) => !s)}
                                                    style={{ border: "none", background: "transparent", color: C.textLight, cursor: "pointer", fontSize: 12 }}
                                                >
                                                    {showKey ? "Ẩn" : "Hiện"}
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 12px", fontSize: 14, color: C.text }}>{planName}</td>
                                        <td style={{ padding: "14px 12px", fontSize: 14, color: C.text }}>
                                            <span style={{ color: "#16a34a", fontWeight: 600 }}>{item.callsUsed.toLocaleString("en-US")}</span>
                                            /{callsPerMonth.toLocaleString("en-US")}
                                        </td>
                                        <td style={{ padding: "14px 12px", fontSize: 14, color: C.text }}>{formatDate(item.expiresAt)}</td>
                                        <td style={{ padding: "14px 12px", fontSize: 14, color: C.text }}>{formatDate(item.createdAt)}</td>
                                        <td style={{ padding: "14px 12px", position: "relative", width: 40 }}>
                                            <button
                                                type="button"
                                                onClick={() => setOpenActionId((x) => (x === item.id ? null : item.id))}
                                                style={{ border: "none", background: "transparent", cursor: "pointer", color: C.textMuted, fontSize: 16 }}
                                            >
                                                ⋮
                                            </button>
                                            {openActionId === item.id && (
                                                <div style={{
                                                    position: "absolute",
                                                    right: 8,
                                                    top: 34,
                                                    width: 160,
                                                    background: C.white,
                                                    border: `1px solid ${C.border}`,
                                                    borderRadius: 10,
                                                    boxShadow: C.shadow,
                                                    zIndex: 10,
                                                }}>
                                                    <button type="button" onClick={() => handleCopyApiKey(item.apiKey)} style={{ width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "10px 12px", fontSize: 13, cursor: "pointer", color: C.text }}>
                                                        Sao chép
                                                    </button>
                                                    <button type="button" onClick={() => handleRename(item.id)} style={{ width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "10px 12px", fontSize: 13, cursor: "pointer", color: C.text }}>
                                                        Đổi tên
                                                    </button>
                                                    <button type="button" onClick={() => handleDelete(item.id)} style={{ width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "10px 12px", fontSize: 13, cursor: "pointer", color: C.red }}>
                                                        Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {apiKey && (
                    <div style={{ marginTop: 14, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, background: "#fafafa" }}>
                        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>API Key (chỉ hiển thị đầy đủ khi vừa tạo)</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <code style={{ fontSize: 12.5, color: C.text }}>{showKey ? apiKey : maskApiKey(apiKey)}</code>
                            <button type="button" onClick={() => setShowKey((s) => !s)} style={{ border: "none", background: "transparent", color: C.textLight, cursor: "pointer", fontSize: 12 }}>
                                {showKey ? "Ẩn" : "Hiện"}
                            </button>
                            <button type="button" onClick={handleCopyApiKey} style={{ border: `1px solid ${C.border}`, background: C.white, color: C.textMuted, borderRadius: 7, cursor: "pointer", padding: "4px 8px", fontSize: 12 }}>
                                Sao chép
                            </button>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 12, color: C.textLight }}>
                            Hết hạn: {expiresAt ? new Date(expiresAt).toLocaleString("vi-VN") : "-"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
