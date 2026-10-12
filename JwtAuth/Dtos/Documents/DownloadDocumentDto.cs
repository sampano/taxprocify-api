namespace JwtAuth.Dtos.Documents
{
    public class DownloadDocumentDto
    {
        public string FilePath { get; set; } = string.Empty;

        public string FileName { get; set; } = string.Empty;

        public string ContentType {  get; set; } = string.Empty;
    }
}
