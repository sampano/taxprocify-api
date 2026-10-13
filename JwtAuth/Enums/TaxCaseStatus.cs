using System.Text.Json.Serialization;

namespace JwtAuth.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TaxCaseStatus
    {
        Draft,
        Waiting,
        WaitingForDocuments,
        InReview,
        ReadyToFile,
        Filed,
        Completed

    }
}
