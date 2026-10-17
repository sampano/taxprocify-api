using JwtAuth.Entities;
using JwtAuth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtAuth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(
            INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private Guid GetCurrentUserId()
        {
            string? userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.Parse(userId!);
        }

        [HttpGet]
        public async Task<ActionResult<List<Notification>>> GetNotifications()
        {
            Guid userId = GetCurrentUserId();

            List<Notification> notifications =
                await _notificationService.GetNotificationsAsync(userId);

            return Ok(notifications);
        }

        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            Guid userId = GetCurrentUserId();

            bool updated =
                await _notificationService.MarkAsReadAsync(
                    notificationId,
                    userId);

            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}