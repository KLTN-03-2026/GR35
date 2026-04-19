namespace AirQuality.Server.Common;

public record VietnamProvince(string Name, string Slug, double Lat, double Lon, string Region);

public static class VietnamProvinces
{
    public static readonly IReadOnlyList<VietnamProvince> All = new[]
    {
        // ── Miền Bắc (25) ────────────────────────────────────────────────
        new VietnamProvince("Hà Nội",          "ha-noi",           21.0278, 105.8342, "Miền Bắc"),
        new VietnamProvince("Hải Phòng",       "hai-phong",        20.8449, 106.6881, "Miền Bắc"),
        new VietnamProvince("Quảng Ninh",      "quang-ninh",       21.0064, 107.2925, "Miền Bắc"),
        new VietnamProvince("Bắc Giang",       "bac-giang",        21.2731, 106.1946, "Miền Bắc"),
        new VietnamProvince("Bắc Kạn",         "bac-kan",          22.1473, 105.8348, "Miền Bắc"),
        new VietnamProvince("Bắc Ninh",        "bac-ninh",         21.1861, 106.0763, "Miền Bắc"),
        new VietnamProvince("Cao Bằng",        "cao-bang",         22.6660, 106.2638, "Miền Bắc"),
        new VietnamProvince("Điện Biên",       "dien-bien",        21.3860, 103.0235, "Miền Bắc"),
        new VietnamProvince("Hà Giang",        "ha-giang",         22.8233, 104.9836, "Miền Bắc"),
        new VietnamProvince("Hà Nam",          "ha-nam",           20.5835, 105.9229, "Miền Bắc"),
        new VietnamProvince("Hải Dương",       "hai-duong",        20.9374, 106.3145, "Miền Bắc"),
        new VietnamProvince("Hòa Bình",        "hoa-binh",         20.6861, 105.3131, "Miền Bắc"),
        new VietnamProvince("Hưng Yên",        "hung-yen",         20.6464, 106.0511, "Miền Bắc"),
        new VietnamProvince("Lai Châu",        "lai-chau",         22.3862, 103.4702, "Miền Bắc"),
        new VietnamProvince("Lạng Sơn",        "lang-son",         21.8537, 106.7610, "Miền Bắc"),
        new VietnamProvince("Lào Cai",         "lao-cai",          22.4856, 103.9754, "Miền Bắc"),
        new VietnamProvince("Nam Định",        "nam-dinh",         20.4205, 106.1682, "Miền Bắc"),
        new VietnamProvince("Ninh Bình",       "ninh-binh",        20.2506, 105.9745, "Miền Bắc"),
        new VietnamProvince("Phú Thọ",         "phu-tho",          21.3980, 105.2300, "Miền Bắc"),
        new VietnamProvince("Sơn La",          "son-la",           21.3270, 103.9146, "Miền Bắc"),
        new VietnamProvince("Thái Bình",       "thai-binh",        20.4463, 106.3366, "Miền Bắc"),
        new VietnamProvince("Thái Nguyên",     "thai-nguyen",      21.5942, 105.8482, "Miền Bắc"),
        new VietnamProvince("Tuyên Quang",     "tuyen-quang",      21.8236, 105.2180, "Miền Bắc"),
        new VietnamProvince("Vĩnh Phúc",       "vinh-phuc",        21.3089, 105.6047, "Miền Bắc"),
        new VietnamProvince("Yên Bái",         "yen-bai",          21.7236, 104.9114, "Miền Bắc"),

        // ── Miền Trung (14) ──────────────────────────────────────────────
        new VietnamProvince("Thanh Hóa",       "thanh-hoa",        19.8075, 105.7769, "Miền Trung"),
        new VietnamProvince("Nghệ An",         "nghe-an",          18.6796, 105.6813, "Miền Trung"),
        new VietnamProvince("Hà Tĩnh",         "ha-tinh",          18.3560, 105.8877, "Miền Trung"),
        new VietnamProvince("Quảng Bình",      "quang-binh",       17.4692, 106.5946, "Miền Trung"),
        new VietnamProvince("Quảng Trị",       "quang-tri",        16.7403, 107.1854, "Miền Trung"),
        new VietnamProvince("Thừa Thiên Huế",  "thua-thien-hue",   16.4583, 107.5905, "Miền Trung"),
        new VietnamProvince("Đà Nẵng",         "da-nang",          16.0544, 108.2022, "Miền Trung"),
        new VietnamProvince("Quảng Nam",       "quang-nam",        15.5394, 108.0191, "Miền Trung"),
        new VietnamProvince("Quảng Ngãi",      "quang-ngai",       15.1214, 108.8044, "Miền Trung"),
        new VietnamProvince("Bình Định",       "binh-dinh",        13.7757, 109.2236, "Miền Trung"),
        new VietnamProvince("Phú Yên",         "phu-yen",          13.0882, 109.0929, "Miền Trung"),
        new VietnamProvince("Khánh Hòa",       "khanh-hoa",        12.2388, 109.1967, "Miền Trung"),
        new VietnamProvince("Ninh Thuận",      "ninh-thuan",       11.5645, 108.9883, "Miền Trung"),
        new VietnamProvince("Bình Thuận",      "binh-thuan",       11.0904, 108.0721, "Miền Trung"),

        // ── Tây Nguyên (5) ───────────────────────────────────────────────
        new VietnamProvince("Kon Tum",         "kon-tum",          14.3497, 108.0005, "Tây Nguyên"),
        new VietnamProvince("Gia Lai",         "gia-lai",          13.9810, 108.0000, "Tây Nguyên"),
        new VietnamProvince("Đắk Lắk",        "dak-lak",          12.7100, 108.2378, "Tây Nguyên"),
        new VietnamProvince("Đắk Nông",        "dak-nong",         12.0046, 107.6898, "Tây Nguyên"),
        new VietnamProvince("Lâm Đồng",        "lam-dong",         11.9465, 108.4419, "Tây Nguyên"),

        // ── Miền Nam (19) ────────────────────────────────────────────────
        new VietnamProvince("TP. Hồ Chí Minh", "tp-ho-chi-minh",  10.8231, 106.6297, "Miền Nam"),
        new VietnamProvince("Bình Dương",      "binh-duong",       11.3254, 106.4770, "Miền Nam"),
        new VietnamProvince("Bình Phước",      "binh-phuoc",       11.7511, 106.9236, "Miền Nam"),
        new VietnamProvince("Tây Ninh",        "tay-ninh",         11.3103, 106.0981, "Miền Nam"),
        new VietnamProvince("Đồng Nai",        "dong-nai",         11.0686, 107.1676, "Miền Nam"),
        new VietnamProvince("Bà Rịa-Vũng Tàu", "ba-ria-vung-tau", 10.5417, 107.2429, "Miền Nam"),
        new VietnamProvince("Long An",         "long-an",          10.5360, 106.4101, "Miền Nam"),
        new VietnamProvince("Tiền Giang",      "tien-giang",       10.3596, 106.3659, "Miền Nam"),
        new VietnamProvince("Bến Tre",         "ben-tre",          10.2433, 106.3759, "Miền Nam"),
        new VietnamProvince("Đồng Tháp",       "dong-thap",        10.4934, 105.6882, "Miền Nam"),
        new VietnamProvince("Vĩnh Long",       "vinh-long",        10.2398, 105.9721, "Miền Nam"),
        new VietnamProvince("Trà Vinh",        "tra-vinh",          9.9513, 106.3421, "Miền Nam"),
        new VietnamProvince("An Giang",        "an-giang",         10.5216, 105.1259, "Miền Nam"),
        new VietnamProvince("Kiên Giang",      "kien-giang",       10.0125, 105.0809, "Miền Nam"),
        new VietnamProvince("Cần Thơ",         "can-tho",          10.0452, 105.7469, "Miền Nam"),
        new VietnamProvince("Hậu Giang",       "hau-giang",         9.7573, 105.6412, "Miền Nam"),
        new VietnamProvince("Sóc Trăng",       "soc-trang",         9.6056, 105.9739, "Miền Nam"),
        new VietnamProvince("Bạc Liêu",        "bac-lieu",          9.2941, 105.7278, "Miền Nam"),
        new VietnamProvince("Cà Mau",          "ca-mau",            9.1527, 105.1961, "Miền Nam"),
    };
}
