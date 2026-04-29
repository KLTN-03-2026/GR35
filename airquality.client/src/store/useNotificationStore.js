import { create } from "zustand";

export const useNotificationStore = create((set) => ({
    unreadCount: 0,
    notifications: [],
    isOpen: false,

    setUnreadCount: (count) => set({ unreadCount: count }),
    setNotifications: (items) => set({ notifications: items }),
    setIsOpen: (isOpen) => set({ isOpen }),

    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
    })),

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
    }))
}));
