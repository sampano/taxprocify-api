using JwtAuth.Data;
using JwtAuth.Dtos.Documents;
using JwtAuth.Entities;
using JwtAuth.Enums;
using Microsoft.EntityFrameworkCore;


namespace JwtAuth.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IEmailService _emailService;


        public DocumentService(
            AppDbContext context,
            IWebHostEnvironment environment, IEmailService emailService)
        {
            _context = context;
            _environment = environment;
            _emailService = emailService;
        }
        
        
        public async Task<DocumentDto?> UploadDocumentAsync(int taxCaseId, IFormFile file, int documentTypeId, Guid userId)
            {
                TaxCase? taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(taxCase =>
                taxCase.Id == taxCaseId &&
                taxCase.Client.UserId == userId);

                if (taxCase is null)
                {
                    return null;
                }

                // Check if the document type exists
                bool documentTypeExists =
                    await _context.DocumentTypes.AnyAsync(
                        documentType => documentType.Id == documentTypeId);

                if (!documentTypeExists)
                {
                    throw new InvalidOperationException("The selected document type does not exist.");
                }

                if (file.Length == 0)
                {
                    throw new InvalidOperationException("The uploaded file is empty");
                }

                const long maxFileSize = 10 * 1024 * 1024;

                if(file.Length > maxFileSize)
                {
                    throw new InvalidOperationException("The file size cannot exceed 10 MB");
                }

                string[] allowedExtensions =
                {
                    ".pdf",
                    ".jpg",
                    ".jpeg",
                    ".png"
                };

                string extension = Path.GetExtension(file.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    throw new InvalidOperationException("Only PDF, JPG, and PNG files are allowed.");
                }

                string uploadsFolder = Path.Combine(
                    _environment.ContentRootPath,
                    "Uploads");

                Directory.CreateDirectory(uploadsFolder);

                string storedFileName = $"{Guid.NewGuid()}{extension}";

                string filePath = Path.Combine(uploadsFolder, storedFileName);

                using (FileStream stream = new FileStream(filePath,
                    FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                Document document = new Document
                {
                    FileName = file.FileName,
                    StoredFileName = storedFileName,
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    UploadedAt = DateTime.UtcNow,
                    TaxCaseId = taxCaseId,
                    UploadedByUserId = userId,
                    DocumentTypeId = documentTypeId
                };
                
                _context.Documents.Add(document);

                 await _context.SaveChangesAsync();

                DocumentRequest? documentRequest = await _context.DocumentRequests
                    .FirstOrDefaultAsync(request =>
                    request.TaxCaseId == taxCaseId &&
                    request.DocumentTypeId == documentTypeId);

                if (documentRequest is not null)
                {
                    documentRequest.IsCompleted = true;

                    await _context.SaveChangesAsync();
                }

                DocumentType? documentType = await _context.DocumentTypes
                    .Include(documentType => documentType.DocumentCategory)
                    .FirstOrDefaultAsync(documentType =>
                     documentType.Id == documentTypeId);
            
                return new DocumentDto
                {
                    Id = document.Id,
                    FileName = document.FileName,
                    ContentType = document.ContentType,
                    FileSize = document.FileSize,
                    UploadedAt = DateTime.UtcNow,
                    TaxCaseId = taxCaseId,
                    DocumentTypeId = document.DocumentTypeId,
                    DocumentType = documentType?.Name,
                    DocumentCategory = documentType?.DocumentCategory.Name
                };
            
        }
        
        public async Task<List<DocumentDto>> GetDocumentByTaxCaseAsync(int taxCaseId, Guid userId)
        {
            return await _context.Documents
                .Where(document =>
                    document.TaxCaseId == taxCaseId &&
                    document.TaxCase.Client.UserId == userId)
                .OrderByDescending(document => document.UploadedAt)
                .Select(document => new DocumentDto
                {
                    Id = document.Id,
                    FileName = document.FileName,
                    ContentType = document.ContentType,
                    FileSize = document.FileSize,
                    UploadedAt= document.UploadedAt,
                    TaxCaseId = document.TaxCaseId,
                    DocumentTypeId = document.DocumentTypeId,
                    DocumentType = document.DocumentType != null
                        ? document.DocumentType.Name
                        : null,
                    DocumentCategory = document.DocumentType != null
                        ? document.DocumentType.DocumentCategory.Name
                        : null
                })
                .ToListAsync();
        }


        public async Task<DownloadDocumentDto?> GetDocumentForDownloadAsync(int documenId, Guid userId)
        {
            Document? document = await _context.Documents
                .FirstOrDefaultAsync(document =>
                    document.Id == documenId &&
                    document.TaxCase.Client.UserId == userId);

            if (document is null)
            {
                return null;
            }

            string uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");

            string filePath = Path.Combine(uploadsFolder, document.StoredFileName);

            if (!File.Exists(filePath))
            {
                return null;
            }


            return new DownloadDocumentDto
            {
                FilePath = filePath,
                FileName = document.FileName,
                ContentType = document.ContentType
            };
        }

        public async Task<bool> DeleteDocumentAsync(int documentId, Guid userId)
        {
            Document? document = await _context.Documents
                .FirstOrDefaultAsync(document =>
                    document.Id == documentId &&
                    document.TaxCase.Client.UserId == userId);

            if (document is null)
            {
                return false;
            }

            int taxCaseId = document.TaxCaseId;

            int? documentTypeId = document.DocumentTypeId;

            string uploadsFolder = Path.Combine(
                _environment.ContentRootPath,
                "Uploads");

            string filePath = Path.Combine(
                uploadsFolder,
                document.StoredFileName);

            //Deletes physical file
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            // Delete  record in DB
            _context.Documents.Remove(document);

            await _context.SaveChangesAsync();


           // Check if another same type document still exist

            if (documentTypeId is not null)
            {
                bool anotherDocumentExists = await _context.Documents.AnyAsync(existingDocument =>
                        existingDocument.TaxCaseId == taxCaseId &&
                        existingDocument.DocumentTypeId == documentTypeId);

                if (!anotherDocumentExists)
                {
                    DocumentRequest? documentRequest = await _context.DocumentRequests
                            .FirstOrDefaultAsync(request =>
                                request.TaxCaseId == taxCaseId &&
                                request.DocumentTypeId == documentTypeId);

                    if (documentRequest is not null)
                    {
                        documentRequest.IsCompleted = false;

                        await _context.SaveChangesAsync();
                    }
                }

            }

            return true;

        }

        public async Task<List<DocumentCategoryDto>> GetDocumentCategoriesAsync()
        {
            return await _context.DocumentCategories
                .OrderBy(category => category.Name)
                .Select(category => new DocumentCategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    DocumentTypes = category.DocumentTypes
                        .OrderBy(documentType => documentType.Name)
                        .Select(documentType => new DocumentTypeDto
                        {
                            Id = documentType.Id,
                            Name = documentType.Name
                        })
                .ToList()
                }).ToListAsync();
        }

        public async Task<DocumentDto?> UploadPortalDocumentAsync(int taxCaseId, IFormFile file, int documentTypeId, Guid portalUserId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .Include(taxCase => taxCase.Client)
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == taxCaseId &&
                    taxCase.Client.PortalUserId == portalUserId);

            if (taxCase is null)
            {
                return null;
            }

            bool documentTypeExists =
                await _context.DocumentTypes.AnyAsync(
                    documentType => documentType.Id == documentTypeId);

            if (!documentTypeExists)
            {
                throw new InvalidOperationException(
                    "The selected document type does not exist.");
            }

            if (file.Length == 0)
            {
                throw new InvalidOperationException(
                    "The uploaded file is empty.");
            }

            const long maxFileSize = 10 * 1024 * 1024;

            if (file.Length > maxFileSize)
            {
                throw new InvalidOperationException(
                    "The file size cannot exceed 10 MB.");
            }

            string[] allowedExtensions =
            {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    };

            string extension =
                Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
            {
                throw new InvalidOperationException(
                    "Only PDF, JPG, and PNG files are allowed.");
            }

            string uploadsFolder = Path.Combine(
                _environment.ContentRootPath,
                "Uploads");

            Directory.CreateDirectory(uploadsFolder);

            string storedFileName =
                $"{Guid.NewGuid()}{extension}";

            string filePath =
                Path.Combine(uploadsFolder, storedFileName);

            using (FileStream stream =
                new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            Document document = new Document
            {
                FileName = file.FileName,
                StoredFileName = storedFileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow,
                TaxCaseId = taxCaseId,
                UploadedByUserId = portalUserId,
                DocumentTypeId = documentTypeId
            };

            _context.Documents.Add(document);

            await _context.SaveChangesAsync();

            DocumentRequest? documentRequest =
                await _context.DocumentRequests
                    .FirstOrDefaultAsync(request =>
                        request.TaxCaseId == taxCaseId &&
                        request.DocumentTypeId == documentTypeId);

            if (documentRequest is not null)
            {
                documentRequest.IsCompleted = true;

                await _context.SaveChangesAsync();
            }

            DocumentType? documentType =
                await _context.DocumentTypes
                    .Include(documentType =>
                        documentType.DocumentCategory)
                    .FirstOrDefaultAsync(documentType =>
                        documentType.Id == documentTypeId);
            if (documentType is not null)
            {
                await _emailService.SendDocumentUploadedAsync(
                    taxCase.Client.Email,
                    taxCase.TaxYear,
                    documentType.Name);
            }
            return new DocumentDto
            {
                Id = document.Id,
                FileName = document.FileName,
                ContentType = document.ContentType,
                FileSize = document.FileSize,
                UploadedAt = document.UploadedAt,
                TaxCaseId = document.TaxCaseId,
                DocumentTypeId = document.DocumentTypeId,
                DocumentType = documentType?.Name,
                DocumentCategory =
                    documentType?.DocumentCategory.Name
            };


        }

        public async Task<List<DocumentDto>> GetPortalDocumentsByTaxCaseAsync(int taxCaseId, Guid portalUserId)
        {
            return await _context.Documents
                .Where(document =>
                    document.TaxCaseId == taxCaseId &&
                    document.TaxCase.Client.PortalUserId
                        == portalUserId)
                .OrderByDescending(document =>
                    document.UploadedAt)
                .Select(document => new DocumentDto
                {
                    Id = document.Id,
                    FileName = document.FileName,
                    ContentType = document.ContentType,
                    FileSize = document.FileSize,
                    UploadedAt = document.UploadedAt,
                    TaxCaseId = document.TaxCaseId,
                    DocumentTypeId = document.DocumentTypeId,
                    DocumentType =
                        document.DocumentType != null
                            ? document.DocumentType.Name
                            : null,
                    DocumentCategory =
                        document.DocumentType != null
                            ? document.DocumentType
                                .DocumentCategory.Name
                            : null
                })
                .ToListAsync();
        }

        public async Task<DownloadDocumentDto?> GetPortalDocumentForDownloadAsync(int documentId, Guid portalUserId)
        {
            Document? document =
                await _context.Documents
                    .FirstOrDefaultAsync(document =>
                        document.Id == documentId &&
                        document.TaxCase.Client.PortalUserId
                            == portalUserId);

            if (document is null)
            {
                return null;
            }

            string uploadsFolder = Path.Combine(
                _environment.ContentRootPath,
                "Uploads");

            string filePath = Path.Combine(
                uploadsFolder,
                document.StoredFileName);

            if (!File.Exists(filePath))
            {
                return null;
            }

            return new DownloadDocumentDto
            {
                FilePath = filePath,
                FileName = document.FileName,
                ContentType = document.ContentType
            };
        }

        public async Task<bool> DeletePortalDocumentAsync(int documentId, Guid portalUserId)
        {
            Document? document = await _context.Documents
                .Include(document => document.TaxCase)
                    .ThenInclude(taxCase => taxCase.Client)
                .FirstOrDefaultAsync(document =>
                    document.Id == documentId &&
                    document.TaxCase.Client.PortalUserId == portalUserId &&
                    document.UploadedByUserId == portalUserId);

            if (document is null)
            {
                return false;
            }

            if (document.TaxCase.Status == TaxCaseStatus.Filed ||
                document.TaxCase.Status == TaxCaseStatus.Completed)
            {
                throw new InvalidOperationException(
                    "Documents cannot be deleted after the tax case has been filed or completed.");
            }

            int taxCaseId = document.TaxCaseId;
            int? documentTypeId = document.DocumentTypeId;

            string uploadsFolder = Path.Combine(
                _environment.ContentRootPath,
                "Uploads");

            string filePath = Path.Combine(
                uploadsFolder,
                document.StoredFileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            _context.Documents.Remove(document);

            await _context.SaveChangesAsync();

            if (documentTypeId is not null)
            {
                bool anotherDocumentExists =
                    await _context.Documents.AnyAsync(existingDocument =>
                        existingDocument.TaxCaseId == taxCaseId &&
                        existingDocument.DocumentTypeId == documentTypeId);

                if (!anotherDocumentExists)
                {
                    DocumentRequest? documentRequest =
                        await _context.DocumentRequests
                            .FirstOrDefaultAsync(request =>
                                request.TaxCaseId == taxCaseId &&
                                request.DocumentTypeId == documentTypeId);

                    if (documentRequest is not null)
                    {
                        documentRequest.IsCompleted = false;

                        await _context.SaveChangesAsync();
                    }
                }
            }

            return true;
        }
    }
}