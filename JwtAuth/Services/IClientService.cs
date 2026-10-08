using JwtAuth.Dtos;
using JwtAuth.Dtos.Clients;

namespace JwtAuth.Services
{
    public interface IClientService
    {
        Task<PageResultDto<ClientDto>> GetClientsAsync(Guid userId, string? search, int page, int pageSize);

        Task<ClientDto?> GetClientByIdAsync(int id, Guid userId);

        Task<ClientDto> CreateClientAsync(CreateClientDto request, Guid userId);

        Task<ClientDto?> UpdateClientAsync(int id, UpdateClientDto request, Guid userId);

        Task<bool> DeleteClientAsync(int id, Guid userId);
        //Task ListClientsAsync();
    }
}
