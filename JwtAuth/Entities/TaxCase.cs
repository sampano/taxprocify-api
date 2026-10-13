using JwtAuth.Enums;

namespace JwtAuth.Entities
{
    public class TaxCase
    {
        public int Id { get; set; }

        public int TaxYear { get; set; }

        public TaxCaseStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int ClientId { get; set; }

        public Client Client { get; set; } = null!;

        public List<Document> Documents { get; set; } = [];

        public List<DocumentRequest> DocumentRequests { get; set; } = [];
    }
}
