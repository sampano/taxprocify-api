namespace JwtAuth.Entities
{
    public class Client
    {
        public int Id { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key to the User entity, store which user owns client
        public Guid UserId { get; set; }

        public User User { get; set; } = null!;

        public List<TaxCase> TaxCases { get; set; } = [];
    }
}
