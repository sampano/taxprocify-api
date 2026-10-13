using JwtAuth.Dtos.DocumentRequests;

namespace JwtAuth.Services
{
    public interface IDocumentRequestService
    {
        Task<DocumentRequestDto?> CreateDocumentRequestAsync(int taxCaseId, CreateDocumentRequestDto request, Guid userId);

        Task<List<DocumentRequestDto>> GetDocumentRequestsAsync(int taxCaseId, Guid userId);

        Task<bool> DeleteDocumentRequestAsync(int documentRequestId, Guid userId);
    }
}
