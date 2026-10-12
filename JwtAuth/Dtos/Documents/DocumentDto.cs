namespace JwtAuth.Dtos.Documents
{
    public class DocumentDto
    {

        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string ContentType {  get; set; } = string.Empty;

        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; }

        public int TaxCaseId { get; set; }

       
        public int? DocumentTypeId { get; set; }

        public string? DocumentType { get; set; }

        public string? DocumentCategory { get; set; }
    }
}
