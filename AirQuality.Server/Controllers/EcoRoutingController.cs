using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using AirQuality.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/eco-routing")]
public class EcoRoutingController(ApplicationDbContext dbContext, IHttpClientFactory httpClientFactory) : ControllerBase
{
    // ─── Request / Response DTOs ──────────────────────────────────────────────
    public sealed record EcoRouteRequest(
        double OriginLat,
        double OriginLng,
        double DestLat,
        double DestLng,
        bool UseHealthProfile = false
    );

    public sealed record AqiSample(double DistanceKm, double Aqi, double Pm25);

    public sealed record RouteResult
    {
        public string Label { get; init; } = "";
        public double DistanceKm { get; init; }
        public double DurationMin { get; init; }
        public double AvgAqi { get; init; }
        public double AvgPm25 { get; init; }
        public double? HealthRiskScore { get; init; }
        public string? HealthAdvice { get; init; }
        public bool Recommended { get; init; }
        public double[][] Geometry { get; init; } = [];
        public List<AqiSample> AqiSamples { get; init; } = [];
    }

    public sealed record EcoRouteResponse
    {
        public RouteResult EcoRoute { get; init; } = null!;
        public RouteResult NormalRoute { get; init; } = null!;
        public string Summary { get; init; } = "";
        public List<string> HealthConditions { get; init; } = [];
    }

    // ─── OSRM JSON models ────────────────────────────────────────────────────
    private sealed class OsrmResponse
    {
        [JsonPropertyName("code")] public string Code { get; set; } = "";
        [JsonPropertyName("routes")] public List<OsrmRoute> Routes { get; set; } = [];
    }

    private sealed class OsrmRoute
    {
        [JsonPropertyName("distance")] public double Distance { get; set; }
        [JsonPropertyName("duration")] public double Duration { get; set; }
        [JsonPropertyName("geometry")] public OsrmGeometry Geometry { get; set; } = new();
    }

    private sealed class OsrmGeometry
    {
        [JsonPropertyName("type")] public string Type { get; set; } = "";
        [JsonPropertyName("coordinates")] public double[][] Coordinates { get; set; } = [];
    }

    // ─── Station AQI cache model ─────────────────────────────────────────────
    private sealed record StationAqiPoint(double Lat, double Lng, double Aqi, double Pm25);

    // ─── Main endpoint ───────────────────────────────────────────────────────
    [Authorize]
    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate([FromBody] EcoRouteRequest request)
    {
        // 1. Validate coordinates
        if (!IsValidLat(request.OriginLat) || !IsValidLng(request.OriginLng) ||
            !IsValidLat(request.DestLat) || !IsValidLng(request.DestLng))
        {
            return BadRequest(new { message = "Tọa độ không hợp lệ." });
        }

        // 2. Call OSRM for alternative routes (request up to 3)
        var osrmRoutes = await GetOsrmRoutes(request.OriginLng, request.OriginLat,
                                               request.DestLng, request.DestLat);
        if (osrmRoutes is null || osrmRoutes.Count == 0)
        {
            return BadRequest(new { message = "Không tìm được tuyến đường. Hãy thử lại với 2 điểm khác." });
        }

        // 2b. Filter out near-duplicate routes (>85% coordinate overlap)
        var distinctRoutes = FilterDistinctRoutes(osrmRoutes);

        // 2c. If only 1 distinct route, force a detour via perpendicular waypoint
        if (distinctRoutes.Count < 2)
        {
            var detourRoute = await GetDetourRoute(
                request.OriginLng, request.OriginLat,
                request.DestLng, request.DestLat);

            if (detourRoute is not null)
            {
                distinctRoutes.Add(detourRoute);
            }
        }

        // 2d. Last resort: try another offset direction
        if (distinctRoutes.Count < 2)
        {
            var detourRoute2 = await GetDetourRoute(
                request.OriginLng, request.OriginLat,
                request.DestLng, request.DestLat, offsetDirection: -1);

            if (detourRoute2 is not null)
            {
                distinctRoutes.Add(detourRoute2);
            }
        }

        if (distinctRoutes.Count < 2)
        {
            var only = ScoreRoute(distinctRoutes[0], []);
            return Ok(new EcoRouteResponse
            {
                EcoRoute = only with { Label = "Tuyến sạch nhất (duy nhất)", Recommended = true },
                NormalRoute = only with { Label = "Tuyến thường (giống nhau)" },
                Summary = "Chỉ tìm được 1 tuyến đường cho khoảng cách này."
            });
        }

        // 3. Load nearby station AQI data
        var stationPoints = await LoadStationAqiData(
            request.OriginLat, request.OriginLng,
            request.DestLat, request.DestLng);

        // 4. Score each route by average AQI
        var scoredRoutes = distinctRoutes.Select(r => ScoreRoute(r, stationPoints)).ToList();

        // Sort by avgAqi ascending -> lowest AQI = eco route
        scoredRoutes.Sort((a, b) => a.AvgAqi.CompareTo(b.AvgAqi));
        var eco = scoredRoutes[0] with { Label = "Tuyến sạch", Recommended = true };
        var normal = scoredRoutes[^1] with { Label = "Tuyến thường" };

        // 5. Health profile personalization (PRO only)
        List<string> healthConditions = [];
        if (request.UseHealthProfile)
        {
            var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdRaw, out var userId))
            {
                var user = await dbContext.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (user is not null &&
                    string.Equals(user.SubscriptionTier, "Pro", StringComparison.OrdinalIgnoreCase))
                {
                    healthConditions = ParseHealthConditions(user.HealCondition);

                    if (healthConditions.Count > 0)
                    {
                        eco = eco with
                        {
                            HealthRiskScore = CalculateHealthRisk(eco.AvgAqi, eco.AvgPm25, healthConditions),
                            HealthAdvice = GetHealthAdvice(eco.AvgAqi, healthConditions, true)
                        };
                        normal = normal with
                        {
                            HealthRiskScore = CalculateHealthRisk(normal.AvgAqi, normal.AvgPm25, healthConditions),
                            HealthAdvice = GetHealthAdvice(normal.AvgAqi, healthConditions, false)
                        };
                    }
                }
                else
                {
                    return BadRequest(new { message = "Tính năng yêu cầu tài khoản nâng cấp PRO" });
                }
            }
        }

        var aqiDiff = Math.Round(normal.AvgAqi - eco.AvgAqi, 1);
        var summary = aqiDiff > 0
            ? $"Tuyến sạch giúp giảm {aqiDiff} điểm AQI trung bình so với tuyến thường."
            : "Hai tuyến có chất lượng không khí tương đương.";

        return Ok(new EcoRouteResponse
        {
            EcoRoute = eco,
            NormalRoute = normal,
            Summary = summary,
            HealthConditions = healthConditions
        });
    }

    // ─── OSRM call ───────────────────────────────────────────────────────────
    private async Task<List<OsrmRoute>?> GetOsrmRoutes(double lng1, double lat1, double lng2, double lat2)
    {
        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(15);

        // Request up to 3 alternatives
        var url = $"https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?alternatives=3&geometries=geojson&overview=full";

        try
        {
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            var osrm = await response.Content.ReadFromJsonAsync<OsrmResponse>(
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return osrm?.Code == "Ok" ? osrm.Routes : null;
        }
        catch
        {
            return null;
        }
    }

    // ─── Filter near-duplicate routes ────────────────────────────────────────
    private static List<OsrmRoute> FilterDistinctRoutes(List<OsrmRoute> routes)
    {
        if (routes.Count <= 1) return [.. routes];

        var result = new List<OsrmRoute> { routes[0] };

        for (var i = 1; i < routes.Count; i++)
        {
            var isDuplicate = false;
            foreach (var existing in result)
            {
                if (CalculateRouteOverlap(existing, routes[i]) > 0.70)
                {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate)
            {
                result.Add(routes[i]);
            }
        }

        return result;
    }

    /// <summary>
    /// Calculates what fraction of route B's sample points are within
    /// ~150m of route A's path. Returns 0.0 – 1.0.
    /// </summary>
    private static double CalculateRouteOverlap(OsrmRoute routeA, OsrmRoute routeB)
    {
        var coordsA = routeA.Geometry.Coordinates;
        var coordsB = routeB.Geometry.Coordinates;

        if (coordsA.Length == 0 || coordsB.Length == 0) return 0;

        // Sample ~30 points from route B
        var stepB = Math.Max(1, coordsB.Length / 30);
        var matchCount = 0;
        var totalSamples = 0;

        // Threshold: ~150m ≈ 0.0014 degrees at Vietnam's latitude
        const double thresholdSq = 0.0014 * 0.0014;

        for (var i = 0; i < coordsB.Length; i += stepB)
        {
            totalSamples++;
            var ptB = coordsB[i];

            // Check if this point is near any point on route A
            var stepA = Math.Max(1, coordsA.Length / 50);
            for (var j = 0; j < coordsA.Length; j += stepA)
            {
                var ptA = coordsA[j];
                var distSq = (ptA[0] - ptB[0]) * (ptA[0] - ptB[0]) +
                             (ptA[1] - ptB[1]) * (ptA[1] - ptB[1]);
                if (distSq < thresholdSq)
                {
                    matchCount++;
                    break;
                }
            }
        }

        return totalSamples == 0 ? 0 : (double)matchCount / totalSamples;
    }

    /// <summary>
    /// Generates an alternative route by adding a waypoint perpendicular to
    /// the A→B line at 1/3 of the distance, offset by ~1-2km.
    /// This forces OSRM to route through a different area.
    /// </summary>
    private async Task<OsrmRoute?> GetDetourRoute(
        double lng1, double lat1, double lng2, double lat2,
        int offsetDirection = 1)
    {
        // Calculate midpoint at 1/3 of A→B
        var midLng = lng1 + (lng2 - lng1) * 0.33;
        var midLat = lat1 + (lat2 - lat1) * 0.33;

        // Direction vector from A to B
        var dx = lng2 - lng1;
        var dy = lat2 - lat1;
        var len = Math.Sqrt(dx * dx + dy * dy);
        if (len < 1e-8) return null;

        // Perpendicular offset (~1.5km at equator ≈ 0.013 degrees)
        // Scale offset based on route length: longer routes get bigger detours
        var offsetDeg = Math.Max(0.008, Math.Min(0.025, len * 0.15));
        var perpLng = midLng + offsetDirection * (-dy / len) * offsetDeg;
        var perpLat = midLat + offsetDirection * (dx / len) * offsetDeg;

        // Call OSRM with waypoint: A → waypoint → B
        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(15);

        var url = $"https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{perpLng},{perpLat};{lng2},{lat2}?geometries=geojson&overview=full";

        try
        {
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            var osrm = await response.Content.ReadFromJsonAsync<OsrmResponse>(
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return osrm?.Code == "Ok" && osrm.Routes.Count > 0 ? osrm.Routes[0] : null;
        }
        catch
        {
            return null;
        }
    }

    // ─── Load station AQI within bounding box ────────────────────────────────
    private async Task<List<StationAqiPoint>> LoadStationAqiData(
        double lat1, double lng1, double lat2, double lng2)
    {
        // Expand bounding box by ~0.3 degrees (~33km) to capture nearby stations
        var minLat = (decimal)(Math.Min(lat1, lat2) - 0.3);
        var maxLat = (decimal)(Math.Max(lat1, lat2) + 0.3);
        var minLng = (decimal)(Math.Min(lng1, lng2) - 0.3);
        var maxLng = (decimal)(Math.Max(lng1, lng2) + 0.3);

        var stations = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1 &&
                        s.Latitude >= minLat && s.Latitude <= maxLat &&
                        s.Longitude >= minLng && s.Longitude <= maxLng)
            .Select(s => new
            {
                Lat = (double)s.Latitude,
                Lng = (double)s.Longitude,
                Latest = s.AirQualityObservations
                    .Where(o => o.IsValid == 1)
                    .OrderByDescending(o => o.Timestamp)
                    .Select(o => new { Aqi = o.CalculatedAqi ?? 0, Pm25 = o.Pm25 ?? 0 })
                    .FirstOrDefault()
            })
            .Where(x => x.Latest != null)
            .ToListAsync();

        // If no stations in bounding box, fallback to province-level data
        if (stations.Count == 0)
        {
            var provincePoints = await dbContext.Cities
                .AsNoTracking()
                .Where(c => c.IsActive == 1 &&
                            c.Latitude >= minLat && c.Latitude <= maxLat &&
                            c.Longitude >= minLng && c.Longitude <= maxLng)
                .Select(c => new
                {
                    Lat = (double)c.Latitude,
                    Lng = (double)c.Longitude,
                    Latest = c.CityAirQualitySnapshots
                        .OrderByDescending(s => s.Timestamp)
                        .Select(s => new { Aqi = (double)(s.CalculatedAqi ?? 0), Pm25 = s.Pm25 ?? 0 })
                        .FirstOrDefault()
                })
                .Where(x => x.Latest != null)
                .ToListAsync();

            return provincePoints
                .Select(p => new StationAqiPoint(p.Lat, p.Lng, p.Latest!.Aqi, p.Latest.Pm25))
                .ToList();
        }

        return stations
            .Select(s => new StationAqiPoint(s.Lat, s.Lng, s.Latest!.Aqi, s.Latest.Pm25))
            .ToList();
    }

    // ─── Score a route by sampling AQI along it ──────────────────────────────
    private static RouteResult ScoreRoute(OsrmRoute route, List<StationAqiPoint> stationPoints)
    {
        var coords = route.Geometry.Coordinates;
        var totalDistKm = Math.Round(route.Distance / 1000.0, 2);
        var totalDurMin = Math.Round(route.Duration / 60.0, 1);

        if (coords.Length == 0 || stationPoints.Count == 0)
        {
            return new RouteResult
            {
                DistanceKm = totalDistKm,
                DurationMin = totalDurMin,
                AvgAqi = 0,
                AvgPm25 = 0,
                Geometry = coords
            };
        }

        // Sample ~20 points along route
        var step = Math.Max(1, coords.Length / 20);
        var samplePoints = new List<double[]>();
        for (var i = 0; i < coords.Length; i += step)
        {
            samplePoints.Add(coords[i]);
        }
        if (samplePoints.Count == 0) samplePoints.Add(coords[0]);

        // For each sample, find nearest station AQI and track cumulative distance
        double totalAqi = 0, totalPm25 = 0;
        var aqiSamples = new List<AqiSample>();
        double cumulativeDist = 0;
        var distPerSample = totalDistKm / Math.Max(1, samplePoints.Count - 1);

        for (var idx = 0; idx < samplePoints.Count; idx++)
        {
            var pt = samplePoints[idx];
            var nearest = stationPoints
                .OrderBy(s => DistanceSq(pt[1], pt[0], s.Lat, s.Lng))
                .First();

            totalAqi += nearest.Aqi;
            totalPm25 += nearest.Pm25;

            aqiSamples.Add(new AqiSample(
                Math.Round(cumulativeDist, 2),
                Math.Round(nearest.Aqi, 1),
                Math.Round(nearest.Pm25, 1)
            ));

            cumulativeDist += distPerSample;
        }

        return new RouteResult
        {
            DistanceKm = totalDistKm,
            DurationMin = totalDurMin,
            AvgAqi = Math.Round(totalAqi / samplePoints.Count, 1),
            AvgPm25 = Math.Round(totalPm25 / samplePoints.Count, 1),
            Geometry = coords,
            AqiSamples = aqiSamples
        };
    }

    // ─── Health risk scoring ─────────────────────────────────────────────────
    private static double CalculateHealthRisk(double avgAqi, double avgPm25, List<string> conditions)
    {
        // Base risk = AQI / 500 (normalize to 0-1 scale)
        var baseRisk = Math.Min(1.0, avgAqi / 500.0);

        // Sensitivity multiplier based on conditions
        var multiplier = 1.0;
        foreach (var c in conditions)
        {
            var lower = c.ToLowerInvariant();
            if (lower.Contains("hen") || lower.Contains("copd") || lower.Contains("phổi"))
                multiplier = Math.Max(multiplier, 2.5);
            else if (lower.Contains("tim"))
                multiplier = Math.Max(multiplier, 2.0);
            else if (lower.Contains("mang thai") || lower.Contains("trẻ"))
                multiplier = Math.Max(multiplier, 1.8);
            else if (lower.Contains("cao tuổi"))
                multiplier = Math.Max(multiplier, 1.5);
            else if (lower.Contains("dị ứng"))
                multiplier = Math.Max(multiplier, 1.3);
        }

        // PM2.5 bonus risk
        var pm25Risk = avgPm25 > 35 ? 0.1 : 0;

        return Math.Round(Math.Min(10.0, (baseRisk * multiplier + pm25Risk) * 10), 1);
    }

    private static string GetHealthAdvice(double avgAqi, List<string> conditions, bool isEco)
    {
        var hasRespiratory = conditions.Any(c =>
            c.ToLowerInvariant().Contains("hen") ||
            c.ToLowerInvariant().Contains("copd") ||
            c.ToLowerInvariant().Contains("phổi"));

        var hasCardio = conditions.Any(c => c.ToLowerInvariant().Contains("tim"));

        if (isEco)
        {
            if (avgAqi <= 50)
                return "Tuyến này an toàn cho bạn. Không khí trong lành, phù hợp với tình trạng sức khỏe.";
            if (avgAqi <= 100)
                return hasRespiratory
                    ? "Tuyến tương đối sạch. Nên đeo khẩu trang y tế khi đi xe máy."
                    : "Tuyến sạch hơn, phù hợp cho di chuyển hàng ngày.";
            return "Nên hạn chế thời gian ngoài trời và đeo khẩu trang N95.";
        }

        if (avgAqi <= 50)
            return "Tuyến này cũng an toàn, nhưng tuyến Eco được khuyên dùng hơn.";
        if (avgAqi <= 100)
            return hasRespiratory
                ? "⚠ Có vùng ô nhiễm trung bình. Với bệnh hô hấp, nên chọn tuyến Eco."
                : "Chất lượng không khí trung bình — tuyến Eco là lựa chọn tốt hơn.";
        if (avgAqi <= 150)
            return hasCardio
                ? "⚠ Không khuyên dùng cho người bệnh tim mạch. Chọn tuyến Eco."
                : "⚠ Không khí hạn chế cho người nhạy cảm. Ưu tiên tuyến Eco.";

        return "🚫 Chất lượng không khí kém. Mạnh mẽ khuyên bạn chọn tuyến Eco.";
    }

    // ─── Utilities ────────────────────────────────────────────────────────────
    private static double DistanceSq(double lat1, double lng1, double lat2, double lng2)
    {
        var dlat = lat1 - lat2;
        var dlng = (lng1 - lng2) * Math.Cos(lat1 * Math.PI / 180);
        return dlat * dlat + dlng * dlng;
    }

    private static bool IsValidLat(double lat) => lat is >= -90 and <= 90;
    private static bool IsValidLng(double lng) => lng is >= -180 and <= 180;

    private static List<string> ParseHealthConditions(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return [];
        return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
}
