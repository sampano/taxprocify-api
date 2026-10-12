namespace JwtAuth.Entities
{
    public class DocumentCategory
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public List<DocumentType> DocumentTypes { get; set; } = [];
    }
}
