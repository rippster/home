namespace WebApplication1.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using WebApplication1.Models;
    using WebApplication1.Services;

    [ApiController]
    [Route("api/[controller]")]
    public class TimeZonesController : ControllerBase
    {
        private readonly ILogger<TimeZonesController> logger;

        private readonly TimeZoneService timeZoneService;

        public TimeZonesController(TimeZoneService timeZoneService, ILogger<TimeZonesController> logger)
        {
            this.timeZoneService = timeZoneService;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<TimeZones> Get()
        {
            TimeZones result = new TimeZones();
            result.Poland = await this.timeZoneService.GetTimeAsync("Europe/Warsaw");
            result.UK = await this.timeZoneService.GetTimeAsync("Europe/London");
            result.NewYork = await this.timeZoneService.GetTimeAsync("America/New_York");
            result.Minnesota = await this.timeZoneService.GetTimeAsync("America/Chicago");
            result.LA = await this.timeZoneService.GetTimeAsync("America/Los_Angeles");

            return result;
        }
    }
}