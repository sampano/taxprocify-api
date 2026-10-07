using JwtAuth.Dtos.Clients;
using JwtAuth.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
    


    [HttpGet]
        public async Task<ActionResult<List<ClientDto>>> GetClients()
        {
            List<ClientDto> clients = 
                await _clientService.GetClientsAsync();

            return Ok(clients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            ClientDto? client = 
                await _clientService.GetClientByIdAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            return Ok(client);
        }

        [HttpPost]
        // Create a new client
        public async Task<ActionResult<ClientDto>> CreateClient(CreateClientDto request)
        {
            
            ClientDto client = 
                await _clientService.CreateClientAsync(request);

            // Return a 201 Created response with the location of the newly created client
            return CreatedAtAction(
                nameof(GetClient), 
                new { id = client.Id }, 
                client);
        }

        [HttpPut("{id}")]
        // Update an existing client
        public async Task<ActionResult<ClientDto>> UpdateClient(int id, UpdateClientDto request)
        {
            ClientDto? client = 
                await _clientService.UpdateClientAsync(id, request);

            if (client == null)
            {
                return NotFound();
            }

            return Ok(client);
        }

        [HttpDelete("{id}")]
        // Delete a client
        public async Task<ActionResult<bool>> DeleteClient(int id)
        {
            bool deleted = 
                await _clientService.DeleteClientAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }

    }
}
