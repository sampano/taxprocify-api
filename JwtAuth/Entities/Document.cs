namespace JwtAuth.Entities
{
    public class Document
    {
        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string StoredFileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;
        
        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        //Document belongs to a TaxCase
        public int TaxCaseId { get; set; }

        public TaxCase TaxCase { get; set; } = null!;

        // User who uploaded the document
        public Guid UploadedByUserId { get; set; }

        public User UploadedByUser { get; set; } = null!;

        // Type of tax document
        public int? DocumentTypeId { get; set; }

        public DocumentType? DocumentType { get; set; }

    }
}
