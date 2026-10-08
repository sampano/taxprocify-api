using JwtAuth.Data;
using JwtAuth.Dtos;
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
        public async Task<PageResultDto<ClientDto>> GetClientsAsync(Guid userId, string? search, int page, int pageSize)
        {
            var query = _context.Clients
                .Where(client => client.UserId == userId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();

                query = query.Where(client =>
                client.FirstName.ToLower().Contains(search) ||
                client.LastName.ToLower().Contains(search) ||
                client.Email.ToLower().Contains(search));
            }
            
            int totalCount = await query.CountAsync();

            List<ClientDto> clients = await query
                .OrderBy(client => client.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(client => new ClientDto
                {
                    Id = client.Id,
                    FirstName = client.FirstName,
                    LastName = client.LastName,
                    Email = client.Email,
                    Phone = client.Phone,
                    CreatedAt = client.CreatedAt,
                    UserId = client.UserId
                })
                .ToListAsync();

           return new PageResultDto<ClientDto>
           {
               Items = clients,
               Page = page,
               PageSize = pageSize,
               TotalCount = totalCount,
               TotalPages = (int)Math.Ceiling(
                   totalCount / (double)pageSize)
           };

        }

        // Get a client by ID
        public async Task<ClientDto?> GetClientByIdAsync(int id, Guid userId)
        {
            //Client? Get the Client Object or null if not found
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client => 
                client.Id == id && 
                client.UserId == userId);

            if (client is null)
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
                CreatedAt = client.CreatedAt,
                UserId = client.UserId
            };
        }

        // Create a new client
        public async Task<ClientDto> CreateClientAsync(CreateClientDto request, Guid userId)
        {
            string email = request.Email.Trim().ToLower();

           // validation for duplicate client email
            bool emailExists = await _context.Clients.AnyAsync(client =>
            client.UserId == userId &&
            client.Email == request.Email);

            if (emailExists)
            {
                throw new InvalidOperationException("A client with this email already exist.");
            }

            Client client = new Client
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = email,
                Phone = request.Phone,
                UserId = userId
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
                CreatedAt = client.CreatedAt,
                UserId = client.UserId
                
            };
        }

        // Update an existing client
        public async Task<ClientDto?> UpdateClientAsync(
            int id,
            UpdateClientDto request, Guid userId)
        {
            

            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.Id == id && 
                    client.UserId == userId);

            if (client is null)
            {
                return null;
            }

            string email = request.Email.Trim().ToLower();

            bool emailExists = await _context.Clients.AnyAsync(existingClient =>
                existingClient.UserId == userId &&
                existingClient.Email == email &&
                existingClient.Id != id);

            if (emailExists)
            {
                throw new InvalidOperationException("A client with this email already exist.");
            }

            client.FirstName = request.FirstName;
            client.LastName = request.LastName;
            client.Email = email;
            client.Phone = request.Phone;

            await _context.SaveChangesAsync();

            return new ClientDto
            {
                Id = client.Id,
                FirstName = client.FirstName,
                LastName = client.LastName,
                Email = client.Email,
                Phone = client.Phone,
                CreatedAt = client.CreatedAt,
                UserId = client.UserId
            };
        }

        // Delete a client
        public async Task<bool> DeleteClientAsync(int id, Guid userId)
        {
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client => 
                client.Id == id && 
                client.UserId == userId);

            if (client is null)
            {
                return false;
            }

            _context.Clients.Remove(client);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
