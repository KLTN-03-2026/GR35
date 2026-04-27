import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const C = {
    green: "#0d6e4e",
    greenLight: "#10b981",
    greenBg: "#f0fdf4",
    greenDeep: "#064e3b",
    text: "#1f2937",
    textMuted: "#4b5563",
    textLight: "#9ca3af",
    border: "#e5e7eb",
    bg: "#f9fafb",
    white: "#ffffff",
    cardBg: "#f8fafc", // A very light blue-gray for form bg
};

export default function ReportTab() {
    const { accessToken } = useAuth();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [location, setLocation] = useState({ lat: null, lng: null, address: "Đang chờ lấy vị trí..." });
    const [description, setDescription] = useState("");
    const [reportType, setReportType] = useState("Cháy nổ / Khói bụi");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recentReports, setRecentReports] = useState([]);

    const fileInputRef = useRef(null);

    // Fetch recent reports
    useEffect(() => {
        fetchRecentReports();
    }, [accessToken]);

    const fetchRecentReports = async () => {
        if (!accessToken) return;
        try {
            const res = await fetch("/api/community-reports/my-reports", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setRecentReports(data);
            }
        } catch (e) {
            console.error("Lỗi lấy báo cáo:", e);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const getLocation = () => {
        setLocation({ ...location, address: "Đang lấy vị trí..." });
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // Simple reverse geocoding via OpenStreetMap (Nominatim)
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await res.json();
                        setLocation({ lat, lng, address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
                    } catch {
                        setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
                    }
                },
                (error) => {
                    alert("Không thể lấy vị trí: " + error.message);
                    setLocation({ lat: null, lng: null, address: "Chưa có vị trí" });
                }
            );
        } else {
            alert("Trình duyệt không hỗ trợ Geolocation.");
            setLocation({ lat: null, lng: null, address: "Không hỗ trợ vị trí" });
        }
    };

    const handleSubmit = async () => {
        if (!accessToken) return;
        if (!description) return alert("Vui lòng nhập mô tả.");
        if (!location.lat || !location.lng) return alert("Vui lòng lấy vị trí hiện tại.");

        setIsSubmitting(true);
        const formData = new FormData();
        if (image) formData.append("image", image);
        formData.append("latitude", location.lat);
        formData.append("longitude", location.lng);
        formData.append("description", description);
        formData.append("reportType", reportType);

        try {
            const res = await fetch("/api/community-reports", {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

            if (res.ok) {
                alert("Báo cáo đã được gửi thành công!");
                setDescription("");
                setImage(null);
                setImagePreview("");
                setReportType("Cháy nổ / Khói bụi");
                setLocation({ lat: null, lng: null, address: "Đang chờ lấy vị trí..." });
                fetchRecentReports();
            } else {
                const err = await res.json();
                alert(err.message || "Gặp lỗi khi gửi báo cáo.");
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: "flex", gap: 30, fontFamily: "'Be Vietnam Pro', sans-serif" }}>

            {/* LEFT: MAIN FORM */}
            <div style={{ flex: 1 }}>
                <h1 style={{ margin: "0 0 8px 0", fontSize: 32, fontWeight: 800, color: C.greenDeep, lineHeight: 1.2 }}>
                    Báo cáo điểm nóng ô nhiễm
                </h1>
                <p style={{ margin: "0 0 30px 0", fontSize: 15, color: C.textMuted, lineHeight: 1.6, maxWidth: 500 }}>
                    Giúp cộng đồng nhận biết các nguồn phát thải thực tế. Mọi đóng góp của bạn đều giúp bản đồ không khí minh bạch hơn.
                </p>

                <div style={{ background: C.white, borderRadius: 16, padding: "30px 30px 20px 30px", border: `1px solid ${C.border}` }}>

                    {/* Image Upload */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
                            Hình ảnh
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                background: C.cardBg, border: `1.5px dashed #cbd5e1`, borderRadius: 12,
                                padding: "40px 20px", textAlign: "center", cursor: "pointer",
                                transition: "all 0.2s", position: "relative", overflow: "hidden"
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = C.greenLight}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
                            ) : (
                                <>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 24, background: C.white,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        margin: "0 auto 16px auto", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                                    }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Kéo thả hoặc nhấp để tải ảnh lên</div>
                                    <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>Hỗ trợ JPG, PNG (Tối đa 10MB)</div>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* Location */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            background: C.cardBg, borderRadius: 12, padding: "16px 20px",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            border: `1px solid ${C.border}`
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 20, background: "#d1fae5",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Vị trí hiện tại</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {location.address}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={getLocation}
                                style={{
                                    background: C.white, border: `1px solid ${C.border}`, borderRadius: 30,
                                    padding: "8px 16px", fontSize: 12, fontWeight: 600, color: C.greenDeep,
                                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                                onMouseLeave={e => e.currentTarget.style.background = C.white}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                Lấy tọa độ GPS hiện tại
                            </button>
                        </div>
                    </div>

                    {/* Report Type */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
                            Phân loại
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            style={{
                                width: "100%", background: C.cardBg, border: `1px solid ${C.border}`,
                                borderRadius: 12, padding: "12px 16px", fontSize: 14, color: C.text,
                                outline: "none", fontFamily: "inherit", appearance: "none"
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = C.greenLight}
                            onBlur={e => e.currentTarget.style.borderColor = C.border}
                        >
                            <option value="Cháy nổ / Khói bụi">Cháy nổ / Khói bụi (Ẩn sau 2 giờ)</option>
                            <option value="Mùi hôi / Đốt rác">Mùi hôi / Đốt rác (Ẩn sau 6 giờ)</option>
                            <option value="Xả thải công nghiệp">Xả thải công nghiệp (Ẩn sau 24 giờ)</option>
                            <option value="Khác">Khác (Ẩn sau 12 giờ)</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 30 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
                            Mô tả tình trạng
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ví dụ: Phát hiện khói đen từ ống xả nhà máy, mùi khét nồng nặc khu vực cầu vượt..."
                            style={{
                                width: "100%", height: 120, background: C.cardBg, border: `1px solid ${C.border}`,
                                borderRadius: 12, padding: 16, fontSize: 14, color: C.text, resize: "none",
                                outline: "none", fontFamily: "inherit"
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = C.greenLight}
                            onBlur={e => e.currentTarget.style.borderColor = C.border}
                        />
                    </div>

                    {/* Submit Button */}
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                padding: "16px 32px", background: C.greenLight, color: C.white, border: "none",
                                borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: isSubmitting ? "wait" : "pointer",
                                transition: "background 0.2s", opacity: isSubmitting ? 0.7 : 1
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = C.green}
                            onMouseLeave={e => e.currentTarget.style.background = C.greenLight}
                        >
                            {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                        </button>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 11, color: C.textLight, marginTop: 12, fontStyle: "italic" }}>
                        Báo cáo của bạn sẽ được đội ngũ EcoAir VN xác minh trong vòng 15-30 phút.
                    </div>
                </div>
            </div>

            {/* RIGHT: SIDEBAR */}
            <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 24, alignSelf: "flex-start" }}>

                {/* Guide Card */}
                <div style={{ background: C.greenDeep, borderRadius: 16, padding: 24, color: C.white }}>
                    <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 700 }}>Hướng dẫn báo cáo nhanh</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {[
                            { step: "01", title: "Chụp ảnh rõ nét", desc: "Đảm bảo thấy rõ nguồn phát thải hoặc màu sắc bầu trời." },
                            { step: "02", title: "Xác nhận vị trí", desc: "Sử dụng GPS để chúng tôi khoanh vùng chính xác điểm nóng." },
                            { step: "03", title: "Gửi & Theo dõi", desc: "Nhận thông báo khi báo cáo được duyệt và đưa lên bản đồ." }
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 12 }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,0.2)", lineHeight: 1 }}>
                                    {item.step}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div style={{ background: C.cardBg, borderRadius: 16, padding: "20px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                        HOẠT ĐỘNG GẦN ĐÂY
                    </div>

                    {recentReports.length === 0 ? (
                        <div style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "20px 0" }}>Chưa có báo cáo nào.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {recentReports.slice(0, 3).map((r, i) => (
                                <div key={i} style={{ background: C.white, borderRadius: 10, padding: 12, display: "flex", alignItems: "center", gap: 12, border: `1px solid ${C.border}` }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", background: C.bg }}>
                                        {r.imageUrl ? (
                                            <img src={r.imageUrl} alt="report" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.textLight }}>?</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, overflow: "hidden" }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: C.greenDeep, marginBottom: 2 }}>
                                            {r.reportType || "Khác"}
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                            {r.description}
                                        </div>
                                        <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
                                            {new Date(r.reportTime).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                        {r.status === "Rejected" && r.rejectReason ? (
                                            <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 4, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                                                Lý do: {r.rejectReason}
                                            </div>
                                        ) : null}
                                    </div>
                                    {r.status === "Approved" ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : r.status === "Rejected" ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Security Badge */}
                <div style={{ background: C.cardBg, borderRadius: 16, padding: "16px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 18, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.greenLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>
                        Dữ liệu của bạn được bảo mật và mã hóa theo tiêu chuẩn an toàn cộng đồng của EcoAir VN.
                    </div>
                </div>

            </div>
        </div>
    );
}
