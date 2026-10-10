namespace JwtAuth.Entities
{
    public class TaxCase
    {
        public int Id { get; set; }
        public int TaxYear { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int ClientId { get; set; }

        public Client Client { get; set; } = null!;

    }
}
