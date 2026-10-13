namespace JwtAuth.Entities
{
    public class DocumentRequest
    {
        public int Id { get; set; }

        public int TaxCaseId { get; set; }

        public TaxCase TaxCase { get; set; } = null!;

        public int DocumentTypeId { get; set; }

        public DocumentType DocumentType { get; set; } = null!;

        public string? Note { get; set; }

        public bool IsCompleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
    }
}
