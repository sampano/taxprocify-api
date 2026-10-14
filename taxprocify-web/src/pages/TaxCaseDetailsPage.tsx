import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

type MissingDocument = {
  documentTypeId: number;
  documentType: string;
  documentCategory: string;
  note: string | null;
};

type RecentDocument = {
  id: number;
  fileName: string;
  documentType: string | null;
  documentCategory: string | null;
  uploadedAt: string;
};

type TaxCaseSummary = {
  id: number;
  clientId: number;
  taxYear: number;
  status: string;
  requestedDocumentsCount: number;
  completedDocumentsCount: number;
  missingDocumentsCount: number;
  documentProgressPercentage: number;
  missingDocuments: MissingDocument[];
  recentDocuments: RecentDocument[];
};

function TaxCaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [taxCase, setTaxCase] = useState<TaxCaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTaxCase() {
      try {
        const response = await apiFetch(`/TaxCases/${id}/summary`);

        if (response.status === 404) {
          setError("Tax case not found.");
          return;
        }

        if (!response.ok) {
          setError("Failed to load tax case.");
          return;
        }

        const data: TaxCaseSummary = await response.json();

        setTaxCase(data);
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadTaxCase();
  }, [id]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile || !selectedDocumentTypeId || !taxCase) {
      setUploadError("Please select a document type and file.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("File", selectedFile);
      formData.append("DocumentTypeId", selectedDocumentTypeId);

      const response = await apiFetch(
        `/Documents/tax-document/upload/${taxCase.id}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const message = await response.text();

        setUploadError(message || "Failed to upload document.");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      setUploadError("Unable to upload document.");
    } finally {
      setUploading(false);
    }
  }
  if (!taxCase) {
    return null;
  }

  const currentTaxCase = taxCase;
  const clientId = currentTaxCase.clientId;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(`/clients/${clientId}`)}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Client
        </button>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tax Case</p>

              <h1 className="text-3xl font-bold text-gray-900">
                Tax Year {currentTaxCase.taxYear}
              </h1>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {currentTaxCase.status}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Requested</p>
              <p className="mt-1 text-2xl font-bold">
                {currentTaxCase.requestedDocumentsCount}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="mt-1 text-2xl font-bold">
                {currentTaxCase.completedDocumentsCount}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Missing</p>
              <p className="mt-1 text-2xl font-bold">
                {currentTaxCase.missingDocumentsCount}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="mt-1 text-2xl font-bold">
                {currentTaxCase.documentProgressPercentage}%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Missing Documents
          </h2>

          {taxCase.missingDocuments.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">No missing documents.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {taxCase.missingDocuments.map((document) => (
                <div
                  key={document.documentTypeId}
                  className="rounded-xl bg-white p-5 shadow"
                >
                  <p className="font-semibold text-gray-900">
                    {document.documentType}
                  </p>

                  <p className="text-sm text-gray-500">
                    {document.documentCategory}
                  </p>

                  {document.note && (
                    <p className="mt-2 text-sm text-gray-700">
                      {document.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Upload Document
          </h2>

          <form
            onSubmit={handleUpload}
            className="rounded-xl bg-white p-6 shadow"
          >
            {uploadError && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {uploadError}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="documentType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Document Type
                </label>

                <select
                  id="documentType"
                  value={selectedDocumentTypeId}
                  onChange={(event) =>
                    setSelectedDocumentTypeId(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="">Select document type</option>

                  {taxCase.missingDocuments.map((document) => (
                    <option
                      key={document.documentTypeId}
                      value={document.documentTypeId}
                    >
                      {document.documentType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  File
                </label>

                <input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    setSelectedFile(event.target.files?.[0] ?? null)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </form>
        </div>
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Recent Documents
          </h2>

          {taxCase.recentDocuments.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      File
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Uploaded
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {taxCase.recentDocuments.map((document) => (
                    <tr key={document.id} className="border-t border-gray-200">
                      <td className="px-6 py-4">{document.fileName}</td>

                      <td className="px-6 py-4">
                        {document.documentType ?? "-"}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default TaxCaseDetailsPage;
