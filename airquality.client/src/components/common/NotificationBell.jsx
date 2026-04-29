import React, { useRef, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useNotificationConnection } from "../../hooks/useNotificationConnection";
import axios from "axios";
import theme from "../layout/theme";

export default function NotificationBell() {
    // Kích hoạt signalR connection
    useNotificationConnection();

    const {
        unreadCount,
        notifications,
        isOpen,
        setIsOpen,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsOpen]);

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                const token = localStorage.getItem("accessToken");
                await axios.put(`/api/AppNotifications/${notif.id}/read`, null, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                markAsRead(notif.id);
            } catch (err) {
                console.error("Lỗi khi đánh dấu đã đọc:", err);
            }
        }
        setIsOpen(false);
        if (notif.relatedLink) {
            navigate(notif.relatedLink);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.put("/api/AppNotifications/read-all", null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            markAllAsRead();
        } catch (err) {
            console.error("Lỗi khi đánh dấu tất cả đã đọc:", err);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 0: return "#ef4444"; // AqiAlert
            case 1: return "#3b82f6"; // System
            case 2: return "#8b5cf6"; // Account
            case 3: return "#eab308"; // CommunityReport
            case 4: return "#14b8a6"; // Health
            default: return theme.green;
        }
    };

    const getIconPrefix = (type) => {
        switch (type) {
            case 0: return "⚠️";
            case 1: return "📢";
            case 2: return "👤";
            case 3: return "📝";
            case 4: return "🏥";
            default: return "🔔";
        }
    };

    return (
        <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    borderRadius: "50%",
                    transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#f3f4f6"}
                onMouseOut={(e) => e.currentTarget.style.background = "none"}
            >
                <Bell size={20} color={theme.text} />
                {unreadCount > 0 && (
                    <div style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "#ef4444",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "bold",
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white"
                    }}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    width: 320,
                    maxHeight: 480,
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    border: `1px solid ${theme.border}`,
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 1300,
                    overflow: "hidden"
                }}>
                    <div style={{
                        padding: "16px",
                        borderBottom: `1px solid ${theme.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#fafafa"
                    }}>
                        <h3 style={{ margin: 0, fontSize: 16, color: theme.text }}>Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: theme.green,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    padding: 0
                                }}
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    <div style={{ overflowY: "auto", flex: 1, padding: 0, margin: 0 }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "32px 16px", textAlign: "center", color: theme.textMuted, fontSize: 14 }}>
                                Không có thông báo nào.
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{
                                        padding: "12px 16px",
                                        borderBottom: `1px solid ${theme.border}`,
                                        cursor: "pointer",
                                        background: notif.isRead ? "white" : "#f0fdf4",
                                        transition: "background 0.2s",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 4
                                    }}
                                    onMouseOver={(e) => {
                                        if (notif.isRead) e.currentTarget.style.background = "#fafafa";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = notif.isRead ? "white" : "#f0fdf4";
                                    }}
                                >
                                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: "50%",
                                            marginTop: 6,
                                            background: notif.isRead ? "transparent" : theme.green,
                                            flexShrink: 0
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: notif.isRead ? 500 : 600, color: theme.text, marginBottom: 2 }}>
                                                <span style={{ marginRight: 4 }}>{getIconPrefix(notif.type)}</span>
                                                {notif.title}
                                            </div>
                                            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.4 }}>
                                                {notif.message}
                                            </div>
                                            <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
