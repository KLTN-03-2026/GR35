using AirQuality.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Data;

public static class SeedData
{
    public static async Task EnsureSeedRolesAsync(ApplicationDbContext dbContext)
    {
        await dbContext.Database.MigrateAsync();

        var roleNames = await dbContext.Roles
            .Select(x => x.RoleName.ToLower())
            .ToListAsync();

        var rolesToAdd = new List<Role>();

        if (!roleNames.Contains("admin"))
        {
            rolesToAdd.Add(new Role { RoleName = "admin", Description = "Quản trị hệ thống" });
        }

        if (!roleNames.Contains("user"))
        {
            rolesToAdd.Add(new Role { RoleName = "user", Description = "Người dùng" });
        }

        if (!roleNames.Contains("super admin"))
        {
            rolesToAdd.Add(new Role { RoleName = "super admin", Description = "Siêu quản trị hệ thống" });
        }

        if (rolesToAdd.Count > 0)
        {
            dbContext.Roles.AddRange(rolesToAdd);
            await dbContext.SaveChangesAsync();
        }

        const string superAdminEmail = "superadmin@airquality.local";
        var superAdminExists = await dbContext.Users
            .AnyAsync(x => x.Email.ToLower() == superAdminEmail);

        if (superAdminExists)
        {
            return;
        }

        var superAdminRoleId = await dbContext.Roles
            .Where(x => x.RoleName.ToLower() == "super admin")
            .Select(x => x.RoleId)
            .FirstOrDefaultAsync();

        if (superAdminRoleId == 0)
        {
            return;
        }

        dbContext.Users.Add(new User
        {
            FullName = "Super Admin",
            Email = "hungpro123123@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("SuperAdmin@123"),
            Status = 1,
            CreatedAt = DateTime.UtcNow,
            RoleId = superAdminRoleId
        });

        await dbContext.SaveChangesAsync();
    }
}
