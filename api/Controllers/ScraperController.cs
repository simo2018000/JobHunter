using Microsoft.AspNetCore.Mvc;

namespace JobHunter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScraperController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ScraperController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost("trigger")]
    public async Task<IActionResult> Trigger()
    {
        var scraperUrl = Environment.GetEnvironmentVariable("SCRAPER_URL") ?? "http://localhost:3001/run";
        
        try
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsync(scraperUrl, null);
            
            if (response.IsSuccessStatusCode)
            {
                return Ok(new { message = "Scraper triggered successfully" });
            }
            
            return StatusCode((int)response.StatusCode, new { message = "Failed to trigger scraper" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error triggering scraper", error = ex.Message });
        }
    }
}
