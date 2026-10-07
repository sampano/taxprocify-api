using JwtAuth.Dtos.Clients;

namespace JwtAuth.Services
{
    public interface IClientService
    {
        Task<List<ClientDto>> GetClientsAsync();

        Task<ClientDto?> GetClientByIdAsync(int id);

        Task<ClientDto> CreateClientAsync(CreateClientDto request);

        Task<ClientDto?> UpdateClientAsync(int id, UpdateClientDto request);

        Task<bool> DeleteClientAsync(int id);
        //Task ListClientsAsync();
    }
}
