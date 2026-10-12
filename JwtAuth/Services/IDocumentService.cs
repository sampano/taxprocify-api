using JwtAuth.Dtos.Documents;
using JwtAuth.Entities;

namespace JwtAuth.Services
{
    public interface IDocumentService
    {
        Task<DocumentDto?> UploadDocumentAsync(int taxCaseId, IFormFile file, Guid userId);

        Task<List<DocumentDto>> GetDocumentByTaxCaseAsync(int taxCaseId, Guid userId);

        Task<DownloadDocumentDto> GetDocumentForDownloadAsync(int documentId, Guid userId);

        Task<bool> DeleteDocumentAsync(int documentId, Guid userId);

    }
}
