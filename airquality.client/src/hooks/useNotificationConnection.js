import { useEffect } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { useNotificationStore } from "../store/useNotificationStore";

export function useNotificationConnection() {
    const { addNotification, setUnreadCount, setNotifications } = useNotificationStore();

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        // Tải danh sách thông báo và số lượng chưa đọc ban đầu
        const fetchInitialData = async () => {
            try {
                const countRes = await axios.get("/api/AppNotifications/unread-count", {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setUnreadCount(countRes.data.count);

                const listRes = await axios.get("/api/AppNotifications?page=1&pageSize=15", {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setNotifications(listRes.data.items);
            } catch (err) {
                console.error("Error fetching notifications", err);
            }
        };

        fetchInitialData();

        // Kết nối SignalR
        const connection = new HubConnectionBuilder()
            .withUrl("/hub/notifications", {
                accessTokenFactory: () => accessToken
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        connection.on("ReceiveNotification", (notification) => {
            // Khi có thông báo mới (signalR server push)
            addNotification(notification);
        });

        connection.start()
            .then(() => console.log("SignalR Connected."))
            .catch(err => console.error("SignalR Connection Error: ", err));

        return () => {
            connection.stop();
        };
    }, [addNotification, setUnreadCount, setNotifications]);
}
