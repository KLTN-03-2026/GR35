using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AirQuality.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ActionTypes",
                columns: table => new
                {
                    action_type_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionTypes", x => x.action_type_id);
                });

            migrationBuilder.CreateTable(
                name: "AffiliateProducts",
                columns: table => new
                {
                    product_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    product_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    affiliate_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    min_aqi_trigger = table.Column<int>(type: "int", nullable: false, defaultValue: 100),
                    target_health_condition = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "All")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AffiliateProducts", x => x.product_id);
                });

            migrationBuilder.CreateTable(
                name: "AIModels",
                columns: table => new
                {
                    model_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    model_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    version = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    hyperparameters = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIModels", x => x.model_id);
                });

            migrationBuilder.CreateTable(
                name: "AQICategories",
                columns: table => new
                {
                    category_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    min_aqi = table.Column<int>(type: "int", nullable: false),
                    max_aqi = table.Column<int>(type: "int", nullable: false),
                    level_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    color_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    health_recommendation = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AQICategories", x => x.category_id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationPlatforms",
                columns: table => new
                {
                    platform_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    platform_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    api_config = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationPlatforms", x => x.platform_id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "Stations",
                columns: table => new
                {
                    station_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    station_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    latitude = table.Column<decimal>(type: "decimal(10,6)", nullable: false),
                    longitude = table.Column<decimal>(type: "decimal(10,6)", nullable: false),
                    is_active = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    provider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    city = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stations", x => x.station_id);
                });

            migrationBuilder.CreateTable(
                name: "ModelEvaluations",
                columns: table => new
                {
                    evaluation_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    rmse = table.Column<double>(type: "float", nullable: true),
                    mae = table.Column<double>(type: "float", nullable: true),
                    r2_score = table.Column<double>(type: "float", nullable: true),
                    mape = table.Column<double>(type: "float", nullable: true, defaultValue: 1.0),
                    evaluated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    model_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelEvaluations", x => x.evaluation_id);
                    table.ForeignKey(
                        name: "FK_ModelEvaluations_AIModels_model_id",
                        column: x => x.model_id,
                        principalTable: "AIModels",
                        principalColumn: "model_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    full_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    status = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    last_login = table.Column<DateTime>(type: "datetime2", nullable: true),
                    heal_condition = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    role_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AirQualityObservations",
                columns: table => new
                {
                    observation_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    pm25 = table.Column<double>(type: "float", nullable: true),
                    pm10 = table.Column<double>(type: "float", nullable: true),
                    co = table.Column<double>(type: "float", nullable: true),
                    no2 = table.Column<double>(type: "float", nullable: true),
                    so2 = table.Column<double>(type: "float", nullable: true),
                    o3 = table.Column<double>(type: "float", nullable: true),
                    temperature = table.Column<double>(type: "float", nullable: true),
                    humidity = table.Column<double>(type: "float", nullable: true),
                    wind_speed = table.Column<double>(type: "float", nullable: true),
                    pressure = table.Column<double>(type: "float", nullable: true),
                    calculated_aqi = table.Column<int>(type: "int", nullable: true),
                    is_valid = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    is_imputed = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    station_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AirQualityObservations", x => x.observation_id);
                    table.ForeignKey(
                        name: "FK_AirQualityObservations_Stations_station_id",
                        column: x => x.station_id,
                        principalTable: "Stations",
                        principalColumn: "station_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ForecastData",
                columns: table => new
                {
                    forecast_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    generated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    target_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    predicted_aqi = table.Column<int>(type: "int", nullable: true),
                    predicted_pm25 = table.Column<double>(type: "float", nullable: true),
                    confidence_interval = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    station_id = table.Column<int>(type: "int", nullable: false),
                    model_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ForecastData", x => x.forecast_id);
                    table.ForeignKey(
                        name: "FK_ForecastData_AIModels_model_id",
                        column: x => x.model_id,
                        principalTable: "AIModels",
                        principalColumn: "model_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ForecastData_Stations_station_id",
                        column: x => x.station_id,
                        principalTable: "Stations",
                        principalColumn: "station_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlertConfigs",
                columns: table => new
                {
                    config_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    aqi_threshold = table.Column<int>(type: "int", nullable: false),
                    is_active = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    station_id = table.Column<int>(type: "int", nullable: false),
                    platform_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertConfigs", x => x.config_id);
                    table.ForeignKey(
                        name: "FK_AlertConfigs_NotificationPlatforms_platform_id",
                        column: x => x.platform_id,
                        principalTable: "NotificationPlatforms",
                        principalColumn: "platform_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AlertConfigs_Stations_station_id",
                        column: x => x.station_id,
                        principalTable: "Stations",
                        principalColumn: "station_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AlertConfigs_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ip_address = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    action_type_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.log_id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_ActionTypes_action_type_id",
                        column: x => x.action_type_id,
                        principalTable: "ActionTypes",
                        principalColumn: "action_type_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommunityReports",
                columns: table => new
                {
                    report_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    latitude = table.Column<double>(type: "float", nullable: false),
                    longitude = table.Column<double>(type: "float", nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    report_time = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    upvotes = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunityReports", x => x.report_id);
                    table.ForeignKey(
                        name: "FK_CommunityReports_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificationHistory",
                columns: table => new
                {
                    notification_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    message_content = table.Column<string>(type: "text", nullable: false),
                    sent_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    platform_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationHistory", x => x.notification_id);
                    table.ForeignKey(
                        name: "FK_NotificationHistory_NotificationPlatforms_platform_id",
                        column: x => x.platform_id,
                        principalTable: "NotificationPlatforms",
                        principalColumn: "platform_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NotificationHistory_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserFavoriteStations",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false),
                    station_id = table.Column<int>(type: "int", nullable: false),
                    added_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFavoriteStations", x => new { x.user_id, x.station_id });
                    table.ForeignKey(
                        name: "FK_UserFavoriteStations_Stations_station_id",
                        column: x => x.station_id,
                        principalTable: "Stations",
                        principalColumn: "station_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserFavoriteStations_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserLinkedAccounts",
                columns: table => new
                {
                    link_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    external_account_id = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    linked_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    platform_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLinkedAccounts", x => x.link_id);
                    table.ForeignKey(
                        name: "FK_UserLinkedAccounts_NotificationPlatforms_platform_id",
                        column: x => x.platform_id,
                        principalTable: "NotificationPlatforms",
                        principalColumn: "platform_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserLinkedAccounts_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AirQualityObservations_station_id",
                table: "AirQualityObservations",
                column: "station_id");

            migrationBuilder.CreateIndex(
                name: "IX_AlertConfigs_platform_id",
                table: "AlertConfigs",
                column: "platform_id");

            migrationBuilder.CreateIndex(
                name: "IX_AlertConfigs_station_id",
                table: "AlertConfigs",
                column: "station_id");

            migrationBuilder.CreateIndex(
                name: "IX_AlertConfigs_user_id",
                table: "AlertConfigs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_action_type_id",
                table: "AuditLogs",
                column: "action_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_user_id",
                table: "AuditLogs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_CommunityReports_user_id",
                table: "CommunityReports",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ForecastData_model_id",
                table: "ForecastData",
                column: "model_id");

            migrationBuilder.CreateIndex(
                name: "IX_ForecastData_station_id",
                table: "ForecastData",
                column: "station_id");

            migrationBuilder.CreateIndex(
                name: "IX_ModelEvaluations_model_id",
                table: "ModelEvaluations",
                column: "model_id");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationHistory_platform_id",
                table: "NotificationHistory",
                column: "platform_id");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationHistory_user_id",
                table: "NotificationHistory",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserFavoriteStations_station_id",
                table: "UserFavoriteStations",
                column: "station_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserLinkedAccounts_platform_id",
                table: "UserLinkedAccounts",
                column: "platform_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserLinkedAccounts_user_id",
                table: "UserLinkedAccounts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_role_id",
                table: "Users",
                column: "role_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AffiliateProducts");

            migrationBuilder.DropTable(
                name: "AirQualityObservations");

            migrationBuilder.DropTable(
                name: "AlertConfigs");

            migrationBuilder.DropTable(
                name: "AQICategories");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CommunityReports");

            migrationBuilder.DropTable(
                name: "ForecastData");

            migrationBuilder.DropTable(
                name: "ModelEvaluations");

            migrationBuilder.DropTable(
                name: "NotificationHistory");

            migrationBuilder.DropTable(
                name: "UserFavoriteStations");

            migrationBuilder.DropTable(
                name: "UserLinkedAccounts");

            migrationBuilder.DropTable(
                name: "ActionTypes");

            migrationBuilder.DropTable(
                name: "AIModels");

            migrationBuilder.DropTable(
                name: "Stations");

            migrationBuilder.DropTable(
                name: "NotificationPlatforms");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
