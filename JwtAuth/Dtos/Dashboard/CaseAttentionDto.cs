namespace JwtAuth.Dtos.Dashboard
{
    public class CaseAttentionDto
    {
        public int TaxCaseId { get; set; }

        public int ClientId { get; set; }

        public string ClientName { get; set; } = string.Empty;

        public int TaxYear { get; set; }

        public int MissingDocumentsCount { get; set; }
    }
}
