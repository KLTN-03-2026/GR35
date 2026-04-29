namespace AirQuality.Server.Common;

public static class VietnamTime
{
    // Vietnam does not observe DST. Keep it simple and consistent with existing codebase
    // (which already uses DateTime.UtcNow.AddHours(7) in several services).
    private const int UtcOffsetHours = 7;

    /// <summary>
    /// Returns current time in Vietnam (UTC+7) with DateTimeKind.Unspecified,
    /// matching how timestamps are parsed/stored elsewhere in this codebase.
    /// </summary>
    public static DateTime Now()
    {
        var local = DateTime.UtcNow.AddHours(UtcOffsetHours);
        return DateTime.SpecifyKind(local, DateTimeKind.Unspecified);
    }

    /// <summary>
    /// Converts a UTC timestamp to Vietnam time (UTC+7), returning DateTimeKind.Unspecified.
    /// </summary>
    public static DateTime FromUtc(DateTime utc)
    {
        var utcNormalized = utc.Kind == DateTimeKind.Utc
            ? utc
            : DateTime.SpecifyKind(utc, DateTimeKind.Utc);

        var local = utcNormalized.AddHours(UtcOffsetHours);
        return DateTime.SpecifyKind(local, DateTimeKind.Unspecified);
    }
}

