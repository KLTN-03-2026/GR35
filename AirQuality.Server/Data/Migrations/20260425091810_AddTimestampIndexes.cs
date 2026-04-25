using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AirQuality.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTimestampIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CityAirQualitySnapshots_city_id",
                table: "CityAirQualitySnapshots");

            migrationBuilder.DropIndex(
                name: "IX_AirQualityObservations_station_id",
                table: "AirQualityObservations");

            migrationBuilder.CreateIndex(
                name: "IX_CityAirQualitySnapshots_city_id_timestamp",
                table: "CityAirQualitySnapshots",
                columns: new[] { "city_id", "timestamp" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_AirQualityObservations_station_id_timestamp",
                table: "AirQualityObservations",
                columns: new[] { "station_id", "timestamp" },
                descending: new[] { false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CityAirQualitySnapshots_city_id_timestamp",
                table: "CityAirQualitySnapshots");

            migrationBuilder.DropIndex(
                name: "IX_AirQualityObservations_station_id_timestamp",
                table: "AirQualityObservations");

            migrationBuilder.CreateIndex(
                name: "IX_CityAirQualitySnapshots_city_id",
                table: "CityAirQualitySnapshots",
                column: "city_id");

            migrationBuilder.CreateIndex(
                name: "IX_AirQualityObservations_station_id",
                table: "AirQualityObservations",
                column: "station_id");
        }
    }
}
