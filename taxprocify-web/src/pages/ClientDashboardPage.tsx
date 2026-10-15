import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyClientProfile, getMyTaxCases } from "../api/clientPortal";

import type { Client } from "../types/client";
import type { TaxCase } from "../types/taxCase";

import TaxCaseStatusBadge from "../components/TaxCaseStatusBadge";

function ClientDashboardPage() {
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [taxCases, setTaxCases] = useState<TaxCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [clientData, taxCaseData] = await Promise.all([
          getMyClientProfile(),
          getMyTaxCases(),
        ]);

        setClient(clientData);
        setTaxCases(taxCaseData);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load client dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

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

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Client Portal</p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome, {client.firstName}
          </h1>

          <div className="mt-4 text-gray-600">
            <p>
              {client.firstName} {client.lastName}
            </p>
            <p>{client.email}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            My Tax Cases
          </h2>

          {taxCases.length === 0 ? (
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">No tax cases available.</p>
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
                      Progress
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {taxCases.map((taxCase) => (
                    <tr
                      key={taxCase.id}
                      onClick={() =>
                        navigate(`/client/tax-cases/${taxCase.id}`)
                      }
                      className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">{taxCase.taxYear}</td>

                      <td className="px-6 py-4">
                        <TaxCaseStatusBadge status={taxCase.status} />
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

export default ClientDashboardPage;
