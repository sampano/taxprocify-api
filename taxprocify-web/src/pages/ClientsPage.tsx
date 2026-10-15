import { useEffect, useState } from "react";
//import { apiFetch } from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import type { Client, PagedClients } from "../types/client";
import { getClients } from "../api/clients";

function ClientsPage() {
  // State variables for clients, error, and loading state
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // State variables for search, pagination, and total count
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Hook for navigation
  const navigate = useNavigate();

  async function loadClients() {
    setLoading(true);
    setError("");

    try {
      const data = await getClients(search, page, pageSize);

      setClients(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error(error);
      setError("Unable to load clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, [page]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (page === 1) {
      loadClients();
    } else {
      setPage(1);
    }
  }
  if (loading) {
    return <p className="p-8">Loading clients...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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
      <form onSubmit={handleSearch} className="mb-6 flex max-w-xl gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search clients..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </form>
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
              <tr
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
              >
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
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {totalCount} client{totalCount === 1 ? "" : "s"}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => current - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages || 1}
          </span>

          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientsPage;
