namespace JwtAuth.Services
{
    public interface IEmailService
    {
        Task SendPortalAccountCreatedAsync(string email, string temporaryPassword);

        Task SendPortalPasswordResetAsync(string email, string temporaryPassword);

        Task SendDocumentRequestCreatedAsync(string email, int taxYear, string documentType,string? note);

        Task SendTaxCaseStatusChangedAsync(string email, int taxYear, string status);

        Task SendDocumentUploadedAsync(string email, int taxYear, string documentType);
    }
}
