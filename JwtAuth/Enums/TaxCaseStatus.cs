using System.Text.Json.Serialization;

namespace JwtAuth.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TaxCaseStatus
    {
        Draft,
        Waiting,
        InReview,
        ReadyToFile,
        Filed,
        Completed

    }
}
