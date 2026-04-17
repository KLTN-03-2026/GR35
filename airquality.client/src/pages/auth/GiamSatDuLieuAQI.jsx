export default function GiamSatDuLieuAQI() {
    const sideItems = [
        { icon: '⊞', label: 'Bảng điều khiển', active: false },
        { icon: '◫', label: 'Báo cáo', active: false },
        { icon: '◌', label: 'Người dùng', active: false },
        { icon: '◍', label: 'Trạm đo', active: true },
        { icon: '◔', label: 'Cấu hình AI', active: false },
    ];

    const bars = [72, 104, 80, 132, 156, 182, 142];

    const activities = [
        {
            iconBg: '#fde8e6',
            iconColor: '#d83b2d',
            icon: '⚠',
            title: 'Cảnh báo: Cảng Hải Phòng',
            desc: 'Nồng độ SO2 vượt ngưỡng 15%',
            time: '2 phút trước',
        },
        {
            iconBg: '#e7f3eb',
            iconColor: '#168c4d',
            icon: '☁',
            title: 'Trạm #402 đã hiệu chuẩn',
            desc: 'Bảo trì định kỳ hoàn tất tại TP. Huế',
            time: '45 phút trước',
        },
        {
            iconBg: '#eef7ea',
            iconColor: '#2f8b3d',
            icon: '◉',
            title: 'Nghiên cứu viên mới',
            desc: 'Đã cấp quyền truy cập cho Bộ Tài nguyên & Môi trường',
            time: '2 giờ trước',
        },
    ];

    const ghostButton = {
        border: 'none',
        background: 'transparent',
        padding: 0,
        margin: 0,
        font: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f4f3e8',
                fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                color: '#1f2a1f',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                body { margin: 0; }
            `}</style>

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr 500px', minHeight: '100vh' }}>
                <aside
                    style={{
                        background: '#f5f4ea',
                        borderRight: '1px solid #e4e2d4',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '28px 24px 18px',
                    }}
                >
                    <div style={{ marginBottom: 54 }}>
                        <div style={{ fontSize: 33, fontWeight: 800, color: '#0c5b23', lineHeight: 1.1, marginBottom: 10 }}>
                            EcoAir VN
                        </div>
                        <div
                            style={{
                                fontSize: 18,
                                color: '#7f816f',
                                letterSpacing: 2.5,
                                textTransform: 'uppercase',
                            }}
                        >
                            Quản trị môi trường
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {sideItems.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                style={{
                                    ...ghostButton,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 18,
                                    height: 64,
                                    padding: '0 18px',
                                    borderLeft: item.active ? '4px solid #0b6a25' : '4px solid transparent',
                                    color: item.active ? '#145a25' : '#49566b',
                                    fontSize: 22,
                                    fontWeight: item.active ? 700 : 500,
                                    width: '100%',
                                }}
                            >
                                <span style={{ width: 28, textAlign: 'center', fontSize: 28 }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ borderTop: '1px solid #e1dfd1', paddingTop: 22 }}>
                        <button
                            type="button"
                            style={{
                                ...ghostButton,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                height: 58,
                                padding: '0 18px',
                                color: '#48556c',
                                fontSize: 21,
                                fontWeight: 500,
                                width: '100%',
                            }}
                        >
                            <span style={{ fontSize: 28 }}>◔</span>
                            <span>Hồ sơ</span>
                        </button>

                        <button
                            type="button"
                            style={{
                                ...ghostButton,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                height: 58,
                                padding: '0 18px',
                                color: '#d33221',
                                fontSize: 21,
                                fontWeight: 500,
                                width: '100%',
                            }}
                        >
                            <span style={{ fontSize: 28 }}>↪</span>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </aside>

                <section style={{ position: 'relative', overflow: 'hidden', background: '#8da28c' }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 96,
                            background: '#f5f4ea',
                            borderBottom: '1px solid #e4e2d4',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 28px 0 22px',
                            zIndex: 5,
                        }}
                    >
                        <button
                            type="button"
                            style={{
                                ...ghostButton,
                                width: 560,
                                height: 60,
                                borderRadius: 4,
                                background: '#f0efe5',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                padding: '0 22px',
                                marginRight: 56,
                            }}
                        >
                            <span style={{ fontSize: 28, color: '#78806f' }}>⌕</span>
                            <span style={{ fontSize: 20, color: '#c0c4b6' }}>Tìm kiếm hệ thống...</span>
                        </button>

                        <div style={{ display: 'flex', gap: 42, alignItems: 'center' }}>
                            <button
                                type="button"
                                style={{
                                    ...ghostButton,
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: '#1e5d20',
                                    paddingBottom: 10,
                                    borderBottom: '4px solid #1e5d20',
                                }}
                            >
                                Tổng quan
                            </button>
                            <button
                                type="button"
                                style={{
                                    ...ghostButton,
                                    fontSize: 24,
                                    color: '#71809a',
                                    fontWeight: 500,
                                }}
                            >
                                Dữ liệu khu vực
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'saturate(0.85) blur(0.2px)',
                        }}
                    />

                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'linear-gradient(180deg, rgba(194,180,149,0.38) 0%, rgba(131,162,142,0.18) 28%, rgba(80,103,115,0.34) 100%)',
                        }}
                    />

                    <div
                        style={{
                            position: 'absolute',
                            top: 162,
                            left: 64,
                            width: 760,
                            background: 'rgba(248,248,241,0.94)',
                            borderRadius: 22,
                            padding: '44px 46px 36px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                            zIndex: 2,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 50,
                                lineHeight: 1.08,
                                fontWeight: 800,
                                color: '#0a5a20',
                                marginBottom: 18,
                            }}
                        >
                            Giám sát Dữ liệu
                            <br />
                            &amp; AQI
                        </div>
                        <div style={{ fontSize: 25, color: '#5e6259', marginBottom: 30 }}>
                            Dữ liệu môi trường trực tiếp từ 1,248 cảm biến
                        </div>

                        <div style={{ display: 'flex', alignItems: 'stretch', gap: 34 }}>
                            <div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: '#7a7e70',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        marginBottom: 10,
                                    }}
                                >
                                    Tổng số trạm
                                </div>
                                <div style={{ fontSize: 58, fontWeight: 800, color: '#1a2419', lineHeight: 1 }}>
                                    1,248
                                </div>
                            </div>

                            <div style={{ width: 1, background: '#d5d5c9' }} />

                            <div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: '#cf2f28',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        marginBottom: 10,
                                    }}
                                >
                                    Cảnh báo nghiêm trọng
                                </div>
                                <div style={{ fontSize: 58, fontWeight: 800, color: '#cf2f28', lineHeight: 1 }}>
                                    14
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            left: '37%',
                            top: '62%',
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: '#00843b',
                            zIndex: 2,
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            left: '41%',
                            bottom: '17%',
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: '#ffd0cf',
                            zIndex: 2,
                        }}
                    />

                    <button
                        type="button"
                        style={{
                            ...ghostButton,
                            position: 'absolute',
                            left: 62,
                            bottom: 64,
                            width: 112,
                            height: 112,
                            background: '#0a6a1f',
                            borderRadius: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 48,
                            zIndex: 2,
                        }}
                    >
                        ⊞
                    </button>

                    <div
                        style={{
                            position: 'absolute',
                            right: 160,
                            bottom: 58,
                            width: 124,
                            background: '#f4f4ec',
                            borderRadius: 10,
                            overflow: 'hidden',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
                            zIndex: 2,
                        }}
                    >
                        <button type="button" style={{ ...ghostButton, width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54 }}>+</button>
                        <div style={{ height: 1, background: '#e4e4d8' }} />
                        <button type="button" style={{ ...ghostButton, width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54 }}>−</button>
                        <div style={{ height: 1, background: '#e4e4d8' }} />
                        <button type="button" style={{ ...ghostButton, width: '100%', height: 94, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46 }}>◎</button>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            right: 52,
                            bottom: 58,
                            width: 110,
                            height: 292,
                            background: '#f4f4ec',
                            borderRadius: 10,
                            boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <button
                            type="button"
                            style={{
                                ...ghostButton,
                                width: 66,
                                height: 66,
                                borderRadius: 12,
                                background: '#05691b',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 34,
                            }}
                        >
                            ◈
                        </button>
                    </div>
                </section>

                <aside
                    style={{
                        background: '#f7f6eb',
                        borderLeft: '1px solid #e4e2d4',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        style={{
                            height: 96,
                            borderBottom: '1px solid #e4e2d4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 22px 0 26px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
                            <button type="button" style={{ ...ghostButton, position: 'relative', fontSize: 34, color: '#66718a' }}>
                                🔔
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 0,
                                        width: 12,
                                        height: 12,
                                        background: '#d72622',
                                        borderRadius: '50%',
                                    }}
                                />
                            </button>
                        </div>

                        <button type="button" style={{ ...ghostButton, display: 'flex', alignItems: 'center', gap: 18 }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 22, fontWeight: 700 }}>Quản trị viên</div>
                                <div style={{ fontSize: 15, color: '#7a7f73', marginTop: 4 }}>QUYỀN TRUY CẬP CẤP 4</div>
                            </div>
                            <div
                                style={{
                                    width: 68,
                                    height: 68,
                                    borderRadius: 18,
                                    background: "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80') center/cover",
                                    boxShadow: 'inset 0 0 0 3px #2f8a2d',
                                }}
                            />
                        </button>
                    </div>

                    <div style={{ padding: '28px 22px 22px', overflowY: 'auto' }}>
                        <button
                            type="button"
                            style={{
                                ...ghostButton,
                                width: '100%',
                                height: 68,
                                borderRadius: 18,
                                background: '#e9e9de',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 22px',
                                marginBottom: 42,
                            }}
                        >
                            <div
                                style={{
                                    background: '#f7c8da',
                                    color: '#9a325f',
                                    borderRadius: 16,
                                    padding: '8px 18px',
                                    fontSize: 18,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                }}
                            >
                                Dự báo AI
                            </div>
                            <div style={{ fontSize: 28, color: '#8f4d75' }}>✧</div>
                        </button>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                marginBottom: 26,
                            }}
                        >
                            <div style={{ fontSize: 27, fontWeight: 800, color: '#21271f' }}>Xu hướng AQI Quốc gia</div>
                            <button type="button" style={{ ...ghostButton, fontSize: 17, color: '#17782f', fontWeight: 700 }}>
                                Tải CSV
                            </button>
                        </div>

                        <div
                            style={{
                                background: '#fffdfc',
                                borderRadius: 18,
                                padding: '24px 24px 22px',
                                marginBottom: 24,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 24,
                                }}
                            >
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#4f564d' }}>AQI TRUNG BÌNH 7 NGÀY</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#177f3f' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#95a89b' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#cfd6ce' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'end', gap: 14, height: 238, marginBottom: 14 }}>
                                {bars.map((h, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'end', alignItems: 'center', gap: 14 }}>
                                        <div
                                            style={{
                                                width: '100%',
                                                height: h,
                                                borderRadius: '4px 4px 0 0',
                                                background: i === 5 ? '#a8ef98' : '#d6f8cb',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: 10,
                                    textAlign: 'center',
                                    color: '#7b7e72',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    lineHeight: 1.4,
                                }}
                            >
                                <div>THL 2</div>
                                <div>THL 3</div>
                                <div>THL 4</div>
                                <div>THL 5</div>
                                <div>THL 6</div>
                                <div>THL 7</div>
                                <div>CHỦ NHBT</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 44 }}>
                            <button type="button" style={{ ...ghostButton, background: '#fffdfc', borderRadius: 18, padding: '24px 24px 18px' }}>
                                <div style={{ fontSize: 34, color: '#0c8c49', marginBottom: 16 }}>◔</div>
                                <div style={{ fontSize: 30, fontWeight: 800, color: '#097846', marginBottom: 10 }}>82%</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#52584f', lineHeight: 1.2 }}>
                                    NĂNG LƯỢNG
                                    <br />
                                    XANH
                                </div>
                            </button>

                            <button type="button" style={{ ...ghostButton, background: '#fffdfc', borderRadius: 18, padding: '24px 24px 18px' }}>
                                <div style={{ fontSize: 34, color: '#9b295c', marginBottom: 16 }}>≈</div>
                                <div style={{ fontSize: 30, fontWeight: 800, color: '#1f2420', marginBottom: 10 }}>12.4</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#52584f', lineHeight: 1.2 }}>
                                    TỐC ĐỘ GIÓ TB
                                </div>
                            </button>
                        </div>

                        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Hoạt động hệ thống gần đây</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {activities.map((item) => (
                                <button
                                    key={item.title}
                                    type="button"
                                    style={{
                                        ...ghostButton,
                                        background: '#fffdfc',
                                        borderRadius: 18,
                                        padding: '24px 24px 20px',
                                        display: 'flex',
                                        gap: 18,
                                        width: '100%',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 18,
                                            background: item.iconBg,
                                            color: item.iconColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 30,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {item.icon}
                                    </div>

                                    <div style={{ minWidth: 0, textAlign: 'left' }}>
                                        <div style={{ fontSize: 21, fontWeight: 700, color: '#222622', marginBottom: 6 }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: 17, color: '#5f655d', lineHeight: 1.35, marginBottom: 10 }}>
                                            {item.desc}
                                        </div>
                                        <div style={{ fontSize: 15, color: '#8b8f84' }}>{item.time}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            style={{
                                ...ghostButton,
                                marginTop: 20,
                                height: 84,
                                borderRadius: 16,
                                background: '#0d0d08',
                                color: '#dedfcf',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                                fontWeight: 700,
                                width: '100%',
                            }}
                        >
                            Xem tất cả nhật ký hoạt động
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
