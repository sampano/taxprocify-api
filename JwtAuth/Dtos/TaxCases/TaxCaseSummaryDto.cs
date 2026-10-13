using JwtAuth.Enums;

namespace JwtAuth.Dtos.TaxCases
{
    public class TaxCaseSummaryDto
    {
        public int Id { get; set; }

        public int ClientId { get; set; }

        public int TaxYear { get; set; }

        public TaxCaseStatus Status { get; set; }

        public int RequestedDocumentsCount { get; set; }

        public int CompletedDocumentsCount { get; set; }

        public int MissingDocumentsCount { get; set; }

        public double DocumentProgressPercentage { get; set; }

        public List<DocumentRequestSummaryDto> MissingDocuments { get; set; } = [];

        public List<RecentDocumentDto> RecentDocuments { get; set; } = [];
    }
}
