namespace AirQuality.Server.Services.AirQuality;

/// <summary>
/// Tính chỉ số AQI (chuẩn VN_AQI theo QĐ 1459/QĐ-TCMT) từ nồng độ raw (µg/m³).
/// Hướng tính: Raw concentration → Sub-index AQI (theo VN_AQI linear interpolation).
/// Đây là hướng NGƯỢC lại so với AqiConverter (IAQI → Raw).
///
/// Công thức quy định chung:
///   AQI = [(I_Hi - I_Lo) / (C_Hi - C_Lo)] × (C - C_Lo) + I_Lo
///
/// Đơn vị OpenWeatherMap trả về: tất cả µg/m³.
/// Đơn vị VN_AQI breakpoints: sử dụng trực tiếp µg/m³ cho tất cả thông số nên không cần convert.
/// </summary>
public static class AqiCalculator
{
    // ── Breakpoints: { C_Low, C_High, AQI_Low, AQI_High } ──────────────

    // PM2.5 (µg/m³, 24h average/Nowcast)
    private static readonly double[,] Pm25Breakpoints =
    {
        { 0.0, 25.0, 0, 50 },
        { 25.1, 50.0, 51, 100 },
        { 50.1, 80.0, 101, 150 },
        { 80.1, 150.0, 151, 200 },
        { 150.1, 250.0, 201, 300 },
        { 250.1, 350.0, 301, 400 },
        { 350.1, 500.0, 401, 500 }
    };

    // PM10 (µg/m³, 24h average/Nowcast)
    private static readonly double[,] Pm10Breakpoints =
    {
        { 0, 50, 0, 50 },
        { 51, 150, 51, 100 },
        { 151, 250, 101, 150 },
        { 251, 350, 151, 200 },
        { 351, 420, 201, 300 },
        { 421, 500, 301, 400 },
        { 501, 600, 401, 500 }
    };

    // CO (µg/m³, 1h average)
    private static readonly double[,] CoBreakpoints =
    {
        { 0, 10000, 0, 50 },
        { 10001, 30000, 51, 100 },
        { 30001, 45000, 101, 150 },
        { 45001, 60000, 151, 200 },
        { 60001, 90000, 201, 300 },
        { 90001, 120000, 301, 400 },
        { 120001, 150000, 401, 500 }
    };

    // NO2 (µg/m³, 1h average)
    private static readonly double[,] No2Breakpoints =
    {
        { 0, 100, 0, 50 },
        { 101, 200, 51, 100 },
        { 201, 700, 101, 150 },
        { 701, 1200, 151, 200 },
        { 1201, 2340, 201, 300 },
        { 2341, 3000, 301, 400 },
        { 3001, 3750, 401, 500 }
    };

    // SO2 (µg/m³, 1h average)
    private static readonly double[,] So2Breakpoints =
    {
        { 0, 125, 0, 50 },
        { 126, 350, 51, 100 },
        { 351, 500, 101, 150 },
        { 501, 650, 151, 200 },
        { 651, 800, 201, 300 },
        { 801, 1060, 301, 400 },
        { 1061, 1340, 401, 500 }
    };

    // O3 (µg/m³, 1h average)
    private static readonly double[,] O3Breakpoints =
    {
        { 0, 160, 0, 50 },
        { 161, 200, 51, 100 },
        { 201, 300, 101, 150 },
        { 301, 400, 151, 200 },
        { 401, 800, 201, 300 },
        { 801, 1000, 301, 400 },
        { 1001, 1200, 401, 500 }
    };

    // ── Public API ──────────────────────────────────────────────────────

    /// <summary>Tính AQI sub-index từ PM2.5 (µg/m³).</summary>
    public static int? FromPm25(double? ugm3)
    {
        if (ugm3 is null or < 0) return null;
        // Truncate to 1 decimal (EPA standard for PM2.5)
        var truncated = Math.Truncate(ugm3.Value * 10) / 10;
        return LinearInterpolate(Pm25Breakpoints, truncated);
    }

    /// <summary>Tính AQI sub-index từ PM10 (µg/m³).</summary>
    public static int? FromPm10(double? ugm3)
    {
        if (ugm3 is null or < 0) return null;
        var truncated = Math.Truncate(ugm3.Value);
        return LinearInterpolate(Pm10Breakpoints, truncated);
    }

    /// <summary>Tính AQI sub-index từ CO (µg/m³).</summary>
    public static int? FromCo(double? ugm3)
    {
        if (ugm3 is null or < 0) return null;
        var truncated = Math.Truncate(ugm3.Value * 10) / 10;
        return LinearInterpolate(CoBreakpoints, truncated);
    }

    /// <summary>Tính AQI sub-index từ NO2 (µg/m³).</summary>
    public static int? FromNo2(double? ugm3)
    {
        if (ugm3 is null or < 0) return null;
        var truncated = Math.Truncate(ugm3.Value * 10) / 10;
        return LinearInterpolate(No2Breakpoints, truncated);
    }

    /// <summary>Tính AQI sub-index từ SO2 (µg/m³).</summary>
    public static int? FromSo2(double? ugm3)
    {
        if (ugm3 is null or < 0) return null;
        var truncated = Math.Truncate(ugm3.Value * 10) / 10;
        return LinearInterpolate(So2Breakpoints, truncated);
    }

    /// <summary>Tính AQI sub-index từ O3 (µg/m³).</summary>
    public static int? FromO3(double? ugm3)
    {
        if (ugm3 is null or < 0) return null;
        var truncated = Math.Truncate(ugm3.Value * 10) / 10;
        return LinearInterpolate(O3Breakpoints, truncated);
    }

    /// <summary>
    /// AQI tổng = MAX của tất cả sub-index có giá trị (theo chuẩn US EPA).
    /// </summary>
    public static int? CalculateOverallAqi(
        int? aqiPm25, int? aqiPm10, int? aqiCo,
        int? aqiNo2, int? aqiSo2, int? aqiO3)
    {
        var values = new[] { aqiPm25, aqiPm10, aqiCo, aqiNo2, aqiSo2, aqiO3 }
            .Where(v => v.HasValue)
            .Select(v => v!.Value)
            .ToList();

        return values.Count > 0 ? values.Max() : null;
    }

    /// <summary>
    /// Trả về tên chất gây ô nhiễm chiếm ưu thế (sub-index cao nhất).
    /// </summary>
    public static string? GetDominantPollutant(
        int? aqiPm25, int? aqiPm10, int? aqiCo,
        int? aqiNo2, int? aqiSo2, int? aqiO3)
    {
        var pairs = new (string Name, int? Value)[]
        {
            ("PM2.5", aqiPm25),
            ("PM10",  aqiPm10),
            ("CO",    aqiCo),
            ("NO2",   aqiNo2),
            ("SO2",   aqiSo2),
            ("O3",    aqiO3)
        };

        var dominant = pairs
            .Where(p => p.Value.HasValue)
            .OrderByDescending(p => p.Value!.Value)
            .FirstOrDefault();

        return dominant.Name;
    }

    // ── EPA Linear Interpolation ────────────────────────────────────────

    private static int? LinearInterpolate(double[,] breakpoints, double concentration)
    {
        for (var i = 0; i < breakpoints.GetLength(0); i++)
        {
            var cLow = breakpoints[i, 0];
            var cHigh = breakpoints[i, 1];
            var iLow = breakpoints[i, 2];
            var iHigh = breakpoints[i, 3];

            if (concentration < cLow || concentration > cHigh)
                continue;

            var aqi = ((iHigh - iLow) / (cHigh - cLow)) * (concentration - cLow) + iLow;
            return (int)Math.Round(aqi, MidpointRounding.AwayFromZero);
        }

        // Nồng độ vượt quá bảng breakpoint → trả 500 (giá trị tối đa)
        if (concentration > 0)
        {
            var lastRow = breakpoints.GetLength(0) - 1;
            if (concentration > breakpoints[lastRow, 1])
                return 500;
        }

        return null;
    }
}
