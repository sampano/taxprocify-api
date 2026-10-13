using JwtAuth.Dtos.Dashboard;

namespace JwtAuth.Services
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid userId);
    }
}
