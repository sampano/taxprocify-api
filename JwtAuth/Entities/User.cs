namespace JwtAuth.Entities
{
    public class User

    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty; // Default role is "User"

        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiryTime { get; set; }

        // Navigation property for the related clients
        public List<Client> Clients { get; set; } = [];

        public List<Document> Documents { get; set; } = [];
    }
}
