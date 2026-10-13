namespace JwtAuth.Dtos.Dashboard
{
    public class RecentActivityDto
    {
        public int DocumentId { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string? DocumentType { get; set; }

        public string ClientName { get; set; } = string.Empty;

        public int TaxCaseId { get; set; }

        public int TaxYear { get; set; }

        public DateTime UploadedAt { get; set; }
    }
}
