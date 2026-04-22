import { useState } from "react";
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
        phone: "",
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

        await new Promise((resolve) => setTimeout(resolve, 700));

        setSubmitting(false);
        setSuccessMessage("Cảm ơn bạn đã liên hệ. EcoAir sẽ phản hồi sớm nhất có thể.");
        setFormData({ fullName: "", email: "", phone: "", message: "" });
    }

    return (
        <MainLayout activePage="Liên hệ">
            <section
                style={{
                    paddingTop: 110,
                    paddingBottom: 88,
                    paddingLeft: 24,
                    paddingRight: 24,
                    minHeight: "100vh",
                    background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 40%, #ffffff 100%)",
                    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                }}
            >
                <div style={{ maxWidth: 1120, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 34 }}>
                        <p style={{ margin: 0, color: "#047857", fontSize: 13, fontWeight: 700, letterSpacing: ".5px" }}>
                            ECOAIR SUPPORT
                        </p>
                        <h1 style={{ marginTop: 10, marginBottom: 12, fontSize: 46, lineHeight: 1.12, color: "#0f172a", letterSpacing: "-1px" }}>
                            Liên hệ với đội ngũ EcoAir
                        </h1>
                        <p style={{ margin: 0, color: "#475569", fontSize: 18, lineHeight: 1.6 }}>
                            Chúng tôi luôn sẵn sàng lắng nghe ý kiến, hỗ trợ kỹ thuật và tư vấn giải pháp không khí sạch.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 22 }}>
                        {infoCards.map((card) => (
                            <div
                                key={card.title}
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #dbe7de",
                                    borderRadius: 14,
                                    padding: "16px 18px",
                                    boxShadow: "0 8px 22px rgba(2, 132, 199, 0.05)",
                                }}
                            >
                                <div style={{ fontSize: 18, marginBottom: 8 }}>{card.icon}</div>
                                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{card.title}</div>
                                <div style={{ color: "#047857", fontWeight: 600, marginBottom: 4 }}>{card.value}</div>
                                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{card.description}</div>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.1fr 1.4fr",
                            gap: 18,
                        }}
                    >
                        <div
                            style={{
                                borderRadius: 16,
                                background: "linear-gradient(145deg, #065f46, #16a34a)",
                                padding: "24px 22px",
                                color: "white",
                                minHeight: 420,
                                boxShadow: "0 12px 30px rgba(16, 185, 129, 0.2)",
                            }}
                        >
                            <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 28 }}>Tư vấn nhanh</h2>
                            <p style={{ marginTop: 0, marginBottom: 22, lineHeight: 1.65, color: "rgba(255,255,255,0.9)" }}>
                                Để lại thông tin để nhận tư vấn giải pháp phù hợp cho gia đình, doanh nghiệp hoặc tích hợp API.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            style={{
                                borderRadius: 16,
                                border: "1px solid #dbe3ef",
                                background: "#ffffff",
                                padding: "22px",
                                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
                            }}
                        >
                            <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: 30, color: "#0f172a" }}>Gửi yêu cầu hỗ trợ</h2>
                            <p style={{ marginTop: 0, marginBottom: 18, color: theme.textMuted, fontSize: 14 }}>
                                Điền thông tin của bạn, chúng tôi sẽ liên hệ lại sớm.
                            </p>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
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
                                />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <InputField
                                    label="Số điện thoại"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="09xxxxxxxx"
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
                        </form>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}

function InputField({ label, name, type = "text", value, onChange, placeholder, required = false }) {
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
            />
        </div>
    );
}
