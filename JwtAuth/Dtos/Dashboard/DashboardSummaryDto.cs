namespace JwtAuth.Dtos.Dashboard
{
    public class DashboardSummaryDto
    {
        public int TotalClients { get; set; }

        public int TotalTaxCases { get; set; }

        public int WaitingForDocumentsCount { get; set; }

        public int CompletedTaxCasesCount { get; set; }

        public int TotalRequestedDocuments { get; set; }

        public int TotalCompletedDocuments { get; set; }

        public int TotalMissingDocuments { get; set; }

        public double OverallDocumentProgressPercentage { get; set; }

        public List<CaseAttentionDto> CasesNeedingAttention { get; set; } = [];

        public List<RecentActivityDto> RecentActivity { get; set; } = [];
    }
}
