using JwtAuth.Dtos;
using JwtAuth.Dtos.Clients;
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
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientsController(IClientService clientService)
        {
            _clientService = clientService;
        }
    
        private Guid GetCurrentUserId()
        {
            string? userId = 
                User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            return Guid.Parse(userId!);
        }

        [HttpGet]   

        public async Task<ActionResult<List<ClientDto>>> GetClients(string? search, int page = 1, int pageSize = 10)
        {
            Guid userId = GetCurrentUserId();

            PageResultDto<ClientDto> clients = 
                await _clientService.GetClientsAsync(
                    userId, 
                    search, 
                    page, 
                    pageSize);

            return Ok(clients);
        }

        [HttpGet("/getclient/{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            Guid userId = GetCurrentUserId();

            ClientDto? client = 
                await _clientService.GetClientByIdAsync(id, userId);

            if (client == null)
            {
                return NotFound();
            }

            return Ok(client);
        }

        [HttpPost("/createclient")]
        // Create a new client
        public async Task<ActionResult<ClientDto>> CreateClient(CreateClientDto request)
        {

            Guid userId = GetCurrentUserId();

            try
            {
                ClientDto client = await _clientService.CreateClientAsync(request, userId);


                // Return a 201 Created response with the location of the newly created client
                return CreatedAtAction(
                    nameof(GetClient),
                    new { id = client.Id },
                    client);
            }

            catch(InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });

            }
            
        }

        [HttpPut("/updateclient/{id}")]
        // Update an existing client
        public async Task<ActionResult<ClientDto>> UpdateClient(int id, UpdateClientDto request)
        {
            Guid userId = GetCurrentUserId();
            try
            {
                ClientDto? client =
               await _clientService.UpdateClientAsync(id, request, userId);

                if (client == null)
                {
                    return NotFound();
                }

                return Ok(client);
            }
            catch(InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("/deleteclient/{id}")]
        // Delete a client
        public async Task<ActionResult<bool>> DeleteClient(int id)
        {
            Guid userId = GetCurrentUserId();

            bool deleted = 
                await _clientService.DeleteClientAsync(id, userId);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }


    }
}
