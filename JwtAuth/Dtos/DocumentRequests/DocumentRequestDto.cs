namespace JwtAuth.Dtos.DocumentRequests
{
    public class DocumentRequestDto
    {
        public int Id { get; set; }

        public int TaxCaseId { get; set; }

        public int DocumentTypeId { get; set; }

        public string DocumentType { get; set; } = string.Empty;

        public string DocumentCategory { get; set; } = string.Empty;

        public string? Note { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
