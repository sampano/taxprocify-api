using JwtAuth.Dtos.Documents;


namespace JwtAuth.Services
{
    public interface IDocumentService
    {
        Task<DocumentDto?> UploadDocumentAsync(int taxCaseId, IFormFile file, int documentTypeId, Guid userId);

        Task<List<DocumentDto>> GetDocumentByTaxCaseAsync(int taxCaseId, Guid userId);

        Task<DownloadDocumentDto?> GetDocumentForDownloadAsync(int documentId, Guid userId);

        Task<bool> DeleteDocumentAsync(int documentId, Guid userId);

        Task<List<DocumentCategoryDto>> GetDocumentCategoriesAsync();

        Task<DocumentDto?> UploadPortalDocumentAsync(int taxCaseId, IFormFile file, int documentTypeId, Guid portalUserId);

        Task<DownloadDocumentDto?> GetPortalDocumentForDownloadAsync(int documentId, Guid portalUserId);

        Task<List<DocumentDto>> GetPortalDocumentsByTaxCaseAsync(int taxCaseId, Guid portalUserId);

        Task<bool> DeletePortalDocumentAsync(int documentId, Guid portalUserId);

    }
}
