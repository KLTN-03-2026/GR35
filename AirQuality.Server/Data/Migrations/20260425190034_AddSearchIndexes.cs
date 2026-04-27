using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AirQuality.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Stations_city",
                table: "Stations",
                column: "city");

            migrationBuilder.CreateIndex(
                name: "IX_Stations_station_name",
                table: "Stations",
                column: "station_name");

            migrationBuilder.CreateIndex(
                name: "IX_Cities_province_name",
                table: "Cities",
                column: "province_name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Stations_city",
                table: "Stations");

            migrationBuilder.DropIndex(
                name: "IX_Stations_station_name",
                table: "Stations");

            migrationBuilder.DropIndex(
                name: "IX_Cities_province_name",
                table: "Cities");
        }
    }
}
