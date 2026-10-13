using JwtAuth.Dtos.Documents;
using JwtAuth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Protocols;
using System.Security.Claims;

namespace JwtAuth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;


        public DocumentsController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        private Guid GetCurrentUserId()
        {
            string? userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.Parse(userId!);
        }
        
        [HttpPost("tax-document/upload/{taxCaseId}")]
        public async Task<ActionResult<DocumentDto>> UploadDocument(
            int taxCaseId,
            [FromForm] UploadDocumentDto request)
        {
            Guid userId = GetCurrentUserId();

            try
            {
                DocumentDto? document =
                    await _documentService.UploadDocumentAsync(
                        taxCaseId,
                        request.File,
                        request.DocumentTypeId,
                        userId);

                if (document is null)
                {
                    return NotFound();
                }

                return Ok(document);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }

        }

        [HttpGet("tax-document/search/{taxCaseId}")]
        public async Task<ActionResult<List<DocumentDto>>> GetDocuments(int taxCaseId)
        {
            Guid userId = GetCurrentUserId();

            List<DocumentDto> document = await _documentService.GetDocumentByTaxCaseAsync(taxCaseId, userId);


            return Ok(document);
        }

        [HttpGet("tax-document/download/{documentId}")]
        public async Task <IActionResult> DownloadDocument(int documentId)
        {
            Guid userId = GetCurrentUserId();

            DownloadDocumentDto? document = await _documentService.GetDocumentForDownloadAsync(documentId, userId);

            if(document is null)
            {
                return NotFound();
            }

            return PhysicalFile(
                document.FilePath,
                document.ContentType,
                document.FileName);
        }

        [HttpDelete("tax-document/delete/{documentId}")]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            Guid userId = GetCurrentUserId();

            bool deleted = await _documentService.DeleteDocumentAsync(
                documentId,
                userId);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpGet("tax-document/categories")]
        public async Task<ActionResult<List<DocumentCategoryDto>>> GetDocumentCategories()
        {
            List<DocumentCategoryDto> categories =
                await _documentService.GetDocumentCategoriesAsync();

            return Ok(categories);
        }
    }

    
}
