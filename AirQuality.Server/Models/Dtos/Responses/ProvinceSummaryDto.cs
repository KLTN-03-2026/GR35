namespace AirQuality.Server.Models.Dtos.Responses;

public class ProvinceSummaryDto
{
    public int ProvinceId { get; set; }
    public string ProvinceName { get; set; } = string.Empty;
    public double Lat { get; set; }
    public double Lng { get; set; }
    public double AvgAqi { get; set; }
    public double AvgPm25 { get; set; }
    public double AvgPm10 { get; set; }
    public int TotalStations { get; set; }
}
