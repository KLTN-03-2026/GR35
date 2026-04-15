import { Link } from "react-router-dom";
import { theme, Icons } from "./authShared";

export default function NotFoundPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 100%)",
                padding: 24,
                fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 560,
                    background: "white",
                    border: "1px solid #dcfce7",
                    borderRadius: 16,
                    padding: "36px 28px",
                    boxShadow: "0 16px 40px rgba(6, 78, 46, 0.08)",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        margin: "0 auto 14px",
                        background: "linear-gradient(135deg,#16a34a,#4ade80)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {Icons.leaf()}
                </div>

                <p
                    style={{
                        margin: "0 0 4px",
                        fontSize: 56,
                        lineHeight: 1,
                        fontWeight: 800,
                        color: theme.green1,
                        letterSpacing: "-1px",
                    }}
                >
                    404
                </p>

                <h1
                    style={{
                        margin: "0 0 10px",
                        fontSize: 24,
                        fontWeight: 700,
                        color: theme.gray700,
                    }}
                >
                    Không tìm thấy trang
                </h1>

                <p
                    style={{
                        margin: "0 auto 22px",
                        maxWidth: 420,
                        fontSize: 14,
                        color: theme.gray600,
                        lineHeight: 1.7,
                    }}
                >
                    Đường dẫn bạn truy cập không tồn tại hoặc bạn không có quyền xem nội dung này.
                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 10,
                        flexWrap: "wrap",
                    }}
                >
                    <Link
                        to="/"
                        style={{
                            textDecoration: "none",
                            background: "linear-gradient(135deg,#16a34a,#22c55e)",
                            color: "white",
                            borderRadius: 10,
                            padding: "10px 14px",
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    >
                        Về trang chủ
                    </Link>                 
                </div>
            </div>
        </div>
    );
}
