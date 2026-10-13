using JwtAuth.Data;
using JwtAuth.Dtos.Dashboard;
using JwtAuth.Enums;
using Microsoft.EntityFrameworkCore;

namespace JwtAuth.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid userId)
        {
            int totalClients = await _context.Clients.CountAsync(client =>
                    client.UserId == userId);

            int totalTaxCases = await _context.TaxCases.CountAsync(taxCase =>
                    taxCase.Client.UserId == userId);

            int waitingForDocumentsCount = await _context.TaxCases.CountAsync(taxCase =>
                    taxCase.Client.UserId == userId &&
                    taxCase.Status == TaxCaseStatus.WaitingForDocuments);

            int completedTaxCasesCount = await _context.TaxCases.CountAsync(taxCase =>
                    taxCase.Client.UserId == userId &&
                    taxCase.Status == TaxCaseStatus.Completed);

            int totalRequestedDocuments = await _context.DocumentRequests.CountAsync(request =>
                    request.TaxCase.Client.UserId == userId);

            int totalCompletedDocuments = await _context.DocumentRequests.CountAsync(request =>
                    request.TaxCase.Client.UserId == userId &&
                    request.IsCompleted);

            int totalMissingDocuments = await _context.DocumentRequests.CountAsync(request =>
                    request.TaxCase.Client.UserId == userId &&
                    !request.IsCompleted);

            double overallProgress =
                totalRequestedDocuments == 0
                    ? 0
                    : Math.Round(
                        (double)totalCompletedDocuments /
                        totalRequestedDocuments * 100,
                        2);

            List<CaseAttentionDto> casesNeedingAttention = await _context.TaxCases
               .Where(taxCase =>
                   taxCase.Client.UserId == userId &&
                   //Only select tax cases where at least one document request is incomplete.
                   taxCase.DocumentRequests.Any(
                   request => !request.IsCompleted))
               .Select(taxCase => new CaseAttentionDto
               {
                   TaxCaseId = taxCase.Id,

                   ClientId = taxCase.ClientId,

                   ClientName = taxCase.Client.FirstName + " " + taxCase.Client.LastName,

                   TaxYear = taxCase.TaxYear,

                   MissingDocumentsCount = taxCase.DocumentRequests.Count(
                           request => !request.IsCompleted)
               })
               .OrderByDescending(taxCase =>
                   taxCase.MissingDocumentsCount)
               .Take(5)
               .ToListAsync();

            List<RecentActivityDto> recentActivity = await _context.Documents
            .Where(document =>
                document.TaxCase.Client.UserId == userId)
            .OrderByDescending(document =>
                document.UploadedAt)
            .Take(5)
            .Select(document => new RecentActivityDto
            {
                DocumentId = document.Id,

                FileName = document.FileName,

                DocumentType = document.DocumentType != null ? document.DocumentType.Name : null,

                ClientName = document.TaxCase.Client.FirstName + " " + document.TaxCase.Client.LastName,

                TaxCaseId = document.TaxCaseId,

                TaxYear = document.TaxCase.TaxYear,

                UploadedAt = document.UploadedAt
            }).ToListAsync();

            return new DashboardSummaryDto
            {
                TotalClients = totalClients,
                TotalTaxCases = totalTaxCases,
                WaitingForDocumentsCount = waitingForDocumentsCount,
                CompletedTaxCasesCount = completedTaxCasesCount,
                TotalRequestedDocuments = totalRequestedDocuments,
                TotalCompletedDocuments = totalCompletedDocuments,
                TotalMissingDocuments = totalMissingDocuments,
                OverallDocumentProgressPercentage = overallProgress,

                CasesNeedingAttention = casesNeedingAttention,

                RecentActivity = recentActivity
            };
        }
    }
}
