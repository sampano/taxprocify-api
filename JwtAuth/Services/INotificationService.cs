using JwtAuth.Entities;

namespace JwtAuth.Services
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(Guid userId, string title, string message);

        Task<List<Notification>> GetNotificationsAsync(Guid userId);

        Task<bool> MarkAsReadAsync(int notificationId, Guid userId);
    }
}
