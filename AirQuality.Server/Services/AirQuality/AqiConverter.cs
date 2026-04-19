using System.Globalization;

namespace AirQuality.Server.Services.AirQuality;

public static class AqiConverter
{
    private static readonly Dictionary<string, double[,]> Breakpoints = new(StringComparer.OrdinalIgnoreCase)
    {
        ["pm25"] = new[,]
        {
            { 0d, 50d, 0.0d, 25.0d },
            { 51d, 100d, 25.1d, 50.0d },
            { 101d, 150d, 50.1d, 80.0d },
            { 151d, 200d, 80.1d, 150.0d },
            { 201d, 300d, 150.1d, 250.0d },
            { 301d, 400d, 250.1d, 350.0d },
            { 401d, 500d, 350.1d, 500.0d }
        },
        ["pm10"] = new[,]
        {
            { 0d, 50d, 0d, 50d },
            { 51d, 100d, 51d, 150d },
            { 101d, 150d, 151d, 250d },
            { 151d, 200d, 251d, 350d },
            { 201d, 300d, 351d, 420d },
            { 301d, 400d, 421d, 500d },
            { 401d, 500d, 501d, 600d }
        },
        ["co"] = new[,]
        {
            { 0d, 50d, 0d, 10000d },
            { 51d, 100d, 10001d, 30000d },
            { 101d, 150d, 30001d, 45000d },
            { 151d, 200d, 45001d, 60000d },
            { 201d, 300d, 60001d, 90000d },
            { 301d, 400d, 90001d, 120000d },
            { 401d, 500d, 120001d, 150000d }
        },
        ["so2"] = new[,]
        {
            { 0d, 50d, 0d, 125d },
            { 51d, 100d, 126d, 350d },
            { 101d, 150d, 351d, 500d },
            { 151d, 200d, 501d, 650d },
            { 201d, 300d, 651d, 800d },
            { 301d, 400d, 801d, 1060d },
            { 401d, 500d, 1061d, 1340d }
        },
        ["no2"] = new[,]
        {
            { 0d, 50d, 0d, 100d },
            { 51d, 100d, 101d, 200d },
            { 101d, 150d, 201d, 700d },
            { 151d, 200d, 701d, 1200d },
            { 201d, 300d, 1201d, 2340d },
            { 301d, 400d, 2341d, 3000d },
            { 401d, 500d, 3001d, 3750d }
        },
        ["o3"] = new[,]
        {
            { 0d, 50d, 0d, 160d },
            { 51d, 100d, 161d, 200d },
            { 101d, 150d, 201d, 300d },
            { 151d, 200d, 301d, 400d },
            { 201d, 300d, 401d, 800d },
            { 301d, 400d, 801d, 1000d },
            { 401d, 500d, 1001d, 1200d }
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
