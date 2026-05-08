namespace JobHunter.Api.Models;

public class Job
{
    public string Id { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Company { get; set; }
    public string? Url { get; set; }
    public string? Source { get; set; }
    public DateTime? SeenAt { get; set; }
    public int? Score { get; set; }
    public string? MatchReason { get; set; }
    public string? RequiredSkills { get; set; }
    public string? ContractType { get; set; }

    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
