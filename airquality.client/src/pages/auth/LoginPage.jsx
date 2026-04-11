import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
    AuthLayout,
    LogoSmall,
    InputField,
    GreenButton,
    Divider,
    SocialButton,
    Icons,
    theme,
} from "./authShared";

// ─── Left panel content ───────────────────────────────────────────────────────
function LeftContent() {
    return (
        <>
            {/* Tagline */}
            <h1
                style={{
                    color: "white",
                    fontSize: 38,
                    fontWeight: 800,
                    lineHeight: 1.22,
                    margin: "0 0 18px",
                    letterSpacing: "-0.5px",
                }}
            >
                Hít thở tương lai xanh cùng EcoAir VN
            </h1>

            <p
                style={{
                    color: "rgba(255,255,255,0.78)",
                    fontSize: 15,
                    lineHeight: 1.65,
                    margin: "0 0 40px",
                    maxWidth: 340,
                }}
            >
                Giám sát chất lượng không khí thông minh để bảo vệ sức khỏe gia đình
                bạn trong mọi hơi thở.
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 14, marginBottom: 0 }}>
                {[
                    {
                        icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        ),
                        value: "98%",
                        label: "Độ chính xác cao",
                    },
                    {
                        icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        ),
                        value: "Real-time",
                        label: "Cập nhật tức thì",
                    },
                ].map((stat) => (
                    <div
                        key={stat.value}
                        style={{
                            flex: 1,
                            background: "rgba(255,255,255,0.12)",
                            borderRadius: 14,
                            padding: "18px 16px",
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255,255,255,0.15)",
                        }}
                    >
                        <div style={{ marginBottom: 8 }}>{stat.icon}</div>
                        <div
                            style={{
                                color: "white",
                                fontWeight: 700,
                                fontSize: 22,
                                letterSpacing: "-0.3px",
                                marginBottom: 4,
                            }}
                        >
                            {stat.value}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const justRegistered = location.state?.registered === true;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

    // ── Validate client-side before hitting API ──
    function validate() {
        const errors = { email: "", password: "" };
        let valid = true;

        if (!email.trim()) {
            errors.email = "Vui lòng nhập địa chỉ email.";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = "Email không đúng định dạng.";
            valid = false;
        }

        if (!password) {
            errors.password = "Vui lòng nhập mật khẩu.";
            valid = false;
        }

        setFieldErrors(errors);
        return valid;
    }

    // ── Submit login ──
    async function handleLogin() {
        setError("");
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || "Đăng nhập thất bại. Vui lòng thử lại.");
                return;
            }

            // Lưu token vào localStorage
            if (result.accessToken) {
                localStorage.setItem("accessToken", result.accessToken);
                localStorage.setItem("role", result.role ?? "");
                // Lưu tên hiển thị (nếu API trả về)
                localStorage.setItem("userName", result.fullName ?? result.userName ?? result.FullName ?? email.split("@")[0]);
            }

            // Điều hướng: admin → /dashboard, user → /dashboard (nếu có), còn lại → /
            const role = result.role?.toLowerCase() ?? "";
            if (role === "admin" || role === "super admin") {
                navigate("/dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch {
            setError("Không kết nối được tới máy chủ. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }

    // ── Enter key support ──
    function handleKeyDown(e) {
        if (e.key === "Enter") handleLogin();
    }

    // ── Right panel (form) ──
    const rightContent = (
        <>
            <LogoSmall />

            <h2
                style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: theme.gray700,
                    margin: "0 0 6px",
                }}
            >
                Chào mừng trở lại!
            </h2>
            <p
                style={{
                    fontSize: 14,
                    color: theme.gray400,
                    margin: "0 0 28px",
                    lineHeight: 1.6,
                }}
            >
                Đăng nhập để theo dõi chất lượng không khí của bạn.
            </p>

            {/* Success banner after registration */}
            {justRegistered && (
                <div
                    style={{
                        background: "#f0fdf4",
                        border: "1.5px solid #bbf7d0",
                        borderRadius: 10,
                        padding: "10px 14px",
                        marginBottom: 18,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span style={{ fontSize: 13, color: "#15803d", fontWeight: 500 }}>
                        Đăng ký thành công! Hãy đăng nhập để tiếp tục.
                    </span>
                </div>
            )}

            {/* Global error alert */}
            {error && (
                <div
                    style={{
                        background: "#fef2f2",
                        border: "1.5px solid #fecaca",
                        borderRadius: 10,
                        padding: "10px 14px",
                        marginBottom: 18,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.red} strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span style={{ fontSize: 13, color: theme.red }}>{error}</span>
                </div>
            )}

            {/* Email */}
            <InputField
                label="Địa chỉ Email"
                type="email"
                placeholder="ví dụ: nguyenvan@email.com"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                error={fieldErrors.email}
                onKeyDown={handleKeyDown}
            />

            {/* Password */}
            <div style={{ position: "relative", marginBottom: 0 }}>
                {/* Label row with "Quên mật khẩu?" */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                    }}
                >
                    <label
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: theme.gray700,
                        }}
                    >
                        Mật khẩu
                    </label>
                    <Link
                        to="/forgot-password"
                        style={{
                            fontSize: 13,
                            color: theme.green2,
                            textDecoration: "none",
                            fontWeight: 500,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                {/* Password input using InputField without its own label */}
                <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password)
                            setFieldErrors((p) => ({ ...p, password: "" }));
                    }}
                    error={fieldErrors.password}
                    onKeyDown={handleKeyDown}
                    rightElement={
                        <span
                            onClick={() => setShowPassword((s) => !s)}
                            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                            {showPassword ? Icons.eyeOff : Icons.eyeOn}
                        </span>
                    }
                />
            </div>

            {/* Submit */}
            <div style={{ marginTop: 8 }}>
                <GreenButton onClick={handleLogin} loading={loading}>
                    Đăng nhập
                </GreenButton>
            </div>

            {/* Divider */}
            <Divider text="Hoặc tiếp tục với" />

            {/* Social buttons */}
            <div style={{ display: "flex", gap: 12 }}>
                <SocialButton label="Google" onClick={() => { }}>
                    {Icons.google}
                </SocialButton>
                <SocialButton label="Facebook" onClick={() => { }}>
                    {Icons.facebook}
                </SocialButton>
            </div>

            {/* Register link */}
            <p
                style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: theme.gray400,
                    marginTop: 24,
                    marginBottom: 20,
                }}
            >
                Bạn chưa có tài khoản?{" "}
                <Link
                    to="/register"
                    style={{
                        color: theme.green1,
                        fontWeight: 600,
                        textDecoration: "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                    Đăng ký ngay miễn phí
                </Link>
            </p>

            {/* Bottom tip */}
            <div
                style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 12,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                }}
            >
                <div style={{ flexShrink: 0, marginTop: 1 }}>
                    {Icons.leaf(theme.green2)}
                </div>
                <p
                    style={{
                        fontSize: 12.5,
                        color: theme.gray600,
                        lineHeight: 1.6,
                        margin: 0,
                    }}
                >
                    "Không khí rất tốt, hãy mở cửa sổ đón gió sau khi đăng nhập và kiểm
                    tra chỉ số khu vực của bạn."
                </p>
            </div>
        </>
    );

    return <AuthLayout leftContent={<LeftContent />} rightContent={rightContent} />;
}
