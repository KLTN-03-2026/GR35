using AirQuality.Server.Services.Background;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/admin/system-logs")]
[Authorize(Roles = "admin,super admin")]
public class AdminSystemLogsController(BackgroundJobTracker tracker) : ControllerBase
{
    /// <summary>
    /// Returns the status of all registered background jobs.
    /// </summary>
    [HttpGet("jobs")]
    public IActionResult GetJobs()
    {
        var jobs = tracker.GetAllJobs();

        var summary = new
        {
            TotalJobs = jobs.Count,
            Running = jobs.Count(j => j.Status == "Running"),
            Success = jobs.Count(j => j.Status == "Success"),
            Failed = jobs.Count(j => j.Status == "Failed"),
            Idle = jobs.Count(j => j.Status == "Idle"),
            TotalRecords = jobs.Sum(j => j.TotalRecordsAllTime),
            TotalErrors = jobs.Sum(j => j.ErrorCount)
        };

        return Ok(new { Summary = summary, Jobs = jobs });
    }

    /// <summary>
    /// Returns recent error logs, optionally filtered by job name.
    /// </summary>
    [HttpGet("errors")]
    public IActionResult GetErrors([FromQuery] string? job, [FromQuery] int count = 50)
    {
        count = Math.Clamp(count, 1, 200);
        var errors = tracker.GetErrorLogs(job, count);
        return Ok(new { Total = errors.Count, Errors = errors });
    }
}
