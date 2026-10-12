namespace JwtAuth.Dtos.Documents
{
    public class DocumentCategoryDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public List<DocumentTypeDto> DocumentTypes { get; set; } = [];
    }
}
