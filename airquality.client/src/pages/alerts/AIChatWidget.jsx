export default function AIChatWidget() {
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(145deg, #eaf2f0 0%, #f0f5f8 50%, #e8f0f8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
            {/* Chat Window */}
            <div style={{
                width: 320,
                borderRadius: 20,
                background: "white",
                boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            }}>

                {/* Header */}
                <div style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "white",
                }}>
                    {/* Avatar */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            background: "linear-gradient(135deg, #0d6e4e, #22c55e)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                            </svg>
                        </div>
                        {/* Online dot */}
                        <div style={{
                            position: "absolute", bottom: 1, right: 1,
                            width: 10, height: 10, borderRadius: "50%",
                            background: "#22c55e",
                            border: "2px solid white",
                        }} />
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a2e1a" }}>
                                Tro ly EcoAir AI
                            </span>
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.5px", marginTop: 1 }}>
                            DANG TRUC TUYEN
                        </div>
                    </div>

                    {/* Icons */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                {/* Chat body */}
                <div style={{
                    padding: "16px 16px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    minHeight: 360,
                    background: "#fafcfa",
                }}>
                    {/* Timestamp */}
                    <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
                        Hom nay, 10:24 AM
                    </div>

                    {/* Bot message bubble */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "85%" }}>
                        <div>
                            <div style={{
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px 16px 16px 16px",
                                padding: "12px 14px",
                                fontSize: 13.5,
                                color: "#1a2e1a",
                                lineHeight: 1.55,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            }}>
                                Du lieu thuc te tai Da Nang luc 10:00 AM:
                            </div>
                        </div>

                        {/* AQI Card */}
                        <div>
                            <div style={{
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                padding: "12px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            }}>
                                {/* AQI circle */}
                                <div style={{
                                    width: 44, height: 44, borderRadius: "50%",
                                    border: "3px solid #eab308",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: "#eab308" }}>75</span>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>AQI</span>
                                        <span style={{ fontSize: 10, color: "#9ca3af" }}>•</span>
                                        <span style={{ fontSize: 10, color: "#eab308", fontWeight: 600 }}>TRUNG BINH</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                            <circle cx="12" cy="12" r="5" />
                                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                        </svg>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a2e1a" }}>28°C</span>
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a", marginBottom: 2 }}>
                                        Thanh pho Da Nang
                                    </div>
                                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                        PM2.5: 22 µg/m³
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User message bubble */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{
                            background: "#0d6e4e",
                            color: "white",
                            borderRadius: "16px 4px 16px 16px",
                            padding: "11px 16px",
                            fontSize: 13.5,
                            fontWeight: 500,
                            maxWidth: "85%",
                            lineHeight: 1.5,
                        }}>
                            Du bao ngay mai toi bi Hen suyen?
                        </div>
                    </div>

                    {/* Typing indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 4 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#0d6e4e" }} />
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#0d6e4e", opacity: 0.6 }} />
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#0d6e4e", opacity: 0.3 }} />
                    </div>

                    {/* Quick reply chips */}
                    <div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {[
                                { label: "Du bao 24h" },
                                { label: "Tim duong ne bui min" },
                                { label: "Chi so PM10?" },
                            ].map((chip) => (
                                <div key={chip.label} style={{
                                    padding: "6px 12px",
                                    borderRadius: 99,
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    fontSize: 12,
                                    color: "#374151",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}>
                                    {chip.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Free tier banner */}
                    <div>
                        <div style={{
                            background: "#fff7ed",
                            borderRadius: 8,
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                        }}>
                            <span style={{ color: "#374151" }}>Tai khoan Free: Ban con 2/5 luot hoi hom nay.</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#0d6e4e", fontWeight: 600, whiteSpace: "nowrap" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d6e4e" strokeWidth="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                Nang cap PRO
                            </span>
                        </div>
                    </div>
                </div>

                {/* Input area */}
                <div style={{
                    padding: "10px 12px",
                    background: "white",
                    borderTop: "1px solid #f0f0f0",
                    position: "relative",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: "8px 12px",
                    }}>
                        {/* Location icon */}
                        <div style={{ flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>

                        {/* Input */}
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Hoi ve chat luong khong khi..."
                                style={{
                                    width: "100%",
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontSize: 13,
                                    color: "#1a2e1a",
                                }}
                            />
                        </div>

                        {/* Send button */}
                        <div style={{ flexShrink: 0 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: "#0d6e4e",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Green bottom bar */}
                    <div style={{
                        height: 4, background: "#0d6e4e",
                        borderRadius: "0 0 4px 4px",
                        marginTop: 10, marginLeft: -12, marginRight: -12,
                    }} />
                </div>
            </div>
        </div>
    );
}