using Resend;

namespace JwtAuth.Services
{
    public class EmailService : IEmailService
    {
        private readonly IResend _resend;

        public EmailService(IResend resend)
        {
            _resend = resend;
        }

        public async Task SendPortalAccountCreatedAsync(
            string email,
            string temporaryPassword)
        {
            var message = new EmailMessage
            {
                From = "onboarding@resend.dev",
                To = email,
                Subject = "Your TaxProcify Portal Account",
                HtmlBody = $"""
                    <h2>Your portal account is ready</h2>

                    <p>Your TaxProcify client portal account has been created.</p>

                    <p>
                        <strong>Email:</strong> {email}<br />
                        <strong>Temporary Password:</strong> {temporaryPassword}
                    </p>

                    <p>
                        Please log in and keep your account information secure.
                    </p>
                    """
            };

            await _resend.EmailSendAsync(message);
        }

        public async Task SendPortalPasswordResetAsync(
            string email,
            string temporaryPassword)
        {
            var message = new EmailMessage
            {
                From = "onboarding@resend.dev",
                To = email,
                Subject = "Your TaxProcify Password Reset Is Complete",
                HtmlBody = $"""
                    <h2>Your password reset is complete</h2>

                    <p>
                        Your TaxProcify client portal password has been successfully reset.
                    </p>

                    <p>
                        <strong>Email:</strong> {email}<br />
                        <strong>New Temporary Password:</strong> {temporaryPassword}
                    </p>

                    <p>
                        You can now log in using your new temporary password.
                    </p>
                    """
            };

            await _resend.EmailSendAsync(message);
        }

        public async Task SendDocumentRequestCreatedAsync(string email, int taxYear, string documentType, string? note)
        {
            var message = new EmailMessage
            {
                From = "onboarding@resend.dev",
                To = email,
                Subject = $"New document requested for your {taxYear} tax case",
                HtmlBody = $"""
            <h2>New document requested</h2>

            <p>
                A new document has been requested for your
                {taxYear} TaxProcify tax case.
            </p>

            <p>
                <strong>Document:</strong> {documentType}
            </p>

            {(string.IsNullOrWhiteSpace(note)
                        ? ""
                        : $"<p><strong>Note:</strong> {note}</p>")}

            <p>
                Please log in to your TaxProcify client portal
                to review the request and upload the document.
            </p>
            """
            };

            await _resend.EmailSendAsync(message);
        }
    }
}