using JwtAuth.Data;
using JwtAuth.Dtos.Clients;
using JwtAuth.Entities;
using Microsoft.EntityFrameworkCore;

namespace JwtAuth.Services
{
    public class ClientService : IClientService
    {
        private readonly AppDbContext _context;

        public ClientService(AppDbContext context)
        {
            _context = context;
        }

        // Get all clients
        public async Task<List<ClientDto>> GetClientsAsync()
        {
            return await _context.Clients
                .Select(client => new ClientDto
                {
                    Id = client.Id,
                    FirstName = client.FirstName,
                    LastName = client.LastName,
                    Email = client.Email,
                    Phone = client.Phone,
                    CreatedAt = client.CreatedAt
                })
                .ToListAsync();

        }

        // Get a client by ID
        public async Task<ClientDto?> GetClientByIdAsync(int id)
        {
            //Client? Get the Client Object or null if not found
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client => client.Id == id);

            if (client == null)
            {
                return null;
            }

            return new ClientDto
            {
                Id = client.Id,
                FirstName = client.FirstName,
                LastName = client.LastName,
                Email = client.Email,
                Phone = client.Phone,
                CreatedAt = client.CreatedAt
            };
        }

        // Create a new client
        public async Task<ClientDto> CreateClientAsync(CreateClientDto request)
        {
            Client client = new Client
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone
            };

            _context.Clients.Add(client);

            await _context.SaveChangesAsync();

            return new ClientDto
            {
                Id = client.Id,
                FirstName = client.FirstName,
                LastName = client.LastName,
                Email = client.Email,
                Phone = client.Phone,
                CreatedAt = client.CreatedAt
            };
        }

        // Update an existing client
        public async Task<ClientDto?> UpdateClientAsync(
            int id,
            UpdateClientDto request)
        {
            Client? client = await _context.Clients
                .FindAsync(id);

            if (client == null)
            {
                return null;
            }

            client.FirstName = request.FirstName;
            client.LastName = request.LastName;
            client.Email = request.Email;
            client.Phone = request.Phone;

            await _context.SaveChangesAsync();

            return new ClientDto
            {
                Id = client.Id,
                FirstName = client.FirstName,
                LastName = client.LastName,
                Email = client.Email,
                Phone = client.Phone,
                CreatedAt = client.CreatedAt
            };
        }

        // Delete a client
        public async Task<bool> DeleteClientAsync(int id)
        {
            Client? client = await _context.Clients
                .FindAsync(id);

            if (client == null)
            {
                return false;
            }

            _context.Clients.Remove(client);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
