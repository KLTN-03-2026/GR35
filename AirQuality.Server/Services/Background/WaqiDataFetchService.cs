using System.Text.Json;
using AirQuality.Server.Data;
using AirQuality.Server.Models;
using AirQuality.Server.Services.AirQuality;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Services.Background;

public class WaqiDataFetchService(
    IHttpClientFactory httpClientFactory,
    IServiceScopeFactory serviceScopeFactory,
    ILogger<WaqiDataFetchService> logger) : BackgroundService
{
    private const string Token = "";
    private const string FeedUrl = "https://api.waqi.info/feed/@{0}/?token={1}";
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("WaqiDataFetchService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await FetchAndProcessDataAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in WAQI fetch loop.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        logger.LogInformation("WaqiDataFetchService stopped.");
    }

    private async Task FetchAndProcessDataAsync(CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient();
        var scanUrls = new List<string>
        {
            $"https://api.waqi.info/map/bounds/?latlng=19.0000,102.0000,23.5000,108.0000&token={Token}",
            $"https://api.waqi.info/map/bounds/?latlng=13.0000,105.0000,19.0000,110.0000&token={Token}",
            $"https://api.waqi.info/map/bounds/?latlng=8.0000,104.0000,13.0000,110.0000&token={Token}"
        };

        var allUids = new HashSet<int>();

        for (var i = 0; i < scanUrls.Count; i++)
        {
            var url = scanUrls[i];

            try
            {
                using var response = await client.GetAsync(url, cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogWarning("WAQI bounds API returned HTTP {StatusCode} for url={Url}.", (int)response.StatusCode, url);
                    continue;
                }

                await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
                var root = doc.RootElement;

                if (!IsOkStatus(root))
                {
                    logger.LogWarning("WAQI bounds API status is not ok for url={Url}.", url);
                    continue;
                }

                if (!root.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var item in data.EnumerateArray())
                {
                    if (!item.TryGetProperty("uid", out var uidElement))
                    {
                        continue;
                    }

                    var uid = TryGetInt(uidElement);
                    if (uid.HasValue && uid.Value > 0)
                    {
                        allUids.Add(uid.Value);
                    }
                }

                logger.LogInformation("Scanned bounds url={Url}, current unique uids={Count}.", url, allUids.Count);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed scanning bounds url={Url}.", url);
            }

            if (i < scanUrls.Count - 1)
            {
                await Task.Delay(500, cancellationToken);
            }
        }

        using var scope = serviceScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        foreach (var uid in allUids)
        {
            await Task.Delay(250, cancellationToken);

            try
            {
                var url = string.Format(FeedUrl, uid, Token);

                using var response = await client.GetAsync(url, cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogWarning("WAQI feed API uid={Uid} returned HTTP {StatusCode}.", uid, (int)response.StatusCode);
                    continue;
                }

                await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
                var root = doc.RootElement;

                if (!IsOkStatus(root))
                {
                    logger.LogWarning("WAQI feed status is not ok for uid={Uid}.", uid);
                    continue;
                }

                if (!root.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Object)
                {
                    logger.LogWarning("Missing data object for uid={Uid}.", uid);
                    continue;
                }

                var stationName = GetStationName(data, uid);
                var cityUrl = GetCityUrl(data);
                var isVietnamByUrl = !string.IsNullOrWhiteSpace(cityUrl) && cityUrl.Contains("/vietnam/", StringComparison.OrdinalIgnoreCase);
                var isVietnamByName = !string.IsNullOrWhiteSpace(stationName) && stationName.Contains("vietnam", StringComparison.OrdinalIgnoreCase);

                if (!isVietnamByUrl && !isVietnamByName)
                {
                    logger.LogInformation("Skip uid={Uid} because station is outside Vietnam. Name={StationName}, Url={CityUrl}", uid, stationName, cityUrl);
                    continue;
                }

                var (latitude, longitude) = GetCoordinates(data);
                var city = GetCity(data);
                var providerKey = LimitLength($"waqi:{uid}", 100);
                var station = await dbContext.Stations
                    .FirstOrDefaultAsync(x => x.Provider == providerKey, cancellationToken);

                if (station is null)
                {
                    station = new Station
                    {
                        StationName = LimitLength(stationName, 150),
                        Latitude = latitude,
                        Longitude = longitude,
                        IsActive = 1,
                        Provider = providerKey,
                        City = LimitLength(city, 50)
                    };

                    dbContext.Stations.Add(station);
                }
                else
                {
                    station.StationName = LimitLength(stationName, 150);
                    station.Latitude = latitude;
                    station.Longitude = longitude;
                    station.City = LimitLength(city, 50);
                }

                var iaqiPm25 = GetIaqiValue(data, "pm25");
                var iaqiPm10 = GetIaqiValue(data, "pm10");
                var iaqiCo = GetIaqiValue(data, "co");
                var iaqiSo2 = GetIaqiValue(data, "so2");
                var iaqiNo2 = GetIaqiValue(data, "no2");
                var iaqiO3 = GetIaqiValue(data, "o3");

                var pm25 = iaqiPm25.HasValue ? AqiConverter.ConvertIaqiToRaw("pm25", iaqiPm25.Value) : null;
                var pm10 = iaqiPm10.HasValue ? AqiConverter.ConvertIaqiToRaw("pm10", iaqiPm10.Value) : null;
                var co = iaqiCo.HasValue ? AqiConverter.ConvertIaqiToRaw("co", iaqiCo.Value) : null;
                var so2 = iaqiSo2.HasValue ? AqiConverter.ConvertIaqiToRaw("so2", iaqiSo2.Value) : null;
                var no2 = iaqiNo2.HasValue ? AqiConverter.ConvertIaqiToRaw("no2", iaqiNo2.Value) : null;
                var o3 = iaqiO3.HasValue ? AqiConverter.ConvertIaqiToRaw("o3", iaqiO3.Value) : null;

                var totalAqi = GetAqiValue(data);
                var temperature = GetIaqiValue(data, "t");
                var humidity = GetIaqiValue(data, "h");
                var windSpeed = GetIaqiValue(data, "w");
                var pressure = GetIaqiValue(data, "p");
                var observationTime = GetObservationTimeUtc(data);

                var observation = new AirQualityObservation
                {
                    Station = station,
                    Timestamp = observationTime,
                    Pm25 = pm25,
                    Pm10 = pm10,
                    Co = co,
                    So2 = so2,
                    No2 = no2,
                    O3 = o3,
                    Temperature = temperature,
                    Humidity = humidity,
                    WindSpeed = windSpeed,
                    Pressure = pressure,
                    CalculatedAqi = totalAqi,
                    IsValid = 1,
                    IsImputed = 0
                };

                dbContext.AirQualityObservations.Add(observation);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed processing station uid={Uid}.", uid);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Completed WAQI sync. Total unique uids={UidCount}.", allUids.Count);
    }

    private static bool IsOkStatus(JsonElement root)
    {
        if (!root.TryGetProperty("status", out var status))
        {
            return false;
        }

        var value = status.GetString();
        return string.Equals(value, "ok", StringComparison.OrdinalIgnoreCase);
    }

    private static string GetStationName(JsonElement data, int uid)
    {
        if (data.TryGetProperty("city", out var city) &&
            city.ValueKind == JsonValueKind.Object &&
            city.TryGetProperty("name", out var name))
        {
            var stationName = name.GetString();
            if (!string.IsNullOrWhiteSpace(stationName))
            {
                return stationName.Trim();
            }
        }

        return $"WAQI Station {uid}";
    }

    private static string GetCity(JsonElement data)
    {
        if (data.TryGetProperty("city", out var cityObj) &&
            cityObj.ValueKind == JsonValueKind.Object &&
            cityObj.TryGetProperty("name", out var nameElement))
        {
            var name = nameElement.GetString();
            if (!string.IsNullOrWhiteSpace(name))
            {
                var firstPart = name.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
                return string.IsNullOrWhiteSpace(firstPart) ? "Unknown" : firstPart;
            }
        }

        return "Unknown";
    }

    private static string GetCityUrl(JsonElement data)
    {
        if (data.TryGetProperty("city", out var cityObj) &&
            cityObj.ValueKind == JsonValueKind.Object &&
            cityObj.TryGetProperty("url", out var urlElement))
        {
            return urlElement.GetString() ?? string.Empty;
        }

        return string.Empty;
    }

    private static (decimal Latitude, decimal Longitude) GetCoordinates(JsonElement data)
    {
        if (data.TryGetProperty("city", out var cityObj) &&
            cityObj.ValueKind == JsonValueKind.Object &&
            cityObj.TryGetProperty("geo", out var geo) &&
            geo.ValueKind == JsonValueKind.Array &&
            geo.GetArrayLength() >= 2)
        {
            var lat = TryGetDouble(geo[0]);
            var lng = TryGetDouble(geo[1]);

            if (lat.HasValue && lng.HasValue)
            {
                return (Math.Round((decimal)lat.Value, 6), Math.Round((decimal)lng.Value, 6));
            }
        }

        return (0m, 0m);
    }

    private static DateTime GetObservationTimeUtc(JsonElement data)
    {
        if (data.TryGetProperty("time", out var timeObj) && timeObj.ValueKind == JsonValueKind.Object)
        {
            if (timeObj.TryGetProperty("iso", out var isoElement))
            {
                var iso = isoElement.GetString();
                if (DateTimeOffset.TryParse(iso, out var dto))
                {
                    return dto.UtcDateTime;
                }
            }

            if (timeObj.TryGetProperty("s", out var sElement))
            {
                var s = sElement.GetString();
                if (DateTimeOffset.TryParse(s, out var dto))
                {
                    return dto.UtcDateTime;
                }
            }
        }

        return DateTime.UtcNow;
    }

    private static int? GetAqiValue(JsonElement data)
    {
        if (!data.TryGetProperty("aqi", out var aqiElement))
        {
            return null;
        }

        var aqi = TryGetDouble(aqiElement);
        if (!aqi.HasValue)
        {
            return null;
        }

        var bounded = Math.Clamp(aqi.Value, 0d, 500d);
        return (int)Math.Round(bounded, MidpointRounding.AwayFromZero);
    }

    private static double? GetIaqiValue(JsonElement data, string code)
    {
        if (!data.TryGetProperty("iaqi", out var iaqiObj) || iaqiObj.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (!iaqiObj.TryGetProperty(code, out var pollutantObj) || pollutantObj.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (!pollutantObj.TryGetProperty("v", out var valueElement))
        {
            return null;
        }

        return TryGetDouble(valueElement);
    }

    private static double? TryGetDouble(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.Number when element.TryGetDouble(out var numberValue) => numberValue,
            JsonValueKind.String when double.TryParse(element.GetString(), out var stringValue) => stringValue,
            _ => null
        };
    }

    private static int? TryGetInt(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.Number when element.TryGetInt32(out var intValue) => intValue,
            JsonValueKind.String when int.TryParse(element.GetString(), out var stringValue) => stringValue,
            _ => null
        };
    }

    private static string LimitLength(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength];
    }
}
