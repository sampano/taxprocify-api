import { apiFetch } from "./apiClient";

export async function createDocumentRequest(
  taxCaseId: number | string,
  documentTypeId: number,
  note: string | null,
): Promise<void> {
  const response = await apiFetch(`/DocumentRequests/create/${taxCaseId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentTypeId,
      note,
    }),
  });

  if (!response.ok) {
    const text = await response.text();

    let message = "Failed to add required document.";

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

export async function updateDocumentRequestNote(
  documentRequestId: number | string,
  note: string | null,
): Promise<void> {
  const response = await apiFetch(
    `/DocumentRequests/update/${documentRequestId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(text || "Failed to update note.");
  }
}

export async function deleteDocumentRequest(
  documentRequestId: number | string,
): Promise<void> {
  const response = await apiFetch(
    `/DocumentRequests/delete/${documentRequestId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(text || "Failed to remove required document.");
  }
}
