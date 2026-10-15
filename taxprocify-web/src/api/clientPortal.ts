import { apiFetch } from "./apiClient";
import type { Client } from "../types/client";
import type { TaxCase, TaxCaseSummary } from "../types/taxCase";
import type { RecentDocument } from "../types/taxCase";
import type { TaxDocument } from "../types/document";

export async function getMyClientProfile(): Promise<Client> {
  const response = await apiFetch("/ClientPortal/me");

  if (!response.ok) {
    throw new Error("Failed to load client profile.");
  }

  return response.json();
}

export async function getMyTaxCases(): Promise<TaxCase[]> {
  const response = await apiFetch("/ClientPortal/tax-cases");

  if (!response.ok) {
    throw new Error("Failed to load tax cases.");
  }

  return response.json();
}

export async function getMyTaxCase(
  taxCaseId: number | string,
): Promise<TaxCaseSummary> {
  const response = await apiFetch(`/ClientPortal/tax-cases/${taxCaseId}`);

  if (!response.ok) {
    throw new Error("Failed to load tax case.");
  }

  return response.json();
}

export async function getMyTaxCaseDocuments(
  taxCaseId: number | string,
): Promise<TaxDocument[]> {
  const response = await apiFetch(
    `/ClientPortal/tax-cases/${taxCaseId}/documents`,
  );

  if (!response.ok) {
    throw new Error("Failed to load documents.");
  }

  return response.json();
}

export async function downloadMyDocument(
  documentId: number | string,
): Promise<Blob> {
  const response = await apiFetch(
    `/ClientPortal/documents/${documentId}/download`,
  );

  if (!response.ok) {
    throw new Error("Failed to download document.");
  }

  return response.blob();
}

export async function uploadMyDocument(
  taxCaseId: number | string,
  file: File,
  documentTypeId: number | string,
): Promise<void> {
  const formData = new FormData();

  formData.append("File", file);
  formData.append("DocumentTypeId", documentTypeId.toString());

  const response = await apiFetch(
    `/ClientPortal/tax-cases/${taxCaseId}/documents`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(text || "Failed to upload document.");
  }
}

export async function deleteMyDocument(
  documentId: number | string,
): Promise<void> {
  const response = await apiFetch(`/ClientPortal/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(text || "Failed to delete document.");
  }
}
