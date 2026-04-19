using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AirQuality.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCitiesAndCityAirQualitySnapshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    city_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    province_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    latitude = table.Column<decimal>(type: "decimal(10,6)", nullable: false),
                    longitude = table.Column<decimal>(type: "decimal(10,6)", nullable: false),
                    region = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    is_active = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.city_id);
                });

            migrationBuilder.CreateTable(
                name: "CityAirQualitySnapshots",
                columns: table => new
                {
                    snapshot_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    temperature = table.Column<double>(type: "float", nullable: true),
                    feels_like = table.Column<double>(type: "float", nullable: true),
                    humidity = table.Column<double>(type: "float", nullable: true),
                    pressure = table.Column<double>(type: "float", nullable: true),
                    wind_speed = table.Column<double>(type: "float", nullable: true),
                    wind_deg = table.Column<double>(type: "float", nullable: true),
                    cloud_cover = table.Column<int>(type: "int", nullable: true),
                    visibility = table.Column<int>(type: "int", nullable: true),
                    weather_main = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    weather_description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    weather_icon = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    pm25 = table.Column<double>(type: "float", nullable: true),
                    pm10 = table.Column<double>(type: "float", nullable: true),
                    co = table.Column<double>(type: "float", nullable: true),
                    no2 = table.Column<double>(type: "float", nullable: true),
                    so2 = table.Column<double>(type: "float", nullable: true),
                    o3 = table.Column<double>(type: "float", nullable: true),
                    nh3 = table.Column<double>(type: "float", nullable: true),
                    aqi_pm25 = table.Column<int>(type: "int", nullable: true),
                    aqi_pm10 = table.Column<int>(type: "int", nullable: true),
                    aqi_co = table.Column<int>(type: "int", nullable: true),
                    aqi_no2 = table.Column<int>(type: "int", nullable: true),
                    aqi_so2 = table.Column<int>(type: "int", nullable: true),
                    aqi_o3 = table.Column<int>(type: "int", nullable: true),
                    calculated_aqi = table.Column<int>(type: "int", nullable: true),
                    city_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CityAirQualitySnapshots", x => x.snapshot_id);
                    table.ForeignKey(
                        name: "FK_CityAirQualitySnapshots_Cities_city_id",
                        column: x => x.city_id,
                        principalTable: "Cities",
                        principalColumn: "city_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cities_slug",
                table: "Cities",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CityAirQualitySnapshots_city_id",
                table: "CityAirQualitySnapshots",
                column: "city_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CityAirQualitySnapshots");

            migrationBuilder.DropTable(
                name: "Cities");
        }
    }
}
