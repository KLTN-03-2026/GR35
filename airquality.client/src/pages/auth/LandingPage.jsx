import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0])) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}
import MainLayout from "../../components/layout/MainLayout";
import theme from "../../components/layout/theme";
import { formatDbDateTime } from "../../utils/datetime";

/* ─── Scroll Reveal Hook ────────────────────────────────────────── */
function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/* ─── Reveal style helpers ──────────────────────────────────────── */
const revealBase = {
  transition: "opacity 0.65s ease, transform 0.65s ease",
};
const hidden = { opacity: 0 };
const shown = { opacity: 1, transform: "none" };

function fadeUp(visible, delay = 0) {
  return {
    ...revealBase,
    transitionDelay: `${delay}ms`,
    ...(visible ? shown : { ...hidden, transform: "translateY(32px)" }),
  };
}
function fadeLeft(visible, delay = 0) {
  return {
    ...revealBase,
    transitionDelay: `${delay}ms`,
    ...(visible ? shown : { ...hidden, transform: "translateX(-40px)" }),
  };
}
function fadeRight(visible, delay = 0) {
  return {
    ...revealBase,
    transitionDelay: `${delay}ms`,
    ...(visible ? shown : { ...hidden, transform: "translateX(40px)" }),
  };
}

function normalizeText(value) {
  return (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isHanoiCity(city) {
  const normalized = normalizeText(city);
  return normalized.includes("ha noi") || normalized.includes("hanoi");
}

function getCharacterByAqi(aqiValue) {
  if (aqiValue <= 50) return "/tot.webp";
  if (aqiValue <= 100) return "/trungbinh.webp";
  if (aqiValue <= 150) return "/kem.webp";
  if (aqiValue <= 200) return "/xau.webp";
  if (aqiValue <= 300) return "/ratxau.webp";
  return "/nguyhai.webp";
}

function formatLocalTime(timestamp) {
  return formatDbDateTime(timestamp);
}

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
    return `rgba(148,163,184,${alpha})`;
  }

  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = Number.parseInt(full, 16);

  if (Number.isNaN(num)) {
    return `rgba(148,163,184,${alpha})`;
  }

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ─── AQI Info Section ───────────────────────────────────────────────── */
function AqiInfoSection({ isMobile }) {
  const [headerRef, headerVisible] = useScrollReveal();
  const [listRef, listVisible] = useScrollReveal({ threshold: 0.05 });
  const [activePollutant, setActivePollutant] = useState("AQI (US)");

  const pollutantLevels = {
    "AQI (US)": [
      { level: "Tốt", range: "(0 đến 50)", color: "#63cc2f", img: "/tot.webp", desc: "Không khí trong lành và không có độc tố. Thoải mái hoạt động ngoài trời mà không lo lắng về sức khỏe." },
      { level: "Vừa phải", range: "(51 đến 100)", color: "#f5d233", img: "/trungbinh.webp", desc: "Chất lượng không khí có thể chấp nhận được đối với hầu hết mọi người, nhưng những người nhạy cảm có thể cảm thấy khó chịu nhẹ." },
      { level: "Kém", range: "(101 đến 150)", color: "#f39a3d", img: "/kem.webp", desc: "Hơi khó thở một chút có thể xảy ra, đặc biệt đối với những người có vấn đề về hô hấp." },
      { level: "Không lành mạnh", range: "(151 đến 200)", color: "#ec4f83", img: "/xau.webp", desc: "Chất lượng không khí này đặc biệt nguy hiểm cho trẻ em, phụ nữ mang thai và người cao tuổi. Hạn chế hoạt động ngoài trời." },
      { level: "Nghiêm trọng", range: "(201 đến 300)", color: "#b748c8", img: "/ratxau.webp", desc: "Tiếp xúc lâu dài có thể gây ra các vấn đề sức khỏe mãn tính hoặc tổn thương cơ quan. Tránh hoạt động ngoài trời." },
      { level: "Nguy hiểm", range: "(301+)", color: "#e92b49", img: "/nguyhai.webp", desc: "Mức độ ô nhiễm nguy hiểm cao. Nguy cơ sức khỏe đe dọa tính mạng với việc tiếp xúc lâu dài. Ở trong nhà và thực hiện các biện pháp phòng ngừa." },
    ],
    "PM2.5": [
      { level: "Tốt", range: "(0 đến 30)", color: "#63cc2f", img: "/tot.webp", desc: "Chất lượng không khí hoàn hảo và rõ ràng. Không có rủi ro sức khỏe cho bất kỳ nhóm nào." },
      { level: "Vừa phải", range: "(31 đến 60)", color: "#f5d233", img: "/trungbinh.webp", desc: "Chất lượng không khí có thể chấp nhận được, nhưng các nhóm nhạy cảm có thể trải qua sự kích thích hô hấp nhẹ." },
      { level: "Kém", range: "(61 đến 90)", color: "#f39a3d", img: "/kem.webp", desc: "Khó chịu nhẹ và khó thở có thể xảy ra, đặc biệt đối với các nhóm nhạy cảm." },
      { level: "Không lành mạnh", range: "(91 đến 120)", color: "#ec4f83", img: "/xau.webp", desc: "Mọi người có thể gặp phải tác động sức khỏe; các nhóm nhạy cảm có thể gặp phải hậu quả nghiêm trọng hơn." },
      { level: "Nghiêm trọng", range: "(121 đến 250)", color: "#b748c8", img: "/ratxau.webp", desc: "Cảnh báo sức khỏe! Mọi người có thể gặp phải tác động sức khỏe nghiêm trọng." },
      { level: "Nguy hiểm", range: "(251 đến 380+)", color: "#e92b49", img: "/nguyhai.webp", desc: "Cảnh báo sức khỏe trong tình trạng khẩn cấp. Toàn bộ dân số có khả năng bị ảnh hưởng." },
    ],
    O3: [
      { level: "Tốt", range: "(0 đến 50)", color: "#63cc2f", img: "/tot.webp", desc: "Chất lượng không khí tuyệt vời mà không có tác động đến sức khỏe." },
      { level: "Vừa phải", range: "(51 đến 100)", color: "#f5d233", img: "/trungbinh.webp", desc: "Chất lượng không khí có thể chấp nhận; tuy nhiên, những người nhạy cảm có thể trải qua triệu chứng hô hấp." },
      { level: "Kém", range: "(101 đến 168)", color: "#f39a3d", img: "/kem.webp", desc: "Các cá nhân nhạy cảm có thể trải qua những tác động nghiêm trọng hơn lên phổi và tim." },
      { level: "Không lành mạnh", range: "(169 đến 208)", color: "#ec4f83", img: "/xau.webp", desc: "Trẻ em, người lớn hoạt động và những người có bệnh hô hấp gặp phải tác động sức khỏe." },
      { level: "Nghiêm trọng", range: "(209 đến 748)", color: "#b748c8", img: "/ratxau.webp", desc: "Tác động sức khỏe nghiêm trọng đối với toàn bộ dân số và tình trạng khẩn cấp cho các nhóm nhạy cảm." },
      { level: "Nguy hiểm", range: "(749 đến 1250+)", color: "#e92b49", img: "/nguyhai.webp", desc: "Tác động sức khỏe nghiêm trọng; tình trạng khẩn cấp đối với toàn bộ dân số." },
    ],
    CO: [
      { level: "Tốt", range: "(0 đến 8330)", color: "#63cc2f", img: "/tot.webp", desc: "Không khí sạch và an toàn. Không có tác động sức khỏe nào dự kiến." },
      { level: "Vừa phải", range: "(8331 đến 16670)", color: "#f5d233", img: "/trungbinh.webp", desc: "Chất lượng không khí có thể chấp nhận được, nhưng một số cá nhân nhạy cảm có thể gặp phải tác động sức khỏe nhẹ." },
      { level: "Kém", range: "(16671 đến 25000)", color: "#f39a3d", img: "/kem.webp", desc: "Tiếp xúc lâu dài có thể gây ra nhức đầu nhẹ và mệt mỏi, đặc biệt ở các nhóm dễ bị tổn thương." },
      { level: "Không lành mạnh", range: "(25001 đến 33330)", color: "#ec4f83", img: "/xau.webp", desc: "Tăng nguy cơ tác động tim mạch và triệu chứng nghiêm trọng hơn ở các nhóm nhạy cảm." },
      { level: "Nghiêm trọng", range: "(33331 đến 41670)", color: "#b748c8", img: "/ratxau.webp", desc: "Tác động sức khỏe nghiêm trọng, bao gồm sự nhầm lẫn và thị lực bị suy giảm; tình trạng khẩn cấp cho các nhóm nhạy cảm." },
      { level: "Nguy hiểm", range: "(41671 đến 50000+)", color: "#e92b49", img: "/nguyhai.webp", desc: "Nguy hiểm ngay lập tức cho sức khỏe. Nguy cơ cao về tác động tim mạch và thần kinh, có thể gây tử vong." },
    ],
    SO2: [
      { level: "Tốt", range: "(0 đến 40)", color: "#63cc2f", img: "/tot.webp", desc: "Chất lượng không khí xuất sắc. Không có rủi ro sức khỏe." },
      { level: "Vừa phải", range: "(41 đến 80)", color: "#f5d233", img: "/trungbinh.webp", desc: "Chất lượng không khí có thể chấp nhận, nhưng nhạy cảm có thể trải qua triệu chứng hô hấp nhẹ." },
      { level: "Kém", range: "(81 đến 380)", color: "#f39a3d", img: "/kem.webp", desc: "Có khả năng gia tăng triệu chứng hô hấp và bệnh phổi ở các cá nhân nhạy cảm." },
      { level: "Không lành mạnh", range: "(381 đến 800)", color: "#ec4f83", img: "/xau.webp", desc: "Hơi thở trở nên khó khăn, đặc biệt là đối với trẻ em, những người bị hen suyễn và người cao tuổi." },
      { level: "Nghiêm trọng", range: "(801 đến 1600)", color: "#b748c8", img: "/ratxau.webp", desc: "Rủi ro nghiêm trọng về các vấn đề hô hấp và tác động tim mạch cho mọi người." },
      { level: "Nguy hiểm", range: "(1601 đến 2600+)", color: "#e92b49", img: "/nguyhai.webp", desc: "Cảnh báo sức khỏe trong tình trạng khẩn cấp. Rủi ro đáng kể về bệnh nghiêm trọng và tác động đe dọa tính mạng." },
    ],
    NO2: [
      { level: "Tốt", range: "(0 đến 40)", color: "#63cc2f", img: "/tot.webp", desc: "Chất lượng không khí tối ưu. Không có khả năng ảnh hưởng đến sức khỏe." },
      { level: "Vừa phải", range: "(41 đến 80)", color: "#f5d233", img: "/trungbinh.webp", desc: "Chất lượng không khí có thể chấp nhận; các cá nhân nhạy cảm có thể trải qua sự khó chịu hô hấp nhẹ." },
      { level: "Kém", range: "(81 đến 180)", color: "#f39a3d", img: "/kem.webp", desc: "Tăng nguy cơ nhiễm trùng hô hấp và giảm chức năng phổi ở các nhóm nhạy cảm." },
      { level: "Không lành mạnh", range: "(181 đến 190)", color: "#ec4f83", img: "/xau.webp", desc: "Mọi người có thể trải qua các tác động sức khỏe nghiêm trọng hơn, đặc biệt là lên hệ hô hấp." },
      { level: "Nghiêm trọng", range: "(191 đến 400)", color: "#b748c8", img: "/ratxau.webp", desc: "Cảnh báo sức khỏe: tác động sức khỏe nghiêm trọng cho tất cả; tình trạng khẩn cấp cho các nhóm nhạy cảm." },
      { level: "Nguy hiểm", range: "(401 đến 500+)", color: "#e92b49", img: "/nguyhai.webp", desc: "Tác động đe dọa tính mạng cho toàn bộ dân số. Nguy cơ sức khỏe ngay lập tức." },
    ],
  };

  const tabs = ["AQI (US)", "PM2.5", "O3", "CO", "SO2", "NO2"];
  const levels = pollutantLevels[activePollutant] ?? pollutantLevels["AQI (US)"];

  return (
    <section
      style={{
        padding: isMobile ? "48px 16px" : "80px 48px",
        background: theme.text, // Dark background
        color: "white",
        fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header row */}
        <div
          ref={headerRef}
          style={{ display: "flex", gap: isMobile ? 16 : "40px", flexDirection: isMobile ? "column" : "row", alignItems: "flex-start", marginBottom: 32 }}
        >
          <div style={{ flex: 1, ...fadeUp(headerVisible, 0) }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 10, marginTop: 0 }}>
              Chỉ số chất lượng<br />không khí (AQI)
            </h2>
          </div>
          <div style={{ flex: 2, ...fadeUp(headerVisible, 150) }}>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0 }}>
              Biết về danh mục chỉ số chất lượng không khí (AQI) mà<br />không khí xung quanh bạn thuộc về và những gì nó ngụ ý.
            </p>
          </div>
        </div>

        {/* Filters/Tabs mock */}
        <div style={{ display: "flex", flexWrap: "wrap", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 6, marginBottom: 24, width: "fit-content", ...fadeUp(headerVisible, 250) }}>
          {tabs.map((tab) => {
            const isActive = activePollutant === tab;
            return (
              <div
                key={tab}
                onClick={() => setActivePollutant(tab)}
                style={{
                  padding: isMobile ? "8px 12px" : "8px 24px",
                  borderRadius: 8,
                  background: isActive ? "rgba(17,24,39,0.82)" : "transparent",
                  color: isActive ? "#3fa9ff" : "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer"
                }}
              >
                {tab}
              </div>
            );
          })}
        </div>

        {/* List of AQI levels */}
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {levels.map((item, i) => (
            <div
              key={item.level}
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: isMobile ? "14px" : "16px 24px",
                border: "1px solid rgba(255,255,255,0.05)",
                ...fadeUp(listVisible, i * 100),
              }}
            >
              <div style={{ flex: isMobile ? "none" : "0 0 200px", width: isMobile ? "100%" : "auto", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: item.color }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{item.level}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{item.range}</div>
                </div>
              </div>
              <div style={{ flex: 1, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, paddingRight: isMobile ? 0 : 24 }}>
                {item.desc}
              </div>
              <div style={{ flexShrink: 0 }}>
                <img src={item.img} alt={item.level} style={{ width: 48, height: "auto" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Hero Section ─────────────────────────────────────────────── */
function HeroSection({ isMobile }) {
  const navigate = useNavigate();
  const [heroRef, heroVisible] = useScrollReveal({ threshold: 0.05 });
  const [dashboardRef, dashboardVisible] = useScrollReveal({ threshold: 0.1 });
  const [nearbyStations, setNearbyStations] = useState([]);
  const [cityDetail, setCityDetail] = useState(null);
  const [dataError, setDataError] = useState("");

  /* ── Search state ── */
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ cities: [], stations: [] });
  const [showDrop, setShowDrop] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  /* Server-side search with 400ms debounce + AbortController */
  const doSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setSearchResults({ cities: [], stations: [] });
      setShowDrop(false);
      setSearching(false);
      return;
    }
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term.trim())}&limit=6`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults({
          cities: Array.isArray(data.cities) ? data.cities : [],
          stations: Array.isArray(data.stations) ? data.stations : [],
        });
        setShowDrop(true);
      }
    } catch (err) {
      if (err.name === "AbortError") return; // Silently ignore cancelled requests
    } finally {
      setSearching(false);
    }
  }, []);

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSearchResults({ cities: [], stations: [] });
      setShowDrop(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  }

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    doSearch(query);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCityData(slug) {
      if (!slug) return;
      try {
        setDataError("");
        const cityRes = await fetch(`/api/city/${slug}`, { cache: "no-store" });
        if (cityRes.ok) {
          const cityData = await cityRes.json();
          if (isMounted) setCityDetail(cityData);
        } else {
          if (isMounted) setDataError("Không tải được dữ liệu thành phố");
        }

        const stationsResponse = await fetch(`/api/city/${slug}/stations`, { cache: "no-store" });
        if (stationsResponse.ok) {
          const stData = await stationsResponse.json();
          if (isMounted && stData && stData.stations) {
            setNearbyStations(stData.stations.slice(0, 20));
          }
        }
      } catch {
        if (isMounted) setDataError("Không thể tải dữ liệu.");
      }
    }

    async function loadRandomFallback() {
      try {
        const res = await fetch(`/api/city/random`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          loadCityData(data.slug);
        } else {
          if (isMounted) setDataError("Không thể gọi dữ liệu ngẫu nhiên.");
        }
      } catch {
        if (isMounted) setDataError("Lỗi kết nối máy chủ.");
      }
    }

    async function initDashboard() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(`/api/city/nearest?lat=${latitude}&lon=${longitude}`, { cache: "no-store" });
              if (res.ok) {
                const data = await res.json();
                loadCityData(data.slug);
              } else {
                loadRandomFallback();
              }
            } catch {
              loadRandomFallback();
            }
          },
          (error) => {
            loadRandomFallback();
          },
          { timeout: 5000 }
        );
      } else {
        loadRandomFallback();
      }
    }

    initDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentAqi = Number(cityDetail?.calculatedAqi ?? 0);
  const currentColor = cityDetail?.colorHex ?? "#94a3b8";
  const currentLevel = cityDetail?.level ?? "Đang cập nhật";
  const currentCityName = cityDetail?.provinceName ?? "Hà Nội";
  const currentTimestamp = cityDetail?.timestamp;
  const dashboardTintStrong = hexToRgba(currentColor, 0.78);
  const dashboardTintLight = hexToRgba(currentColor, 0.32);

  const pollutantCards = [
    { name: "Vật chất hạt mịn (PM2.5)", value: cityDetail?.pm25, unit: "µg/m³", color: "#eab308" },
    { name: "Vật chất hạt mịn (PM10)", value: cityDetail?.pm10, unit: "µg/m³", color: "#f59e0b" },
    { name: "Carbon monoxide (CO)", value: cityDetail?.co, unit: "μg/m³", color: "#22c55e" },
    { name: "Lưu huỳnh dioxide (SO2)", value: cityDetail?.so2, unit: "μg/m³", color: "#22c55e" },
    { name: "Nitrogen dioxide (NO2)", value: cityDetail?.no2, unit: "μg/m³", color: "#22c55e" },
    { name: "Ozon (O3)", value: cityDetail?.o3, unit: "μg/m³", color: "#22c55e" },
  ];

  const mapCenter = cityDetail
    ? [cityDetail.latitude, cityDetail.longitude]
    : [21.0285, 105.8542];

  return (
    <section
      style={{
        paddingTop: isMobile ? 90 : 120,
        paddingBottom: 60,
        background: "linear-gradient(180deg, #eaf2ea 0%, #f5f9f5 100%)",
        textAlign: "center",
        fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        .landing-map,
        .landing-map .leaflet-pane,
        .landing-map .leaflet-control-container {
          z-index: 1 !important;
        }
        @keyframes cloudsPan {
          from { background-position: 0 0; }
          to { background-position: -1000px 0; }
        }
        @keyframes blinkRed {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>

      <div ref={heroRef} style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "0 14px" : "0 24px" }}>
        {/* Badge */}
        <div style={{ marginBottom: 20, ...fadeUp(heroVisible, 0) }}>
          <span
            style={{
              display: "inline-block",
              padding: "5px 16px",
              background: "#d1fae5",
              color: theme.green,
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid #a7f3d0",
            }}
          >
            THẾ HỆ BẢO VỆ MỚI
          </span>
        </div>

        <h1
          style={{
            fontSize: isMobile ? 34 : 52,
            fontWeight: 800,
            lineHeight: 1.15,
            color: theme.text,
            marginBottom: 12,
            letterSpacing: "-1px",
            ...fadeUp(heroVisible, 100),
          }}
        >
          Bảo vệ lá phổi của bạn
        </h1>
        <h1
          style={{
            fontSize: isMobile ? 34 : 52,
            fontWeight: 800,
            lineHeight: 1.15,
            color: theme.green,
            marginBottom: 20,
            letterSpacing: "-1px",
            ...fadeUp(heroVisible, 200),
          }}
        >
          với Dữ liệu AI.
        </h1>

        <p
          style={{
            fontSize: isMobile ? 15 : 17,
            color: theme.textMuted,
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 24px",
            ...fadeUp(heroVisible, 300),
          }}
        >
          Theo dõi chất lượng không khí thời gian thực với độ chính xác tuyệt đối từ vệ tinh và
          mạng lưới cảm biến cộng đồng.
        </p>

        {/* Search bar with autocomplete */}
        <div ref={searchRef} style={{ position: "relative", maxWidth: 520, margin: "0 auto", ...fadeUp(heroVisible, 400) }}>
          <form onSubmit={handleSearch} style={{ display: "flex", background: "white", borderRadius: 12, border: `1.5px solid ${showDrop ? theme.green : theme.border}`, boxShadow: showDrop ? `0 0 0 3px ${theme.green}22, 0 4px 24px rgba(0,0,0,0.1)` : "0 4px 24px rgba(0,0,0,0.07)", overflow: "visible", transition: "box-shadow .2s, border-color .2s" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => { if (searchResults.cities.length || searchResults.stations.length) setShowDrop(true); }}
              placeholder="Tìm thành phố hoặc trạm... (VD: Hà Nội)"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: theme.text, padding: "14px 0", background: "transparent" }}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setSearchResults({ cities: [], stations: [] }); setShowDrop(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, paddingRight: 8, display: "flex", alignItems: "center" }}>×</button>
            )}
            {!isMobile && <button type="submit" style={{ padding: "12px 22px", background: theme.green, color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, borderRadius: "0 10px 10px 0", flexShrink: 0, minHeight: 44 }}>Tìm kiếm</button>}
          </form>

          {/* Dropdown */}
          {(showDrop || searching) && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: `1px solid ${theme.border}`, zIndex: 999, overflow: "hidden" }}>
              {/* Loading indicator */}
              {searching && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", color: "#9ca3af", fontSize: 13 }}>
                  <div style={{ width: 14, height: 14, border: `2px solid ${theme.green}40`, borderTopColor: theme.green, borderRadius: "50%", animation: "searchSpin 0.7s linear infinite", flexShrink: 0 }} />
                  <style>{`@keyframes searchSpin { to { transform: rotate(360deg); } }`}</style>
                  Đang tìm kiếm...
                </div>
              )}

              {!searching && searchResults.cities.length > 0 && (
                <>
                  <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8 }}>🏙️ Thành phố / Tỉnh thành</div>
                  {searchResults.cities.map(c => (
                    <div key={c.cityId ?? c.slug} onClick={() => { navigate(`/thanh-pho/${c.slug}`); setShowDrop(false); setQuery(""); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: c.colorHex ? `${c.colorHex}20` : "#f0fdf4", border: `1.5px solid ${c.colorHex ?? theme.green}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: c.colorHex ?? theme.green, flexShrink: 0 }}>{c.calculatedAqi ?? "—"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{c.provinceName}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.region} · {c.level ?? "Đang cập nhật"}</div>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                    </div>
                  ))}
                </>
              )}
              {!searching && searchResults.stations.length > 0 && (
                <>
                  <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, borderTop: searchResults.cities.length ? `1px solid ${theme.border}` : "none" }}>📡 Trạm quan trắc</div>
                  {searchResults.stations.map(s => (
                    <div key={s.stationId} onClick={() => { navigate(`/tram/${s.stationId}`); setShowDrop(false); setQuery(""); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: s.colorHex ? `${s.colorHex}20` : "#f0fdf4", border: `1.5px solid ${s.colorHex ?? "#64748b"}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: s.colorHex ?? "#64748b", flexShrink: 0 }}>{s.calculatedAqi ?? "—"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.stationName}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {s.city}</div>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                    </div>
                  ))}
                </>
              )}
              {!searching && searchResults.cities.length === 0 && searchResults.stations.length === 0 && showDrop && (
                <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Không tìm thấy kết quả cho "{query}"</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-time dashboard mock – staggered */}
      <div
        ref={dashboardRef}
        style={{
          maxWidth: "none",
          margin: isMobile ? "36px auto 0" : "60px auto 0",
          padding: 0,
          textAlign: "left",
          position: "relative",
          zIndex: 1,
          ...fadeUp(dashboardVisible, 200),
        }}
      >
        <div
          style={{
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            borderTop: "1px solid #2a343a",
            borderBottom: "1px solid #2a343a",
            height: isMobile ? 280 : 360,
            position: "relative",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          <MapContainer
            className="landing-map"
            center={mapCenter}
            zoom={12}
            style={{ width: "100%", height: "100%", zIndex: 1 }}
            scrollWheelZoom={false}
            dragging={true}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            zoomControl={false}
            attributionControl={false}
          >
            <MapUpdater center={mapCenter} />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {nearbyStations.map((station) => {
              const isSelected = false;
              const markerColor = station.colorHex || "#facc15";
              const markerAqi = Number(station.calculatedAqi ?? 0);

              const icon = L.divIcon({
                className: "",
                html: `<div style="
                  width:${isSelected ? 38 : 34}px;
                  height:${isSelected ? 38 : 34}px;
                  border-radius:999px;
                  background:${markerColor};
                  color:#0f172a;
                  font-size:${isSelected ? 14 : 13}px;
                  font-weight:800;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  border:${isSelected ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.65)"};
                  box-shadow:0 3px 10px rgba(0,0,0,0.35);
                ">${markerAqi || "--"}</div>`,
                iconSize: [isSelected ? 38 : 34, isSelected ? 38 : 34],
                iconAnchor: [isSelected ? 19 : 17, isSelected ? 19 : 17],
              });

              return (
                <Marker
                  key={station.stationId}
                  position={[station.latitude, station.longitude]}
                  icon={icon}
                  interactive={false}
                />
              );
            })}
          </MapContainer>

          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(148,163,184,0.3)" }}>
            <div style={{ padding: "10px 16px", background: "#1f2937", color: "#e5e7eb", fontSize: 14, fontWeight: 600 }}>⚕ AQI</div>
            <div style={{ padding: "10px 16px", background: "rgba(31,41,55,0.65)", color: "#cbd5e1", fontSize: 14, fontWeight: 500 }}>☀ Thời tiết</div>
          </div>

          {!isMobile && <div style={{
            position: "absolute",
            top: 12,
            right: 20,
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(148,163,184,0.35)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 15,
            fontWeight: 600,
          }}>
            <span style={{ color: "#22d3ee" }}>AQI</span> Map ⤢
          </div>}
        </div>

        <div
          style={{
            background: "linear-gradient(180deg, #1b2126 0%, #0d1215 100%)",
            borderRadius: isMobile ? 14 : 20,
            padding: isMobile ? "12px 10px 18px" : "16px 16px 24px",
            color: "white",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
            border: "1px solid #2a343a",
            maxWidth: 1280,
            margin: isMobile ? "-26px auto 0" : "-50px auto 0",
            position: "relative",
            zIndex: 5,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", alignItems: "flex-start", marginBottom: 20, gap: isMobile ? 10 : 0, padding: isMobile ? "0 6px" : "0 16px" }}>
            <div>
              <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, marginBottom: 6, color: "#f8fafc" }}>Real-time Air Quality Index (AQI)</div>
              <div style={{ color: "#3b82f6", fontSize: 13, marginBottom: 6, cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate(`/thanh-pho/${cityDetail?.slug || 'ha-noi'}`)}>📍 {currentCityName}, Vietnam</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontStyle: "italic" }}>
                Cập nhật lần cuối: {formatLocalTime(currentTimestamp)} (Thời gian địa phương)
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 6, background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16, padding: "6px 12px",
                color: "#60a5fa", fontSize: 13, cursor: "pointer"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                Locate me
              </button>
              <button style={{ width: 44, height: 44, borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              </button>
              <button style={{ width: 44, height: 44, borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </div>
          </div>

          {/* Main Card */}
          <div style={{
            background: `linear-gradient(to bottom, #1f2937, ${dashboardTintStrong})`,
            borderRadius: 16,
            padding: isMobile ? "16px 14px 20px" : "32px 32px 48px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)"
          }}>
            {/* Dynamic Background Layout */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, width: "200%", height: 200,
              background: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 200" xmlns="http://www.w3.org/2000/svg"><path d="M150 120c0-16.6 13.4-30 30-30 6.2 0 12 2 16.7 5.3 6.9-18.7 25-32 46.6-32 23.3 0 42.8 15.6 48.6 36.7 4.1-3 9.2-4.7 14.8-4.7 13.8 0 25 11.2 25 25 0 12.3-8.9 22.5-20.7 24.6l-140.3.1C159.2 143.5 150 132.8 150 120z" fill="rgba(255,255,255,0.06)"/><path d="M550 130c0-22.1 17.9-40 40-40 8.3 0 15.9 2.5 22.3 6.8 9.3-25 33.3-42.8 62.1-42.8 31 0 57 20.8 64.7 48.8 5.6-3.8 12.4-6.1 19.6-6.1 18.4 0 33.3 14.9 33.3 33.3 0 16.3-11.8 30-27.5 32.8l-186.8.2C562.3 161.4 550 147.2 550 130z" fill="rgba(255,255,255,0.04)"/><path d="M850 140c0-11 9-20 20-20 4.1 0 8 1.3 11.2 3.4 4.6-12.5 16.7-21.4 31.1-21.4 15.5 0 28.5 10.3 32.4 24.4 2.8-1.9 6.2-3 9.8-3 9.2 0 16.7 7.5 16.7 16.7 0 8.2-5.9 15.1-13.8 16.4l-93.6.1C856.1 155.6 850 148.5 850 140z" fill="rgba(255,255,255,0.05)"/></svg>') repeat-x`,
              animation: "cloudsPan 60s linear infinite",
              pointerEvents: "none", zIndex: 0
            }}></div>
            <div style={{
              position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%",
              background: "linear-gradient(to top, rgba(234,179,8,0.4), transparent)",
              pointerEvents: "none", zIndex: 0
            }}></div>

            {/* Left Column (AQI Data) */}
            <div style={{ flex: 1, zIndex: 1, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "blinkRed 1.5s infinite" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>AQI Trực tiếp</span>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "8px 16px", border: `1px solid rgba(255,255,255,0.1)` }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>Chất lượng không khí là</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: currentColor }}>{currentLevel}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 24, textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                <span style={{ fontSize: isMobile ? 56 : 84, fontWeight: 800, lineHeight: 0.9, color: currentColor }}>{currentAqi || "--"}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.6)", paddingBottom: 12 }}>AQI (US)</span>
              </div>

              <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>PM2.5 : </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>{cityDetail?.pm25 ?? "--"}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginLeft: 4 }}>µg/m³</span>
                </div>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>PM10 : </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>{cityDetail?.pm10 ?? "--"}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginLeft: 4 }}>µg/m³</span>
                </div>
              </div>

              {/* AQI Scale Bar */}
              <div style={{ position: "relative", width: "80%", maxWidth: 500, height: 6, borderRadius: 3, background: "linear-gradient(to right, #63cc2f, #f5d233, #f39a3d, #ec4f83, #b748c8, #e92b49)", marginTop: 20 }}>
                <div style={{ position: "absolute", top: -24, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                  <span>Tốt</span><span>Vừa Phải</span><span>Kém</span><span>Không L...</span><span>Nghiêm ...</span><span>Nguy Hiể...</span>
                </div>
                <div style={{ position: "absolute", top: 12, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                  <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300</span><span>301+</span>
                </div>
                <div style={{ position: "absolute", top: -4, left: `${Math.min(100, Math.max(0, (currentAqi / 300) * 100))}%`, width: 14, height: 14, borderRadius: "50%", background: "white", border: "3px solid #1f2937", transform: "translateX(-50%)", zIndex: 2, boxShadow: "0 0 10px rgba(0,0,0,0.5)" }} />
              </div>
            </div>

            {/* Center Character */}
            {!isMobile && <div style={{ position: "absolute", bottom: -10, left: "45%", transform: "translateX(-50%)", zIndex: 2 }}>
              <img src={getCharacterByAqi(currentAqi)} alt="Character" style={{ height: 260, filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.3))" }} />
            </div>}

            {/* Right Column (Weather Data) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: isMobile ? "stretch" : "flex-end", zIndex: 1, marginTop: isMobile ? 22 : 0 }}>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)", padding: isMobile ? 14 : 24, width: isMobile ? "100%" : 360, backdropFilter: "blur(8px)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#94a3b8"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.3 0-.6 0-.8.1-1.3-3.6-5.1-5.6-8.9-4.2-2.4 1-4.2 3.1-4.6 5.6C1.4 11.9 0 13.8 0 16c0 2.8 2.2 5 5 5h12.5z" /></svg>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "white" }}>{cityDetail?.temperature ?? "--"} <span style={{ fontSize: 20 }}>°C</span></div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.9)", textTransform: "capitalize" }}>{cityDetail?.weatherDescription ?? cityDetail?.weatherMain ?? "Đang cập nhật"}</div>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#1f2937", cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                  </div>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 16 }} />

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, textAlign: "center" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Độ ẩm</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{cityDetail?.humidity ?? "--"} %</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Tốc độ gió</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{cityDetail?.windSpeed ?? "--"} km/h</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: "rgba(255,255,255,0.7)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Chỉ số UV</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>0</div>
                  </div>
                </Box>
              </div>
            </div>
          </div>

          {/* Pollutants row */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Các Chất Ô nhiễm Không khí Chính</h3>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
              {pollutantCards.map((p) => (
                <div key={p.name} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "16px", border: `1px solid ${p.color}40`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${p.color}` }} />
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{p.name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{p.value ?? "--"}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{p.unit}</div>
                  </div>
                </div>
              ))}
            </Box>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Tech Section ──────────────────────────────────────────────── */
function TechSection({ isMobile }) {
  const navigate = useNavigate();
  const [headerRef, headerVisible] = useScrollReveal();
  const [gridRef, gridVisible] = useScrollReveal({ threshold: 0.05 });

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
      title: "Bản đồ nhiệt thời gian thực",
      desc: "Trực quan hóa mức độ ô nhiễm trên bản đồ tương tác với độ trễ dưới 5 phút.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 12h4l3-9 4 18 3-9h6" />
        </svg>
      ),
      title: "Dự báo AI 7 ngày",
      desc: "Dự đoán xu hướng chất lượng không khí tuần tới bằng thuật toán Deep Learning.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
        </svg>
      ),
      title: "Tìm đường sinh thái (Eco-Routing)",
      desc: "Gợi ý lộ trình di chuyển có nồng độ ô nhiễm thấp nhất cho người đi bộ và đi xe đạp.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      title: "Cảnh báo tự động",
      desc: "Nhận thông báo ngay lập tức trên điện thoại khi chất lượng không khí tại nơi bạn ở vượt ngưỡng.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      title: "Trợ lý ảo AI Gemini",
      desc: "Hỏi đáp trực tiếp về sức khỏe và cách cải thiện chất lượng sống trong môi trường ô nhiễm.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.green} strokeWidth="1.8" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      ),
      title: "API cho Nhà phát triển",
      desc: "Tích hợp dữ liệu không khí sạch vào ứng dụng của bạn một cách dễ dàng và tin cậy.",
    },
  ];

  return (
    <section
      style={{ padding: isMobile ? "48px 16px" : "80px 48px", background: "white", fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header row */}
        <div
          ref={headerRef}
          style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "flex-start", justifyContent: "space-between", gap: isMobile ? 16 : 0, marginBottom: 32 }}
        >
          <div style={fadeUp(headerVisible, 0)}>
            <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: theme.text, marginBottom: 10, marginTop: 0 }}>
              Công nghệ bảo hộ tiên tiến
            </h2>
            <p style={{ fontSize: 15, color: theme.textMuted, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
              Chúng tôi kết hợp trí tuệ nhân tạo và mạng lưới dữ liệu vệ tinh để mang lại cái nhìn
              minh bạch nhất về bầu khí quyển.
            </p>
          </div>
          <button
            style={{
              padding: "11px 22px",
              background: theme.text,
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...fadeUp(headerVisible, 150),
            }}
          >
            Khám phá tất cả &rsaquo;
          </button>
        </div>

        {/* Feature cards – staggered */}
        <Box ref={gridRef} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              onClick={f.title === "Trợ lý ảo AI Gemini" ? () => navigate("/ai-chat") : undefined}
              style={{
                background: "#fafcfa",
                borderRadius: 14,
                border: `1px solid ${theme.border}`,
                padding: "28px 24px",
                transition: `box-shadow 0.2s, opacity 0.65s ease ${i * 90}ms, transform 0.65s ease ${i * 90}ms`,
                cursor: f.title === "Tro ly ao AI Gemini" ? "pointer" : "default",
                ...(gridVisible
                  ? { opacity: 1, transform: "translateY(0)" }
                  : { opacity: 0, transform: "translateY(28px)" }),
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{ marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 8, marginTop: 0 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.65, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </Box>
      </div>
    </section>
  );
}

/* ─── Why Section ───────────────────────────────────────────────── */
function WhySection({ isMobile }) {
  const [imgRef, imgVisible] = useScrollReveal();
  const [listRef, listVisible] = useScrollReveal({ threshold: 0.1 });

  const benefits = [
    {
      num: "1",
      title: "Dữ liệu minh bạch",
      desc: "Thông tin được tổng hợp từ hơn 500 trạm đo cộng đồng và dữ liệu vệ tinh NASA/ESA.",
    },
    {
      num: "2",
      title: "Tư vấn sức khỏe cá nhân hóa",
      desc: "Không chỉ là con số, chúng tôi đưa ra hành động cụ thể cho từng cá nhân dựa trên độ tuổi và bệnh nền.",
    },
    {
      num: "3",
      title: "Cộng đồng bảo vệ lôi cuốn",
      desc: "Tham gia báo cáo các điểm nóng ô nhiễm và cùng chung tay cải thiện môi trường sống.",
    },
  ];

  return (
    <section
      style={{
        padding: isMobile ? "48px 16px" : "80px 48px",
        background: "#f5f9f5",
        fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 24 : 64, alignItems: "center" }}>
        {/* Image card – slides from left */}
        <div ref={imgRef} style={{ flex: isMobile ? "none" : "0 0 320px", width: isMobile ? "100%" : "auto", position: "relative", ...fadeLeft(imgVisible, 0) }}>
          <div
            style={{
              background: "linear-gradient(145deg, #0a2e1e 0%, #0d4a2e 40%, #0f6e45 100%)",
              borderRadius: 20,
              overflow: "hidden",
              aspectRatio: "4/5",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 28,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: "30%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <svg width="200" height="80" viewBox="0 0 200 80" fill="none" opacity="0.4">
                <path d="M0 40 Q25 10 50 40 Q75 70 100 40 Q125 10 150 40 Q175 70 200 40" stroke="#4ade80" strokeWidth="2" fill="none" />
                <path d="M0 40 Q25 20 50 40 Q75 60 100 40 Q125 20 150 40 Q175 60 200 40" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.6" />
              </svg>
            </div>
            <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 4 }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                  </svg>
                </div>
                <span style={{ color: "white", fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>EC AIR</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 3 }}>EC0NY2S</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500 }}>Hệ thống Đang hoạt động</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: theme.text }}>98.4%</div>
              <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.5 }}>
                Độ chính xác dữ liệu từ trung tâm được kiểm chứng bởi AI
              </div>
            </div>
          </div>
        </div>

        {/* Benefits – slides from right, staggered */}
        <div ref={listRef} style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: isMobile ? 28 : 36,
              fontWeight: 800,
              color: theme.text,
              marginBottom: 32,
              marginTop: 0,
              lineHeight: 1.2,
              ...fadeRight(listVisible, 0),
            }}
          >
            Tại sao chọn<br />EcoAir VN?
          </h2>
          {benefits.map((item, i) => (
            <div
              key={item.num}
              style={{ display: "flex", gap: 18, marginBottom: 28, ...fadeRight(listVisible, (i + 1) * 120) }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: theme.green,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {item.num}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 5, marginTop: 4 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function LandingPage() {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <MainLayout activePage="Trang chủ">
      <HeroSection isMobile={isMobile} />
      <AqiInfoSection isMobile={isMobile} />
      <TechSection isMobile={isMobile} />
      <WhySection isMobile={isMobile} />
    </MainLayout>
  );
}
