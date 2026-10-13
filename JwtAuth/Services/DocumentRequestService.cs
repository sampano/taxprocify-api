using JwtAuth.Data;
using JwtAuth.Dtos.DocumentRequests;
using JwtAuth.Entities;
using Microsoft.EntityFrameworkCore;

namespace JwtAuth.Services
{
    public class DocumentRequestService : IDocumentRequestService
    {
        private readonly AppDbContext _context;

        public DocumentRequestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DocumentRequestDto?> CreateDocumentRequestAsync(
            int taxCaseId,
            CreateDocumentRequestDto request,
            Guid userId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == taxCaseId &&
                    taxCase.Client.UserId == userId);

            if (taxCase is null)
            {
                return null;
            }

            DocumentType? documentType = await _context.DocumentTypes
                    .Include(documentType =>
                        documentType.DocumentCategory)
                    .FirstOrDefaultAsync(documentType =>
                        documentType.Id == request.DocumentTypeId);

            if (documentType is null)
            {
                throw new InvalidOperationException(
                    "The selected document type does not exist.");
            }

            bool requestExists = await _context.DocumentRequests.AnyAsync(
                    documentRequest =>
                        documentRequest.TaxCaseId == taxCaseId &&
                        documentRequest.DocumentTypeId ==
                            request.DocumentTypeId);

            if (requestExists)
            {
                throw new InvalidOperationException(
                    "This document has already been requested.");
            }

            DocumentRequest documentRequest = new DocumentRequest
            {
                TaxCaseId = taxCaseId,
                DocumentTypeId = request.DocumentTypeId,
                Note = request.Note,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentRequests.Add(documentRequest);

            await _context.SaveChangesAsync();

            return new DocumentRequestDto
            {
                Id = documentRequest.Id,
                TaxCaseId = documentRequest.TaxCaseId,
                DocumentTypeId = documentRequest.DocumentTypeId,
                Note = documentRequest.Note,
                DocumentType = documentType.Name,
                DocumentCategory = documentType.DocumentCategory.Name,
                IsCompleted = documentRequest.IsCompleted,
                CreatedAt = documentRequest.CreatedAt
            };
        }

        public async Task<List<DocumentRequestDto>> GetDocumentRequestsAsync(int taxCaseId, Guid userId)
        {
            return await _context.DocumentRequests
                .Where(documentRequest =>
                    documentRequest.TaxCaseId == taxCaseId &&
                    documentRequest.TaxCase.Client.UserId == userId)
                .OrderBy(documentRequest =>
                    documentRequest.DocumentType.DocumentCategory.Name)
                .ThenBy(documentRequest =>
                    documentRequest.DocumentType.Name)
                .Select(documentRequest =>
                    new DocumentRequestDto
                    {
                        Id = documentRequest.Id,
                        TaxCaseId = documentRequest.TaxCaseId,
                        DocumentTypeId = documentRequest.DocumentTypeId,
                        DocumentType = documentRequest.DocumentType.Name,
                        DocumentCategory = documentRequest.DocumentType.DocumentCategory.Name,
                        Note = documentRequest.Note,
                        IsCompleted = documentRequest.IsCompleted,
                        CreatedAt = documentRequest.CreatedAt
                    })
                .ToListAsync();
        }

        public async Task<bool> DeleteDocumentRequestAsync(int documentRequestId, Guid userId)
        {
            DocumentRequest? documentRequest = await _context.DocumentRequests
                    .FirstOrDefaultAsync(documentRequest =>
                        documentRequest.Id == documentRequestId &&
                        documentRequest.TaxCase.Client.UserId == userId);

            if (documentRequest is null)
            {
                return false;
            }

            _context.DocumentRequests.Remove(documentRequest);

            await _context.SaveChangesAsync();

            return true;
        }

    }
}
