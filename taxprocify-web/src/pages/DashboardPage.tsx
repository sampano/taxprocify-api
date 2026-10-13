import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

type DashboardSummary = {
  totalClients: number;
  totalTaxCases: number;
  waitingForDocumentsCount: number;
  completedTaxCasesCount: number;
  totalRequestedDocuments: number;
  totalCompletedDocuments: number;
  totalMissingDocuments: number;
  overallDocumentProgressPercentage: number;
};

function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");

    navigate("/login");
  }

  useEffect(() => {
    async function loadDashboard() {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("No access token found.");
        return;
      }

      try {
        const response = await apiFetch("/Dashboard/summary");

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          setError("Failed to load dashboard.");
          return;
        }

        const data: DashboardSummary = await response.json();

        setDashboard(data);
      } catch (error) {
        console.error(error);
        setError("Unable to connect to the server.");
      }
    }

    loadDashboard();
  }, [navigate]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!dashboard) {
    return <p>Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="mt-2 text-3xl font-bold">{dashboard.totalClients}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Tax Cases</p>
          <p className="mt-2 text-3xl font-bold">{dashboard.totalTaxCases}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Missing Documents</p>
          <p className="mt-2 text-3xl font-bold">
            {dashboard.totalMissingDocuments}
          </p>
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
