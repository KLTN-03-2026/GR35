namespace AirQuality.Server.Services.Chatbot;

/// <summary>
/// Helper resolve tên tỉnh/thành phố từ các biến thể (alias) → tên chuẩn trong DB
/// </summary>
public static class CityAliasResolver
{
    private static readonly Dictionary<string, string> Aliases = new(StringComparer.OrdinalIgnoreCase)
    {
        // Hà Nội
        { "hà nội", "Hà Nội" }, { "ha noi", "Hà Nội" }, { "hn", "Hà Nội" }, { "hanoi", "Hà Nội" },
        // Hồ Chí Minh
        { "hồ chí minh", "Hồ Chí Minh" }, { "ho chi minh", "Hồ Chí Minh" }, { "hcm", "Hồ Chí Minh" },
        { "sài gòn", "Hồ Chí Minh" }, { "sai gon", "Hồ Chí Minh" }, { "sg", "Hồ Chí Minh" },
        { "tphcm", "Hồ Chí Minh" }, { "tp hcm", "Hồ Chí Minh" }, { "saigon", "Hồ Chí Minh" },
        { "tp. hồ chí minh", "Hồ Chí Minh" }, { "thành phố hồ chí minh", "Hồ Chí Minh" },
        // Đà Nẵng
        { "đà nẵng", "Đà Nẵng" }, { "da nang", "Đà Nẵng" }, { "dn", "Đà Nẵng" }, { "danang", "Đà Nẵng" },
        // Hải Phòng
        { "hải phòng", "Hải Phòng" }, { "hai phong", "Hải Phòng" }, { "hp", "Hải Phòng" },
        // Cần Thơ
        { "cần thơ", "Cần Thơ" }, { "can tho", "Cần Thơ" },
        // Huế
        { "huế", "Thừa Thiên Huế" }, { "hue", "Thừa Thiên Huế" }, { "thừa thiên huế", "Thừa Thiên Huế" },
        { "thua thien hue", "Thừa Thiên Huế" },
        // Các thành phố → tỉnh
        { "nha trang", "Khánh Hòa" }, { "đà lạt", "Lâm Đồng" }, { "da lat", "Lâm Đồng" }, { "dalat", "Lâm Đồng" },
        { "vũng tàu", "Bà Rịa - Vũng Tàu" }, { "vung tau", "Bà Rịa - Vũng Tàu" },
        { "hạ long", "Quảng Ninh" }, { "ha long", "Quảng Ninh" },
        { "quảng ninh", "Quảng Ninh" }, { "quang ninh", "Quảng Ninh" },
        { "bình dương", "Bình Dương" }, { "binh duong", "Bình Dương" },
        { "đồng nai", "Đồng Nai" }, { "dong nai", "Đồng Nai" },
        { "bắc ninh", "Bắc Ninh" }, { "bac ninh", "Bắc Ninh" },
        { "thanh hóa", "Thanh Hóa" }, { "thanh hoa", "Thanh Hóa" },
        { "nghệ an", "Nghệ An" }, { "nghe an", "Nghệ An" },
        { "thái nguyên", "Thái Nguyên" }, { "thai nguyen", "Thái Nguyên" },
        { "hải dương", "Hải Dương" }, { "hai duong", "Hải Dương" },
        { "lâm đồng", "Lâm Đồng" }, { "lam dong", "Lâm Đồng" },
        { "khánh hòa", "Khánh Hòa" }, { "khanh hoa", "Khánh Hòa" },
        { "bà rịa", "Bà Rịa - Vũng Tàu" }, { "ba ria", "Bà Rịa - Vũng Tàu" },
        { "bình định", "Bình Định" }, { "binh dinh", "Bình Định" },
        { "phú thọ", "Phú Thọ" }, { "phu tho", "Phú Thọ" },
        { "quảng nam", "Quảng Nam" }, { "quang nam", "Quảng Nam" },
        { "an giang", "An Giang" }, { "bắc giang", "Bắc Giang" }, { "bac giang", "Bắc Giang" },
        { "bạc liêu", "Bạc Liêu" }, { "bac lieu", "Bạc Liêu" },
        { "bến tre", "Bến Tre" }, { "ben tre", "Bến Tre" },
        { "bình phước", "Bình Phước" }, { "binh phuoc", "Bình Phước" },
        { "bình thuận", "Bình Thuận" }, { "binh thuan", "Bình Thuận" },
        { "cà mau", "Cà Mau" }, { "ca mau", "Cà Mau" },
        { "cao bằng", "Cao Bằng" }, { "cao bang", "Cao Bằng" },
        { "đắk lắk", "Đắk Lắk" }, { "dak lak", "Đắk Lắk" },
        { "đắk nông", "Đắk Nông" }, { "dak nong", "Đắk Nông" },
        { "điện biên", "Điện Biên" }, { "dien bien", "Điện Biên" },
        { "đồng tháp", "Đồng Tháp" }, { "dong thap", "Đồng Tháp" },
        { "gia lai", "Gia Lai" },
        { "hà giang", "Hà Giang" }, { "ha giang", "Hà Giang" },
        { "hà nam", "Hà Nam" }, { "ha nam", "Hà Nam" },
        { "hà tĩnh", "Hà Tĩnh" }, { "ha tinh", "Hà Tĩnh" },
        { "hậu giang", "Hậu Giang" }, { "hau giang", "Hậu Giang" },
        { "hòa bình", "Hòa Bình" }, { "hoa binh", "Hòa Bình" },
        { "hưng yên", "Hưng Yên" }, { "hung yen", "Hưng Yên" },
        { "kiên giang", "Kiên Giang" }, { "kien giang", "Kiên Giang" },
        { "kon tum", "Kon Tum" },
        { "lai châu", "Lai Châu" }, { "lai chau", "Lai Châu" },
        { "lạng sơn", "Lạng Sơn" }, { "lang son", "Lạng Sơn" },
        { "lào cai", "Lào Cai" }, { "lao cai", "Lào Cai" },
        { "long an", "Long An" },
        { "nam định", "Nam Định" }, { "nam dinh", "Nam Định" },
        { "ninh bình", "Ninh Bình" }, { "ninh binh", "Ninh Bình" },
        { "ninh thuận", "Ninh Thuận" }, { "ninh thuan", "Ninh Thuận" },
        { "phú yên", "Phú Yên" }, { "phu yen", "Phú Yên" },
        { "quảng bình", "Quảng Bình" }, { "quang binh", "Quảng Bình" },
        { "quảng ngãi", "Quảng Ngãi" }, { "quang ngai", "Quảng Ngãi" },
        { "quảng trị", "Quảng Trị" }, { "quang tri", "Quảng Trị" },
        { "sóc trăng", "Sóc Trăng" }, { "soc trang", "Sóc Trăng" },
        { "sơn la", "Sơn La" }, { "son la", "Sơn La" },
        { "tây ninh", "Tây Ninh" }, { "tay ninh", "Tây Ninh" },
        { "thái bình", "Thái Bình" }, { "thai binh", "Thái Bình" },
        { "tiền giang", "Tiền Giang" }, { "tien giang", "Tiền Giang" },
        { "trà vinh", "Trà Vinh" }, { "tra vinh", "Trà Vinh" },
        { "tuyên quang", "Tuyên Quang" }, { "tuyen quang", "Tuyên Quang" },
        { "vĩnh long", "Vĩnh Long" }, { "vinh long", "Vĩnh Long" },
        { "vĩnh phúc", "Vĩnh Phúc" }, { "vinh phuc", "Vĩnh Phúc" },
        { "yên bái", "Yên Bái" }, { "yen bai", "Yên Bái" },
        { "bắc kạn", "Bắc Kạn" }, { "bac kan", "Bắc Kạn" },
    };

    /// <summary>Resolve alias → tên chuẩn. Trả về null nếu không tìm thấy.</summary>
    public static string? Resolve(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;
        return Aliases.TryGetValue(input.Trim(), out var name) ? name : null;
    }

    /// <summary>Resolve alias, nếu không có alias thì trả về input gốc (capitalize first letter)</summary>
    public static string ResolveOrPassthrough(string input)
    {
        return Resolve(input) ?? input.Trim();
    }
}
