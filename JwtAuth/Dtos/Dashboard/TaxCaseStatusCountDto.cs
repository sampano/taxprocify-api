using JwtAuth.Enums;

namespace JwtAuth.Dtos.Dashboard
{
    public class TaxCaseStatusCountDto
    {
        public TaxCaseStatus Status { get; set; }

        public int Count { get; set; }
    }
}
