namespace JwtAuth.Services
{
    public interface IEmailService
    {
        Task SendPortalAccountCreatedAsync(string email, string temporaryPassword);

        Task SendPortalPasswordResetAsync(string email, string temporaryPassword);
    }
}
