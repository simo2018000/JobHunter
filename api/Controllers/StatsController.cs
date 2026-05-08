using JobHunter.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobHunter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StatsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var totalJobs = await _context.Jobs.CountAsync();
        var appliedJobs = await _context.Applications.CountAsync(a => a.Status != "Nouveau");
        var offers = await _context.Applications.CountAsync(a => a.Status == "Offre");
        var responseRate = appliedJobs > 0 ? (double)offers / appliedJobs * 100 : 0;
        
        var avgScore = await _context.Jobs.Where(j => j.Score.HasValue).AverageAsync(j => (double?)j.Score) ?? 0;

        var sourceStats = await _context.Jobs
            .GroupBy(j => j.Source)
            .Select(g => new { name = g.Key ?? "Unknown", value = g.Count() })
            .ToListAsync();

        var dateStats = await _context.Jobs
            .Where(j => j.SeenAt.HasValue)
            .GroupBy(j => j.SeenAt.Value.Date)
            .Select(g => new { date = g.Key.ToString("yyyy-MM-dd"), count = g.Count() })
            .OrderBy(x => x.date)
            .Take(14)
            .ToListAsync();

        return Ok(new
        {
            totalScraped = totalJobs,
            totalApplied = appliedJobs,
            responseRate = responseRate,
            averageScore = avgScore,
            jobsBySource = sourceStats,
            jobsPerDay = dateStats
        });
    }
}
