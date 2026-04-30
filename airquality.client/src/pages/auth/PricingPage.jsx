import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Stack, Typography } from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import theme from "../../components/layout/theme";

const freeFeatures = [
    { text: "Xem bản đồ nhiệt", active: true },
    { text: "Dự báo 24h", active: true },
    { text: "Lưu giới hạn trạm", active: true },
    { text: "Dự báo AI 7 ngày", active: false },
    { text: "Eco-Routing theo bệnh lý", active: false },
    { text: "API Key & Cảnh báo Zalo/SMS", active: false },
];

const proFeatures = [
    "Mở khóa toàn bộ chức năng AI",
    "Dự báo chi tiết 7 ngày",
    "Tìm đường né bụi mịn theo bệnh lý",
    "Cảnh báo tự động qua Zalo/Email",
    "Hỗ trợ API cho Developer",
];

function formatDate(dateValue) {
    if (!dateValue) return "--";
    const dt = new Date(dateValue);
    if (Number.isNaN(dt.getTime())) return "--";
    return dt.toLocaleDateString("vi-VN");
}

export default function PricingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [subscription, setSubscription] = useState({ tier: "Free", expiresAt: null });

    const paymentStatus = searchParams.get("payment");
    const paymentReason = searchParams.get("reason");

    const accessToken = localStorage.getItem("accessToken");
    const isLoggedIn = !!accessToken;

    const isPro = useMemo(
        () => (subscription.tier ?? "").toLowerCase() === "pro",
        [subscription.tier]
    );

    useEffect(() => {
        if (!isLoggedIn) {
            setSubscription({ tier: "Free", expiresAt: null });
            return;
        }

        let mounted = true;

        async function loadSubscription() {
            try {
                const response = await fetch("/api/billing/my-subscription", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) return;
                const data = await response.json();
                if (!mounted) return;

                setSubscription({
                    tier: data.tier ?? "Free",
                    expiresAt: data.expiresAt ?? null,
                });
                localStorage.setItem("subscriptionTier", data.tier ?? "Free");
            } catch {
                // ignore
            }
        }

        loadSubscription();

        return () => {
            mounted = false;
        };
    }, [isLoggedIn, accessToken, paymentStatus]);

    async function handleBuyPro() {
        setError("");

        if (!isLoggedIn) {
            navigate("/login", { state: { from: "/goi" } });
            return;
        }

        if (isPro) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/billing/vnpay/create-payment", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message ?? "Không tạo được giao dịch thanh toán.");
                return;
            }

            if (!data.paymentUrl) {
                setError("Không nhận được liên kết thanh toán.");
                return;
            }

            window.location.href = data.paymentUrl;
        } catch {
            setError("Không thể kết nối tới máy chủ thanh toán.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <MainLayout activePage="Gói">
            <Box
                component="section"
                sx={{
                    pt: "118px",
                    pb: { xs: 7, md: 12 },
                    px: { xs: 1.5, md: 3 },
                    background: "#f2f4f8",
                    minHeight: "100vh",
                    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                }}
            >
                <Box sx={{ maxWidth: 1140, mx: "auto" }}>
                    <Typography component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.1, mt: 0, mb: 1.5, color: "#0f172a", textAlign: "center", fontWeight: 800, letterSpacing: "-1.1px" }}>
                        Đầu tư cho <span style={{ color: "#0d9468" }}>lá phổi</span> của bạn.
                    </Typography>
                    <Typography sx={{ mt: 0, mb: 4.75, color: "#475569", textAlign: "center", fontSize: { xs: 16, md: 21 }, fontWeight: 500, lineHeight: 1.45 }}>
                        Mở khóa sức mạnh của AI để bảo vệ sức khỏe gia đình bạn 24/7.
                    </Typography>

                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 42, flexWrap: "wrap" }}>
                        <span style={{ padding: "7px 16px", borderRadius: 999, background: "#eafcf3", color: "#0f766e", fontSize: 12, fontWeight: 700 }}>Hàng tháng</span>
                        <span style={{ padding: "7px 16px", borderRadius: 999, background: "#ffffff", color: "#334155", fontSize: 12, fontWeight: 700, border: "1px solid #dbe3ef" }}>Hàng năm</span>
                        <span style={{ padding: "7px 16px", borderRadius: 999, background: "#ffe4ea", color: "#be123c", fontSize: 12, fontWeight: 700 }}>Tiết kiệm 20%</span>
                    </div>

                    {paymentStatus === "success" && (
                        <div style={{ background: "#ecfdf3", border: "1px solid #86efac", color: "#166534", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                            Thanh toán thành công. Tài khoản đã được nâng cấp lên Pro.
                        </div>
                    )}

                    {paymentStatus === "failed" && (
                        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                            Thanh toán thất bại{paymentReason ? ` (${paymentReason})` : ""}. Vui lòng thử lại.
                        </div>
                    )}

                    {error && (
                        <div style={{ background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2.2 }}>
                        <div style={{ background: "#eef2f7", borderRadius: 14, padding: "24px 18px 18px", border: "1px solid #e7ebf3", display: "flex", flexDirection: "column", minHeight: 430 }}>
                            <div style={{ fontSize: 27, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Gói Cơ Bản</div>
                            <div style={{ marginBottom: 14, display: "flex", alignItems: "flex-end", gap: 8 }}>
                                <span style={{ fontSize: 50, fontWeight: 800, color: "#0f172a", letterSpacing: "-1.1px", lineHeight: 0.95 }}>0 VNĐ</span>
                                <span style={{ color: "#64748b", marginBottom: 6, fontSize: 14 }}>/ tháng</span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 16 }}>
                                {freeFeatures.map((item) => (
                                    <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, color: item.active ? "#0f172a" : "#94a3b8", fontSize: 14.5 }}>
                                        {item.active ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f9d7a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M8 12.4l2.5 2.6L16 9.8" />
                                            </svg>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        )}
                                        <span style={{ opacity: item.active ? 1 : 0.78, fontStyle: item.active ? "normal" : "italic" }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled
                                style={{
                                    marginTop: "auto",
                                    width: "100%",
                                    borderRadius: 999,
                                    height: 46,
                                    border: "1.6px solid #6b7280",
                                    background: "transparent",
                                    color: "#64748b",
                                    fontWeight: 700,
                                    fontSize: 14,
                                }}
                            >
                                Gói hiện tại
                            </button>
                        </div>

                        <div style={{ background: "#ffffff", borderRadius: 14, padding: "24px 18px 18px", border: "2px solid #10b981", display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 8px 20px rgba(16, 185, 129, 0.08)", minHeight: 430 }}>
                            <div style={{ position: "absolute", top: -12, right: 18, background: "#047857", color: "white", borderRadius: 999, fontSize: 11, fontWeight: 800, padding: "4px 12px", letterSpacing: ".3px" }}>
                                PHỔ BIẾN NHẤT
                            </div>

                            <div style={{ fontSize: 27, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Gói Pro AI</div>
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                                    <span style={{ fontSize: 50, fontWeight: 800, color: "#047857", letterSpacing: "-1.1px", lineHeight: 0.95 }}>200.000 VNĐ</span>
                                    <span style={{ color: "#64748b", marginBottom: 6, fontSize: 14 }}>/ tháng</span>
                                </div>
                                <div style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through", marginTop: 4 }}>250.000 VNĐ</div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 16 }}>
                                {proFeatures.map((item) => (
                                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, color: "#0f172a", fontSize: 14.5 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="9" />
                                            <path d="M8 12.4l2.5 2.6L16 9.8" />
                                        </svg>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleBuyPro}
                                disabled={loading || isPro}
                                style={{
                                    marginTop: "auto",
                                    width: "100%",
                                    borderRadius: 999,
                                    height: 48,
                                    border: "none",
                                    background: loading || isPro ? "#94a3b8" : "linear-gradient(135deg, #047857, #22c55e)",
                                    color: "white",
                                    fontWeight: 800,
                                    fontSize: 15,
                                    cursor: loading || isPro ? "not-allowed" : "pointer",
                                }}
                            >
                                {isPro ? "Đang dùng Pro" : loading ? "Đang chuyển đến VNPAY..." : "Nâng cấp Pro ngay"}
                            </button>
                        </div>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1.5} sx={{ mt: 2.2, px: 0.5 }}>
                        <div style={{ color: theme.textMuted, fontSize: 14 }}>
                            Gói hiện tại: <strong style={{ color: theme.text }}>{subscription.tier}</strong>
                            {isPro && subscription.expiresAt && (
                                <span> · Hết hạn: <strong style={{ color: theme.text }}>{formatDate(subscription.expiresAt)}</strong></span>
                            )}
                        </div>
                    </Stack>
                </Box>
            </Box>
        </MainLayout>
    );
}
