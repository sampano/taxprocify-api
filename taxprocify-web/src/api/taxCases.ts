import { apiFetch } from "./apiClient";
import type { TaxCase, TaxCaseSummary } from "../types/taxCase";

export async function getTaxCasesByClient(
  clientId: number | string,
): Promise<TaxCase[]> {
  const response = await apiFetch(`/TaxCases/gettaxcases/client/${clientId}`);

  if (!response.ok) {
    throw new Error("Failed to load tax cases.");
  }

  return response.json();
}

export async function getTaxCaseSummary(
  taxCaseId: number | string,
): Promise<TaxCaseSummary> {
  const response = await apiFetch(`/TaxCases/${taxCaseId}/summary`);

  if (response.status === 404) {
    throw new Error("Tax case not found.");
  }

  if (!response.ok) {
    throw new Error("Failed to load tax case.");
  }

  return response.json();
}

export async function createTaxCase(
  clientId: number | string,
  taxYear: number,
  status: string,
) {
  const response = await apiFetch(`/TaxCases/createtaxcases/${clientId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taxYear,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create tax case.");
  }

  return response.json();
}

export async function updateTaxCase(
  taxCaseId: number | string,
  taxYear: number,
  status: string,
): Promise<void> {
  const response = await apiFetch(`/TaxCases/updatetaxcases/${taxCaseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taxYear,
      status,
    }),
  });

  if (!response.ok) {
    const text = await response.text();

    let message = "Failed to update tax case.";

    if (text) {
      try {
        const data = JSON.parse(text);
        message = data.message ?? text;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }
}

export async function deleteTaxCase(taxCaseId: number | string): Promise<void> {
  const response = await apiFetch(`/TaxCases/deletetaxcases/${taxCaseId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete tax case.");
  }
}
