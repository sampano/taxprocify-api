namespace JwtAuth.Dtos.TaxCases
{
    public class CreateTaxCaseDto
    {
        public int TaxYear { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
