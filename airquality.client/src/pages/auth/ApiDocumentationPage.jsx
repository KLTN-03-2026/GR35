import MainLayout from "../../components/layout/MainLayout";

const C = {
    text: "#1a2e1a",
    textMuted: "#5a6e5a",
    border: "#e5e7eb",
    bg: "#f8fafc",
    white: "#ffffff",
    green: "#0d6e4e",
    codeBg: "#0b1020",
    codeText: "#e2e8f0",
};

function DocCard({ title, children }) {
    return (
        <section style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
            <h3 style={{ margin: "0 0 10px", color: C.text }}>{title}</h3>
            {children}
        </section>
    );
}

function EndpointTable({ rows }) {
    return (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}` }}>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12 }}>Method</th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12 }}>Endpoint</th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12 }}>Mô tả</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.endpoint} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: "10px 12px", fontSize: 12.5, fontWeight: 700, color: C.green }}>{row.method}</td>
                            <td style={{ padding: "10px 12px", fontSize: 12.5 }}><code>{row.endpoint}</code></td>
                            <td style={{ padding: "10px 12px", fontSize: 12.5, color: C.textMuted }}>{row.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CodeBlock({ children }) {
    return (
        <pre style={{ margin: 0, background: C.codeBg, color: C.codeText, padding: 12, borderRadius: 10, overflowX: "auto", fontSize: 12.5 }}>
            {children}
        </pre>
    );
}

export default function ApiDocumentationPage() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <MainLayout activePage="API Docs">
            <div style={{ background: C.bg, minHeight: "100vh", padding: "96px 20px 40px" }}>
                <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <h1 style={{ margin: 0, color: C.text, fontSize: 30 }}>Tài liệu API dữ liệu không khí</h1>
                        <p style={{ margin: "8px 0 0", color: C.textMuted, fontSize: 14 }}>
                            Hướng dẫn chi tiết lấy dữ liệu theo tỉnh/thành phố, trạm quan trắc và tọa độ từ EcoAir VN.
                        </p>
                    </div>

                    <DocCard title="1) Xác thực & tạo API Key">
                        <ol style={{ margin: 0, paddingLeft: 18, color: C.textMuted, lineHeight: 1.8, fontSize: 14 }}>
                            <li>Đăng nhập vào tài khoản của bạn.</li>
                            <li>Vào `Dashboard` → tab `API Key`.</li>
                            <li>Nhập tên project, thời hạn key và bấm `Create an API key`.</li>
                        </ol>
                        <div style={{ marginTop: 10, fontSize: 13, color: C.textMuted }}>
                            Header bắt buộc cho nhóm API Public Data:
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <CodeBlock>{`X-API-Key: <your_api_key>`}</CodeBlock>
                        </div>
                    </DocCard>

                    <DocCard title="2) Danh sách endpoint theo nhóm">
                        <div style={{ marginBottom: 10, fontSize: 13, color: C.textMuted }}>
                            Nhóm dữ liệu bằng API Key:
                        </div>
                        <EndpointTable
                            rows={[
                                { method: "GET", endpoint: "/api/public-data/cities", desc: "Danh sách tỉnh/thành phố kèm AQI mới nhất." },
                                { method: "GET", endpoint: "/api/public-data/stations?limit=200", desc: "Danh sách trạm quan trắc kèm AQI mới nhất." },
                            ]}
                        />

                        <div style={{ margin: "14px 0 10px", fontSize: 13, color: C.textMuted }}>
                            Nhóm endpoint website (không cần API Key):
                        </div>
                        <EndpointTable
                            rows={[
                                { method: "GET", endpoint: "/api/city", desc: "Tất cả tỉnh/thành phố + snapshot mới nhất." },
                                { method: "GET", endpoint: "/api/city/{slug}", desc: "Chi tiết một tỉnh/thành phố." },
                                { method: "GET", endpoint: "/api/city/{slug}/history?hours=24", desc: "Lịch sử theo giờ của một tỉnh/thành phố." },
                                { method: "GET", endpoint: "/api/city/{slug}/stations", desc: "Các trạm thuộc tỉnh/thành phố theo slug." },
                                { method: "GET", endpoint: "/api/city/map", desc: "Dữ liệu map tỉnh/thành phố có tọa độ." },
                                { method: "GET", endpoint: "/api/city/nearest?lat=10.78&lon=106.7", desc: "Tìm tỉnh/thành phố gần nhất theo tọa độ." },
                                { method: "GET", endpoint: "/api/airquality/station/{id}", desc: "Chi tiết dữ liệu không khí của trạm." },
                                { method: "GET", endpoint: "/api/airquality/station/{id}/history?hours=24", desc: "Lịch sử theo giờ của trạm." },
                                { method: "GET", endpoint: "/api/airquality/map-stations", desc: "Dữ liệu trạm cho bản đồ (lat/lon + AQI)." },
                            ]}
                        />
                    </DocCard>

                    <DocCard title="3) Ví dụ gọi dữ liệu theo tỉnh/thành phố">
                        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>
                            <b>Danh sách tỉnh/thành phố</b>
                        </div>
                        <CodeBlock>{`curl -X GET "${baseUrl}/api/public-data/cities" \\
  -H "X-API-Key: <your_api_key>"`}</CodeBlock>

                        <div style={{ margin: "12px 0 8px", color: C.textMuted, fontSize: 13 }}>
                            <b>Chi tiết một tỉnh/thành phố theo slug</b>
                        </div>
                        <CodeBlock>{`curl -X GET "${baseUrl}/api/city/ho-chi-minh"

# Lịch sử 72 giờ
curl -X GET "${baseUrl}/api/city/ho-chi-minh/history?hours=72"`}</CodeBlock>

                        <div style={{ margin: "12px 0 8px", color: C.textMuted, fontSize: 13 }}>
                            <b>Response mẫu rút gọn</b>
                        </div>
                        <CodeBlock>{`{
  "cityId": 1,
  "provinceName": "TP. Hồ Chí Minh",
  "slug": "ho-chi-minh",
  "latitude": 10.7769,
  "longitude": 106.7009,
  "calculatedAqi": 64,
  "level": "Trung bình"
}`}</CodeBlock>
                    </DocCard>

                    <DocCard title="4) Ví dụ gọi dữ liệu theo trạm quan trắc">
                        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>
                            <b>Danh sách trạm quan trắc</b>
                        </div>
                        <CodeBlock>{`curl -X GET "${baseUrl}/api/public-data/stations?limit=200" \\
  -H "X-API-Key: <your_api_key>"`}</CodeBlock>

                        <div style={{ margin: "12px 0 8px", color: C.textMuted, fontSize: 13 }}>
                            <b>Chi tiết trạm theo ID</b>
                        </div>
                        <CodeBlock>{`curl -X GET "${baseUrl}/api/airquality/station/15"

# Lịch sử 48 giờ
curl -X GET "${baseUrl}/api/airquality/station/15/history?hours=48"`}</CodeBlock>

                        <div style={{ margin: "12px 0 8px", color: C.textMuted, fontSize: 13 }}>
                            <b>Response mẫu rút gọn</b>
                        </div>
                        <CodeBlock>{`{
  "stationId": 15,
  "stationName": "Trạm Quận 1",
  "city": "TP. Hồ Chí Minh",
  "latitude": 10.779,
  "longitude": 106.699,
  "calculatedAqi": 72,
  "pm25": 18.2,
  "temperature": 31.4
}`}</CodeBlock>
                    </DocCard>

                    <DocCard title="5) Dữ liệu theo tọa độ và bản đồ">
                        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>
                            <b>Tìm tỉnh/thành phố gần nhất từ tọa độ</b>
                        </div>
                        <CodeBlock>{`curl -X GET "${baseUrl}/api/city/nearest?lat=10.7769&lon=106.7009"`}</CodeBlock>

                        <div style={{ margin: "12px 0 8px", color: C.textMuted, fontSize: 13 }}>
                            <b>Dữ liệu map tỉnh/thành phố và trạm</b>
                        </div>
                        <CodeBlock>{`curl -X GET "${baseUrl}/api/city/map"
curl -X GET "${baseUrl}/api/airquality/map-stations?limit=500"`}</CodeBlock>
                    </DocCard>

                    <DocCard title="6) Quy ước dữ liệu AQI & gợi ý triển khai">
                        <ul style={{ margin: 0, paddingLeft: 18, color: C.textMuted, lineHeight: 1.8, fontSize: 14 }}>
                            <li>`calculatedAqi`: chỉ số AQI đã tính toán tổng hợp.</li>
                            <li>`level`: mức đánh giá (Tốt, Trung bình, Kém...).</li>
                            <li>`latitude` và `longitude`: tọa độ để hiển thị bản đồ.</li>
                            <li>Nên cache dữ liệu 1-5 phút ở backend để giảm số lượt gọi.</li>
                            <li>Không nhúng API Key trực tiếp ở frontend public.</li>
                            <li>Calls/month mặc định: <b>3,000,000</b> mỗi API key.</li>
                        </ul>
                    </DocCard>
                </div>
            </div>
        </MainLayout>
    );
}
