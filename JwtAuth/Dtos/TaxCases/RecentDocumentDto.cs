namespace JwtAuth.Dtos.TaxCases
{
    public class RecentDocumentDto
    {
        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string? DocumentType { get; set; }

        public string? DocumentCategory { get; set; }

        public DateTime UploadedAt { get; set; }
    }
}
