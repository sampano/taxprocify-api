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

        public async Task SendTaxCaseStatusChangedAsync(string email, int taxYear, string status)
        {
            var message = new EmailMessage
            {
                From = "onboarding@resend.dev",
                To = email,
                Subject = $"Your {taxYear} Tax Case Status Has Been Updated",
                HtmlBody = $"""
            <h2>Your tax case status has been updated</h2>

            <p>
                The status of your {taxYear} TaxProcify tax case has changed.
            </p>

            <p>
                <strong>Current Status:</strong> {status}
            </p>

            <p>
                Please log in to your TaxProcify client portal
                to review your case.
            </p>
            """
            };

            await _resend.EmailSendAsync(message);
        }

        public async Task SendDocumentUploadedAsync(
    string email,
    int taxYear,
    string documentType)
        {
            var message = new EmailMessage
            {
                From = "onboarding@resend.dev",
                To = email,
                Subject = $"Document received for your {taxYear} tax case",
                HtmlBody = $"""
            <h2>Your document was received</h2>

            <p>
                We successfully received your document for your
                {taxYear} TaxProcify tax case.
            </p>

            <p>
                <strong>Document:</strong> {documentType}
            </p>

            <p>
                No further action is required for this document
                unless your tax professional contacts you.
            </p>
            """
            };

            await _resend.EmailSendAsync(message);
        }

        public async Task SendAllDocumentsCompletedAsync(string email, int taxYear)
        {
            var message = new EmailMessage
            {
                From = "onboarding@resend.dev",
                To = email,
                Subject = $"All documents received for your {taxYear} tax case",
                HtmlBody = $"""
            <h2>All requested documents have been received</h2>

            <p>
                We have received all requested documents for your
                {taxYear} TaxProcify tax case.
            </p>

            <p>
                Your tax professional can now continue reviewing your case.
            </p>

            <p>
                You can log in to your TaxProcify client portal
                to check the current status of your tax case.
            </p>
            """
            };

            await _resend.EmailSendAsync(message);
        }

        public async Task SendAdminDocumentUploadedAsync(string adminEmail, string clientName, int taxYear, string documentType, string fileName)
        {
            var message = new EmailMessage
            {
                From = "onboarding@resend.dev",
                To = adminEmail,
                Subject = $"{clientName} uploaded a document",
                HtmlBody = $"""
            <h2>New client document uploaded</h2>

            <p>
                {clientName} uploaded a new document
                for their {taxYear} tax case.
            </p>

            <p>
                <strong>Document:</strong> {documentType}<br />
                <strong>File:</strong> {fileName}
            </p>

            <p>
                Log in to TaxProcify to review the uploaded document.
            </p>
            """
            };

            await _resend.EmailSendAsync(message);
        }
    }
}