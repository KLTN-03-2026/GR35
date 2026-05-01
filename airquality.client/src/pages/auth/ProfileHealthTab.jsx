﻿import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const C = {
    green: "#0d6e4e",
    greenLight: "#22c55e",
    greenSoft: "#dcfce7",
    emerald: "#10b981",
    greenBg: "#f0fdf4",
    greenBorder: "#bbf7d0",
    blueBg: "#eff6ff",
    blueBorder: "#bfdbfe",
    blueText: "#1d4ed8",
    text: "#1a2e1a",
    textMuted: "#5a6e5a",
    textLight: "#9ca3af",
    border: "#e5e7eb",
    bg: "#f8fafc",
    white: "#ffffff",
    yellow: "#f59e0b",
    red: "#ef4444",
};

const HEALTH_OPTIONS = [
    "Hen suyễn",
    "Viêm mũi dị ứng",
    "COPD / bệnh phổi tắc nghẽn",
    "Bệnh tim mạch",
    "Người cao tuổi",
    "Trẻ nhỏ",
    "Phụ nữ mang thai",
];

function fmtDate(iso) {
    if (!iso) return "Chưa xác định";
    return new Date(iso).toLocaleString("vi-VN");
}

function getPasswordStrength(password) {
    const checks = [
        password.length >= 8,
        /[A-Za-z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z\d]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: "Yếu", color: "#ef4444", pct: 25 };
    if (score === 2) return { label: "Trung bình", color: "#f59e0b", pct: 50 };
    if (score === 3) return { label: "Khá", color: "#3b82f6", pct: 75 };
    return { label: "Mạnh", color: "#10b981", pct: 100 };
}

function getConditionTips(conditions) {
    if (!conditions.length) {
        return [
            "Bạn chưa chọn hồ sơ sức khỏe. Hãy chọn ít nhất 1 tình trạng để nhận cảnh báo chính xác hơn.",
            "Ưu tiên bật cảnh báo PM2.5 theo thời gian thực để tối ưu bảo vệ sức khỏe hô hấp.",
        ];
    }

    const tips = [];
    if (conditions.some((x) => x.toLowerCase().includes("hen") || x.toLowerCase().includes("copd"))) {
        tips.push("Ưu tiên cảnh báo PM2.5 và PM10, tránh hoạt động ngoài trời khi AQI > 100.");
    }
    if (conditions.some((x) => x.toLowerCase().includes("tim mạch"))) {
        tips.push("Bật cảnh báo theo giờ cao điểm giao thông để giảm rủi ro cho tim mạch.");
    }
    if (conditions.some((x) => x.toLowerCase().includes("mang thai") || x.toLowerCase().includes("trẻ"))) {
        tips.push("Khuyến nghị nhận cảnh báo sớm 30-60 phút trước khi chất lượng không khí xấu.");
    }
    if (conditions.some((x) => x.toLowerCase().includes("cao tuổi"))) {
        tips.push("Nên theo dõi thêm nhiệt độ và độ ẩm để điều chỉnh hoạt động ngoài trời phù hợp.");
    }

    return tips.length ? tips : ["Hồ sơ hiện tại đã sẵn sàng cho cảnh báo cá nhân hóa."];
}

export default function ProfileHealthTab({ onProfileUpdated, isMobile }) {
    const { accessToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [customCondition, setCustomCondition] = useState("");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [healthConditions, setHealthConditions] = useState([]);
    const [subscription, setSubscription] = useState({
        tier: "Free",
        startedAt: null,
        expiresAt: null,
        isPro: false,
    });
    const [initialProfile, setInitialProfile] = useState({ fullName: "", healthConditions: [] });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        next: false,
        confirm: false,
    });

    useEffect(() => {
        let ignore = false;

        async function loadProfile() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch("/api/auth/profile-health", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Không thể tải hồ sơ người dùng.");
                }

                if (ignore) return;

                setFullName(data.fullName || "");
                setEmail(data.email || "");
                setHealthConditions(Array.isArray(data.healthConditions) ? data.healthConditions : []);
                setInitialProfile({
                    fullName: data.fullName || "",
                    healthConditions: Array.isArray(data.healthConditions) ? data.healthConditions : [],
                });
                setSubscription({
                    tier: data.subscriptionTier || "Free",
                    startedAt: data.subscriptionStartedAt,
                    expiresAt: data.subscriptionExpiresAt,
                    isPro: !!data.isPro,
                });
            } catch (e) {
                if (!ignore) {
                    setError(e instanceof Error ? e.message : "Đã xảy ra lỗi khi tải hồ sơ.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            ignore = true;
        };
    }, [accessToken]);

    const daysLeft = useMemo(() => {
        if (!subscription.expiresAt) return null;
        const diff = new Date(subscription.expiresAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [subscription.expiresAt]);

    const sortedConditions = useMemo(() => [...healthConditions].sort((a, b) => a.localeCompare(b)), [healthConditions]);
    const personalizedTips = useMemo(() => getConditionTips(healthConditions), [healthConditions]);

    const isProfileDirty = useMemo(() => {
        const initial = [...(initialProfile.healthConditions || [])].sort((a, b) => a.localeCompare(b));
        return fullName.trim() !== initialProfile.fullName.trim()
            || JSON.stringify(sortedConditions) !== JSON.stringify(initial);
    }, [fullName, sortedConditions, initialProfile]);

    const profileCompletion = useMemo(() => {
        let score = 0;
        if (fullName.trim().length >= 3) score += 40;
        if (healthConditions.length > 0) score += 40;
        if (subscription.isPro) score += 20;
        return score;
    }, [fullName, healthConditions.length, subscription.isPro]);

    const passwordStrength = useMemo(() => getPasswordStrength(passwordForm.newPassword), [passwordForm.newPassword]);

    function handleProCheck() {
        if (!subscription.isPro) {
            setError("Tính năng yêu cầu tài khoản nâng cấp PRO");
            setMessage("");
            return false;
        }
        return true;
    }

    function toggleCondition(condition) {
        if (!handleProCheck()) return;
        setHealthConditions((prev) =>
            prev.includes(condition) ? prev.filter((x) => x !== condition) : [...prev, condition],
        );
    }

    function addCustomCondition() {
        if (!handleProCheck()) return;
        const value = customCondition.trim();
        if (!value) return;
        if (healthConditions.some((x) => x.toLowerCase() === value.toLowerCase())) {
            setCustomCondition("");
            return;
        }

        setHealthConditions((prev) => [...prev, value].slice(0, 10));
        setCustomCondition("");
    }

    function removeCondition(condition) {
        if (!handleProCheck()) return;
        setHealthConditions((prev) => prev.filter((x) => x !== condition));
    }

    async function handleSaveProfile() {
        if (!fullName.trim()) {
            setError("Họ và tên không được để trống.");
            setMessage("");
            return;
        }

        setSavingProfile(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/profile-health", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    fullName,
                    healthConditions,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Không thể lưu hồ sơ.");
            }

            localStorage.setItem("userName", data.fullName || fullName);
            setMessage(data.message || "Đã cập nhật hồ sơ.");
            setInitialProfile({
                fullName: data.fullName || fullName,
                healthConditions: Array.isArray(data.healthConditions) ? data.healthConditions : healthConditions,
            });
            onProfileUpdated?.(data.fullName || fullName);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Không thể cập nhật hồ sơ.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("Mật khẩu mới và xác nhận không khớp.");
            return;
        }
        setChangingPassword(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(passwordForm),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Không thể đổi mật khẩu.");
            }

            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setMessage(data.message || "Đổi mật khẩu thành công.");
        } catch (e2) {
            setError(e2 instanceof Error ? e2.message : "Không thể đổi mật khẩu.");
        } finally {
            setChangingPassword(false);
        }
    }
    function handleResetProfile() {
        setFullName(initialProfile.fullName);
        setHealthConditions(initialProfile.healthConditions || []);
        setCustomCondition("");
        setError("");
        setMessage("Đã khôi phục dữ liệu hồ sơ ban đầu.");
    }

    if (loading) {
        return <div style={{ color: C.textMuted, fontSize: 14 }}>Đang tải hồ sơ...</div>;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
                background: "linear-gradient(135deg, #0d6e4e 0%, #10b981 50%, #34d399 100%)",
                borderRadius: 16,
                color: "white",
                padding: "18px 20px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 16,
                alignItems: "center",
            }}>
                <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 20,
                }}>
                    {(fullName || email || "U").trim().charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>Hồ sơ & Sức khỏe cá nhân</div>
                    <div style={{ fontSize: 12.5, opacity: 0.9 }}>
                        Hoàn thiện hồ sơ để nhận cảnh báo phù hợp với tình trạng sức khỏe của bạn.
                    </div>
                </div>
                <div style={{ minWidth: 130 }}>
                    <div style={{ fontSize: 11, opacity: 0.9, marginBottom: 6 }}>Mức hoàn thiện</div>
                    <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.35)", overflow: "hidden" }}>
                        <div style={{ width: `${profileCompletion}%`, height: "100%", background: "white" }} />
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700 }}>{profileCompletion}%</div>
                </div>
            </div>

            {(error || message) && (
                <div
                    style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1px solid ${error ? "#fecaca" : C.greenBorder}`,
                        background: error ? "#fef2f2" : C.greenBg,
                        color: error ? C.red : C.green,
                        fontSize: 13,
                    }}
                >
                    {error || message}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr", gap: 16 }}>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 15, color: C.text }}>Hồ sơ cá nhân hóa sức khỏe</h3>
                    <p style={{ margin: "0 0 14px", color: C.textLight, fontSize: 12 }}>Dữ liệu này giúp hệ thống tinh chỉnh cảnh báo AQI theo mức nhạy cảm của bạn.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 4 }}>Họ và tên</label>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 4 }}>Email</label>
                            <input
                                value={email}
                                disabled
                                style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, background: "#f9fafb" }}
                            />
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                                <div style={{ fontSize: 12, color: C.textMuted }}>Tình trạng sức khỏe cần ưu tiên cảnh báo</div>
                                <div style={{ fontSize: 11, color: C.textLight }}>{healthConditions.length}/10</div>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {HEALTH_OPTIONS.map((item) => {
                                    const active = healthConditions.includes(item);
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => toggleCondition(item)}
                                            style={{
                                                border: `1px solid ${active ? C.green : C.border}`,
                                                background: active ? C.greenBg : C.white,
                                                color: active ? C.green : C.textMuted,
                                                borderRadius: 999,
                                                padding: "7px 10px",
                                                fontSize: 12,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                                <input
                                    value={customCondition}
                                    onChange={(e) => setCustomCondition(e.target.value)}
                                    placeholder="Thêm tình trạng khác..."
                                    style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 12.5 }}
                                    maxLength={100}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomCondition}
                                    style={{
                                        border: `1px solid ${C.greenBorder}`,
                                        background: C.greenBg,
                                        color: C.green,
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    + Thêm
                                </button>
                            </div>

                            {sortedConditions.length > 0 && (
                                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {sortedConditions.map((item) => (
                                        <span
                                            key={item}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                border: `1px solid ${C.blueBorder}`,
                                                background: C.blueBg,
                                                color: C.blueText,
                                                borderRadius: 999,
                                                padding: "6px 10px",
                                                fontSize: 12,
                                            }}
                                        >
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() => removeCondition(item)}
                                                style={{ border: "none", background: "transparent", cursor: "pointer", color: C.blueText, fontSize: 13, lineHeight: 1 }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{
                            border: `1px solid ${C.blueBorder}`,
                            borderRadius: 10,
                            background: C.blueBg,
                            padding: "12px 13px",
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.blueText, marginBottom: 6 }}>Gợi ý cảnh báo cá nhân hóa</div>
                            <ul style={{ margin: 0, paddingLeft: 18, color: C.blueText, fontSize: 12, lineHeight: 1.6 }}>
                                {personalizedTips.map((tip) => (
                                    <li key={tip}>{tip}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={savingProfile || !isProfileDirty}
                                style={{
                                    border: "none",
                                    borderRadius: 8,
                                    background: C.green,
                                    color: "white",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    padding: "9px 14px",
                                    cursor: savingProfile || !isProfileDirty ? "default" : "pointer",
                                    opacity: savingProfile || !isProfileDirty ? 0.7 : 1,
                                }}
                            >
                                {savingProfile ? "Đang lưu..." : "Lưu hồ sơ"}
                            </button>
                            <button
                                type="button"
                                onClick={handleResetProfile}
                                disabled={!isProfileDirty}
                                style={{
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 8,
                                    background: C.white,
                                    color: C.textMuted,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    padding: "9px 14px",
                                    cursor: !isProfileDirty ? "default" : "pointer",
                                    opacity: !isProfileDirty ? 0.65 : 1,
                                }}
                            >
                                Hoàn tác
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>Gói dịch vụ hiện tại</h3>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 12, fontWeight: 700, borderRadius: 999,
                        padding: "5px 10px",
                        color: subscription.isPro ? "#92400e" : C.textMuted,
                        background: subscription.isPro ? "#fffbeb" : "#f3f4f6",
                        border: `1px solid ${subscription.isPro ? "#fde68a" : C.border}`,
                        marginBottom: 12,
                    }}>
                        {subscription.isPro ? "⭐ PRO" : "Free"}
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8 }}>
                        <div><b style={{ color: C.text }}>Tên gói:</b> {subscription.tier}</div>
                        <div><b style={{ color: C.text }}>Ngày bắt đầu:</b> {fmtDate(subscription.startedAt)}</div>
                        <div><b style={{ color: C.text }}>Ngày hết hạn:</b> {fmtDate(subscription.expiresAt)}</div>
                        <div><b style={{ color: C.text }}>Thời gian còn lại:</b> {daysLeft == null ? "—" : `${daysLeft} ngày`}</div>
                    </div>
                    {daysLeft != null && (
                        <div style={{ marginTop: 10 }}>
                            <div style={{ height: 7, borderRadius: 999, background: "#f3f4f6", overflow: "hidden" }}>
                                <div
                                    style={{
                                        width: `${Math.max(8, Math.min(100, daysLeft * 3))}%`,
                                        height: "100%",
                                        background: subscription.isPro ? C.emerald : C.textLight,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {!subscription.isPro && (
                        <a
                            href="/goi"
                            style={{
                                marginTop: 14,
                                display: "inline-block",
                                fontSize: 13,
                                fontWeight: 600,
                                color: C.yellow,
                                textDecoration: "none",
                            }}
                        >
                            Nâng cấp lên Pro
                        </a>
                    )}

                    <div style={{
                        marginTop: 14,
                        border: `1px solid ${C.greenBorder}`,
                        background: C.greenBg,
                        borderRadius: 10,
                        padding: "10px 11px",
                        fontSize: 12,
                        color: C.green,
                        lineHeight: 1.6,
                    }}>
                        {subscription.isPro
                            ? "Bạn đang dùng gói PRO: đã mở khóa cảnh báo nâng cao, ưu tiên thông báo và phân tích chuyên sâu."
                            : "Mẹo: nâng cấp PRO để nhận cảnh báo ưu tiên theo hồ sơ sức khỏe và dự báo rủi ro sớm."}
                    </div>
                </div>
            </div>

            <form onSubmit={handleChangePassword} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>Thay đổi mật khẩu</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 10 }}>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword.current ? "text" : "password"}
                            placeholder="Mật khẩu hiện tại"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 34px 9px 11px", fontSize: 13 }}
                        />
                        <button type="button" onClick={() => setShowPassword((s) => ({ ...s, current: !s.current }))} style={{ position: "absolute", right: 8, top: 8, border: "none", background: "transparent", cursor: "pointer", color: C.textLight }}>
                            {showPassword.current ? "🙈" : "👁"}
                        </button>
                    </div>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword.next ? "text" : "password"}
                            placeholder="Mật khẩu mới"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 34px 9px 11px", fontSize: 13 }}
                        />
                        <button type="button" onClick={() => setShowPassword((s) => ({ ...s, next: !s.next }))} style={{ position: "absolute", right: 8, top: 8, border: "none", background: "transparent", cursor: "pointer", color: C.textLight }}>
                            {showPassword.next ? "🙈" : "👁"}
                        </button>
                    </div>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword.confirm ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu mới"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 34px 9px 11px", fontSize: 13 }}
                        />
                        <button type="button" onClick={() => setShowPassword((s) => ({ ...s, confirm: !s.confirm }))} style={{ position: "absolute", right: 8, top: 8, border: "none", background: "transparent", cursor: "pointer", color: C.textLight }}>
                            {showPassword.confirm ? "🙈" : "👁"}
                        </button>
                    </div>
                </div>

                <div style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    background: C.bg,
                    marginBottom: 10,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: C.textMuted }}>Độ mạnh mật khẩu mới</span>
                        <b style={{ color: passwordStrength.color }}>{passwordStrength.label}</b>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" }}>
                        <div style={{ width: `${passwordStrength.pct}%`, height: "100%", background: passwordStrength.color }} />
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11.5, color: C.textLight }}>
                        Mật khẩu mạnh nên có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt.
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    style={{
                        marginTop: 12,
                        border: "none",
                        borderRadius: 8,
                        background: C.greenLight,
                        color: "white",
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "9px 14px",
                        cursor: changingPassword ? "default" : "pointer",
                        opacity: changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword ? 0.7 : 1,
                    }}
                >
                    {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
            </form>
        </div>
    );
}
