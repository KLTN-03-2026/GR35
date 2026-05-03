using AirQuality.Server.Data;
using AirQuality.Server.Models.Configurations;
using AirQuality.Server.Services;
using AirQuality.Server.Services.Auth;
using AirQuality.Server.Services.Background;
using AirQuality.Server.Services.Chatbot;
using AirQuality.Server.Services.Chatbot.Functions;
using AirQuality.Server.Services.Interfaces;
using AirQuality.Server.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.CommandTimeout(120)));

builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<BackgroundJobTracker>();
builder.Services.AddHostedService<TedpDataFetchService>();
//builder.Services.AddHostedService<WeatherDataFetchService>();
//builder.Services.AddHostedService<TelegramDailyAlertService>();
//builder.Services.AddHostedService<TelegramThresholdAlertService>();
//builder.Services.AddHostedService<OwmCityDataFetchService>();
//builder.Services.AddHostedService<HistoricalDataSyncService>();

builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<VnPayOptions>()
    .Bind(builder.Configuration.GetSection(VnPayOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<GroqOptions>()
    .Bind(builder.Configuration.GetSection(GroqOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<SmtpOptions>()
    .Bind(builder.Configuration.GetSection(SmtpOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<GoogleAuthOptions>()
    .Bind(builder.Configuration.GetSection(GoogleAuthOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSignalR();

builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOtpService, OtpService>();

// ── Chatbot AI Services ──────────────────────────────────────────────
// Function Calling: đăng ký tất cả IChatbotFunction implementations
builder.Services.AddScoped<IChatbotFunction, GetCityAqiFunction>();
builder.Services.AddScoped<IChatbotFunction, CompareCitiesFunction>();
builder.Services.AddScoped<IChatbotFunction, GetForecastFunction>();
builder.Services.AddScoped<IChatbotFunction, GetAqiRankingFunction>();
builder.Services.AddScoped<IChatbotFunction, GetStationInfoFunction>();
builder.Services.AddScoped<IChatbotFunction, GetAqiTrendFunction>();
builder.Services.AddScoped<FunctionCallingService>();

// RAG + Vector Database
builder.Services.AddSingleton<EmbeddingService>();
builder.Services.AddSingleton<VectorSearchService>();
builder.Services.AddScoped<RagService>();

// Chatbot Orchestrator
builder.Services.AddScoped<ChatbotService>();

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Thiếu cấu hình Jwt.");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub/notifications"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập token dạng: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await SeedData.EnsureSeedRolesAsync(dbContext);

    // Seed knowledge base cho RAG chatbot
    var embeddingService = scope.ServiceProvider.GetRequiredService<EmbeddingService>();
    await KnowledgeBaseSeeder.SeedAsync(dbContext, embeddingService);
}

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hub/notifications");

app.MapFallbackToFile("/index.html");

app.Run();
