import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import theme from "./theme";

/**
 * Navbar dùng chung cho các trang có MainLayout.
 * Prop `activePage`: tên link đang active, mặc định "Trang chủ".
 * Tự động hiển thị nút "Dashboard" khi người dùng đã đăng nhập.
 */
export default function Navbar({ activePage = "Trang chủ" }) {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:600px)");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const navLinks = [
        { label: "Trang chủ", path: "/" },
        { label: "Dữ liệu chất lượng không khí", path: "/du-lieu" },
        { label: "Bản đồ", path: "/ban-do" },
        { label: "Liên hệ", path: "/lien-he" },
        { label: "Gói", path: "/goi" },
    ];

    const MobileDrawer = (
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} ModalProps={{ keepMounted: true }}>
            <Box style={{ width: 290, padding: "12px 10px" }}>
                <Box style={{ padding: "4px 8px 10px" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.8 }}>
                        MENU ĐIỀU HƯỚNG
                    </Typography>
                </Box>
                <Divider />
                <List>
                    {navLinks.map((item) => (
                        <ListItemButton
                            key={item.label}
                            onClick={() => {
                                navigate(item.path);
                                setDrawerOpen(false);
                            }}
                            style={{
                                minHeight: 44,
                                borderRadius: 10,
                                marginTop: 4,
                                background: activePage === item.label ? "rgba(13,110,78,0.1)" : "transparent",
                                border: activePage === item.label ? "1px solid rgba(13,110,78,0.25)" : "1px solid transparent",
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontSize: 14,
                                    fontWeight: activePage === item.label ? 700 : 500,
                                    color: activePage === item.label ? theme.green : theme.text,
                                }}
                            />
                        </ListItemButton>
                    ))}
                </List>
                <Divider sx={{ mt: 1 }} />
                <Box style={{ padding: "10px 8px 4px", fontSize: 12, color: theme.textMuted }}>
                    EcoAir VN - Không khí sạch mỗi ngày.
                </Box>
            </Box>
        </Drawer>
    );

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                background: theme.navBg,
                borderBottom: `1px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                padding: isMobile ? "0 12px" : "0 48px",
                height: 60,
                fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                gap: isMobile ? 6 : 0,
            }}
        >
            {isMobile && (
                <>
                    <IconButton
                        aria-label="open menu"
                        onClick={() => setDrawerOpen(true)}
                        style={{ width: 44, height: 44, marginRight: 8 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    {MobileDrawer}
                </>
            )}

            {/* Logo */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginRight: isMobile ? 0 : 48,
                    flex: isMobile ? 1 : "0 0 auto",
                    minWidth: 0,
                    cursor: "pointer",
                }}
                onClick={() => navigate("/")}
            >
                <img
                    src="/logoecoair.png"
                    alt="EcoAir Logo"
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        objectFit: "cover"
                    }}
                />
                <span style={{ fontWeight: 800, fontSize: isMobile ? 15 : 16, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    EcoAir VN
                </span>
            </div>

            {/* Nav links */}
            {!isMobile && <div style={{ display: "flex", gap: 32, flex: 1 }}>
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
            </div>}

            {/* Auth buttons – conditional on login state */}
            <NavAuthButtons navigate={navigate} />
        </nav>
    );
}

function NavAuthButtons({ navigate }) {
    const isMobile = useMediaQuery("(max-width:600px)");
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
                        padding: isMobile ? "8px 12px" : "8px 20px",
                        background: "linear-gradient(135deg, #0d6e4e, #22c55e)",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 8px rgba(13,110,78,0.25)",
                        minHeight: 44,
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="9" rx="1" />
                        <rect x="14" y="3" width="7" height="5" rx="1" />
                        <rect x="14" y="12" width="7" height="9" rx="1" />
                        <rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                    {isMobile ? "Dashboard" : isAdmin ? "Admin Dashboard" : "Dashboard"}
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            {!isMobile && <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                style={{ fontSize: 14, color: theme.textMuted, textDecoration: "none", fontWeight: 500 }}
            >
                Đăng nhập
            </a>}
            <button
                onClick={() => navigate(isMobile ? "/login" : "/register")}
                style={{
                    padding: isMobile ? "8px 12px" : "8px 20px",
                    background: theme.green,
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    minHeight: 44,
                    whiteSpace: "nowrap",
                }}
            >
                {isMobile ? "Đăng nhập" : "Đăng ký"}
            </button>
        </div>
    );
}
