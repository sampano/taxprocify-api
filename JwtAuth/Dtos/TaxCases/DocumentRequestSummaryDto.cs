namespace JwtAuth.Dtos.TaxCases
{
    public class DocumentRequestSummaryDto
    {
        public int DocumentTypeId { get; set; }

        public string DocumentType { get; set; } = string.Empty;

        public string DocumentCategory { get; set; } = string.Empty;

        public string? Note { get; set; }
    }
}
