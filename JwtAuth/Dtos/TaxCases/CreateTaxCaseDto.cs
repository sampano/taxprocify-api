using JwtAuth.Enums;
using System.ComponentModel.DataAnnotations;

namespace JwtAuth.Dtos.TaxCases
{
    public class CreateTaxCaseDto
    {
        [Range(2000, 2100)]
        public int TaxYear { get; set; }

        public TaxCaseStatus Status { get; set; }
    }
}
