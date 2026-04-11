using System.Globalization;

namespace AirQuality.Server.Services.AirQuality;

public static class AqiConverter
{
    private static readonly Dictionary<string, double[,]> Breakpoints = new(StringComparer.OrdinalIgnoreCase)
    {
        ["pm25"] = new[,]
        {
            { 0d, 50d, 0.0d, 12.0d },
            { 51d, 100d, 12.1d, 35.4d },
            { 101d, 150d, 35.5d, 55.4d },
            { 151d, 200d, 55.5d, 150.4d },
            { 201d, 300d, 150.5d, 250.4d },
            { 301d, 400d, 250.5d, 350.4d },
            { 401d, 500d, 350.5d, 500.4d }
        },
        ["pm10"] = new[,]
        {
            { 0d, 50d, 0d, 54d },
            { 51d, 100d, 55d, 154d },
            { 101d, 150d, 155d, 254d },
            { 151d, 200d, 255d, 354d },
            { 201d, 300d, 355d, 424d },
            { 301d, 400d, 425d, 504d },
            { 401d, 500d, 505d, 604d }
        },
        ["co"] = new[,]
        {
            { 0d, 50d, 0.0d, 4.4d },
            { 51d, 100d, 4.5d, 9.4d },
            { 101d, 150d, 9.5d, 12.4d },
            { 151d, 200d, 12.5d, 15.4d },
            { 201d, 300d, 15.5d, 30.4d },
            { 301d, 400d, 30.5d, 40.4d },
            { 401d, 500d, 40.5d, 50.4d }
        },
        ["so2"] = new[,]
        {
            { 0d, 50d, 0d, 35d },
            { 51d, 100d, 36d, 75d },
            { 101d, 150d, 76d, 185d },
            { 151d, 200d, 186d, 304d },
            { 201d, 300d, 305d, 604d },
            { 301d, 400d, 605d, 804d },
            { 401d, 500d, 805d, 1004d }
        },
        ["no2"] = new[,]
        {
            { 0d, 50d, 0d, 53d },
            { 51d, 100d, 54d, 100d },
            { 101d, 150d, 101d, 360d },
            { 151d, 200d, 361d, 649d },
            { 201d, 300d, 650d, 1249d },
            { 301d, 400d, 1250d, 1649d },
            { 401d, 500d, 1650d, 2049d }
        },
        ["o3"] = new[,]
        {
            { 0d, 50d, 0.000d, 0.054d },
            { 51d, 100d, 0.055d, 0.070d },
            { 101d, 150d, 0.071d, 0.085d },
            { 151d, 200d, 0.086d, 0.105d },
            { 201d, 300d, 0.106d, 0.200d },
            { 301d, 400d, 0.125d, 0.164d },
            { 401d, 500d, 0.165d, 0.204d }
        }
    };

    public static double? ConvertIaqiToRaw(string pollutantCode, double iaqi)
    {
        if (string.IsNullOrWhiteSpace(pollutantCode) || iaqi < 0)
        {
            return null;
        }

        var normalizedCode = pollutantCode.Trim().ToLower(CultureInfo.InvariantCulture);
        if (!Breakpoints.TryGetValue(normalizedCode, out var ranges))
        {
            return null;
        }

        var boundedIaqi = Math.Min(iaqi, 500d);

        for (var i = 0; i < ranges.GetLength(0); i++)
        {
            var iLow = ranges[i, 0];
            var iHigh = ranges[i, 1];
            var cLow = ranges[i, 2];
            var cHigh = ranges[i, 3];

            if (boundedIaqi < iLow || boundedIaqi > iHigh)
            {
                continue;
            }

            var concentration = ((boundedIaqi - iLow) / (iHigh - iLow)) * (cHigh - cLow) + cLow;
            return Math.Round(concentration, 2);
        }

        return null;
    }
}
