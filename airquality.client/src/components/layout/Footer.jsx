import { useNavigate } from "react-router-dom";
import theme from "./theme";

/**
 * Footer dùng chung cho các trang có MainLayout.
 */
export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer
            style={{
                background: "white",
                borderTop: `1px solid ${theme.border}`,
                padding: "48px 48px 24px",
                fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
            }}
        >
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        gap: 40,
                        marginBottom: 40,
                    }}
                >
                    {/* Brand */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <div
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 6,
                                    background: "linear-gradient(135deg,#0d6e4e,#22c55e)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                                </svg>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>EcoAir VN</span>
                        </div>
                        <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7, margin: 0, maxWidth: 240 }}>
                            Ứng dụng tiên phong sử dụng AI để giám sát và dự báo chất lượng không khí, bảo vệ sức khỏe cộng đồng Việt Nam.
                        </p>
                    </div>

                    {/* Giai phap */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 14, marginTop: 0 }}>
                            Giải pháp
                        </h4>
                        {["Dự báo AI", "Bản đồ nhiệt real-time", "Lộ trình sạch (Eco-routing)", "Thiết bị cảm biến"].map(
                            (item) => (
                                <a
                                    key={item}
                                    href="#"
                                    style={{ display: "block", fontSize: 13, color: theme.textMuted, textDecoration: "none", marginBottom: 8 }}
                                >
                                    {item}
                                </a>
                            )
                        )}
                    </div>

                    {/* Tai nguyen */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 14, marginTop: 0 }}>
                            Tài nguyên
                        </h4>
                        {["Tài liệu API", "Báo cáo hàng năm", "Blog sức khỏe", "Cộng đồng"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                style={{ display: "block", fontSize: 13, color: theme.textMuted, textDecoration: "none", marginBottom: 8 }}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* Lien he */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 14, marginTop: 0 }}>
                            Liên hệ
                        </h4>
                        {[
                            { icon: "✉", text: "support@ecoair.vn" },
                            { icon: "✆", text: "1900 6789" },
                            { icon: "⊙", text: "Khu Công nghệ Cao, TP. Thủ Đức, TP. HCM" },
                        ].map((item) => (
                            <div key={item.text} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 13, color: theme.textMuted, flexShrink: 0 }}>{item.icon}</span>
                                <span style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        borderTop: `1px solid ${theme.border}`,
                        paddingTop: 20,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span style={{ fontSize: 13, color: theme.textLight }}>
                        © 2024 EcoAir VN - Người bảo hộ thanh khiết.
                    </span>
                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        {["Về chúng tôi", "Tài khoản", "Bảo mật"].map((item) => (
                            <a key={item} href="#" style={{ fontSize: 13, color: theme.textMuted, textDecoration: "none" }}>
                                {item}
                            </a>
                        ))}
                        <div
                            onClick={() => navigate("/ai-chat")}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: theme.green,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
