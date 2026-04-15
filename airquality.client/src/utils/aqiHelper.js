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
