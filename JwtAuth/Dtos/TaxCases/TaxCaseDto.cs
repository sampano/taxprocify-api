namespace JwtAuth.Dtos.TaxCases
{
    public class TaxCaseDto
    {
        public int Id { get; set; }
        
        public int TaxYear { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public int ClientId { get; set; }
    }
}
