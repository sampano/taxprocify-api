using JwtAuth.Data;
using JwtAuth.Dtos;
using JwtAuth.Dtos.Clients;
using JwtAuth.Dtos.TaxCases;
using JwtAuth.Entities;
using Microsoft.AspNetCore.Identity;
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
                    UserId = client.UserId,
                    PortalUserId = client.PortalUserId
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
                UserId = client.UserId,
                PortalUserId = client.PortalUserId

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
                UserId = client.UserId,
                PortalUserId = client.PortalUserId

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
                UserId = client.UserId,
                PortalUserId = client.PortalUserId
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

        public async Task<bool> AssignPortalUserAsync(int clientId, Guid portalUserId, Guid adminUserId)
        {
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.Id == clientId &&
                    client.UserId == adminUserId);

            if (client is null)
            {
                return false;
            }

            bool alreadyAssigned = await _context.Clients
                .AnyAsync(client =>
                    client.PortalUserId == portalUserId &&
                    client.Id != clientId);

            if (alreadyAssigned)
            {
                throw new InvalidOperationException(
                    "This portal user is already assigned to another client.");
            }

            User? portalUser = await _context.Users
                .FirstOrDefaultAsync(user =>
                    user.Id == portalUserId &&
                    user.Role == "Client");

            if (portalUser is null)
            {
                throw new InvalidOperationException(
                    "Client portal user not found.");
            }

            client.PortalUserId = portalUser.Id;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<ClientDto?> GetClientByPortalUserIdAsync(Guid portalUserId)
        {
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.PortalUserId == portalUserId);

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
                UserId = client.UserId,
                PortalUserId = client.PortalUserId
            };
        }

        public async Task<List<TaxCaseDto>> GetPortalTaxCasesAsync(Guid portalUserId)
        {
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.PortalUserId == portalUserId);

            if (client is null)
            {
                return [];
            }

            return await _context.TaxCases
                .Where(taxCase => taxCase.ClientId == client.Id)
                .Select(taxCase => new TaxCaseDto
                {
                    Id = taxCase.Id,
                    TaxYear = taxCase.TaxYear,
                    Status = taxCase.Status,
                    CreatedAt = taxCase.CreatedAt,
                    ClientId = taxCase.ClientId,
                    RequestedDocumentsCount =
                        taxCase.DocumentRequests.Count,
                    CompletedDocumentsCount =
                        taxCase.DocumentRequests.Count(request => request.IsCompleted),
                    MissingDocumentsCount =
                        taxCase.DocumentRequests.Count(request => !request.IsCompleted),
                    DocumentProgressPercentage =
                        taxCase.DocumentRequests.Count == 0
                            ? 0
                            : (double)taxCase.DocumentRequests.Count(request => request.IsCompleted)
                              / taxCase.DocumentRequests.Count * 100
                })
                .ToListAsync();
        }

        public async Task<TaxCaseSummaryDto?> GetPortalTaxCaseSummaryAsync(int taxCaseId, Guid portalUserId)
        {
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.PortalUserId == portalUserId);

            if (client is null)
            {
                return null;
            }

            TaxCase? taxCase = await _context.TaxCases
                .Include(taxCase => taxCase.DocumentRequests)
                    .ThenInclude(request => request.DocumentType)
                        .ThenInclude(type => type.DocumentCategory)
                .Include(taxCase => taxCase.Documents)
                    .ThenInclude(document => document.DocumentType)
                        .ThenInclude(type => type.DocumentCategory)
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == taxCaseId &&
                    taxCase.ClientId == client.Id);

            if (taxCase is null)
            {
                return null;
            }

            int requestedCount = taxCase.DocumentRequests.Count;
            int completedCount = taxCase.DocumentRequests.Count(request => request.IsCompleted);
            int missingCount = taxCase.DocumentRequests.Count(request => !request.IsCompleted);

            double progress =
                requestedCount == 0
                    ? 0
                    : (double)completedCount / requestedCount * 100;

            return new TaxCaseSummaryDto
            {
                Id = taxCase.Id,
                ClientId = taxCase.ClientId,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,
                RequestedDocumentsCount = requestedCount,
                CompletedDocumentsCount = completedCount,
                MissingDocumentsCount = missingCount,
                DocumentProgressPercentage = progress,

                MissingDocuments = taxCase.DocumentRequests
                    .Where(request => !request.IsCompleted)
                    .Select(request => new DocumentRequestSummaryDto
                    {
                        Id = request.Id,
                        DocumentTypeId = request.DocumentTypeId,
                        DocumentType = request.DocumentType.Name,
                        DocumentCategory = request.DocumentType.DocumentCategory.Name,
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
                        DocumentType = document.DocumentType != null
                            ? document.DocumentType.Name
                            : null,
                        DocumentCategory = document.DocumentType != null
                            ? document.DocumentType.DocumentCategory.Name
                            : null,
                        UploadedAt = document.UploadedAt
                    })
                    .ToList()
            };
        }

        public async Task<bool> CreatePortalAccountAsync(int clientId, string password, Guid adminUserId)
        {
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.Id == clientId &&
                    client.UserId == adminUserId);

            if (client is null)
            {
                return false;
            }

            if (client.PortalUserId is not null)
            {
                throw new InvalidOperationException(
                    "This client already has a portal account.");
            }

            bool emailExists = await _context.Users
                .AnyAsync(user => user.Email == client.Email);

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "A user account with this email already exists.");
            }

            var user = new User
            {
                Email = client.Email,
                Role = "Client"
            };

            user.PasswordHash = new PasswordHasher<User>()
                .HashPassword(user, password);

            _context.Users.Add(user);

            client.PortalUserId = user.Id;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UnassignPortalUserAsync(int clientId, Guid adminUserId)
        {
            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.Id == clientId &&
                    client.UserId == adminUserId);

            if (client is null)
            {
                return false;
            }

            client.PortalUserId = null;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
