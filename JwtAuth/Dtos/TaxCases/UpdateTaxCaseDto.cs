namespace JwtAuth.Dtos.TaxCases
{
    public class UpdateTaxCaseDto
    {
        public int TaxYear { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
