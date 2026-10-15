import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import { apiFetch } from "../api/apiClient";
import { createTaxCase } from "../api/taxCases";
function AddTaxCasePage() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState("Draft");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientId) {
      setError("Client ID is missing.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await createTaxCase(clientId, taxYear, status);

      navigate(`/clients/${clientId}`);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl">
        <button
          type="button"
          onClick={() => navigate(`/clients/${clientId}`)}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Client
        </button>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">Add Tax Case</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl bg-white p-6 shadow"
        >
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="taxYear"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Tax Year
            </label>

            <input
              id="taxYear"
              type="number"
              min={2000}
              max={2100}
              value={taxYear}
              onChange={(event) => setTaxYear(Number(event.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="WaitingForDocuments">Waiting For Documents</option>
              <option value="InReview">In Review</option>
              <option value="ReadyToFile">Ready To File</option>
              <option value="Filed">Filed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Tax Case"}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/clients/${clientId}`)}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaxCasePage;
