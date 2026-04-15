import { useNavigate } from "react-router-dom";
import theme from "./theme";

/**
 * Navbar dùng chung cho các trang có MainLayout.
 * Prop `activePage`: tên link đang active, mặc định "Trang chủ".
 * Tự động hiển thị nút "Dashboard" khi người dùng đã đăng nhập.
 */
export default function Navbar({ activePage = "Trang chủ" }) {
    const navigate = useNavigate();

    const navLinks = [
        { label: "Trang chủ", path: "/" },
        { label: "Dữ liệu chất lượng không khí", path: "/du-lieu" },
        { label: "Bản đồ", path: "/ban-do" },
        { label: "Liên hệ", path: "/lien-he" },
        { label: "Gói", path: "/goi" },
    ];

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: theme.navBg,
                borderBottom: `1px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                padding: "0 48px",
                height: 60,
                fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
            }}
        >
            {/* Logo */}
            <div
                style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 48, flexShrink: 0, cursor: "pointer" }}
                onClick={() => navigate("/")}
            >
                <div
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: "linear-gradient(135deg, #0d6e4e, #22c55e)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                    </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>EcoAir VN</span>
            </div>

            {/* Nav links */}
            <div style={{ display: "flex", gap: 32, flex: 1 }}>
                {navLinks.map((item) => {
                    const isActive = activePage === item.label;
                    return (
                        <a
                            key={item.label}
                            href={item.path}
                            onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                            style={{
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? theme.green : theme.textMuted,
                                textDecoration: "none",
                                borderBottom: isActive ? `2px solid ${theme.green}` : "2px solid transparent",
                                paddingBottom: 2,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {item.label}
                        </a>
                    );
                })}
            </div>

            {/* Auth buttons – conditional on login state */}
            <NavAuthButtons navigate={navigate} />
        </nav>
    );
}

function NavAuthButtons({ navigate }) {
    const accessToken = localStorage.getItem("accessToken");
    const role = (localStorage.getItem("role") ?? "").toLowerCase();
    const isLoggedIn = !!accessToken;
    const isAdmin = role === "admin" || role === "super admin";

    if (isLoggedIn) {
        return (
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                <button
                    onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
                    style={{
                        padding: "8px 20px",
                        background: "linear-gradient(135deg, #0d6e4e, #22c55e)",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 8px rgba(13,110,78,0.25)",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="9" rx="1" />
                        <rect x="14" y="3" width="7" height="5" rx="1" />
                        <rect x="14" y="12" width="7" height="9" rx="1" />
                        <rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                    {isAdmin ? "Admin Dashboard" : "Dashboard"}
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                style={{ fontSize: 14, color: theme.textMuted, textDecoration: "none", fontWeight: 500 }}
            >
                Đăng nhập
            </a>
            <button
                onClick={() => navigate("/register")}
                style={{
                    padding: "8px 20px",
                    background: theme.green,
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                Đăng ký
            </button>
        </div>
    );
}
