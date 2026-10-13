namespace JwtAuth.Entities
{
    public class DocumentType
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public int DocumentCategoryId { get; set; }


        public DocumentCategory DocumentCategory { get; set; } = null!;

        public List<Document> Documents { get; set; } = [];

        public List<DocumentRequest> DocumentRequests { get; set; } = [];

    }
}
