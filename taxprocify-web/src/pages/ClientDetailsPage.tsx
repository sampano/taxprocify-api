import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  userId: string;
};

type TaxCase = {
  id: number;
  taxYear: number;
  status: string;
  createdAt: string;
  clientId: number;
  requestedDocumentsCount: number;
  completedDocumentsCount: number;
  missingDocumentsCount: number;
  documentProgressPercentage: number;
};

function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [taxCases, setTaxCases] = useState<TaxCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClient() {
      try {
        const response = await apiFetch(`/Clients/getclient/${id}`);

        if (response.status === 404) {
          setError("Client not found.");
          return;
        }

        if (!response.ok) {
          setError("Failed to load client.");
          return;
        }

        const data: Client = await response.json();

        setClient(data);

        const taxCaseResponse = await apiFetch(
          `/TaxCases/gettaxcases/client/${id}`,
        );

        if (!taxCaseResponse.ok) {
          setError("Failed to load tax cases.");
          return;
        }

        const taxCaseData: TaxCase[] = await taxCaseResponse.json();

        setTaxCases(taxCaseData);
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [id]);

  if (loading) {
    return <p className="p-8">Loading client...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  if (!client) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/clients")}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Clients
        </button>

        <div className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-gray-900">
            {client.firstName} {client.lastName}
          </h1>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{client.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{client.phone ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Client ID</p>
              <p className="font-medium text-gray-900">{client.id}</p>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Tax Cases</h2>

            <button
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Add Tax Case
            </button>
          </div>

          {taxCases.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">
                No tax cases found for this client.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Tax Year
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Missing Documents
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                      Progress
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {taxCases.map((taxCase) => (
                    <tr
                      key={taxCase.id}
                      onClick={() => navigate(`/tax-cases/${taxCase.id}`)}
                      className="border-t border-gray-200"
                    >
                      <td className="px-6 py-4">{taxCase.taxYear}</td>

                      <td className="px-6 py-4">{taxCase.status}</td>

                      <td className="px-6 py-4">
                        {taxCase.missingDocumentsCount}
                      </td>

                      <td className="px-6 py-4">
                        {taxCase.documentProgressPercentage}%
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

export default ClientDetailsPage;
