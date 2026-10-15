import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import TaxCaseStatusBadge from "../components/TaxCaseStatusBadge";
import type { DashboardSummary } from "../types/dashboard";
import { getDashboardSummary } from "../api/dashboard";

type CaseAttention = {
  taxCaseId: number;
  clientId: number;
  clientName: string;
  taxYear: number;
  missingDocumentsCount: number;
};

type RecentActivity = {
  documentId: number;
  fileName: string;
  documentType: string | null;
  clientName: string;
  taxCaseId: number;
  taxYear: number;
  uploadedAt: string;
};

type TaxCaseStatusCount = {
  status: string;
  count: number;
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
        const data = await getDashboardSummary();

        setDashboard(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          navigate("/login");
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to connect to the server.",
        );
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      {/* Summary cards */}
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
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Overall Progress</p>
          <p className="mt-2 text-3xl font-bold">
            {dashboard.overallDocumentProgressPercentage}%
          </p>
        </div>
      </div>

      {/* Document Progress */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-medium text-gray-900">Document Progress</p>

          <span className="text-sm text-gray-500">
            {dashboard.totalCompletedDocuments} /{" "}
            {dashboard.totalRequestedDocuments}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{
              width: `${dashboard.overallDocumentProgressPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Cases Needing Attention */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Cases Needing Attention
        </h2>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Client
                </th>

                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Tax Year
                </th>

                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Missing
                </th>
              </tr>
            </thead>

            <tbody>
              {dashboard.casesNeedingAttention.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No cases currently need attention.
                  </td>
                </tr>
              ) : (
                dashboard.casesNeedingAttention.map((item) => (
                  <tr
                    key={item.taxCaseId}
                    onClick={() => navigate(`/tax-cases/${item.taxCaseId}`)}
                    className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">{item.clientName}</td>

                    <td className="px-6 py-4">{item.taxYear}</td>

                    <td className="px-6 py-4">{item.missingDocumentsCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Recent Activity
        </h2>

        <div className="space-y-3">
          {dashboard.recentActivity.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center shadow">
              <p className="text-gray-500">No recent document activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.recentActivity.map((activity) => (
                <div
                  key={activity.documentId}
                  className="rounded-xl bg-white p-5 shadow"
                >
                  <p className="font-medium text-gray-900">
                    {activity.clientName}
                  </p>

                  <p className="text-sm text-gray-600">
                    Uploaded {activity.fileName}
                    {activity.documentType ? ` (${activity.documentType})` : ""}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Tax Year {activity.taxYear} ·{" "}
                    {new Date(activity.uploadedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tax Case Status */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Tax Case Status
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboard.taxCaseStatusBreakdown.map((item) => (
            <div key={item.status} className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">
                {" "}
                <TaxCaseStatusBadge status={item.status} />
              </p>

              <p className="mt-2 text-2xl font-bold">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
