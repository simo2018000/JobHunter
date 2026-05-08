using JobHunter.Api.Data;
using JobHunter.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobHunter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _context;

    public JobsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs([FromQuery] string? status)
    {
        var query = _context.Jobs.Include(j => j.Applications).AsQueryable();
        
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(j => j.Applications.Any(a => a.Status == status));
        }

        var jobs = await query.OrderByDescending(j => j.SeenAt).ToListAsync();
        return Ok(jobs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetJob(string id)
    {
        var job = await _context.Jobs.Include(j => j.Applications).FirstOrDefaultAsync(j => j.Id == id);
        if (job == null) return NotFound();
        return Ok(job);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusDto dto)
    {
        var job = await _context.Jobs.Include(j => j.Applications).FirstOrDefaultAsync(j => j.Id == id);
        if (job == null) return NotFound();

        var app = job.Applications.FirstOrDefault();
        if (app == null)
        {
            app = new Application
            {
                Id = Guid.NewGuid().ToString(),
                JobId = id,
                Status = dto.Status,
                AppliedAt = dto.Status != "Nouveau" ? DateTime.UtcNow : null,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Applications.Add(app);
        }
        else
        {
            app.Status = dto.Status;
            app.UpdatedAt = DateTime.UtcNow;
            if (dto.Status == "Postulé" && app.AppliedAt == null) app.AppliedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(app);
    }

    [HttpPatch("{id}/notes")]
    public async Task<IActionResult> UpdateNotes(string id, [FromBody] UpdateNotesDto dto)
    {
        var job = await _context.Jobs.Include(j => j.Applications).FirstOrDefaultAsync(j => j.Id == id);
        if (job == null) return NotFound();

        var app = job.Applications.FirstOrDefault();
        if (app == null)
        {
            app = new Application
            {
                Id = Guid.NewGuid().ToString(),
                JobId = id,
                Notes = dto.Notes,
                Status = "Nouveau",
                UpdatedAt = DateTime.UtcNow
            };
            _context.Applications.Add(app);
        }
        else
        {
            app.Notes = dto.Notes;
            app.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(app);
    }
}

public class UpdateStatusDto { public string Status { get; set; } = string.Empty; }
public class UpdateNotesDto { public string Notes { get; set; } = string.Empty; }
