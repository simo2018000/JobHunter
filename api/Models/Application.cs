namespace JobHunter.Api.Models;

public class Application
{
    public string Id { get; set; } = string.Empty;
    public string? JobId { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public DateTime? AppliedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Job? Job { get; set; }
}
