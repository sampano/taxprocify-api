using JwtAuth.Enums;

namespace JwtAuth.Dtos.TaxCases
{
    public class TaxCaseDto
    {
        public int Id { get; set; }

        public int TaxYear { get; set; }

        public TaxCaseStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public int ClientId { get; set; }

        public int RequestedDocumentsCount { get; set; }

        public int CompletedDocumentsCount { get; set; }

        public int MissingDocumentsCount { get; set; }

        public double DocumentProgressPercentage { get; set; }
    }
}
