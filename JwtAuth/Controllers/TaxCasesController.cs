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
    [Authorize]
    public class TaxCasesController : ControllerBase
    {
        private readonly ITaxCaseService _taxCaseService;

        public TaxCasesController(ITaxCaseService taxCaseService)
        {
            _taxCaseService = taxCaseService;
        }
        
        private Guid GetCurrentUserId()
        {
            string? userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.Parse(userId!);
        }
        
        [HttpGet("gettaxcases/client/{clientId}")]
        // Get all tax cases for a specific client
        public async Task<ActionResult<List<TaxCaseDto>>> GetTaxCaseByClient(
            int clientId)
        {
            Guid userId = GetCurrentUserId();

            List<TaxCaseDto> taxCases =
                await _taxCaseService.GetTaxCaseByClientAsync(
                    clientId, 
                    userId);

            return Ok(taxCases);
        }

        [HttpGet("gettaxcases/{id}")]

        // Get a specific tax case by its ID
        public async Task<ActionResult<TaxCaseDto>> GetTaxCase(int id)
        {
            Guid userId = GetCurrentUserId();

            TaxCaseDto? taxCase = await _taxCaseService
                .GetTaxCaseByIdAsync(id, userId);

            if(taxCase is null)
            {
                return NotFound();
            }

            return Ok(taxCase);
        }

        [HttpPost("createtaxcases/{clientId}")]
        // Create a new tax case for a specific client
        public async Task<ActionResult<TaxCaseDto>> CreateTaxCase(
            int clientId,
            CreateTaxCaseDto request)
        {
            Guid userId = GetCurrentUserId();

            TaxCaseDto? taxCase = await _taxCaseService.CreateTaxCaseAsync(
                clientId,
                request,
                userId);

            if (taxCase is null)
            {
                return NotFound();
            }

            return CreatedAtAction(
                nameof(GetTaxCase),
                new { id = taxCase.Id }, 
                taxCase);

        }

        [HttpPut("updatetaxcases/{id}")]
        // Update an existing tax case by its ID
        public async Task<ActionResult<TaxCaseDto>> UpdateTaxCase(
            int id,
            UpdateTaxCaseDto request)
        {
            Guid userId = GetCurrentUserId();

            TaxCaseDto? taxCase = await _taxCaseService.UpdateTaxCaseAsync(
                id,
                request,
                userId);

            if (taxCase is null)
            {
                return NotFound();
            }

            return Ok(taxCase);
        }

        [HttpDelete("deletetaxcases/{id}")]
        public async Task<IActionResult> DeleteTaxCase(int id)
        {
            Guid userId = GetCurrentUserId();

            bool deleted = await _taxCaseService.DeleteTaxCaseAsync(
                id, 
                userId);

            if(!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
