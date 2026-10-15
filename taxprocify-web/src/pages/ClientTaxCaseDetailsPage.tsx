import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMyTaxCase,
  getMyTaxCaseDocuments,
  downloadMyDocument,
  deleteMyDocument,
  uploadMyDocument,
} from "../api/clientPortal";
import type { TaxCaseSummary } from "../types/taxCase";
import TaxCaseStatusBadge from "../components/TaxCaseStatusBadge";

import type { TaxDocument } from "../types/document";

function ClientTaxCaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [taxCase, setTaxCase] = useState<TaxCaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [documents, setDocuments] = useState<TaxDocument[]>([]);

  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadTaxCase() {
    try {
      const [taxCaseData, documentData] = await Promise.all([
        getMyTaxCase(id!),
        getMyTaxCaseDocuments(id!),
      ]);

      setTaxCase(taxCaseData);
      setDocuments(documentData);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Unable to load tax case.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTaxCase();
  }, [id]);

  async function handleDownload(documentId: number, fileName: string) {
    try {
      const blob = await downloadMyDocument(documentId);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Unable to download document.",
      );
    }
  }
  async function handleDeleteDocument(documentId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMyDocument(documentId);

      await loadTaxCase();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Unable to delete document.",
      );
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile || !selectedDocumentTypeId || !taxCase) {
      setUploadError("Please select a document type and file.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      await uploadMyDocument(taxCase.id, selectedFile, selectedDocumentTypeId);

      await loadTaxCase();

      setSelectedDocumentTypeId("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);

      setUploadError(
        error instanceof Error ? error.message : "Unable to upload document.",
      );
    } finally {
      setUploading(false);
    }
  }
  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="rounded-lg bg-red-50 p-4 text-red-600">{error}</p>
      </div>
    );
  }

  if (!taxCase) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/client/dashboard")}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tax Case</p>

              <h1 className="text-3xl font-bold text-gray-900">
                Tax Year {taxCase.taxYear}
              </h1>
            </div>

            <TaxCaseStatusBadge status={taxCase.status} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Requested</p>
              <p className="mt-1 text-2xl font-bold">
                {taxCase.requestedDocumentsCount}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="mt-1 text-2xl font-bold">
                {taxCase.completedDocumentsCount}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Missing</p>
              <p className="mt-1 text-2xl font-bold">
                {taxCase.missingDocumentsCount}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="mt-1 text-2xl font-bold">
                {taxCase.documentProgressPercentage}%
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
                  key={document.id}
                  className="rounded-xl bg-white p-5 shadow"
                >
                  <p className="font-semibold text-gray-900">
                    {document.documentType}
                  </p>

                  <p className="text-sm text-gray-500">
                    {document.documentCategory}
                  </p>

                  {document.note && (
                    <p className="mt-3 text-sm text-gray-700">
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
                  ref={fileInputRef}
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
            Uploaded Documents
          </h2>

          {documents.length === 0 ? (
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

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id} className="border-t border-gray-200">
                      <td className="px-6 py-4">{document.fileName}</td>

                      <td className="px-6 py-4">
                        {document.documentType ?? "-"}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(document.id, document.fileName)
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                          >
                            Download
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(document.id)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientTaxCaseDetailsPage;
