namespace JwtAuth.Dtos.DocumentRequests
{
    public class CreateDocumentRequestDto
    {
        public int DocumentTypeId { get; set; }

        public string? Note { get; set; }
    }
}
