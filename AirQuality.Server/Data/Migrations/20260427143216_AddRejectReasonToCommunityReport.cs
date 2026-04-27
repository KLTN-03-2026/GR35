using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AirQuality.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRejectReasonToCommunityReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "reject_reason",
                table: "CommunityReports",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "reject_reason",
                table: "CommunityReports");
        }
    }
}
