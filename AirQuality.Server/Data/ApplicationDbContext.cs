using AirQuality.Server.Models.Entites;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<NotificationPlatform> NotificationPlatforms => Set<NotificationPlatform>();
    public DbSet<AqiCategory> AqiCategories => Set<AqiCategory>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserLinkedAccount> UserLinkedAccounts => Set<UserLinkedAccount>();
    public DbSet<Station> Stations => Set<Station>();
    public DbSet<UserFavoriteStation> UserFavoriteStations => Set<UserFavoriteStation>();
    public DbSet<AirQualityObservation> AirQualityObservations => Set<AirQualityObservation>();
    public DbSet<AiModel> AiModels => Set<AiModel>();
    public DbSet<ModelEvaluation> ModelEvaluations => Set<ModelEvaluation>();
    public DbSet<ForecastData> ForecastData => Set<ForecastData>();
    public DbSet<AlertConfig> AlertConfigs => Set<AlertConfig>();
    public DbSet<NotificationHistory> NotificationHistories => Set<NotificationHistory>();
    public DbSet<ActionType> ActionTypes => Set<ActionType>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AffiliateProduct> AffiliateProducts => Set<AffiliateProduct>();
    public DbSet<CommunityReport> CommunityReports => Set<CommunityReport>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<CityAirQualitySnapshot> CityAirQualitySnapshots => Set<CityAirQualitySnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserFavoriteStation>()
            .HasKey(x => new { x.UserId, x.StationId });

        modelBuilder.Entity<User>()
            .HasOne(x => x.Role)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserLinkedAccount>()
            .HasOne(x => x.User)
            .WithMany(x => x.UserLinkedAccounts)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserLinkedAccount>()
            .HasOne(x => x.NotificationPlatform)
            .WithMany(x => x.UserLinkedAccounts)
            .HasForeignKey(x => x.PlatformId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserFavoriteStation>()
            .HasOne(x => x.User)
            .WithMany(x => x.UserFavoriteStations)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserFavoriteStation>()
            .HasOne(x => x.Station)
            .WithMany(x => x.UserFavoriteStations)
            .HasForeignKey(x => x.StationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AirQualityObservation>()
            .HasOne(x => x.Station)
            .WithMany(x => x.AirQualityObservations)
            .HasForeignKey(x => x.StationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ModelEvaluation>()
            .HasOne(x => x.AiModel)
            .WithMany(x => x.ModelEvaluations)
            .HasForeignKey(x => x.ModelId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ForecastData>()
            .HasOne(x => x.Station)
            .WithMany(x => x.ForecastData)
            .HasForeignKey(x => x.StationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ForecastData>()
            .HasOne(x => x.AiModel)
            .WithMany(x => x.ForecastData)
            .HasForeignKey(x => x.ModelId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AlertConfig>()
            .HasOne(x => x.User)
            .WithMany(x => x.AlertConfigs)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AlertConfig>()
            .HasOne(x => x.Station)
            .WithMany(x => x.AlertConfigs)
            .HasForeignKey(x => x.StationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AlertConfig>()
            .HasOne(x => x.NotificationPlatform)
            .WithMany(x => x.AlertConfigs)
            .HasForeignKey(x => x.PlatformId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NotificationHistory>()
            .HasOne(x => x.User)
            .WithMany(x => x.NotificationHistories)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NotificationHistory>()
            .HasOne(x => x.NotificationPlatform)
            .WithMany(x => x.NotificationHistories)
            .HasForeignKey(x => x.PlatformId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>()
            .HasOne(x => x.User)
            .WithMany(x => x.AuditLogs)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AuditLog>()
            .HasOne(x => x.ActionType)
            .WithMany(x => x.AuditLogs)
            .HasForeignKey(x => x.ActionTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CityAirQualitySnapshot>()
            .HasOne(x => x.City)
            .WithMany(x => x.CityAirQualitySnapshots)
            .HasForeignKey(x => x.CityId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<City>()
            .HasIndex(x => x.Slug)
            .IsUnique();

        modelBuilder.Entity<City>().Property(x => x.IsActive).HasDefaultValue(1);

        modelBuilder.Entity<CommunityReport>()
            .HasOne(x => x.User)
            .WithMany(x => x.CommunityReports)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>().Property(x => x.Status).HasDefaultValue(1);
        modelBuilder.Entity<Station>().Property(x => x.IsActive).HasDefaultValue(1);
        modelBuilder.Entity<AirQualityObservation>().Property(x => x.IsValid).HasDefaultValue(1);
        modelBuilder.Entity<AirQualityObservation>().Property(x => x.IsImputed).HasDefaultValue(0);
        modelBuilder.Entity<AiModel>().Property(x => x.IsActive).HasDefaultValue(1);
        modelBuilder.Entity<ModelEvaluation>().Property(x => x.Mape).HasDefaultValue(1.0);
        modelBuilder.Entity<AlertConfig>().Property(x => x.IsActive).HasDefaultValue(1);
        modelBuilder.Entity<AffiliateProduct>().Property(x => x.MinAqiTrigger).HasDefaultValue(100);
        modelBuilder.Entity<AffiliateProduct>().Property(x => x.TargetHealthCondition).HasDefaultValue("All");
        modelBuilder.Entity<CommunityReport>().Property(x => x.ReportTime).HasDefaultValueSql("GETDATE()");
        modelBuilder.Entity<CommunityReport>().Property(x => x.Upvotes).HasDefaultValue(0);
        modelBuilder.Entity<CommunityReport>().Property(x => x.Status).HasDefaultValue("Pending");
    }
}
