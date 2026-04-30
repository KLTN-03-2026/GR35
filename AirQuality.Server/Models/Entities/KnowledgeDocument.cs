using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entities;

/// <summary>
/// Knowledge document cho RAG - lưu trữ kiến thức + embedding vector
/// </summary>
[Table("KnowledgeDocuments")]
public class KnowledgeDocument
{
    [Key]
    public int DocumentId { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Category { get; set; } = string.Empty; // "health", "terminology", "app_info", "environment"

    /// <summary>JSON array of float[] - embedding vector (384 hoặc 1024 dim)</summary>
    public string? EmbeddingJson { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
