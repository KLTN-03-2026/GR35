using AirQuality.Server.Data;
using AirQuality.Server.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot;

/// <summary>
/// In-memory vector search trên KnowledgeDocuments.
/// Load embeddings lần đầu, cache trong memory, tính cosine similarity.
/// </summary>
public class VectorSearchService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly EmbeddingService _embeddingService;
    private readonly ILogger<VectorSearchService> _logger;

    private List<(int DocId, string Title, string Content, string Category, float[] Embedding)>? _cache;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public VectorSearchService(
        IServiceScopeFactory scopeFactory,
        EmbeddingService embeddingService,
        ILogger<VectorSearchService> logger)
    {
        _scopeFactory = scopeFactory;
        _embeddingService = embeddingService;
        _logger = logger;
    }

    /// <summary>
    /// Tìm top-K documents tương đồng nhất với query
    /// </summary>
    public async Task<List<SearchResult>> SearchAsync(string query, int topK = 3, float minScore = 0.1f)
    {
        await EnsureCacheLoadedAsync();

        if (_cache == null || !_cache.Any())
            return new List<SearchResult>();

        var queryEmbedding = await _embeddingService.GetEmbeddingAsync(query);

        var scored = _cache
            .Select(doc => new
            {
                doc.DocId,
                doc.Title,
                doc.Content,
                doc.Category,
                Score = CosineSimilarity(queryEmbedding, doc.Embedding)
            })
            .Where(x => x.Score >= minScore)
            .OrderByDescending(x => x.Score)
            .Take(topK)
            .Select(x => new SearchResult
            {
                DocumentId = x.DocId,
                Title = x.Title,
                Content = x.Content,
                Category = x.Category,
                Score = x.Score
            })
            .ToList();

        _logger.LogInformation("Vector search for '{Query}' → {Count} results (top score: {TopScore:F3})",
            query.Length > 50 ? query[..50] + "..." : query,
            scored.Count,
            scored.FirstOrDefault()?.Score ?? 0);

        return scored;
    }

    /// <summary>Invalidate cache (gọi khi seed thêm documents)</summary>
    public void InvalidateCache()
    {
        _cache = null;
        _logger.LogInformation("Vector search cache invalidated");
    }

    private async Task EnsureCacheLoadedAsync()
    {
        if (_cache != null) return;

        await _lock.WaitAsync();
        try
        {
            if (_cache != null) return; // double-check

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var docs = await db.Set<KnowledgeDocument>()
                .Where(d => d.EmbeddingJson != null)
                .ToListAsync();

            _cache = new List<(int, string, string, string, float[])>();

            foreach (var doc in docs)
            {
                try
                {
                    var embedding = JsonSerializer.Deserialize<float[]>(doc.EmbeddingJson!);
                    if (embedding != null && embedding.Length > 0)
                    {
                        _cache.Add((doc.DocumentId, doc.Title, doc.Content, doc.Category, embedding));
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse embedding for doc {DocId}", doc.DocumentId);
                }
            }

            _logger.LogInformation("Loaded {Count} knowledge documents into vector cache", _cache.Count);
        }
        finally
        {
            _lock.Release();
        }
    }

    private static float CosineSimilarity(float[] a, float[] b)
    {
        if (a.Length != b.Length) return 0;

        float dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.Length; i++)
        {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        var denom = (float)(Math.Sqrt(normA) * Math.Sqrt(normB));
        return denom > 0 ? dot / denom : 0;
    }
}

public class SearchResult
{
    public int DocumentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public float Score { get; set; }
}
