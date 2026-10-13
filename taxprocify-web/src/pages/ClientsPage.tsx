import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiClient";
import { useNavigate } from "react-router-dom";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

type PagedClients = {
  items: Client[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};

function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadClients() {
      try {
        const response = await apiFetch("/clients");

        if (!response.ok) {
          setError("Failed to load clients.");
          return;
        }

        const data: PagedClients = await response.json();

        setClients(data.items);
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  if (loading) {
    return <p className="p-8">Loading clients...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>

        <button
          type="button"
          onClick={() => navigate("/clients/new")}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Add Client
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Phone
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-gray-200">
                <td className="px-6 py-4">
                  {client.firstName} {client.lastName}
                </td>

                <td className="px-6 py-4">{client.email}</td>

                <td className="px-6 py-4">{client.phone ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default ClientsPage;
