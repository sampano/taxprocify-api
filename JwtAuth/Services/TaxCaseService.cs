using JwtAuth.Data;
using JwtAuth.Dtos.TaxCases;
using JwtAuth.Entities;
using JwtAuth.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace JwtAuth.Services
{
    public class TaxCaseService : ITaxCaseService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        private readonly INotificationService _notificationService;

        private static string FormatTaxCaseStatus(TaxCaseStatus status)
        {
            return status switch
            {
                TaxCaseStatus.WaitingForDocuments => "Waiting for Documents",
                TaxCaseStatus.InReview => "In Review",
                TaxCaseStatus.ReadyToFile => "Ready to File",
                _ => status.ToString()
            };
        }

        public static readonly Expression<Func<TaxCase, TaxCaseDto>> TaxCaseToDto = taxCase => new TaxCaseDto
        {
            Id = taxCase.Id,
            TaxYear = taxCase.TaxYear,
            Status = taxCase.Status,
            CreatedAt = taxCase.CreatedAt,
            ClientId = taxCase.ClientId,

            RequestedDocumentsCount = taxCase.DocumentRequests.Count,

            CompletedDocumentsCount = taxCase.DocumentRequests.Count(
                request => request.IsCompleted),

            MissingDocumentsCount = taxCase.DocumentRequests.Count(
                request => !request.IsCompleted),

            DocumentProgressPercentage = taxCase.DocumentRequests.Count == 0 ? 0 : Math.Round(
                    (double)taxCase.DocumentRequests.Count(
                        request => request.IsCompleted)
                    / taxCase.DocumentRequests.Count
                    * 100, 2)
        };

        public TaxCaseService(AppDbContext context, IEmailService emailService, INotificationService notificationService)
        {
            _context = context;
            _emailService = emailService;
            _notificationService = notificationService;

        }

        public async Task<List<TaxCaseDto>> GetTaxCaseByClientAsync(int clientId, Guid userId)
        {
            return await _context.TaxCases
                .Where(taxCase =>
                taxCase.ClientId == clientId &&
                taxCase.Client.UserId == userId)
                .Select(TaxCaseToDto)
                .ToListAsync();
        }

        public async Task<TaxCaseDto?> GetTaxCaseByIdAsync(int id, Guid userId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .Include(taxCase => taxCase.DocumentRequests)
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == id &&
                    taxCase.Client.UserId == userId);

            if (taxCase is null)
            {
                return null;
            }

            return await _context.TaxCases
             .Where(taxCase =>
                 taxCase.Id == id &&
                 taxCase.Client.UserId == userId)
             .Select(TaxCaseToDto)
             .FirstOrDefaultAsync();
        }

        public async Task<TaxCaseDto?> CreateTaxCaseAsync(int clientId, CreateTaxCaseDto request, Guid userId)
        {

            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.Id == clientId &&
                    client.UserId == userId);

            if (client is null)
            {
                return null;
            }

            bool taxCaseExists = await _context.TaxCases.AnyAsync(taxCase =>
            taxCase.ClientId == clientId &&
            taxCase.TaxYear == request.TaxYear);

            if (taxCaseExists)
            {
                throw new InvalidOperationException(
                    "A tax case for this tax year already exist.");
            }
            TaxCase taxCase = new TaxCase
            {
                TaxYear = request.TaxYear,
                Status = request.Status,
                ClientId = clientId
            };

            _context.TaxCases.Add(taxCase);

            await _context.SaveChangesAsync();

            return new TaxCaseDto
            {
                Id = taxCase.Id,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,
                CreatedAt = taxCase.CreatedAt,
                ClientId = taxCase.ClientId
            };
        }

        public async Task<TaxCaseDto?> UpdateTaxCaseAsync(
            int id,
            UpdateTaxCaseDto request,
            Guid userId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .Include(taxCase => taxCase.Client)
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == id &&
                    taxCase.Client.UserId == userId);

            if (taxCase is null)
            {
                return null;
            }

            bool taxCaseExists = await _context.TaxCases.AnyAsync(existingTaxCase =>
            existingTaxCase.ClientId == taxCase.ClientId &&
            existingTaxCase.TaxYear == request.TaxYear &&
            existingTaxCase.Id != id);

           

            if (taxCaseExists)
            {
                throw new InvalidOperationException(
                    "A tax case for this tax year already exists.");
            }

            TaxCaseStatus oldStatus = taxCase.Status;

            taxCase.TaxYear = request.TaxYear;
            taxCase.Status = request.Status;

            await _context.SaveChangesAsync();

            if (oldStatus != taxCase.Status)
            {
                string formattedStatus = FormatTaxCaseStatus(taxCase.Status);

                await _emailService.SendTaxCaseStatusChangedAsync(
                    taxCase.Client.Email,
                    taxCase.TaxYear,
                    formattedStatus);

                if (taxCase.Client.PortalUserId is not null)
                {
                    await _notificationService.CreateNotificationAsync(
                        taxCase.Client.PortalUserId.Value,
                        "Tax case status updated",
                        $"Your {taxCase.TaxYear} tax case is now {formattedStatus}."
                    );
                }

            }

            return new TaxCaseDto
            {
                Id = taxCase.Id,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,
                CreatedAt = taxCase.CreatedAt,
                ClientId = taxCase.ClientId
            };
        }

        public async Task<bool> DeleteTaxCaseAsync(
            int id,
            Guid userId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == id &&
                    taxCase.Client.UserId == userId);

            if (taxCase is null)
            {
                return false;
            }
            
            _context.TaxCases.Remove(taxCase);
            
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<TaxCaseSummaryDto?> GetTaxCaseSummaryAsync(int taxCaseId, Guid userId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .Include(taxCase => taxCase.DocumentRequests)
                    .ThenInclude(request => request.DocumentType)
                        .ThenInclude(documentType => documentType.DocumentCategory)
                .Include(taxCase => taxCase.Documents)
                    .ThenInclude(document => document.DocumentType)
                        .ThenInclude(documentType => documentType!.DocumentCategory)
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == taxCaseId &&
                    taxCase.Client.UserId == userId);

            if (taxCase is null)
            {
                return null;
            }

            int requestedCount =
                taxCase.DocumentRequests.Count;

            int completedCount =
                taxCase.DocumentRequests.Count(request =>
                    request.IsCompleted);

            int missingCount =
                taxCase.DocumentRequests.Count(request =>
                    !request.IsCompleted);

            double progressPercentage =
                requestedCount == 0
                    ? 0
                    : Math.Round(
                        (double)completedCount / requestedCount * 100,
                        2);

            return new TaxCaseSummaryDto
            {
                Id = taxCase.Id,
                ClientId = taxCase.ClientId,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,

                RequestedDocumentsCount = requestedCount,
                CompletedDocumentsCount = completedCount,
                MissingDocumentsCount = missingCount,
                DocumentProgressPercentage = progressPercentage,

                MissingDocuments = taxCase.DocumentRequests
                    .Where(request => !request.IsCompleted)
                    .Select(request => new DocumentRequestSummaryDto
                    {
                        Id = request.Id,
                        DocumentTypeId = request.DocumentTypeId,
                        DocumentType = request.DocumentType.Name,
                        DocumentCategory =
                            request.DocumentType.DocumentCategory.Name,
                        Note = request.Note
                    })
                    .ToList(),

                RecentDocuments = taxCase.Documents
                    .OrderByDescending(document => document.UploadedAt)
                    .Take(5)
                    .Select(document => new RecentDocumentDto
                    {
                        Id = document.Id,
                        FileName = document.FileName,
                        DocumentType = document.DocumentType?.Name,
                        DocumentCategory =
                            document.DocumentType?.DocumentCategory.Name,
                        UploadedAt = document.UploadedAt
                    })
                    .ToList()
            };
        }
    }


}
