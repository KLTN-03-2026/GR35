import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const STATUS_LABELS = {
    Pending: "Đang chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Từ chối",
};

const STATUS_STYLE = {
    Pending: { bg: "rgba(234,179,8,0.18)", color: "#facc15" },
    Approved: { bg: "rgba(34,197,94,0.18)", color: "#4ade80" },
    Rejected: { bg: "rgba(239,68,68,0.18)", color: "#f87171" },
};

const pageWrap = {
    color: "#e8edf3",
    fontFamily: "'Be Vietnam Pro','Segoe UI',sans-serif",
};

const card = {
    background: "#14202e",
    border: "1px solid #1e3048",
    borderRadius: 12,
};

function StatusBadge({ status }) {
    const style = STATUS_STYLE[status] || STATUS_STYLE.Pending;
    return (
        <span
            style={{
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: style.bg,
                color: style.color,
            }}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function StatCard({ title, value, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                ...card,
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                cursor: "pointer",
                background: active ? "rgba(34,197,94,0.15)" : card.background,
                borderColor: active ? "#22c55e" : "#1e3048",
            }}
        >
            <div style={{ fontSize: 12, color: "#7a8da0", marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
        </button>
    );
}

export default function DuyetBaoCaoDiemNongCongDong() {
    const { accessToken } = useAuth();
    const [statusFilter, setStatusFilter] = useState("All");
    const [keyword, setKeyword] = useState("");
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [reports, setReports] = useState([]);
    const [summary, setSummary] = useState({ Total: 0, Pending: 0, Approved: 0, Rejected: 0 });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0, pageSize: 20 });

    const normalizeSummary = (raw) => ({
        Total: Number(raw?.total ?? raw?.Total ?? 0),
        Pending: Number(raw?.pending ?? raw?.Pending ?? 0),
        Approved: Number(raw?.approved ?? raw?.Approved ?? 0),
        Rejected: Number(raw?.rejected ?? raw?.Rejected ?? 0),
    });

    const normalizePagination = (raw) => ({
        page: Number(raw?.page ?? 1),
        totalPages: Number(raw?.totalPages ?? 1),
        totalCount: Number(raw?.totalCount ?? 0),
        pageSize: Number(raw?.pageSize ?? 20),
    });

    const fetchReports = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        setError("");

        const query = new URLSearchParams({
            page: String(page),
            pageSize: "10",
        });

        if (statusFilter !== "All") query.set("status", statusFilter);
        if (keyword.trim()) query.set("q", keyword.trim());

        try {
            const response = await fetch(`/api/community-reports/admin?${query.toString()}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || "Không thể tải danh sách báo cáo.");
            }

            setReports(data?.reports ?? data?.Reports ?? []);
            setSummary(normalizeSummary(data?.summary ?? data?.Summary));
            setPagination(normalizePagination(data?.pagination ?? data?.Pagination));
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    }, [accessToken, keyword, page, statusFilter]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const updateStatus = async (reportId, status) => {
        if (!accessToken) return;
        let rejectReason = "";
        if (status === "Rejected") {
            const input = window.prompt("Nhập lý do từ chối báo cáo:");
            if (input === null) return;
            rejectReason = input.trim();
            if (!rejectReason) {
                setError("Bạn cần nhập lý do từ chối.");
                return;
            }
        }

        setUpdatingId(reportId);
        setError("");
        try {
            const response = await fetch(`/api/community-reports/${reportId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ status, rejectReason }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || "Không thể cập nhật trạng thái báo cáo.");
            }
            await fetchReports();
        } catch (err) {
            setError(err.message || "Cập nhật thất bại.");
        } finally {
            setUpdatingId(null);
        }
    };

    const canPrev = pagination.page > 1;
    const canNext = pagination.page < pagination.totalPages;
    const titleFilter = useMemo(() => {
        if (statusFilter === "All") return "Tất cả báo cáo";
        return STATUS_LABELS[statusFilter] ?? "Danh sách báo cáo";
    }, [statusFilter]);

    return (
        <div style={pageWrap}>
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#7a8da0", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                    Duyệt báo cáo cộng đồng
                </div>
                <h1 style={{ margin: 0, fontSize: 28 }}>Kiểm duyệt báo cáo người dùng</h1>
                <p style={{ margin: "8px 0 0", color: "#93a4b8" }}>
                    Role Admin có thể duyệt hoặc từ chối báo cáo trước khi hiển thị trên bản đồ cộng đồng.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 16 }}>
                <StatCard title="Tổng báo cáo" value={summary.Total} active={statusFilter === "All"} onClick={() => { setStatusFilter("All"); setPage(1); }} />
                <StatCard title="Chờ duyệt" value={summary.Pending} active={statusFilter === "Pending"} onClick={() => { setStatusFilter("Pending"); setPage(1); }} />
                <StatCard title="Đã duyệt" value={summary.Approved} active={statusFilter === "Approved"} onClick={() => { setStatusFilter("Approved"); setPage(1); }} />
                <StatCard title="Từ chối" value={summary.Rejected} active={statusFilter === "Rejected"} onClick={() => { setStatusFilter("Rejected"); setPage(1); }} />
            </div>

            <div style={{ ...card, padding: 14, marginBottom: 12, display: "flex", gap: 10 }}>
                <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setKeyword(searchText);
                            setPage(1);
                        }
                    }}
                    placeholder="Tìm theo mô tả, tên người báo cáo, email..."
                    style={{
                        flex: 1,
                        height: 42,
                        borderRadius: 8,
                        border: "1px solid #1e3048",
                        background: "#0f1923",
                        color: "#e8edf3",
                        padding: "0 12px",
                    }}
                />
                <button
                    type="button"
                    onClick={() => { setKeyword(searchText); setPage(1); }}
                    style={{
                        height: 42,
                        borderRadius: 8,
                        border: "none",
                        background: "#22c55e",
                        color: "#0b1219",
                        fontWeight: 700,
                        padding: "0 16px",
                        cursor: "pointer",
                    }}
                >
                    Tìm kiếm
                </button>
            </div>

            <div style={{ ...card, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e3048", color: "#93a4b8", fontSize: 13 }}>
                    {titleFilter} - {pagination.totalCount} kết quả
                </div>

                {error ? (
                    <div style={{ padding: 16, color: "#fda4af" }}>{error}</div>
                ) : loading ? (
                    <div style={{ padding: 16 }}>Đang tải dữ liệu...</div>
                ) : reports.length === 0 ? (
                    <div style={{ padding: 16, color: "#93a4b8" }}>Không có báo cáo phù hợp bộ lọc.</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {reports.map((r) => (
                            <div
                                key={r.reportId}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "88px 1.2fr 1.3fr 0.7fr 0.9fr",
                                    gap: 12,
                                    padding: 14,
                                    alignItems: "center",
                                    borderTop: "1px solid #1e3048",
                                }}
                            >
                                <div>
                                    {r.imageUrl ? (
                                        <img src={r.imageUrl} alt="report" style={{ width: 74, height: 54, objectFit: "cover", borderRadius: 6 }} />
                                    ) : (
                                        <div style={{ width: 74, height: 54, borderRadius: 6, background: "#0f1923", border: "1px solid #1e3048" }} />
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{r.reporterName}</div>
                                    <div style={{ fontSize: 12, color: "#93a4b8" }}>{r.reporterEmail}</div>
                                    <div style={{ fontSize: 12, color: "#7a8da0", marginTop: 4 }}>
                                        #{r.reportId} - {new Date(r.reportTime).toLocaleString("vi-VN")}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, color: "#e8edf3", marginBottom: 4 }}>{r.description}</div>
                                    <div style={{ fontSize: 12, color: "#7a8da0" }}>
                                        ({Number(r.latitude).toFixed(5)}, {Number(r.longitude).toFixed(5)})
                                    </div>
                                    {r.status === "Rejected" && r.rejectReason ? (
                                        <div style={{ fontSize: 12, color: "#fda4af", marginTop: 6 }}>
                                            Lý do từ chối: {r.rejectReason}
                                        </div>
                                    ) : null}
                                </div>
                                <div><StatusBadge status={r.status} /></div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        type="button"
                                        disabled={updatingId === r.reportId || r.status !== "Pending"}
                                        onClick={() => updateStatus(r.reportId, "Approved")}
                                        style={{
                                            border: "none",
                                            borderRadius: 8,
                                            padding: "8px 10px",
                                            background: "#22c55e",
                                            color: "#052e16",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            opacity: updatingId === r.reportId || r.status !== "Pending" ? 0.5 : 1,
                                        }}
                                    >
                                        Duyệt
                                    </button>
                                    <button
                                        type="button"
                                        disabled={updatingId === r.reportId || r.status !== "Pending"}
                                        onClick={() => updateStatus(r.reportId, "Rejected")}
                                        style={{
                                            border: "none",
                                            borderRadius: 8,
                                            padding: "8px 10px",
                                            background: "#ef4444",
                                            color: "#fff",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            opacity: updatingId === r.reportId || r.status !== "Pending" ? 0.5 : 1,
                                        }}
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ borderTop: "1px solid #1e3048", padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: "#93a4b8", fontSize: 12 }}>
                        Trang {pagination.page}/{Math.max(1, pagination.totalPages)}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            type="button"
                            disabled={!canPrev}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            style={{
                                border: "1px solid #1e3048",
                                borderRadius: 8,
                                background: "#0f1923",
                                color: "#e8edf3",
                                padding: "8px 12px",
                                cursor: "pointer",
                                opacity: canPrev ? 1 : 0.5,
                            }}
                        >
                            Trước
                        </button>
                        <button
                            type="button"
                            disabled={!canNext}
                            onClick={() => setPage((p) => p + 1)}
                            style={{
                                border: "1px solid #1e3048",
                                borderRadius: 8,
                                background: "#0f1923",
                                color: "#e8edf3",
                                padding: "8px 12px",
                                cursor: "pointer",
                                opacity: canNext ? 1 : 0.5,
                            }}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
