import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    AuthLayout,
    LogoSmall,
    InputField,
    GreenButton,
    Icons,
    theme,
} from "./authShared";

// ─── Left panel ───────────────────────────────────────────────────────────────
function LeftContent() {
    return (
        <div style={{ textAlign: "center" }}>
            {/* Leaf icon */}
            <div
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 28px",
                    border: "2px solid rgba(255,255,255,0.25)",
                }}
            >
                {Icons.leaf("white")}
            </div>

            <h2
                style={{
                    color: "white",
                    fontSize: 32,
                    fontWeight: 800,
                    margin: "0 0 16px",
                    letterSpacing: "-0.4px",
                }}
            >
                EcoAir VN
            </h2>

            <p
                style={{
                    color: "rgba(255,255,255,0.80)",
                    fontSize: 15,
                    lineHeight: 1.65,
                    margin: "0 auto 48px",
                    maxWidth: 280,
                    textAlign: "center",
                }}
            >
                Kiến tạo môi trường sống trong lành qua từng hơi thở với công nghệ giám
                sát không khí thông minh.
            </p>

            {/* Stat cards */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                {[
                    {
                        icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
                            </svg>
                        ),
                    },
                    {
                        icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M18 10a6 6 0 00-11.9-1A4 4 0 006 17h12a4 4 0 000-8z" />
                            </svg>
                        ),
                    },
                    {
                        icon: (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        ),
                    },
                ].map((s, i) => (
                    <div
                        key={i}
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            background: "rgba(255,255,255,0.13)",
                            border: "1px solid rgba(255,255,255,0.18)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {s.icon}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Register Page ────────────────────────────────────────────────────────────
export default function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    function set(field, value) {
        setForm((p) => ({ ...p, [field]: value }));
        setFieldErrors((p) => ({ ...p, [field]: "" }));
        setError("");
    }

    function validate() {
        const errs = {};
        if (!form.userName.trim()) errs.userName = "Vui lòng nhập họ và tên.";
        if (!form.email.trim()) {
            errs.email = "Vui lòng nhập địa chỉ email.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errs.email = "Email không đúng định dạng.";
        }
        if (!form.password) {
            errs.password = "Vui lòng nhập mật khẩu.";
        } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.password)) {
            errs.password = "Tối thiểu 8 ký tự, gồm chữ, số và ký tự đặc biệt.";
        }
        if (!form.confirmPassword) {
            errs.confirmPassword = "Vui lòng xác nhận mật khẩu.";
        } else if (form.password !== form.confirmPassword) {
            errs.confirmPassword = "Mật khẩu xác nhận không khớp.";
        }
        if (!agreed) errs.agreed = "Bạn cần đồng ý với điều khoản dịch vụ.";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleRegister() {
        setError("");
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userName: form.userName.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
                return;
            }

            // Đăng ký thành công → chuyển về trang đăng nhập
            navigate("/login", { state: { registered: true } });
        } catch {
            setError("Không kết nối được tới máy chủ. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleRegister();
    }

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
                Tạo tài khoản mới
            </h2>
            <p
                style={{
                    fontSize: 14,
                    color: theme.gray400,
                    margin: "0 0 28px",
                    lineHeight: 1.6,
                }}
            >
                Tham gia cùng cộng đồng bảo vệ sức khỏe EcoAir VN.
            </p>

            {/* Global error */}
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

            {/* Họ và tên */}
            <InputField
                label="Họ và Tên"
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.userName}
                onChange={(e) => set("userName", e.target.value)}
                onKeyDown={handleKeyDown}
                error={fieldErrors.userName}
                icon={Icons.user}
            />

            {/* Email */}
            <InputField
                label="Địa chỉ Email"
                type="email"
                placeholder="email@vi-du.vn"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onKeyDown={handleKeyDown}
                error={fieldErrors.email}
                icon={Icons.email}
            />

            {/* Mật khẩu */}
            <InputField
                label="Mật khẩu"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onKeyDown={handleKeyDown}
                error={fieldErrors.password}
                icon={Icons.lock}
                rightElement={
                    <span
                        onClick={() => setShowPass((s) => !s)}
                        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    >
                        {showPass ? Icons.eyeOff : Icons.eyeOn}
                    </span>
                }
            />

            {/* Xác nhận mật khẩu */}
            <InputField
                label="Xác nhận mật khẩu"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                onKeyDown={handleKeyDown}
                error={fieldErrors.confirmPassword}
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                }
                rightElement={
                    <span
                        onClick={() => setShowConfirm((s) => !s)}
                        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    >
                        {showConfirm ? Icons.eyeOff : Icons.eyeOn}
                    </span>
                }
            />

            {/* Terms checkbox */}
            <div style={{ marginBottom: fieldErrors.agreed ? 4 : 20 }}>
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => {
                            setAgreed(e.target.checked);
                            setFieldErrors((p) => ({ ...p, agreed: "" }));
                        }}
                        style={{
                            width: 16,
                            height: 16,
                            marginTop: 2,
                            accentColor: theme.green1,
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    />
                    <span style={{ fontSize: 13, color: theme.gray600, lineHeight: 1.55 }}>
                        Tôi đồng ý với{" "}
                        <a
                            href="#"
                            style={{ color: theme.green1, fontWeight: 600, textDecoration: "none" }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                            Điều khoản dịch vụ
                        </a>{" "}
                        &amp;{" "}
                        <a
                            href="#"
                            style={{ color: theme.green1, fontWeight: 600, textDecoration: "none" }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                            Chính sách bảo mật
                        </a>
                    </span>
                </label>
                {fieldErrors.agreed && (
                    <p style={{ fontSize: 12, color: theme.red, margin: "4px 0 0 26px" }}>
                        {fieldErrors.agreed}
                    </p>
                )}
            </div>

            {/* Submit */}
            <GreenButton
                onClick={handleRegister}
                loading={loading}
                style={{ marginTop: fieldErrors.agreed ? 16 : 0 }}
            >
                Đăng ký →
            </GreenButton>

            {/* Login link */}
            <p
                style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: theme.gray400,
                    marginTop: 22,
                    marginBottom: 0,
                }}
            >
                Đã có tài khoản?{" "}
                <Link
                    to="/login"
                    style={{
                        color: theme.green1,
                        fontWeight: 600,
                        textDecoration: "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                    Đăng nhập ↩
                </Link>
            </p>
        </>
    );

    return <AuthLayout leftContent={<LeftContent />} rightContent={rightContent} />;
}
