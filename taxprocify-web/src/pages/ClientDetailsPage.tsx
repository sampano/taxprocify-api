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
  // Get the client ID from the URL parameters and set up navigation
  const { id } = useParams();
  const navigate = useNavigate();

  // State variables for client details, tax cases, loading state, and error message
  const [client, setClient] = useState<Client | null>(null);
  const [taxCases, setTaxCases] = useState<TaxCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State variables for editing client details
  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

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

  function startEditingClient() {
    if (!client) {
      return;
    }

    setEditFirstName(client.firstName);
    setEditLastName(client.lastName);
    setEditEmail(client.email);
    setEditPhone(client.phone ?? "");
    setEditError("");
    setEditing(true);
  }

  // Function to handle updating the client details
  async function handleUpdateClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!client) {
      return;
    }

    setEditError("");
    setSaving(true);

    try {
      const response = await apiFetch(`/Clients/updateclient/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          phone: editPhone || null,
        }),
      });

      if (!response.ok) {
        const text = await response.text();

        if (text) {
          try {
            const data = JSON.parse(text);
            setEditError(data.message ?? "Failed to update client.");
          } catch {
            setEditError(text);
          }
        } else {
          setEditError("Failed to update client.");
        }

        return;
      }

      const updatedClient: Client = await response.json();

      setClient(updatedClient);
      setEditing(false);
    } catch (error) {
      console.error(error);
      setEditError("Unable to update client.");
    } finally {
      setSaving(false);
    }
  }

  // Function to handle deleting the client
  async function handleDeleteClient() {
    if (!client) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.firstName} ${client.lastName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiFetch(`/Clients/deleteclient/${client.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setEditError("Failed to delete client.");
        return;
      }

      navigate("/clients");
    } catch (error) {
      console.error(error);
      setEditError("Unable to delete client.");
    }
  }

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
    <div className="min-h-screen bg-gray-100 p-8">
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEditingClient}
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDeleteClient}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
            {editing && (
              <form
                onSubmit={handleUpdateClient}
                className="mt-6 space-y-4 rounded-lg bg-gray-50 p-5"
              >
                {editError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {editError}
                  </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="editFirstName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>

                    <input
                      id="editFirstName"
                      type="text"
                      value={editFirstName}
                      onChange={(event) => setEditFirstName(event.target.value)}
                      required
                      maxLength={50}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="editLastName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>

                    <input
                      id="editLastName"
                      type="text"
                      value={editLastName}
                      onChange={(event) => setEditLastName(event.target.value)}
                      required
                      maxLength={50}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="editEmail"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>

                    <input
                      id="editEmail"
                      type="email"
                      value={editEmail}
                      onChange={(event) => setEditEmail(event.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="editPhone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>

                    <input
                      id="editPhone"
                      type="text"
                      value={editPhone}
                      onChange={(event) => setEditPhone(event.target.value)}
                      maxLength={30}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditError("");
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
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
              onClick={() => navigate(`/clients/${client.id}/tax-cases/new`)}
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
    </div>
  );
}

export default ClientDetailsPage;
