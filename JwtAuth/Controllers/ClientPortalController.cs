using JwtAuth.Dtos.Clients;
using JwtAuth.Dtos.Documents;
using JwtAuth.Dtos.TaxCases;
using JwtAuth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtAuth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Client")]
    public class ClientPortalController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly IDocumentService _documentService;

        public ClientPortalController(IClientService clientService, IDocumentService documentService)
        {
            _clientService = clientService;
            _documentService = documentService;
        }

        private Guid GetCurrentUserId()
        {
            string? userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.Parse(userId!);
        }

        [HttpGet("me")]
        public async Task<ActionResult<ClientDto>> GetMyClientProfile()
        {
            Guid portalUserId = GetCurrentUserId();

            ClientDto? client =
                await _clientService.GetClientByPortalUserIdAsync(
                    portalUserId);

            if (client is null)
            {
                return NotFound("Client profile not found.");
            }

            return Ok(client);
        }

        [HttpGet("tax-cases")]
        public async Task<ActionResult<List<TaxCaseDto>>> GetMyTaxCases()
        {
            Guid portalUserId = GetCurrentUserId();

            List<TaxCaseDto> taxCases =
                await _clientService.GetPortalTaxCasesAsync(portalUserId);

            return Ok(taxCases);
        }

        [HttpGet("tax-cases/{taxCaseId}")]
        public async Task<ActionResult<TaxCaseSummaryDto>> GetMyTaxCase(int taxCaseId)
        {
            Guid portalUserId = GetCurrentUserId();

            TaxCaseSummaryDto? taxCase =
                await _clientService.GetPortalTaxCaseSummaryAsync(
                    taxCaseId,
                    portalUserId);

            if (taxCase is null)
            {
                return NotFound("Tax case not found.");
            }

            return Ok(taxCase);
        }

        [HttpPost("tax-cases/{taxCaseId}/documents")]
        public async Task<ActionResult<DocumentDto>> UploadDocument(int taxCaseId,
        [FromForm] UploadDocumentDto request)
        {
            Guid portalUserId = GetCurrentUserId();

            try
            {
                DocumentDto? document =
                    await _documentService
                        .UploadPortalDocumentAsync(
                            taxCaseId,
                            request.File,
                            request.DocumentTypeId,
                            portalUserId);

                if (document is null)
                {
                    return NotFound("Tax case not found.");
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

        [HttpGet("tax-cases/{taxCaseId}/documents")]
        public async Task<ActionResult<List<DocumentDto>>> GetDocuments(int taxCaseId)
        {
            Guid portalUserId = GetCurrentUserId();

            List<DocumentDto> documents =
                await _documentService
                    .GetPortalDocumentsByTaxCaseAsync(
                        taxCaseId,
                        portalUserId);

            return Ok(documents);
        }

        [HttpGet("documents/{documentId}/download")]
        public async Task<IActionResult> DownloadDocument(int documentId)
        {
            Guid portalUserId = GetCurrentUserId();

            DownloadDocumentDto? document =
                await _documentService
                    .GetPortalDocumentForDownloadAsync(
                        documentId,
                        portalUserId);

            if (document is null)
            {
                return NotFound();
            }

            return PhysicalFile(
                document.FilePath,
                document.ContentType,
                document.FileName);
        }

        [HttpDelete("documents/{documentId}")]
        public async Task<IActionResult> DeleteDocument(
    int documentId)
        {
            Guid portalUserId = GetCurrentUserId();

            try
            {
                bool deleted =
                    await _documentService.DeletePortalDocumentAsync(
                        documentId,
                        portalUserId);

                if (!deleted)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}