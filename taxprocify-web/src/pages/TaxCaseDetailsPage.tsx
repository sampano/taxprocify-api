import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import { apiFetch } from "../api/apiClient";
import TaxCaseStatusBadge from "../components/TaxCaseStatusBadge";
import type { TaxCaseSummary } from "../types/taxCase";
import type { DocumentCategory } from "../types/document";
import {
  getTaxCaseSummary,
  updateTaxCase,
  deleteTaxCase,
} from "../api/taxCases";
import {
  getDocumentCategories,
  downloadTaxDocument,
  deleteTaxDocument,
  uploadTaxDocument,
} from "../api/documents";
import {
  createDocumentRequest,
  updateDocumentRequestNote,
  deleteDocumentRequest,
} from "../api/documentRequests";

type RecentDocument = {
  id: number;
  fileName: string;
  documentType: string | null;
  documentCategory: string | null;
  uploadedAt: string;
};

function formatStatus(status: string) {
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function TaxCaseDetailsPage() {
  // Get the tax case ID from the URL parameters
  const { id } = useParams();
  const navigate = useNavigate();

  // State for uploading documents
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for editing document requests
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [requestActionError, setRequestActionError] = useState("");
  const [documentCategories, setDocumentCategories] = useState<
    DocumentCategory[]
  >([]);

  // State for adding document requests
  const [requestDocumentTypeId, setRequestDocumentTypeId] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // State for tax case details
  const [taxCase, setTaxCase] = useState<TaxCaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for editing tax case details
  const [editingTaxCase, setEditingTaxCase] = useState(false);
  const [editTaxYear, setEditTaxYear] = useState(2000);
  const [editStatus, setEditStatus] = useState("Draft");
  const [taxCaseEditError, setTaxCaseEditError] = useState("");
  const [savingTaxCase, setSavingTaxCase] = useState(false);

  async function loadDocumentCategories() {
    try {
      const data = await getDocumentCategories();

      setDocumentCategories(data);
    } catch (error) {
      console.error(error);
    }
  }

  // Function to load tax case details
  async function loadTaxCase() {
    try {
      const data = await getTaxCaseSummary(id!);

      console.log("Missing documents:", data.missingDocuments);

      setTaxCase(data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTaxCase();
    loadDocumentCategories();
  }, [id]);

  // Function for uploading documents
  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile || !selectedDocumentTypeId || !taxCase) {
      setUploadError("Please select a document type and file.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      await uploadTaxDocument(taxCase.id, selectedFile, selectedDocumentTypeId);

      await loadTaxCase();

      setSelectedDocumentTypeId("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setUploadError("Unable to upload document.");
    } finally {
      setUploading(false);
    }
  }

  // Function for downloading and deleting documents
  async function handleDownload(documentId: number, fileName: string) {
    try {
      const blob = await downloadTaxDocument(documentId);

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
      setError("Unable to download document.");
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
      await deleteTaxDocument(documentId);

      await loadTaxCase();
    } catch (error) {
      console.error(error);
      setError("Unable to delete document.");
    }
  }

  // Functions for adding document requests
  async function handleAddDocumentRequest(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!requestDocumentTypeId || !taxCase) {
      setRequestError("Please select a document type.");
      return;
    }

    setRequestError("");
    setRequestSubmitting(true);

    try {
      await createDocumentRequest(
        taxCase.id,
        Number(requestDocumentTypeId),
        requestNote || null,
      );

      setRequestDocumentTypeId("");
      setRequestNote("");

      await loadTaxCase();
    } catch (error) {
      console.error(error);

      setRequestError(
        error instanceof Error
          ? error.message
          : "Unable to add required document.",
      );
    } finally {
      setRequestSubmitting(false);
    }
  }
  // Functions for editing and deleting document requests
  async function handleUpdateRequestNote(documentRequestId: number) {
    setRequestActionError("");

    try {
      await updateDocumentRequestNote(documentRequestId, editingNote || null);

      setEditingRequestId(null);
      setEditingNote("");

      await loadTaxCase();
    } catch (error) {
      console.error(error);
      setRequestActionError("Unable to update note.");
    }
  }

  // Function for deleting a document request
  async function handleDeleteRequest(documentRequestId: number) {
    const confirmed = window.confirm(
      "Remove this required document from the tax case?",
    );

    if (!confirmed) {
      return;
    }

    setRequestActionError("");

    try {
      await deleteDocumentRequest(documentRequestId);

      await loadTaxCase();
    } catch (error) {
      console.error(error);
      setRequestActionError("Unable to remove required document.");
    }
  }

  // Function to start editing tax case details
  function startEditingTaxCase() {
    if (!taxCase) {
      return;
    }

    setEditTaxYear(taxCase.taxYear);
    setEditStatus(taxCase.status);
    setTaxCaseEditError("");
    setEditingTaxCase(true);
  }

  // Function to cancel editing tax case details
  async function handleUpdateTaxCase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!taxCase) {
      return;
    }

    setTaxCaseEditError("");
    setSavingTaxCase(true);

    try {
      await updateTaxCase(taxCase.id, editTaxYear, editStatus);

      setEditingTaxCase(false);

      await loadTaxCase();
    } catch (error) {
      console.error(error);

      setTaxCaseEditError(
        error instanceof Error ? error.message : "Unable to update tax case.",
      );
    } finally {
      setSavingTaxCase(false);
    }
  }

  // Function to delete the tax case
  async function handleDeleteTaxCase() {
    if (!taxCase) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete tax year ${taxCase.taxYear}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTaxCase(taxCase.id);

      navigate(`/clients/${taxCase.clientId}`);
    } catch (error) {
      console.error(error);

      setTaxCaseEditError(
        error instanceof Error ? error.message : "Unable to delete tax case.",
      );
    }
  }

  if (!taxCase) {
    return null;
  }

  const currentTaxCase = taxCase;
  const clientId = currentTaxCase.clientId;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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

            <TaxCaseStatusBadge status={currentTaxCase.status} />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEditingTaxCase}
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              Edit Tax Case
            </button>

            <button
              type="button"
              onClick={handleDeleteTaxCase}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Delete Tax Case
            </button>
          </div>
          {editingTaxCase && (
            <form
              onSubmit={handleUpdateTaxCase}
              className="mt-6 space-y-4 rounded-lg bg-gray-50 p-5"
            >
              {taxCaseEditError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {taxCaseEditError}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="editTaxYear"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Tax Year
                  </label>

                  <input
                    id="editTaxYear"
                    type="number"
                    min={2000}
                    max={2100}
                    value={editTaxYear}
                    onChange={(event) =>
                      setEditTaxYear(Number(event.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="editStatus"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="editStatus"
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Waiting">Waiting</option>
                    <option value="WaitingForDocuments">
                      Waiting For Documents
                    </option>
                    <option value="InReview">In Review</option>
                    <option value="ReadyToFile">Ready To File</option>
                    <option value="Filed">Filed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={savingTaxCase}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingTaxCase ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingTaxCase(false);
                    setTaxCaseEditError("");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

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
            Add Required Document
          </h2>

          <form
            onSubmit={handleAddDocumentRequest}
            className="rounded-xl bg-white p-6 shadow"
          >
            {requestError && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {requestError}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="requestDocumentType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Document Type
                </label>

                <select
                  id="requestDocumentType"
                  value={requestDocumentTypeId}
                  onChange={(event) =>
                    setRequestDocumentTypeId(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="">Select document type</option>

                  {documentCategories.map((category) => (
                    <optgroup key={category.id} label={category.name}>
                      {category.documentTypes.map((documentType) => (
                        <option key={documentType.id} value={documentType.id}>
                          {documentType.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="requestNote"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Note
                </label>

                <input
                  id="requestNote"
                  type="text"
                  value={requestNote}
                  onChange={(event) => setRequestNote(event.target.value)}
                  placeholder="Optional instructions"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={requestSubmitting}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {requestSubmitting ? "Adding..." : "Add Required Document"}
            </button>
          </form>
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {document.documentType}
                      </p>

                      <p className="text-sm text-gray-500">
                        {document.documentCategory}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRequestId(document.id);
                          setEditingNote(document.note ?? "");
                        }}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                      >
                        Edit Note
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(document.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {editingRequestId === document.id ? (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={editingNote}
                        onChange={(event) => setEditingNote(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRequestNote(document.id)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingRequestId(null);
                            setEditingNote("");
                          }}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    document.note && (
                      <p className="mt-3 text-sm text-gray-700">
                        {document.note}
                      </p>
                    )
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
                {requestActionError && (
                  <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {requestActionError}
                  </p>
                )}
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
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Actions
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
    </div>
  );
}

export default TaxCaseDetailsPage;
