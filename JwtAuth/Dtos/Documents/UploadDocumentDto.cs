namespace JwtAuth.Dtos.Documents
{
    public class UploadDocumentDto
    {
        public IFormFile File { get; set; } = null!;

        public int DocumentTypeId { get; set; }
    }


}
