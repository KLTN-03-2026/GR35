export default function DuyetBaoCaoDiemNongCongDong() {
    const sideItems = [
        { icon: '◫', label: 'Bảng điều khiển', active: false },
        { icon: '▣', label: 'Báo cáo', active: true },
        { icon: '◉', label: 'Người dùng', active: false },
        { icon: '◌', label: 'Trạm đo', active: false },
        { icon: '◔', label: 'Cấu hình AI', active: false },
    ];

    const reports = [
        {
            image: "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80')",
            name: 'Linh Trần',
            id: 'ID: #44921',
            location: 'Quận 1, TP.HCM',
            coords: '10.762622, 106.660172',
            type: 'Khói bụi',
            typeBg: '#fde4e1',
            typeColor: '#d35243',
            status: 'Đang chờ duyệt',
            statusColor: '#8d2452',
            statusDot: '#8d2452',
            action1: '✓',
            action2: '✕',
            action1Bg: '#0a6a1f',
            action1Color: '#fff',
            action2Bg: '#fff',
            action2Color: '#333',
        },
        {
            image: "url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=300&q=80')",
            name: 'Minh Phúc',
            id: 'ID: #44802',
            location: 'Bình Thạnh, TP.HCM',
            coords: '10.801655, 106.702315',
            type: 'Cháy nổ',
            typeBg: '#d52b1e',
            typeColor: '#fff',
            status: 'Đã duyệt',
            statusColor: '#117742',
            statusDot: '#117742',
            action1: 'Chi tiết',
            action2: '',
            action1Bg: 'transparent',
            action1Color: '#0d5f20',
            action2Bg: 'transparent',
            action2Color: 'transparent',
        },
        {
            image: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80')",
            name: 'Lan Anh',
            id: 'ID: #44773',
            location: 'TP. Thủ Đức',
            coords: '10.8231, 106.7630',
            type: 'Cơ sở hạ tầng',
            typeBg: '#8ff0b2',
            typeColor: '#0b7340',
            status: 'Từ chối',
            statusColor: '#70756b',
            statusDot: '#8e9487',
            action1: 'Đánh giá lại',
            action2: '',
            action1Bg: 'transparent',
            action1Color: '#4b4f47',
            action2Bg: 'transparent',
            action2Color: 'transparent',
        },
    ];

    const buttonReset = {
        border: 'none',
        background: 'transparent',
        padding: 0,
        margin: 0,
        font: 'inherit',
        cursor: 'pointer',
        textAlign: 'left',
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f6f6ea',
                fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                color: '#1f251f',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                body { margin: 0; }
            `}</style>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: '100vh' }}>
                <aside
                    style={{
                        background: '#f7f6ed',
                        borderRight: '1px solid #e4e5d7',
                        padding: '26px 18px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
                        <div
                            style={{
                                width: 54,
                                height: 54,
                                borderRadius: 16,
                                background: '#0e1420',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#d5a93d',
                                fontSize: 10,
                                fontWeight: 800,
                            }}
                        >
                            ECO
                        </div>
                        <div>
                            <div style={{ fontSize: 30, fontWeight: 800, color: '#0c5d23', lineHeight: 1.1 }}>EcoAir VN</div>
                            <div style={{ fontSize: 14, letterSpacing: 2.4, textTransform: 'uppercase', color: '#666d61', marginTop: 6 }}>
                                Quen trị môi trường
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sideItems.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                style={{
                                    ...buttonReset,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 18,
                                    height: 64,
                                    width: '100%',
                                    padding: '0 16px',
                                    borderLeft: item.active ? '4px solid #96f0a7' : '4px solid transparent',
                                    color: item.active ? '#0d6a26' : '#4c5870',
                                    fontSize: 20,
                                    fontWeight: item.active ? 700 : 500,
                                }}
                            >
                                <span style={{ width: 26, textAlign: 'center', fontSize: 26 }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                            type="button"
                            style={{
                                ...buttonReset,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                height: 56,
                                padding: '0 16px',
                                color: '#4d5a71',
                                fontSize: 20,
                                fontWeight: 500,
                            }}
                        >
                            <span style={{ fontSize: 26 }}>◔</span>
                            <span>Hồ sơ</span>
                        </button>
                        <button
                            type="button"
                            style={{
                                ...buttonReset,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                height: 56,
                                padding: '0 16px',
                                color: '#2f4d7e',
                                fontSize: 20,
                                fontWeight: 500,
                            }}
                        >
                            <span style={{ fontSize: 26 }}>↪</span>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </aside>

                <main style={{ minWidth: 0 }}>
                    <header
                        style={{
                            height: 84,
                            borderBottom: '1px solid #e3e4d6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 28px',
                            background: '#f8f8ef',
                        }}
                    >
                        <button
                            type="button"
                            style={{
                                ...buttonReset,
                                width: 640,
                                height: 58,
                                borderRadius: 16,
                                background: '#efefe4',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: '0 18px',
                            }}
                        >
                            <span style={{ fontSize: 30, color: '#78806f' }}>⌕</span>
                            <span style={{ fontSize: 18, color: '#9ca191' }}>Tìm kiếm sự cố, vị trí hoặc người dùng...</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
                                <button type="button" style={{ ...buttonReset, fontSize: 17, color: '#657281', fontWeight: 500 }}>
                                    Tổng quan
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        ...buttonReset,
                                        fontSize: 17,
                                        color: '#0b641f',
                                        fontWeight: 700,
                                        paddingBottom: 10,
                                        borderBottom: '4px solid #0b641f',
                                    }}
                                >
                                    Dữ liệu Vùng
                                </button>
                            </div>

                            <button type="button" style={{ ...buttonReset, position: 'relative', fontSize: 28, color: '#0f5f1d' }}>
                                🔔
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        width: 10,
                                        height: 10,
                                        background: '#95254a',
                                        borderRadius: '50%',
                                    }}
                                />
                            </button>

                            <button type="button" style={{ ...buttonReset, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0b5e1f' }}>Nguyễn Văn A</div>
                                    <div style={{ fontSize: 14, color: '#6b6f67', marginTop: 4 }}>Kiểm soát viên Cao cấp</div>
                                </div>
                                <div
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 16,
                                        background: "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80') center/cover",
                                    }}
                                />
                            </button>
                        </div>
                    </header>

                    <div style={{ padding: '18px 34px 30px' }}>
                        <div style={{ fontSize: 14, color: '#0a7b3a', fontWeight: 700, letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 14 }}>
                            Duyệt Báo cáo điểm nóng cộng đồng
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 28 }}>
                            <div style={{ maxWidth: 980 }}>
                                <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, fontWeight: 800, color: '#1f2520' }}>
                                    Quản lý Báo cáo Môi trường Cộng đồng
                                </h1>
                                <p style={{ margin: '24px 0 0', fontSize: 22, lineHeight: 1.55, color: '#4f564d' }}>
                                    Phân tích và xác thực các bất thường về môi trường do người dùng gửi. Ưu tiên các mối nguy khí
                                    quyển nghiêm trọng để đảm bảo an toàn công cộng và tính toàn vẹn của dữ liệu.
                                </p>
                            </div>

                            <div
                                style={{
                                    minWidth: 360,
                                    height: 132,
                                    background: '#f2f2e6',
                                    borderRadius: 18,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 22px',
                                }}
                            >
                                <button
                                    type="button"
                                    style={{
                                        ...buttonReset,
                                        width: 92,
                                        height: 116,
                                        borderRadius: 18,
                                        background: '#fff',
                                        color: '#0b6021',
                                        fontSize: 18,
                                        fontWeight: 700,
                                        lineHeight: 1.35,
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    Tất
                                    <br />
                                    cả
                                    <br />
                                    báo
                                    <br />
                                    cáo
                                </button>

                                <button
                                    type="button"
                                    style={{
                                        ...buttonReset,
                                        width: 90,
                                        textAlign: 'center',
                                        fontSize: 18,
                                        color: '#4d544c',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    Đang
                                    <br />
                                    chờ
                                </button>

                                <button
                                    type="button"
                                    style={{
                                        ...buttonReset,
                                        width: 50,
                                        textAlign: 'center',
                                        fontSize: 32,
                                        color: '#2b2f2b',
                                        lineHeight: 1,
                                    }}
                                >
                                    !
                                </button>

                                <button
                                    type="button"
                                    style={{
                                        ...buttonReset,
                                        width: 90,
                                        textAlign: 'center',
                                        fontSize: 18,
                                        color: '#4d544c',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    Ưu
                                    <br />
                                    tiên
                                    <br />
                                    cao
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            style={{
                                ...buttonReset,
                                width: '100%',
                                height: 144,
                                borderRadius: 18,
                                background: '#f1f1e7',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 28px',
                                marginBottom: 26,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: 76,
                                    height: 76,
                                    borderRadius: 10,
                                    background: '#94375f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: 30,
                                    flexShrink: 0,
                                }}
                            >
                                ✧
                            </div>

                            <div style={{ marginLeft: 28, textAlign: 'left', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10 }}>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: '#262b26' }}>Phát hiện Bất thường bằng AI</span>
                                    <span
                                        style={{
                                            padding: '8px 14px',
                                            background: '#8c2f56',
                                            borderRadius: 18,
                                            color: '#fff',
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        LOGIC MỚI
                                    </span>
                                </div>
                                <div style={{ maxWidth: 860, fontSize: 17, lineHeight: 1.45, color: '#555b53' }}>
                                    Dựa trên hình ảnh vệ tinh và mô hình gió lịch sử, 3 báo cáo đang chờ xử lý từ <b>Quận 7</b> có khả
                                    năng là dương tính giả do hoạt động đốt nông nghiệp có kiểm soát. Khuyến nghị xác minh.
                                </div>
                            </div>

                            <div
                                style={{
                                    position: 'absolute',
                                    right: 34,
                                    top: 18,
                                    fontSize: 82,
                                    color: '#d7c2cb',
                                    fontWeight: 300,
                                    letterSpacing: 2,
                                }}
                            >
                                RK
                            </div>
                        </button>

                        <div
                            style={{
                                background: '#f0f0e6',
                                borderRadius: 18,
                                overflow: 'hidden',
                                marginBottom: 34,
                            }}
                        >
                            <div
                                style={{
                                    height: 66,
                                    display: 'grid',
                                    gridTemplateColumns: '180px 1.1fr 1.3fr 180px 210px 170px',
                                    alignItems: 'center',
                                    padding: '0 28px',
                                    color: '#5a5f56',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    letterSpacing: 1.2,
                                    textTransform: 'uppercase',
                                }}
                            >
                                <div>Ảnh thực tế</div>
                                <div>Người báo cáo</div>
                                <div>Vị trí</div>
                                <div>Phân loại</div>
                                <div>Trạng thái</div>
                                <div style={{ textAlign: 'center' }}>Hành động</div>
                            </div>

                            <div style={{ background: '#fffefb' }}>
                                {reports.map((report, index) => (
                                    <div
                                        key={report.name}
                                        style={{
                                            height: 124,
                                            display: 'grid',
                                            gridTemplateColumns: '180px 1.1fr 1.3fr 180px 210px 170px',
                                            alignItems: 'center',
                                            padding: '0 28px',
                                            borderTop: index === 0 ? '1px solid #efeee4' : '1px solid #f0efe7',
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    width: 108,
                                                    height: 72,
                                                    borderRadius: 6,
                                                    background: `${report.image} center/cover`,
                                                }}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div
                                                style={{
                                                    width: 46,
                                                    height: 46,
                                                    borderRadius: '50%',
                                                    background: "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80') center/cover",
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontSize: 18, fontWeight: 700, color: '#232823' }}>{report.name}</div>
                                                <div style={{ fontSize: 14, color: '#757b72', marginTop: 4 }}>{report.id}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: 18, color: '#2f342f', lineHeight: 1.3 }}>{report.location}</div>
                                            <div style={{ fontSize: 14, color: '#6e736c', marginTop: 6 }}>{report.coords}</div>
                                        </div>

                                        <div>
                                            <div
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    padding: '7px 14px',
                                                    borderRadius: 999,
                                                    background: report.typeBg,
                                                    color: report.typeColor,
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                <span style={{ fontSize: 12 }}>◌</span>
                                                <span>{report.type}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    background: report.statusDot,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <span style={{ fontSize: 18, color: report.statusColor, fontWeight: 600 }}>{report.status}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                            <button
                                                type="button"
                                                style={{
                                                    ...buttonReset,
                                                    minWidth: report.action1 === '✓' ? 44 : 'auto',
                                                    height: report.action1 === '✓' ? 44 : 'auto',
                                                    borderRadius: 8,
                                                    background: report.action1Bg,
                                                    color: report.action1Color,
                                                    fontSize: report.action1 === '✓' ? 28 : 16,
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {report.action1}
                                            </button>

                                            {report.action2 ? (
                                                <button
                                                    type="button"
                                                    style={{
                                                        ...buttonReset,
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 8,
                                                        background: report.action2Bg,
                                                        color: report.action2Color,
                                                        fontSize: 24,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #e5e5db',
                                                    }}
                                                >
                                                    {report.action2}
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    height: 82,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0 28px',
                                    color: '#4f554d',
                                    fontSize: 14,
                                    fontWeight: 500,
                                }}
                            >
                                <div>ĐANG HIỂN THỊ 3 TRONG TỔNG SỐ 42 BÁO CÁO HOẠT ĐỘNG</div>

                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        style={{
                                            ...buttonReset,
                                            width: 40,
                                            height: 40,
                                            borderRadius: 6,
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 24,
                                        }}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            ...buttonReset,
                                            width: 40,
                                            height: 40,
                                            borderRadius: 6,
                                            background: '#065f17',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 18,
                                            fontWeight: 700,
                                        }}
                                    >
                                        1
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            ...buttonReset,
                                            width: 40,
                                            height: 40,
                                            borderRadius: 6,
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 18,
                                            fontWeight: 700,
                                        }}
                                    >
                                        2
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            ...buttonReset,
                                            width: 40,
                                            height: 40,
                                            borderRadius: 6,
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 24,
                                        }}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.6fr', gap: 28 }}>
                            <div
                                style={{
                                    background: '#222928',
                                    borderRadius: 16,
                                    minHeight: 540,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background:
                                            "linear-gradient(rgba(17,23,20,0.18), rgba(17,23,20,0.18)), url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=1400&q=80') center/cover",
                                        opacity: 0.92,
                                    }}
                                />

                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 34,
                                        left: 34,
                                        width: 360,
                                        background: 'rgba(246,247,239,0.96)',
                                        borderRadius: 8,
                                        padding: '24px 24px 20px',
                                    }}
                                >
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#146029', marginBottom: 18 }}>
                                        Bản đồ nhiệt sự cố
                                    </div>
                                    <div style={{ fontSize: 16, lineHeight: 1.55, color: '#4f554d', marginBottom: 24 }}>
                                        Phân cụm báo cáo cộng đồng theo thời gian thực đối chiếu với các nút cảm biến công nghiệp.
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div style={{ fontSize: 14, color: '#575d55', fontWeight: 600 }}>MẬT ĐỘ CẢNH BÁO</div>
                                        <div style={{ fontSize: 14, color: '#d7332d', fontWeight: 700 }}>12 Khu vực</div>
                                    </div>
                                    <div style={{ height: 6, background: '#eadfdc', borderRadius: 999 }}>
                                        <div style={{ width: '72%', height: '100%', background: '#d7332d', borderRadius: 999 }} />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        position: 'absolute',
                                        right: 26,
                                        bottom: 26,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10,
                                    }}
                                >
                                    <button
                                        type="button"
                                        style={{
                                            ...buttonReset,
                                            width: 48,
                                            height: 48,
                                            borderRadius: 4,
                                            background: '#f5f5ec',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 32,
                                        }}
                                    >
                                        +
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            ...buttonReset,
                                            width: 48,
                                            height: 48,
                                            borderRadius: 4,
                                            background: '#f5f5ec',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 32,
                                        }}
                                    >
                                        −
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            ...buttonReset,
                                            width: 48,
                                            height: 48,
                                            borderRadius: 4,
                                            background: '#065f17',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 24,
                                        }}
                                    >
                                        ◈
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div
                                    style={{
                                        background: '#0b6518',
                                        borderRadius: 16,
                                        padding: '34px 34px 30px',
                                        color: '#fff',
                                        minHeight: 318,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 62,
                                            height: 62,
                                            borderRadius: 12,
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 28,
                                            marginBottom: 34,
                                        }}
                                    >
                                        ▣
                                    </div>
                                    <div style={{ fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20, opacity: 0.95 }}>
                                        Tỷ lệ xác thực
                                    </div>
                                    <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1, marginBottom: 26 }}>94.2%</div>
                                    <div style={{ fontSize: 18, lineHeight: 1.65, color: '#d2e5d4' }}>
                                        Báo cáo cộng đồng được xác thực thành công bởi hệ thống cảm biến trạm quan trắc trong tháng này.
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background: '#93efaf',
                                        borderRadius: 16,
                                        padding: '30px 34px 28px',
                                        minHeight: 288,
                                        color: '#0c4c1f',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 26 }}>
                                        <div style={{ fontSize: 44 }}>◔</div>
                                        <div
                                            style={{
                                                padding: '10px 18px',
                                                borderRadius: 999,
                                                background: '#0d7d38',
                                                color: '#d8ffdf',
                                                fontSize: 14,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            Xu hướng
                                        </div>
                                    </div>

                                    <div style={{ fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                                        Tình nguyện viên tích cực
                                    </div>
                                    <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1, marginBottom: 26 }}>1,204</div>
                                    <div style={{ fontSize: 18, lineHeight: 1.55, color: '#22653a' }}>
                                        Quận có nhiều báo cáo nhất: <b>Bình Chánh</b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        style={{
                            ...buttonReset,
                            position: 'fixed',
                            right: 24,
                            bottom: 24,
                            width: 64,
                            height: 64,
                            borderRadius: 18,
                            background: '#0a681b',
                            color: '#fff',
                            fontSize: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 18px 28px rgba(13,70,25,0.25)',
                        }}
                    >
                        +
                    </button>
                </main>
            </div>
        </div>
    );
}
