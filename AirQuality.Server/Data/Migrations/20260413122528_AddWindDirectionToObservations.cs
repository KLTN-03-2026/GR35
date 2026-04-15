using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AirQuality.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWindDirectionToObservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "wind_deg",
                table: "AirQualityObservations",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "wind_deg",
                table: "AirQualityObservations");
        }
    }
}
