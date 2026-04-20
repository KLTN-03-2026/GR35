export const AQI_LEVELS = [
    { max: 50, label: "Tốt", color: "#16a34a", bg: "#f0fdf4", badge: "#dcfce7", icon: "/tot.svg" },
    { max: 100, label: "Trung bình", color: "#ca8a04", bg: "#fefce8", badge: "#fef9c3", icon: "/trungbinh.svg" },
    { max: 150, label: "Kém", color: "#ea580c", bg: "#fff7ed", badge: "#ffedd5", icon: "/kem.svg" },
    { max: 200, label: "Xấu", color: "#dc2626", bg: "#fef2f2", badge: "#fee2e2", icon: "/xau.svg" },
    { max: 300, label: "Rất xấu", color: "#9333ea", bg: "#faf5ff", badge: "#f3e8ff", icon: "/ratxau.svg" },
    { max: 500, label: "Nguy hại", color: "#be123c", bg: "#fff1f2", badge: "#ffe4e6", icon: "/nguyhai.svg" },
];

export function getLevel(aqi) {
    return AQI_LEVELS.find((l) => aqi <= l.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1];
}

export function getHealthTiles(aqi) {
    if (aqi <= 50) return [
        { icon: "😊", label: "Không cần khẩu trang", active: false },
        { icon: "🪟", label: "Thoải mái mở cửa", active: true },
        { icon: "🏃", label: "Lý tưởng để tập thể dục", active: true },
        { icon: "💨", label: "Máy lọc không cần thiết", active: false },
        { icon: "👨‍👩‍👧", label: "An toàn cho trẻ em & người già", active: true },
        { icon: "🌿", label: "Thích hợp hoạt động ngoài trời", active: true },
    ];
    if (aqi <= 100) return [
        { icon: "😷", label: "Chưa cần khẩu trang", active: false },
        { icon: "🪟", label: "Nên mở cửa thoáng", active: true },
        { icon: "🏃", label: "Vẫn có thể tập ngoài trời", active: true },
        { icon: "💨", label: "Máy lọc hữu ích", active: true },
        { icon: "⚠️", label: "Người nhạy cảm chú ý", active: true },
        { icon: "🌿", label: "Hạn chế thời gian ngoài trời lâu", active: false },
    ];
    return [
        { icon: "😷", label: "Nên đeo khẩu trang N95", active: true },
        { icon: "🏠", label: "Hạn chế ra ngoài trời", active: true },
        { icon: "🚫", label: "Tránh tập thể dục ngoài trời", active: true },
        { icon: "💨", label: "Bật máy lọc không khí", active: true },
        { icon: "🧒", label: "Giữ trẻ em trong nhà", active: true },
        { icon: "🏥", label: "Người bệnh cần đặc biệt chú ý", active: true },
    ];
}
