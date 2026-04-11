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
                            Ung dung tien phong su dung AI de giam sat va du bao chat luong khong khi, bao ve suc khoe cong dong Viet Nam.
                        </p>
                    </div>

                    {/* Giai phap */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 14, marginTop: 0 }}>
                            Giai phap
                        </h4>
                        {["Du bao AI", "Ban do nhiet real-time", "Lo trinh sach (Eco-routing)", "Thiet bi cam bien"].map(
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
                            Tai nguyen
                        </h4>
                        {["Tai lieu API", "Bao cao hang nam", "Blog suc khoe", "Cong dong"].map((item) => (
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
                            Lien he
                        </h4>
                        {[
                            { icon: "✉", text: "support@ecoair.vn" },
                            { icon: "✆", text: "1900 6789" },
                            { icon: "⊙", text: "Khu Cong nghe Cao, TP. Thu Duc, TP. HCM" },
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
                        © 2024 EcoAir VN - Nguoi bao ho thanh khiet.
                    </span>
                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        {["Ve chung toi", "Tai khoan", "Bao mat"].map((item) => (
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
