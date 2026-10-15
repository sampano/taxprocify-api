type TaxCaseStatusBadgeProps = {
  status: string;
};

function getStatusClasses(status: string) {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-700";

    case "Waiting":
    case "WaitingForDocuments":
      return "bg-yellow-100 text-yellow-700";

    case "InReview":
      return "bg-blue-100 text-blue-700";

    case "ReadyToFile":
      return "bg-purple-100 text-purple-700";

    case "Filed":
      return "bg-indigo-100 text-indigo-700";

    case "Completed":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatStatus(status: string) {
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function TaxCaseStatusBadge({ status }: TaxCaseStatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
        status,
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}

export default TaxCaseStatusBadge;
