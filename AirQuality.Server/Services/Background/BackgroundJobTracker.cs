using System.Collections.Concurrent;

namespace AirQuality.Server.Services.Background;

/// <summary>
/// Thread-safe singleton service that tracks the status of all background jobs.
/// Background services call ReportStart/ReportSuccess/ReportError to update their status.
/// Admin API reads from GetAllJobs/GetErrorLogs.
/// </summary>
public class BackgroundJobTracker
{
    private readonly ConcurrentDictionary<string, JobStatus> _jobs = new();
    private readonly ConcurrentQueue<ErrorLogEntry> _errorLogs = new();
    private const int MaxErrorLogs = 100;

    /// <summary>Register a job with its metadata (call once per service at startup).</summary>
    public void RegisterJob(string jobName, string description, string interval)
    {
        _jobs.TryAdd(jobName, new JobStatus
        {
            JobName = jobName,
            Description = description,
            Interval = interval,
            Status = "Idle",
            RegisteredAt = DateTime.UtcNow
        });
    }

    /// <summary>Mark job as running.</summary>
    public void ReportStart(string jobName)
    {
        if (_jobs.TryGetValue(jobName, out var status))
        {
            status.Status = "Running";
            status.LastRunAt = DateTime.UtcNow;
            status.LastError = null;
        }
    }

    /// <summary>Mark job as success with record count.</summary>
    public void ReportSuccess(string jobName, int recordsProcessed, TimeSpan? duration = null)
    {
        if (_jobs.TryGetValue(jobName, out var status))
        {
            status.Status = "Success";
            status.LastSuccessAt = DateTime.UtcNow;
            status.RecordsProcessed = recordsProcessed;
            status.TotalRecordsAllTime += recordsProcessed;
            status.SuccessCount++;
            status.LastDurationMs = duration?.TotalMilliseconds ?? 
                (status.LastRunAt.HasValue ? (DateTime.UtcNow - status.LastRunAt.Value).TotalMilliseconds : 0);
        }
    }

    /// <summary>Mark job as failed and add error to log.</summary>
    public void ReportError(string jobName, Exception ex)
    {
        if (_jobs.TryGetValue(jobName, out var status))
        {
            status.Status = "Failed";
            status.ErrorCount++;
            status.LastError = ex.Message;
        }

        var entry = new ErrorLogEntry
        {
            Timestamp = DateTime.UtcNow,
            JobName = jobName,
            Message = ex.Message,
            ExceptionType = ex.GetType().Name,
            StackTrace = ex.StackTrace?.Length > 500 ? ex.StackTrace[..500] + "..." : ex.StackTrace
        };

        _errorLogs.Enqueue(entry);

        // Trim if exceeds max
        while (_errorLogs.Count > MaxErrorLogs)
        {
            _errorLogs.TryDequeue(out _);
        }
    }

    /// <summary>Get all job statuses.</summary>
    public List<JobStatus> GetAllJobs()
    {
        return _jobs.Values
            .OrderBy(j => j.JobName)
            .Select(j => j.Clone())
            .ToList();
    }

    /// <summary>Get error logs, optionally filtered by job name.</summary>
    public List<ErrorLogEntry> GetErrorLogs(string? jobName = null, int count = 50)
    {
        var query = _errorLogs.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(jobName))
        {
            query = query.Where(e => e.JobName.Equals(jobName, StringComparison.OrdinalIgnoreCase));
        }

        return query
            .OrderByDescending(e => e.Timestamp)
            .Take(count)
            .ToList();
    }

    // ─── DTOs ──────────────────────────────────────────────────────────

    public class JobStatus
    {
        public string JobName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Interval { get; set; } = string.Empty;
        public string Status { get; set; } = "Idle";
        public DateTime RegisteredAt { get; set; }
        public DateTime? LastRunAt { get; set; }
        public DateTime? LastSuccessAt { get; set; }
        public double LastDurationMs { get; set; }
        public int RecordsProcessed { get; set; }
        public long TotalRecordsAllTime { get; set; }
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public string? LastError { get; set; }

        public JobStatus Clone() => new()
        {
            JobName = JobName,
            Description = Description,
            Interval = Interval,
            Status = Status,
            RegisteredAt = RegisteredAt,
            LastRunAt = LastRunAt,
            LastSuccessAt = LastSuccessAt,
            LastDurationMs = LastDurationMs,
            RecordsProcessed = RecordsProcessed,
            TotalRecordsAllTime = TotalRecordsAllTime,
            SuccessCount = SuccessCount,
            ErrorCount = ErrorCount,
            LastError = LastError
        };
    }

    public class ErrorLogEntry
    {
        public DateTime Timestamp { get; set; }
        public string JobName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string ExceptionType { get; set; } = string.Empty;
        public string? StackTrace { get; set; }
    }
}
