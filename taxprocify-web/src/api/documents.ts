import { apiFetch } from "./apiClient";
import type { DocumentCategory } from "../types/document";

export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  const response = await apiFetch("/Documents/tax-document/categories");

  if (!response.ok) {
    throw new Error("Failed to load document categories.");
  }

  return response.json();
}

export async function uploadTaxDocument(
  taxCaseId: number | string,
  file: File,
  documentTypeId: number | string,
): Promise<void> {
  const formData = new FormData();

  formData.append("File", file);
  formData.append("DocumentTypeId", documentTypeId.toString());

  const response = await apiFetch(
    `/Documents/tax-document/upload/${taxCaseId}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "Failed to upload document.");
  }
}
export async function deleteTaxDocument(
  documentId: number | string,
): Promise<void> {
  const response = await apiFetch(
    `/Documents/tax-document/delete/${documentId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete document.");
  }
}

export async function downloadTaxDocument(
  documentId: number | string,
): Promise<Blob> {
  const response = await apiFetch(
    `/Documents/tax-document/download/${documentId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to download document.");
  }

  return response.blob();
}
