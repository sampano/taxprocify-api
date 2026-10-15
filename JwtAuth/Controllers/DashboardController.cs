using JwtAuth.Dtos.Dashboard;
using JwtAuth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtAuth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(
            IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        private Guid GetCurrentUserId()
        {
            string? userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.Parse(userId!);
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>>
            GetSummary()
        {
            Guid userId = GetCurrentUserId();

            DashboardSummaryDto summary =
                await _dashboardService
                    .GetDashboardSummaryAsync(userId);

            return Ok(summary);
        }
    }
}
