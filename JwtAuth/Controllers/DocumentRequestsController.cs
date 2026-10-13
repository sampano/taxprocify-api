using JwtAuth.Dtos.DocumentRequests;
using JwtAuth.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtAuth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentRequestsController : ControllerBase
    {
        private readonly IDocumentRequestService _documentRequestService;

        public DocumentRequestsController(
            IDocumentRequestService documentRequestService)
        {
            _documentRequestService = documentRequestService;
        }

        private Guid GetCurrentUserId()
        {
            string? userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.Parse(userId!);
        }

        [HttpPost("tax-case/{taxCaseId}")]
        public async Task<ActionResult<DocumentRequestDto>> CreateDocumentRequest(
                int taxCaseId,
                CreateDocumentRequestDto request)
        {
            Guid userId = GetCurrentUserId();

            try
            {
                DocumentRequestDto? documentRequest =
                    await _documentRequestService
                        .CreateDocumentRequestAsync(
                            taxCaseId,
                            request,
                            userId);

                if (documentRequest is null)
                {
                    return NotFound();
                }

                return Ok(documentRequest);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("tax-case/{taxCaseId}")]
        public async Task<ActionResult<List<DocumentRequestDto>>> GetDocumentRequests(int taxCaseId)
        {
            Guid userId = GetCurrentUserId();

            List<DocumentRequestDto> requests = await _documentRequestService
                    .GetDocumentRequestsAsync(
                        taxCaseId,
                        userId);

            return Ok(requests);
        }

        [HttpDelete("{documentRequestId}")]
        public async Task<IActionResult> DeleteDocumentRequest(
        int documentRequestId)
        {
            Guid userId = GetCurrentUserId();

            bool deleted =
                await _documentRequestService
                    .DeleteDocumentRequestAsync(
                        documentRequestId,
                        userId);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
