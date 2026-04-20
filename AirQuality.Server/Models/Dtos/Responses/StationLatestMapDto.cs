namespace AirQuality.Server.Models.Dtos.Responses;

public class StationLatestMapDto
{
    public int StationId { get; set; }
    public string StationName { get; set; } = string.Empty;
    public string ProvinceName { get; set; } = string.Empty;
    public double Lat { get; set; }
    public double Lng { get; set; }
    public int Aqi { get; set; }
    public double? Pm25 { get; set; }
    public double? Pm10 { get; set; }
}
