using JwtAuth.Data;
using JwtAuth.Entities;
using Microsoft.EntityFrameworkCore;

namespace JwtAuth.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Notification> CreateNotificationAsync(Guid userId, string title, string message)
        {
            Notification notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message
            };

            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return notification;
        }

        public async Task<List<Notification>> GetNotificationsAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(notification =>
                    notification.UserId == userId)
                .OrderByDescending(notification =>
                    notification.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, Guid userId)
        {
            Notification? notification =
                await _context.Notifications
                    .FirstOrDefaultAsync(notification =>
                        notification.Id == notificationId &&
                        notification.UserId == userId);

            if (notification is null)
            {
                return false;
            }

            notification.IsRead = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}