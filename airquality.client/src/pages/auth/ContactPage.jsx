import { useState } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import theme from "../../components/layout/theme";

const infoCards = [
    {
        title: "Email hỗ trợ",
        value: "support@ecoair.vn",
        description: "Phản hồi trong vòng 24h làm việc",
        icon: "✉",
    },
    {
        title: "Tổng đài",
        value: "1900 6789",
        description: "Hoạt động từ 08:00 - 22:00 mỗi ngày",
        icon: "✆",
    },
    {
        title: "Văn phòng",
        value: "TP. Thủ Đức, TP. Hồ Chí Minh",
        description: "Khu Công nghệ Cao, tòa EcoAir",
        icon: "⌂",
    },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (successMessage) {
            setSuccessMessage("");
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setSuccessMessage("");

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSuccessMessage("Cảm ơn bạn đã liên hệ. EcoAir sẽ phản hồi sớm nhất có thể qua email của bạn.");
                setFormData({ fullName: "", email: "", subject: "", message: "" });
            } else {
                const errData = await response.json();
                alert(errData.message || "Gửi liên hệ thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error submitting contact:", error);
            alert("Lỗi kết nối đến máy chủ. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <MainLayout activePage="Liên hệ">
            <Box
                component="section"
                sx={{
                    pt: "110px",
                    pb: { xs: 6, md: 11 },
                    px: { xs: 1.5, md: 3 },
                    minHeight: "100vh",
                    background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 40%, #ffffff 100%)",
                    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                }}
            >
                <Box sx={{ maxWidth: 1120, mx: "auto" }}>
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Typography sx={{ m: 0, color: "#047857", fontSize: 13, fontWeight: 700, letterSpacing: ".5px" }}>
                            ECOAIR SUPPORT
                        </Typography>
                        <Typography component="h1" sx={{ mt: 1.2, mb: 1.4, fontSize: { xs: 34, md: 46 }, lineHeight: 1.12, color: "#0f172a", letterSpacing: "-1px", fontWeight: 800 }}>
                            Liên hệ với đội ngũ EcoAir
                        </Typography>
                        <Typography sx={{ m: 0, color: "#475569", fontSize: { xs: 15, md: 18 }, lineHeight: 1.6 }}>
                            Chúng tôi luôn sẵn sàng lắng nghe ý kiến, hỗ trợ kỹ thuật và tư vấn giải pháp không khí sạch.
                        </Typography>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 1.75, mb: 2.5 }}>
                        {infoCards.map((card) => (
                            <Box
                                key={card.title}
                                sx={{
                                    background: "#ffffff",
                                    border: "1px solid #dbe7de",
                                    borderRadius: "14px",
                                    p: "16px 18px",
                                    boxShadow: "0 8px 22px rgba(2, 132, 199, 0.05)",
                                }}
                            >
                                <Typography sx={{ fontSize: 18, mb: 1 }}>{card.icon}</Typography>
                                <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>{card.title}</Typography>
                                <Typography sx={{ color: "#047857", fontWeight: 600, mb: 0.5 }}>{card.value}</Typography>
                                <Typography sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{card.description}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Grid container spacing={2.2}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box
                                sx={{
                                    borderRadius: 16,
                                    background: "linear-gradient(145deg, #065f46, #16a34a)",
                                    p: "24px 22px",
                                    color: "white",
                                    minHeight: 420,
                                    boxShadow: "0 12px 30px rgba(16, 185, 129, 0.2)",
                                }}
                            >
                                <Typography component="h2" sx={{ mt: 0, mb: 1.2, fontSize: 28, fontWeight: 700 }}>Tư vấn nhanh</Typography>
                                <Typography sx={{ mt: 0, mb: 2.75, lineHeight: 1.65, color: "rgba(255,255,255,0.9)" }}>
                                    Để lại thông tin để nhận tư vấn giải pháp phù hợp cho gia đình, doanh nghiệp hoặc tích hợp API.
                                </Typography>

                                <Stack spacing={1.5}>
                                    <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                                        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 3 }}>Thời gian phản hồi</div>
                                        <div style={{ fontWeight: 700 }}>Dưới 24 giờ làm việc</div>
                                    </div>
                                    <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                                        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 3 }}>Hỗ trợ ưu tiên</div>
                                        <div style={{ fontWeight: 700 }}>Khách hàng Pro & Doanh nghiệp</div>
                                    </div>
                                    <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                                        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 3 }}>Khung giờ hỗ trợ</div>
                                        <div style={{ fontWeight: 700 }}>08:00 - 22:00, Thứ 2 - Chủ nhật</div>
                                    </div>
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box
                                component="form"
                                onSubmit={handleSubmit}
                                sx={{
                                    borderRadius: 16,
                                    border: "1px solid #dbe3ef",
                                    background: "#ffffff",
                                    p: "22px",
                                    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
                                }}
                            >
                                <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: 30, color: "#0f172a" }}>Gửi yêu cầu hỗ trợ</h2>
                                <p style={{ marginTop: 0, marginBottom: 18, color: theme.textMuted, fontSize: 14 }}>
                                    Điền thông tin của bạn, chúng tôi sẽ liên hệ lại sớm.
                                </p>

                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mb: 1.5 }}>
                                    <InputField
                                        label="Họ và tên"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                    <InputField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ban@ecoair.vn"
                                        required
                                        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                        onInvalid={(e) => e.target.setCustomValidity("Vui lòng nhập địa chỉ email hợp lệ.")}
                                        onInput={(e) => e.target.setCustomValidity("")}
                                    />
                                </Box>

                                <div style={{ marginBottom: 12 }}>
                                    <InputField
                                        label="Tiêu đề"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Vấn đề bạn cần hỗ trợ..."
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", marginBottom: 7, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                                        Nội dung
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Mô tả yêu cầu của bạn..."
                                        required
                                        rows={6}
                                        style={{
                                            width: "100%",
                                            borderRadius: 12,
                                            border: "1px solid #cbd5e1",
                                            padding: "12px 13px",
                                            fontSize: 14,
                                            outline: "none",
                                            resize: "vertical",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                        }}
                                    />
                                </div>

                                {successMessage && (
                                    <div style={{ background: "#ecfdf3", border: "1px solid #86efac", color: "#166534", borderRadius: 10, padding: "10px 12px", marginBottom: 12, fontSize: 14 }}>
                                        {successMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        width: "100%",
                                        height: 46,
                                        border: "none",
                                        borderRadius: 999,
                                        background: submitting ? "#94a3b8" : "linear-gradient(135deg, #047857, #22c55e)",
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: 15,
                                        cursor: submitting ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {submitting ? "Đang gửi..." : "Gửi liên hệ"}
                                </button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </MainLayout>
    );
}

function InputField({ label, name, type = "text", value, onChange, placeholder, required = false, ...props }) {
    return (
        <div>
            <label style={{ display: "block", marginBottom: 7, fontSize: 13, fontWeight: 600, color: "#334155" }}>
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    padding: "11px 12px",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                }}
                {...props}
            />
        </div>
    );
}
