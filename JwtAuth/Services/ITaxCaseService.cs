using JwtAuth.Dtos.TaxCases;

namespace JwtAuth.Services
{
    public interface ITaxCaseService
    {
        Task<List<TaxCaseDto>> GetTaxCaseByClientAsync(int clientId, Guid userId);

        Task<TaxCaseDto?> GetTaxCaseByIdAsync(int id, Guid userId);

        Task<TaxCaseDto?> CreateTaxCaseAsync(int clientId, CreateTaxCaseDto request, Guid userId);

        Task<TaxCaseDto?> UpdateTaxCaseAsync( int id, UpdateTaxCaseDto request, Guid userId);

        Task<bool> DeleteTaxCaseAsync(int id,Guid userId);
    }
}
