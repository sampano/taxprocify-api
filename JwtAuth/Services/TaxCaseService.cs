using JwtAuth.Data;
using JwtAuth.Dtos.TaxCases;
using JwtAuth.Entities;
using Microsoft.EntityFrameworkCore;

namespace JwtAuth.Services
{
    public class TaxCaseService : ITaxCaseService
    {
        private readonly AppDbContext _context;

        public TaxCaseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TaxCaseDto>> GetTaxCaseByClientAsync(
            int clientId,
            Guid userId)
        {
            return await _context.TaxCases
                .Where(taxCase =>
                taxCase.ClientId == clientId &&
                taxCase.Client.UserId == userId)
                .Select(taxCase => new TaxCaseDto
                {
                    Id = taxCase.Id,
                    TaxYear = taxCase.TaxYear,
                    Status = taxCase.Status,
                    CreatedAt = taxCase.CreatedAt,
                    ClientId = taxCase.ClientId
                })
                .ToListAsync();
        }

        public async Task<TaxCaseDto?> GetTaxCaseByIdAsync(
            int id,
            Guid userId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == id &&
                    taxCase.Client.UserId == userId);

            if (taxCase is null)
            {
                return null;
            }

            return new TaxCaseDto
            {
                Id = taxCase.Id,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,
                CreatedAt = taxCase.CreatedAt,
                ClientId = taxCase.ClientId
            };
        }

        public async Task<TaxCaseDto?> CreateTaxCaseAsync(
            int clientId,
            CreateTaxCaseDto request,
            Guid userId)
        {

            Client? client = await _context.Clients
                .FirstOrDefaultAsync(client =>
                    client.Id == clientId &&
                    client.UserId == userId);

            if (client is null)
            {
                return null;
            }

            bool taxCaseExists = await _context.TaxCases.AnyAsync(taxCase =>
            taxCase.ClientId == clientId &&
            taxCase.TaxYear == request.TaxYear);

            if (taxCaseExists)
            {
                throw new InvalidOperationException(
                    "A tax case for this tax year already exist.");
            }
            TaxCase taxCase = new TaxCase
            {
                TaxYear = request.TaxYear,
                Status = request.Status,
                ClientId = clientId
            };

            _context.TaxCases.Add(taxCase);

            await _context.SaveChangesAsync();

            return new TaxCaseDto
            {
                Id = taxCase.Id,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,
                CreatedAt = taxCase.CreatedAt,
                ClientId = taxCase.ClientId
            };
        }

        public async Task<TaxCaseDto?> UpdateTaxCaseAsync(
            int id,
            UpdateTaxCaseDto request,
            Guid userId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == id &&
                    taxCase.Client.UserId == userId);

            if (taxCase is null)
            {
                return null;
            }

            bool taxCaseExists = await _context.TaxCases.AnyAsync(existingTaxCase =>
            existingTaxCase.ClientId == taxCase.ClientId &&
            existingTaxCase.TaxYear == request.TaxYear &&
            existingTaxCase.Id != id);

            taxCase.TaxYear = request.TaxYear;
            taxCase.Status = request.Status;

            if (taxCaseExists)
            {
                throw new InvalidOperationException(
                    "A tax case for this tax year already exists.");
            }

            await _context.SaveChangesAsync();

            return new TaxCaseDto
            {
                Id = taxCase.Id,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,
                CreatedAt = taxCase.CreatedAt,
                ClientId = taxCase.ClientId
            };
        }

        public async Task<bool> DeleteTaxCaseAsync(
            int id,
            Guid userId)
        {
            TaxCase? taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(taxCase =>
                    taxCase.Id == id &&
                    taxCase.Client.UserId == userId);

            if (taxCase is null)
            {
                return false;
            }
            
            _context.TaxCases.Remove(taxCase);
            
            await _context.SaveChangesAsync();
            
            return true;
        }
    }


}
